import sys
from playwright.sync_api import sync_playwright
OUT = sys.argv[1]
URL = 'http://127.0.0.1:8790/index.html?debug&lang=ru&adms=300'
def mk(b, vp, mobile):
    ctx = b.new_context(viewport={'width': vp[0], 'height': vp[1]}, device_scale_factor=2 if mobile else 1, is_mobile=mobile, has_touch=mobile)
    pg = ctx.new_page(); errs = []
    pg.on('console', lambda m: errs.append(m.type + ': ' + m.text) if m.type in ('error', 'warning') and 'sdk.js' not in m.text and '404' not in m.text else None)
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    return ctx, pg, errs
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx, pg, errs = mk(b, (1280, 720), False)
    pg.goto(URL); pg.wait_for_timeout(1500)
    pg.screenshot(path=OUT + '/d_menu.png')
    for lv in [1, 13, 19, 25, 31, 37, 46]:
        pg.evaluate(f'__dbg.startCamp({lv})'); pg.wait_for_timeout(900)
        pg.evaluate('__dbg.solve()'); pg.wait_for_timeout(250)
        pg.screenshot(path=OUT + f'/d_l{lv}.png')
    pg.evaluate('__dbg.unlockAll(); __dbg.openMap()'); pg.wait_for_timeout(600); pg.screenshot(path=OUT + '/d_map.png')
    pg.evaluate('__dbg.openSkins()'); pg.wait_for_timeout(600); pg.screenshot(path=OUT + '/d_skins.png')
    print('\n'.join(errs[:20]))
    b.close()
