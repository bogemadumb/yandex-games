import sys
from playwright.sync_api import sync_playwright
from PIL import Image
OUT = sys.argv[1]
URL = 'http://127.0.0.1:8790/index.html?debug&lang=ru'
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': 390, 'height': 700}, device_scale_factor=1)
    pg = ctx.new_page(); pg.goto(URL); pg.wait_for_function('window.__dbg'); pg.wait_for_timeout(400)
    imgs = []
    for lv in range(1, 49):
        pg.evaluate(f'__dbg.startCamp({lv})'); pg.wait_for_timeout(150)
        pg.evaluate('__dbg.step(0.5); __dbg.solve()'); pg.wait_for_timeout(120)
        pg.screenshot(path=OUT + f'/lv{lv:02d}.png', clip={'x': 0, 'y': 50, 'width': 390, 'height': 560})
        imgs.append(Image.open(OUT + f'/lv{lv:02d}.png'))
    for s in range(4):
        sheet = Image.new('RGB', (6 * 292, 2 * 420))
        for i in range(12):
            im = imgs[s * 12 + i].resize((292, 420))
            sheet.paste(im, ((i % 6) * 292, (i // 6) * 420))
        sheet.save(OUT + f'/sheet{s+1}.png')
    b.close()
