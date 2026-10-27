import sys, json
from playwright.sync_api import sync_playwright
OUT = sys.argv[1]
URL = 'http://127.0.0.1:8790/index.html?debug&lang=ru&adms=300'
def mk(b, vp, mobile):
    ctx = b.new_context(viewport={'width': vp[0], 'height': vp[1]}, device_scale_factor=2 if mobile else 1, is_mobile=mobile, has_touch=mobile)
    pg = ctx.new_page(); errs = []
    pg.on('console', lambda m: errs.append(m.type + ': ' + m.text) if m.type in ('error', 'warning') else None)
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    return ctx, pg, errs
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx, pg, errs = mk(b, (390, 844), True)
    pg.goto(URL); pg.wait_for_timeout(1500)
    pg.screenshot(path=OUT + '/m_menu.png')
    pg.evaluate('__dbg.startCamp(1)'); pg.wait_for_timeout(1400)
    pg.screenshot(path=OUT + '/m_l1.png')
    pg.evaluate('__dbg.solve()'); pg.wait_for_timeout(300)
    pg.screenshot(path=OUT + '/m_l1_solved.png')
    pg.evaluate('__dbg.launch()'); pg.wait_for_timeout(1800)
    pg.screenshot(path=OUT + '/m_l1_run.png')
    pg.wait_for_timeout(4000)
    pg.screenshot(path=OUT + '/m_l1_win.png')
    print('state', pg.evaluate('__dbg.st'), pg.evaluate('JSON.stringify(__dbg.modal)'))
    print('\n'.join(errs[:20]))
    ctx.close()
    b.close()
