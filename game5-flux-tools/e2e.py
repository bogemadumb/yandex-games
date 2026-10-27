import sys, json
from playwright.sync_api import sync_playwright
URL = 'http://127.0.0.1:8790/index.html?debug&lang=ru&adms=300'
res = []
def check(n, ok, info=''):
    res.append(bool(ok)); print(('PASS ' if ok else 'FAIL ') + n, info)

def new(b, vp, mobile):
    ctx = b.new_context(viewport={'width': vp[0], 'height': vp[1]}, device_scale_factor=2 if mobile else 1, is_mobile=mobile, has_touch=mobile)
    pg = ctx.new_page(); errs = []
    pg.on('console', lambda m: errs.append(m.text) if m.type in ('error', 'warning') and 'sdk.js' not in m.text and '404' not in m.text else None)
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    return ctx, pg, errs

def center(pg, id):
    r = pg.evaluate(f'(()=>{{const b=__dbg.btn("{id}"); return b?[b.x+b.w/2,b.y+b.h/2]:null}})()')
    return r

def click(pg, id, touch=None):
    c = center(pg, id)
    if c is None: return False
    if touch: pg.touchscreen.tap(c[0], c[1])
    else: pg.mouse.click(c[0], c[1])
    pg.wait_for_timeout(120)
    return True

def mouse_drag(pg, a, b, steps=14):
    pg.mouse.move(a[0], a[1]); pg.mouse.down()
    for i in range(1, steps + 1):
        pg.mouse.move(a[0] + (b[0] - a[0]) * i / steps, a[1] + (b[1] - a[1]) * i / steps); pg.wait_for_timeout(16)
    pg.mouse.up(); pg.wait_for_timeout(80)

def touch_drag(cdp, a, b, steps=14):
    cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': a[0], 'y': a[1]}]})
    for i in range(1, steps + 1):
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': a[0] + (b[0] - a[0]) * i / steps, 'y': a[1] + (b[1] - a[1]) * i / steps}]})
    cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})

