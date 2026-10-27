import os, sys
from playwright.sync_api import sync_playwright
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
ST = ROOT + 'game5-flux-store/'
os.makedirs(ST + 'vk', exist_ok=True)
GAME = 'http://127.0.0.1:8790/index.html?debug&lang=ru&adms=250'
with sync_playwright() as p:
    b = p.chromium.launch()
    for mode, fn in (('icon', 'icon-512.png'), ('cover', 'cover-800x470.png'), ('snippet', 'vk/snippet-1120x630.png')):
        w, h = {'icon': (512, 512), 'cover': (800, 470), 'snippet': (1120, 630)}[mode]
        pg = b.new_page(viewport={'width': w, 'height': h}); pg.goto('file://' + ROOT + 'game5-flux-tools/art.html?mode=' + mode); pg.wait_for_function('window.READY'); pg.wait_for_timeout(300); pg.screenshot(path=ST + fn); pg.close()
    # vk icons from icon-512
    ic = Image.open(ST + 'icon-512.png').convert('RGB')
    for s in (576, 278, 150, 32):
        ic.resize((s, s), Image.LANCZOS).save(ST + 'vk/' + ('favicon-32.png' if s == 32 else f'icon-{s}.png'))
    def shots(vp, mobile, scale, plan):
        ctx = b.new_context(viewport={'width': vp[0], 'height': vp[1]}, device_scale_factor=scale, is_mobile=mobile, has_touch=mobile)
        pg = ctx.new_page(); pg.goto(GAME); pg.wait_for_function('window.__dbg'); pg.wait_for_timeout(600)
        for name, fn in plan:
            fn(pg); pg.wait_for_timeout(350); pg.screenshot(path=ST + name)
        ctx.close()
    def lvl(n, mid=None, mode_=None):
        def f(pg):
            pg.evaluate(f'__dbg.startCamp({n})'); pg.wait_for_timeout(1000); pg.evaluate('__dbg.step(0.6); __dbg.solve()')
            if mid is not None:
                pg.evaluate('__dbg.launch()'); pg.wait_for_timeout(int(mid * 1000))
        return f
    def menu(pg): pg.evaluate('__dbg.openMenu()'); pg.wait_for_timeout(2500)
    def sk(pg): pg.evaluate('__dbg.S.sp=240; __dbg.openSkins()')
    shots((1280, 720), False, 1, [('screenshot-1-desktop.png', lvl(25)), ('screenshot-2-desktop-run.png', lvl(23, 3.4)), ('screenshot-4-desktop-fog.png', lvl(40))])
    shots((360, 640), True, 2, [('screenshot-3-mobile.png', lvl(19)), ('screenshot-5-mobile-menu.png', menu)])
    for i, fn in enumerate(('screenshot-1-desktop.png', 'screenshot-2-desktop-run.png', 'screenshot-4-desktop-fog.png'), 1):
        im = Image.open(ST + fn).convert('RGB'); w, h = im.size; top = (h - w // 2) // 2
        im.crop((0, max(0, top), w, max(0, top) + w // 2)).resize((1200, 600), Image.LANCZOS).save(ST + f'vk/screenshot-{i}-1200x600.png')
    b.close()
