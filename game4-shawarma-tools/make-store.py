import os
from playwright.sync_api import sync_playwright
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
ST = ROOT + 'game4-shawarma-store/'
GAME = 'http://127.0.0.1:8771/index.html?debug&lang=ru&adms=250'
PRE = {
 'early': dict(n=[14, 3, 0, 0, 0, 0, 0, 0], up={}, tap=3, cash=3400, run=9e4, stars=0),
 'mid': dict(n=[48, 34, 22, 12, 4, 0, 0, 0], up={'s0a': True, 's1a': True, 's2a': True, 'g1': True}, tap=9, cash=2.3e6, run=3.1e6, stars=0),
 'late': dict(n=[96, 72, 58, 41, 26, 15, 6, 2], up={'s0a': True, 's0b': True, 's1a': True, 's1b': True, 's2a': True, 's3a': True, 'g1': True, 'g2': True, 'g3': True}, tap=17, cash=8.4e9, run=2.6e10, stars=34),
 'fr': dict(n=[80, 58, 40, 26, 12, 3, 0, 0], up={'s0a': True, 's0b': True, 's1a': True, 's2a': True, 'g1': True, 'g2': True}, tap=14, cash=6.5e7, run=9.2e6, stars=12),
}
def seed(pg, name, taps=0, fire=False):
    p = PRE[name]
    pg.evaluate("p=>{const S=__dbg.S;S.n=p.n;S.up=p.up;S.tap=p.tap;S.cash=p.cash;S.run=p.run;S.life=p.run;S.stars=p.stars;S.tc=100;S.seen=[1,1,1,1,1,1,1,1];}", p)
    pg.evaluate("__dbg.step(6)")
    if fire:
        for i in range(26):
            pg.evaluate("__dbg.doTap(__dbg.sx(%d),__dbg.sy(%d))" % (120 + (i * 53) % 160, 150 + (i * 29) % 90)); pg.evaluate('__dbg.step(0.12)')
    if fire: pg.evaluate('__dbg.step(1.3)')
    for i in range(taps):
        pg.evaluate("__dbg.doTap(__dbg.sx(%d),__dbg.sy(%d))" % (90 + (i * 97) % 240, 140 + (i * 41) % 70)); pg.evaluate('__dbg.step(0.3)')
    pg.wait_for_timeout(120)
def shot(b, path, vp, name, tab='stands', mobile=False, taps=0, fire=False, scale=1, q=None):
    ctx = b.new_context(viewport={'width': vp[0], 'height': vp[1]}, device_scale_factor=scale, is_mobile=mobile, has_touch=mobile)
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.goto(GAME); pg.wait_for_timeout(800)
    seed(pg, name, taps, fire)
    pg.evaluate("__dbg.setTab('%s')" % tab); pg.wait_for_timeout(250)
    if tab == 'ups': pg.evaluate("document.getElementById('list').scrollTop=0")
    pg.screenshot(path=path); ctx.close()
    if errs: print('ERR', path, errs)
with sync_playwright() as p:
    b = p.chromium.launch()
    for mode, fn in (('icon', 'icon-512.png'), ('cover', 'cover-800x470.png')):
        w, h = (512, 512) if mode == 'icon' else (800, 470)
        pg = b.new_page(viewport={'width': w, 'height': h}); pg.goto('file://' + ROOT + 'game4-shawarma-tools/art.html?mode=' + mode); pg.wait_for_timeout(400); pg.screenshot(path=ST + fn); pg.close()
    pg = b.new_page(viewport={'width': 1120, 'height': 630}); pg.goto('file://' + ROOT + 'game4-shawarma-tools/art.html?mode=snippet'); pg.wait_for_timeout(400); pg.screenshot(path=ST + 'vk/snippet-1120x630.png'); pg.close()
    shot(b, ST + 'screenshot-1-desktop.png', (1280, 720), 'late', taps=3, fire=True)
    shot(b, ST + 'screenshot-2-mobile.png', (360, 640), 'mid', mobile=True, scale=2, taps=2)
    shot(b, ST + 'screenshot-3-upgrades.png', (360, 640), 'mid', tab='ups', mobile=True, scale=2, taps=2)
    shot(b, ST + 'screenshot-4-franchise.png', (360, 640), 'fr', tab='fr', mobile=True, scale=2, taps=2)
    shot(b, ST + 'vk/screenshot-1-1200x600.png', (1200, 600), 'mid', taps=3)
    shot(b, ST + 'vk/screenshot-2-1200x600.png', (1200, 600), 'late', fire=True, taps=3)
    shot(b, ST + 'vk/screenshot-3-1200x600.png', (1200, 600), 'fr', tab='fr', taps=4)
    b.close()
ic = Image.open(ST + 'icon-512.png').convert('RGBA')
for sz, fn in ((576, 'icon-576.png'), (278, 'icon-278.png'), (150, 'icon-150.png'), (32, 'favicon-32.png')):
    ic.resize((sz, sz), Image.LANCZOS).save(ST + 'vk/' + fn)
for f in sorted(os.listdir(ST)) + ['vk/' + x for x in sorted(os.listdir(ST + 'vk'))]:
    if f.endswith('.png'): print(f, Image.open(ST + f).size)