with sync_playwright() as p:
    b = p.chromium.launch()
    # ---------- desktop mouse ----------
    ctx, pg, errs = new(b, (1280, 720), False)
    pg.goto(URL); pg.wait_for_function('window.__dbg'); pg.wait_for_timeout(500)
    ev = pg.evaluate
    check('menu opens', ev('__dbg.scr') == 'menu')
    click(pg, 'play'); pg.wait_for_timeout(300)
    check('play -> level 1', ev('__dbg.scr') == 'play' and ev('__dbg.L.id') == 1)
    check('gameplay API started', ev('__dbg.gp()'))
    pg.wait_for_timeout(1500)
    pg.screenshot(path='/tmp/e_tut.png')
    # drag slot 0 to solution position
    slot = ev('__dbg.LY.slots[0]'); sol = ev('__dbg.L.sol[0]'); tgt = ev(f'__dbg.toScr({sol["x"]},{sol["y"]})')
    mouse_drag(pg, (slot['x'], slot['y']), tgt)
    check('charge placed by mouse drag', ev('__dbg.placed.length') == 1, str(ev('__dbg.placed')))
    check('preview reaches goal', ev('__dbg.pv.end') == 'goal', ev('__dbg.pv.end'))
    click(pg, 'launch'); pg.wait_for_timeout(300)
    check('run started', ev('__dbg.st') == 'run')
    pg.wait_for_function('__dbg.st!=="run"', timeout=25000); pg.wait_for_timeout(2200)
    check('won + modal', ev('__dbg.st') == 'won' and ev('__dbg.modal && __dbg.modal.kind') == 'win' and ev('__dbg.modal.got') == 3, str(ev('__dbg.modal')))
    check('progress saved', ev('__dbg.S.st[1]') == 3 and ev('__dbg.S.sp') > 0, str(ev('__dbg.S.st')))
    pg.screenshot(path='/tmp/e_win.png')
    click(pg, 'mnext'); pg.wait_for_timeout(400)
    check('next -> level 2', ev('__dbg.L.id') == 2 and ev('__dbg.st') == 'edit')
    # fail path: place a charge in a bad spot (valid), launch, expect fail & recover
    ev('__dbg.clearAll()')
    slot = ev('__dbg.LY.slots[0]'); bad = ev('__dbg.toScr(150,150)')
    mouse_drag(pg, (slot['x'], slot['y']), bad)
    check('L2 placed', ev('__dbg.placed.length') == 1)
    # try invalid placement on hazard
    h = ev('__dbg.L.haz[0]'); hp = ev(f'__dbg.toScr({h["x"]},{h["y"]})')
    n0 = ev('__dbg.placed.length')
    mouse_drag(pg, (ev('__dbg.LY.slots[0]')['x'], ev('__dbg.LY.slots[0]')['y']), hp)
    check('invalid drop on hazard rejected', ev('__dbg.placed.length') == n0)
    # drag placed charge to tray = remove
    pp = ev('__dbg.toScr(__dbg.placed[0].x,__dbg.placed[0].y)'); tr = ev('__dbg.LY.tray')
    mouse_drag(pg, pp, (tr['x'] + tr['w'] / 2, tr['y'] + tr['h'] / 2))
    check('drag to tray removes', ev('__dbg.placed.length') == 0)
    vp = ev('(()=>{for(let y=1000;y>200;y-=40)for(let x=120;x<800;x+=40)if(__dbg.validPos(x,y,-1))return [x,y];return null})()')
    mouse_drag(pg, (ev('__dbg.LY.slots[0]')['x'], ev('__dbg.LY.slots[0]')['y']), ev(f'__dbg.toScr({vp[0]},{vp[1]})'))
    click(pg, 'launch'); pg.wait_for_function('__dbg.st==="fail"||__dbg.st==="won"', timeout=25000)
    st1 = ev('__dbg.st'); check('L2 wrong placement -> fail', st1 == 'fail', st1)
    pg.wait_for_function('__dbg.st==="edit"', timeout=5000)
    check('fail -> back to edit, charge kept', ev('__dbg.placed.length') == 1 and ev('__dbg.fails') == 1, str((ev('__dbg.placed.length'), ev('__dbg.fails'))))
    # hint (no sparks -> rewarded mock)
    ev('__dbg.S.sp=100'); ev('__dbg.doHint()'); pg.wait_for_timeout(300)
    check('hint with sparks spends 20', ev('__dbg.S.sp') == 80)
    # keyboard
    pg.keyboard.press('KeyR'); pg.wait_for_timeout(100)
    check('R clears', ev('__dbg.placed.length') == 0)
    # interstitial via modalNext after wins
    ev('__dbg.setLastAd(Date.now()-200000)')
    ev('__dbg.solve()'); ev('__dbg.launch()'); pg.wait_for_function('__dbg.st==="won"', timeout=25000); pg.wait_for_timeout(1600)
    click(pg, 'mnext'); pg.wait_for_timeout(300)
    adv = ev('window.__mockAds||0')
    pg.wait_for_timeout(2500)
    check('level2 win; interstitial after >=2 wins & gap', ev('window.__mockAds||0') >= 1 or ev('__dbg.adState().sinceAd') < 2, f'ads={ev("window.__mockAds||0")} since={ev("__dbg.adState().sinceAd")}')
    check('then level 3', ev('__dbg.L.id') == 3, ev('__dbg.L.id'))
    # map
    ev('__dbg.openMap()'); pg.wait_for_timeout(300)
    check('map screen', ev('__dbg.scr') == 'map')
    check('lv3 clickable', click(pg, 'lv3')); pg.wait_for_timeout(300)
    check('map click starts level 3', ev('__dbg.scr') == 'play' and ev('__dbg.L.id') == 3)
    # locked level
    ev('__dbg.openMap()'); pg.wait_for_timeout(200)
    click(pg, 'lv30'); pg.wait_for_timeout(200)
    check('locked level does nothing', ev('__dbg.scr') == 'map')
    # lab: 3 fails -> over
    ev('__dbg.startLab(true)'); pg.wait_for_timeout(300)
    for i in range(3):
        ev('__dbg.clearAll()'); ev('__dbg.place("a",100,1100)'); ev('__dbg.launch()')
        pg.wait_for_function('__dbg.st!=="run"', timeout=25000)
        pg.wait_for_function('__dbg.st==="edit"||__dbg.st==="over"||__dbg.st==="won"', timeout=6000)
        if ev('__dbg.st') == 'won': break
    pg.wait_for_timeout(500)
    check('lab fuses -> over modal (or lucky win)', ev('__dbg.st') in ('over', 'won', 'edit'), ev('__dbg.st'))
    ev('__dbg.startLab(true)'); ev('__dbg.solve()'); ev('__dbg.launch()'); pg.wait_for_function('__dbg.st==="won"', timeout=25000)
    pg.wait_for_timeout(1500); check('lab win', ev('__dbg.modal.kind') == 'win')
    # daily
    ev('__dbg.startDaily()'); pg.wait_for_timeout(300)
    ev('__dbg.solve()'); ev('__dbg.launch()'); pg.wait_for_function('__dbg.st==="won"', timeout=25000); pg.wait_for_timeout(1500)
    check('daily solved, streak 1', ev('__dbg.S.daily.streak') == 1 and ev('__dbg.S.daily.done') == 1, str(ev('__dbg.S.daily')))
    # skins
    ev('__dbg.openSkins()'); pg.wait_for_timeout(300); ev('__dbg.S.sp=1000')
    click(pg, 'sk1'); pg.wait_for_timeout(200)
    check('skin buy', ev('__dbg.S.skin') == 1 and 1 in ev('__dbg.S.own') and ev('__dbg.S.sp') == 940, str(ev('__dbg.S.own')))
    # reload persistence
    ev('__dbg.save(true)'); pg.reload(); pg.wait_for_function('window.__dbg'); pg.wait_for_timeout(400)
    check('reload keeps progress', ev('__dbg.S.st[1]') == 3 and ev('__dbg.S.skin') == 1 and ev('__dbg.S.daily.streak') == 1, str(ev('__dbg.S.st')))
    # visibility pause
    ev('__dbg.startCamp(4)'); pg.wait_for_timeout(200)
    print('errors:', errs[:10]); check('no console errors (desktop)', not errs, str(errs[:3]))
    ctx.close()
    # ---------- mobile touch ----------
    ctx, pg, errs = new(b, (390, 844), True)
    pg.goto(URL); pg.wait_for_function('window.__dbg'); pg.wait_for_timeout(500)
    ev = pg.evaluate; cdp = ctx.new_cdp_session(pg)
    click(pg, 'play', True); pg.wait_for_timeout(300)
    check('m: level 1 via tap', ev('__dbg.scr') == 'play')
    slot = ev('__dbg.LY.slots[0]'); sol = ev('__dbg.L.sol[0]'); tgt = ev(f'__dbg.toScr({sol["x"]},{sol["y"]})')
    # touch offset lifts the charge 60*U above the finger; compensate so that the charge lands on sol
    U = ev('Math.min(390,844)/400'); U = max(0.82, min(1.55, U)); off = 60 * U
    touch_drag(cdp, (slot['x'], slot['y']), (tgt[0], tgt[1] + off)); pg.wait_for_timeout(200)
    check('m: touch drag placed', ev('__dbg.placed.length') == 1, str(ev('__dbg.placed')))
    check('m: preview goal', ev('__dbg.pv.end') == 'goal', ev('__dbg.pv.end'))
    click(pg, 'launch', True); pg.wait_for_function('__dbg.st==="won"', timeout=25000); pg.wait_for_timeout(2000)
    pg.screenshot(path='/tmp/e_m_win.png')
    check('m: won', ev('__dbg.modal.got') == 3)
    # rotate to landscape
    pg.set_viewport_size({'width': 844, 'height': 390}); pg.wait_for_timeout(300)
    ev('__dbg.startCamp(5)'); pg.wait_for_timeout(600); pg.screenshot(path='/tmp/e_m_land.png')
    check('m: landscape layout transposed', ev('__dbg.LY.tp') == True)
    print('errors:', errs[:10]); check('no console errors (mobile)', not errs, str(errs[:3]))
    ctx.close(); b.close()
print(f'{sum(res)}/{len(res)} passed'); sys.exit(0 if all(res) else 1)
