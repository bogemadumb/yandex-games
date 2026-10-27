import sys, re, json
from playwright.sync_api import sync_playwright
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import gp_runner  # patches Browser.new_context
# usage: smoke.py <platform> <port> <game-title-needle...>  (server must serve the build at /)
plat, port = sys.argv[1], int(sys.argv[2])
base = f'http://127.0.0.1:{port}/index.html?debug&adms=300&lang=en'
res = []
def check(n, ok, info=''):
    res.append(bool(ok)); print(('PASS ' if ok else 'FAIL ') + n, info)

def page(b, url):
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); errs = []
    pg.on('console', lambda m: errs.append(m.text) if m.type in ('error', 'warning') else None)
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(url)
    return ctx, pg, errs

with sync_playwright() as p:
    b = p.chromium.launch()
    if plat == 'gamepush':
        for mode, wait, want_calls, maxstart in [('ok', 1500, 1, 3), ('slow', 4000, 1, 5), ('unavail', 1500, 0, 2), ('reject', 1500, 1, 2), ('hang', 11500, 1, 10)]:
            ctx, pg, errs = page(b, base + '&gpmode=' + mode)
            pg.wait_for_timeout(wait); ev = pg.evaluate
            log = ev('window.__gpLog'); st = ev('__dbg.info ? __dbg.info() : {}')
            started = ev('typeof __dbg!=="undefined" && !!__dbg.S')
            pre_i = log.index('pre:close') if 'pre:close' in log else -1
            gs_i = log.index('gameStart') if 'gameStart' in log else -1
            check(f'{mode}: preloader calls={want_calls}', (ev('window.__gpPreCalls') or 0) == want_calls, str(log))
            check(f'{mode}: game booted (never hangs)', started and gs_i >= 0, str(log))
            if mode in ('ok', 'slow'):
                check(f'{mode}: preloader closed before gameStart', 0 <= pre_i < gs_i)
                check(f'{mode}: overlay gone', ev('document.querySelectorAll(".mockgpad").length') == 0)
            if mode == 'hang':
                check('hang: gameStart reached only after ~8s timeout', gs_i >= 0 and 'pre:close' not in log)
            check(f'{mode}: no console errors', not errs, str(errs)[:200])
            ctx.close()
    else:
        ctx, pg, errs = page(b, base); pg.wait_for_timeout(1500)
        check(f'{plat}: booted', pg.evaluate('typeof __dbg!=="undefined" && !!__dbg.S'))
        check(f'{plat}: Platform.showPreloader is no-op fn', pg.evaluate('typeof Platform.showPreloader') == 'function' and pg.evaluate('Platform.showPreloader().then(r=>r)') is False)
        check(f'{plat}: no console errors', not [e for e in errs if 'vk' not in e.lower() and 'sdk.js' not in e and 'Failed to load resource' not in e], str(errs)[:200])
        ctx.close()
    b.close()
print(f'{sum(res)}/{len(res)} passed'); sys.exit(0 if all(res) else 1)
