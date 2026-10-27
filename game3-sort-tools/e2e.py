import sys, json
from playwright.sync_api import sync_playwright
SP = sys.argv[1]
URL = 'http://127.0.0.1:8765/index.html?debug&lang=en&adms=300'
paths = json.load(open(SP + '/paths20.json'))
res = []
def check(name, ok, info=''):
    res.append((name, bool(ok), info)); print(('PASS ' if ok else 'FAIL ') + name, info)

def run(b, label, vp, mobile):
    errs = []
    ctx = b.new_context(viewport={'width': vp[0], 'height': vp[1]}, device_scale_factor=2, is_mobile=mobile, has_touch=mobile)
    pg = ctx.new_page()
    pg.on('console', lambda m: errs.append((m.type, m.text)) if m.type in ('error', 'warning') else None)
    pg.on('pageerror', lambda e: errs.append(('pageerror', str(e))))
    pg.on('requestfailed', lambda r: errs.append(('reqfail', r.url)))
    pg.goto(URL); pg.wait_for_timeout(700)
    ev = pg.evaluate
    check(label + ' menu opens', ev('__dbg.info().modal'))
    pg.click('.btns .btn.green'); pg.wait_for_timeout(300)
    check(label + ' menu play closes modal', not ev('__dbg.info().modal'))
    def tap(i):
        p = ev(f'__dbg.pos({i})')
        if mobile: pg.touchscreen.tap(p['x'], p['y'])
        else: pg.mouse.click(p['x'], p['y'])
        pg.wait_for_timeout(120)
    # real taps: solve level 1
    for m in paths['1']:
        tap(m[0]); sel = ev('__dbg.G.sel'); 
        if sel != m[0]: check(label + ' select tube', False, f'sel={sel} want {m[0]}'); break
        tap(m[1]); pg.wait_for_timeout(520)
    check(label + ' L1 solved via real taps', ev('__dbg.G.won'))
    pg.wait_for_timeout(1500)
    check(label + ' win modal shown', ev('__dbg.info().modal') and pg.locator('.stars svg').count() == 3)
    pg.screenshot(path=f'{SP}/e_{label}_win.png')
    check(label + ' progress after win', ev('__dbg.S.maxLvl') == 2 and ev('__dbg.S.st[1]') >= 1, f"maxLvl={ev('__dbg.S.maxLvl')} stars={ev('__dbg.S.st[1]')}")
    pg.click('.btns .btn.green', force=True); pg.wait_for_timeout(500)
    check(label + ' next -> level 2', ev('__dbg.G.n') == 2 and ev('__dbg.S.since') == 1)
    # invalid move / undo
    tap(0); tap(1); pg.wait_for_timeout(600)
    # undo flow: use real moves from path 2
    for m in paths['2'][:3]:
        ev(f'__dbg.doMove({m[0]},{m[1]})'); pg.wait_for_timeout(450)
    for k in range(3): pg.click('#bundo'); pg.wait_for_timeout(100)
    check(label + ' 3 free undos', ev('__dbg.G.undos') == 0 and ev('__dbg.G.hist.length') == 0, f"undos={ev('__dbg.G.undos')} hist={ev('__dbg.G.hist.length')}")
    ev(f'__dbg.doMove({paths["2"][0][0]},{paths["2"][0][1]})'); pg.wait_for_timeout(450)
    pg.click('#bundo'); pg.wait_for_timeout(900)
    check(label + ' undo w/o charges calls rewarded and grants +3', ev('window.__mockRewarded') == 1 and ev('__dbg.G.undos') == 2 and ev('__dbg.G.hist.length') == 0, f"rew={ev('window.__mockRewarded')} undos={ev('__dbg.G.undos')}")
    n0 = ev('__dbg.G.tubes.length'); pg.click('#btube'); pg.wait_for_timeout(1000)
    check(label + ' extra tube via rewarded', ev('__dbg.G.tubes.length') == n0 + 1 and ev('__dbg.G.extra') == 1, f"{n0}->{ev('__dbg.G.tubes.length')}")
    pg.screenshot(path=f'{SP}/e_{label}_tube.png')
    pg.click('#btube'); pg.wait_for_timeout(300)
    check(label + ' second extra tube refused', ev('__dbg.G.tubes.length') == n0 + 1 and ev('window.__mockRewarded') == 2)
    # restart confirm
    ev(f'__dbg.doMove({paths["2"][0][0]},{paths["2"][0][1]})'); pg.wait_for_timeout(450)
    pg.click('#brestart'); pg.wait_for_timeout(300)
    check(label + ' restart asks confirm', ev('__dbg.info().modal'))
    pg.click('.btns .btn.pink', force=True); pg.wait_for_timeout(300)
    check(label + ' restart resets', ev('__dbg.G.hist.length') == 0 and ev('__dbg.G.tubes.length') == n0 and ev('__dbg.G.undos') == 3)
    # map
    pg.click('#bmap'); pg.wait_for_timeout(500)
    nodes = pg.locator('.node[data-n]').count()
    check(label + ' level map', nodes == 320, f'nodes={nodes}')
    pg.screenshot(path=f'{SP}/e_{label}_map.png')
    pg.click('.x'); pg.wait_for_timeout(200)
    # pattern toggle
    pg.click('#bpat'); pg.wait_for_timeout(300)
    check(label + ' pattern toggle', ev('__dbg.S.pat') is True)
    ev('__dbg.startLevel(40)'); pg.wait_for_timeout(500)
    pg.screenshot(path=f'{SP}/e_{label}_pat.png')
    pg.click('#bpat'); pg.wait_for_timeout(100)
    # bfs paths for 20 levels through game rules
    ok = 0
    for n in range(1, 21):
        ev(f'__dbg.startLevel({n})')
        for m in paths[str(n)]: ev(f'__dbg.doMove({m[0]},{m[1]})')
        if ev('__dbg.G.won'): ok += 1
    pg.wait_for_timeout(2500)
    check(label + ' first 20 levels solved in-game by BFS paths', ok == 20, f'{ok}/20')
    ev('__dbg.closeM()')
    # interstitial pacing
    ev('__dbg.S.since = 3'); ev('__dbg.startLevel(1)'); ev('__dbg.G.won=false')
    a0 = ev('window.__mockAds || 0')
    ev('__dbg.goLevel(2)'); pg.wait_for_timeout(2500)
    check(label + ' no interstitial within 90s of start', (ev('window.__mockAds || 0') - a0) == 0 and ev('__dbg.G.n') == 2 and ev('__dbg.S.since') == 3)
    ev('__dbg.setLastAd(0)'); ev('__dbg.goLevel(3)'); pg.wait_for_timeout(500)
    shown = pg.locator('#adov:not(.hidden)').count() or pg.locator('#mockad').count()
    pg.wait_for_timeout(2500)
    check(label + ' interstitial after 3 levels when 90s passed', (ev('window.__mockAds || 0') - a0) == 1 and ev('__dbg.G.n') == 3 and ev('__dbg.S.since') == 0, f"ads={ev('window.__mockAds||0')} since={ev('__dbg.S.since')}")
    ev('__dbg.S.since = 3'); ev('__dbg.goLevel(4)'); pg.wait_for_timeout(2500)
    check(label + ' 2nd ad blocked by 90s gap', (ev('window.__mockAds || 0') - a0) == 1 and ev('__dbg.G.n') == 4)
    # persistence
    ev('__dbg.startLevel(5)')
    m = paths['5'][0]; ev(f'__dbg.doMove({m[0]},{m[1]})'); pg.wait_for_timeout(500)
    ev('__dbg.save(true)')
    pg.reload(); pg.wait_for_timeout(900)
    check(label + ' resume after reload', ev('__dbg.G.n') == 5 and ev('__dbg.G.hist.length') == 1 and ev('__dbg.S.maxLvl') >= 21, f"n={ev('__dbg.G.n')} hist={ev('__dbg.G.hist.length')} max={ev('__dbg.S.maxLvl')}")
    # stuck modal
    ev('__dbg.closeM()'); ev('__dbg.showStuck()'); pg.wait_for_timeout(400)
    pg.screenshot(path=f'{SP}/e_{label}_stuck.png')
    check(label + ' stuck modal', ev('__dbg.info().modal'))
    check(label + ' no console errors/warnings', not errs, str(errs))
    ctx.close()

with sync_playwright() as p:
    b = p.chromium.launch()
    run(b, 'mobile390', (390, 844), True)
    run(b, 'desk1280', (1280, 720), False)
    b.close()
bad = [r for r in res if not r[1]]
print('TOTAL', len(res), 'FAILED', len(bad))
