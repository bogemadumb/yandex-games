import sys, os, glob, shutil
from playwright.sync_api import sync_playwright
OUT = sys.argv[1]
URL = 'http://127.0.0.1:8790/index.html?debug&lang=ru&adms=300'
os.makedirs(OUT, exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=1, is_mobile=True, has_touch=True, record_video_dir=OUT, record_video_size={'width': 390, 'height': 844})
    pg = ctx.new_page(); ev = pg.evaluate
    pg.goto(URL); pg.wait_for_function('window.__dbg'); pg.wait_for_timeout(1800)
    def tap(id):
        r = ev(f'(()=>{{const b=__dbg.btn("{id}"); return [b.x+b.w/2,b.y+b.h/2]}})()'); pg.touchscreen.tap(r[0], r[1]); pg.wait_for_timeout(200)
    tap('play'); pg.wait_for_timeout(2500)
    ev('__dbg.solve()'); pg.wait_for_timeout(900)
    tap('launch'); pg.wait_for_function('__dbg.st==="won"', timeout=25000); pg.wait_for_timeout(2800)
    tap('mnext'); pg.wait_for_timeout(1200)
    ev('__dbg.place("a",150,900)'); pg.wait_for_timeout(500); tap('launch'); pg.wait_for_function('__dbg.st==="fail"', timeout=25000); pg.wait_for_timeout(1500)
    ev('__dbg.clearAll(); __dbg.solve()'); pg.wait_for_timeout(500); tap('launch'); pg.wait_for_function('__dbg.st==="won"', timeout=25000); pg.wait_for_timeout(2000)
    ctx.close(); b.close()
for f in glob.glob(OUT + '/*.webm'): shutil.move(f, OUT + '/session.webm')
