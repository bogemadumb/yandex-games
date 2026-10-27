import sys
from playwright.sync_api import sync_playwright
from PIL import Image
OUT = sys.argv[1]
vps = [(320, 568), (768, 1024), (1920, 1080), (1024, 600), (568, 320), (2560, 1080), (412, 915)]
with sync_playwright() as p:
    b = p.chromium.launch(); ims = []
    for vp in vps:
        mob = vp[0] < 800 or vp[1] < 500
        ctx = b.new_context(viewport={'width': vp[0], 'height': vp[1]}, device_scale_factor=1, is_mobile=mob, has_touch=mob)
        pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('http://127.0.0.1:8790/index.html?debug&lang=ru'); pg.wait_for_function('window.__dbg'); pg.wait_for_timeout(300)
        pg.evaluate('__dbg.startLab(true)'); pg.wait_for_timeout(700); pg.evaluate('__dbg.step(0.6); __dbg.solve()'); pg.wait_for_timeout(200)
        pg.screenshot(path=OUT + f'/vp_{vp[0]}x{vp[1]}.png'); print(vp, errs)
        ctx.close()
    b.close()
