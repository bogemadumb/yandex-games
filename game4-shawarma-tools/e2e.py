import sys, json, re
from playwright.sync_api import sync_playwright
SP = sys.argv[1]
BASE = 'http://127.0.0.1:8771/index.html?debug&adms=250&lang='
res = []
def check(name, ok, info=''):
    res.append((name, bool(ok), info)); print(('PASS ' if ok else 'FAIL ') + name, info)

def run(b, label, vp, mobile, lang):
    errs = []
    ctx = b.new_context(viewport={'width': vp[0], 'height': vp[1]}, device_scale_factor=2, is_mobile=mobile, has_touch=mobile)
    pg = ctx.new_page()
    pg.on('console', lambda m: errs.append((m.type, m.text)) if m.type in ('error', 'warning') else None)
    pg.on('pageerror', lambda e: errs.append(('pageerror', str(e))))
    pg.on('requestfailed', lambda r: errs.append(('reqfail', r.url)))
    pg.goto(BASE + lang); pg.wait_for_timeout(700)
    ev = pg.evaluate
    P = label + ' '
    check(P + 'lang applied', ev('document.documentElement.lang') == lang and ev('__dbg.L') == lang)
    def tap(x, y):
        if mobile: pg.touchscreen.tap(x, y)
        else: pg.mouse.click(x, y)
        pg.wait_for_timeout(40)
    sc = ev('__dbg.scene')
    cxp, cyp = ev('__dbg.sx(200)'), ev('__dbg.sy(230)')
    c0 = ev('__dbg.S.cash'); tap(cxp, cyp)
    d = ev('__dbg.S.cash') - c0
    check(P + 'tap gives cash', abs(d - 1) < 1e-6, f'+{d}')
    for i in range(8): tap(cxp + i, cyp)
    c1 = ev('__dbg.S.cash'); tap(cxp, cyp); d10 = ev('__dbg.S.cash') - c1
    check(P + '10th tap is x5 crit', abs(d10 - 5) < 1e-6, f'+{d10}')
    for i in range(30): tap(cxp, cyp)
    check(P + 'heat -> fire after taps', ev('__dbg.fire') > 0, f"fire={ev('__dbg.fire'):.2f}")
    ev('__dbg.setCash(15)')
    pg.click('.row .buy'); pg.wait_for_timeout(100)
    check(P + 'hire first cook via UI', ev('__dbg.S.n[0]') == 1 and ev('__dbg.S.cash') < 6, f"n0={ev('__dbg.S.n[0]')}")
    ev('__dbg.setCash(200)')
    ev('__dbg.buyStand(1)'); pg.wait_for_timeout(150)
    check(P + 'new stand modal first time', ev('__dbg.modal') and ev('__dbg.S.n[1]') == 1)
    pg.screenshot(path=f'{SP}/e_{label}_{lang}_unlock.png')
    pg.click('.btns .btn'); pg.wait_for_timeout(200)
    check(P + 'unlock modal closes', not ev('__dbg.modal'))
    ev('__dbg.setCash(1e6)'); ev('__dbg.setQty(10)'); pg.wait_for_timeout(200)
    n0 = ev('__dbg.S.n[0]'); pg.click('.row .buy'); pg.wait_for_timeout(100)
    check(P + 'x10 buy', ev('__dbg.S.n[0]') == n0 + 10, f"{n0}->{ev('__dbg.S.n[0]')}")
    ev('__dbg.setQty(0)'); ev('__dbg.setCash(1e9)'); pg.wait_for_timeout(200)
    n0 = ev('__dbg.S.n[0]'); cash = ev('__dbg.S.cash'); mb = ev(f'__dbg.E.maxBuy(0,{n0},{cash})'); pg.click('.row .buy'); pg.wait_for_timeout(100)
    check(P + 'max buy', ev('__dbg.S.n[0]') == n0 + mb and mb > 10, f"+{mb}")
    ev('__dbg.setQty(1)')
    ev('__dbg.setCash(1e8)')
    pg.click('.tab[data-t=ups]'); pg.wait_for_timeout(250)
    rows = pg.locator('#list .row').count()
    check(P + 'upgrades tab rows', rows >= 3, f'rows={rows}')
    pg.screenshot(path=f'{SP}/e_{label}_{lang}_ups.png')
    t0 = ev('__dbg.S.tap'); pg.locator('#list .row .buy').first.click(); pg.wait_for_timeout(100)
    check(P + 'tap upgrade bought', ev('__dbg.S.tap') == t0 + 1)
    ev('__dbg.S.n[0]=12'); pg.wait_for_timeout(300)
    ev('__dbg.buyUp("s0a")'); check(P + 'stand upgrade bought', ev('__dbg.S.up.s0a') is True)
    c = ev('__dbg.cps()'); ev('__dbg.buyUp("g1")'); c2 = ev('__dbg.cps())'.replace('))', ')'))
    check(P + 'global upgrade x1.5', abs(c2 / c - 1.5) < 0.01, f'{c2/c:.3f}')
    # ads
    check(P + 'no interstitial within 90s', ev('__dbg.canAd()') is False)
    ev('__dbg.setLastAd(Date.now()-95000)'); check(P + 'interstitial allowed after 90s', ev('__dbg.canAd()') is True)
    a0 = ev('window.__mockAds||0'); ev('__dbg.breakpoint()'); pg.wait_for_timeout(2200)
    check(P + 'interstitial shown once', ev('window.__mockAds||0') == a0 + 1 and ev('__dbg.canAd()') is False and not ev('__dbg.paused'))
    pg.click('.tab[data-t=stands]')
    cs = ev('__dbg.S.cash'); pg.click('#bboost', force=True); pg.wait_for_timeout(1600)
    check(P + 'rewarded x2 income', ev('__dbg.S.boost') > 200 and ev('window.__mockRewarded') == 1 and ev('__dbg.paused') is False, f"boost={ev('__dbg.S.boost'):.0f}")
    cs = ev('__dbg.S.cash'); pg.click('#bcash', force=True); pg.wait_for_timeout(1600)
    check(P + 'rewarded cash', ev('__dbg.S.cash') > cs * 1.0 and ev('window.__mockRewarded') == 2, f"+{ev('__dbg.S.cash')-cs:.0f}")
    pg.click('#bcash', force=True); pg.wait_for_timeout(300)
    check(P + 'cash ad cooldown blocks', ev('window.__mockRewarded') == 2)
    # daily
    ev('__dbg.closeM()'); pg.click('#bgift'); pg.wait_for_timeout(300)
    check(P + 'daily modal', ev('__dbg.modal'))
    pg.screenshot(path=f'{SP}/e_{label}_{lang}_daily.png')
    cs = ev('__dbg.S.cash'); pg.click('.btns .btn.green'); pg.wait_for_timeout(300)
    check(P + 'daily claimed', ev('__dbg.S.cash') > cs and ev('__dbg.S.daily.streak') == 1)
    pg.wait_for_timeout(1600)
    # offline
    ev('(()=>{__dbg.save(true);const k="swt_save_v1";const o=JSON.parse(localStorage.getItem(k));o.savedAt=Date.now()-7200000;localStorage.setItem(k,JSON.stringify(o));localStorage.setItem("mock_ysdk_cloud","{}");})()')
    ev('(()=>{const o=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==="swt_save_v1"||k==="mock_ysdk_cloud")return;return o.call(this,k,v)}})()')
    pg.reload(); pg.wait_for_timeout(900)
    check(P + 'offline modal on reload', ev('__dbg.modal') and pg.locator('.card .big').count() == 1, str((ev('__dbg.modal'), pg.locator('.card .big').count(), ev('Date.now()-__dbg.S.savedAt'), ev('__dbg.cps()'), pg.locator('.card').inner_text()[:60])))
    pg.screenshot(path=f'{SP}/e_{label}_{lang}_offline.png')
    ev('__dbg.closeM()')
    check(P + 'state persisted', ev('__dbg.S.n[0]') > 10 and ev('__dbg.S.up.s0a') is True)
    # prestige
    ev('__dbg.setCash(5e6)'); pg.click('.tab[data-t=fr]'); pg.wait_for_timeout(300)
    check(P + 'franchise button enabled', pg.locator('#list .frbox .btn.green').count() == 1)
    pg.screenshot(path=f'{SP}/e_{label}_{lang}_fr.png')
    g = ev('__dbg.E.prestigeGain(__dbg.S.run)'); pg.click('#list .frbox .btn'); pg.wait_for_timeout(300)
    check(P + 'prestige confirm modal', ev('__dbg.modal'))
    pg.click('.btns .btn.green'); pg.wait_for_timeout(500)
    check(P + 'prestige resets, stars kept', ev('__dbg.S.stars') == g and g >= 10 and ev('__dbg.S.n[0]') == 0 and ev('__dbg.S.cash') == 0 and ev('__dbg.S.pc') == 1, f'stars={g}')
    pg.screenshot(path=f'{SP}/e_{label}_{lang}_prestige.png')
    pg.click('.btns .btn.green'); pg.wait_for_timeout(300)
    pg.wait_for_timeout(400)
    # layout sanity
    box = ev('(()=>{const r=document.getElementById("panel").getBoundingClientRect();const f=document.getElementById("floaters").getBoundingClientRect();const h=document.getElementById("hud").getBoundingClientRect();return {p:[r.left,r.top,r.right,r.bottom],f:[f.left,f.top,f.right,f.bottom],h:[h.left,h.top,h.right,h.bottom],w:innerWidth,hh:innerHeight,sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight}})()')
    check(P + 'no page overflow', box['sw'] <= box['w'] and box['sh'] <= box['hh'], str(box['sw']) + 'x' + str(box['sh']))
    pg.screenshot(path=f'{SP}/e_{label}_{lang}_final.png')
    bad = [e for e in errs]
    check(P + 'no console errors/warnings', not bad, str(bad)[:300])
    if lang == 'tr':
        txt = ev('document.body.innerText')
        check(P + 'no Cyrillic in tr UI', not re.search('[А-Яа-яЁё]', txt))
    ctx.close()

with sync_playwright() as p:
    b = p.chromium.launch()
    for lang in sys.argv[2:] or ['en']:
        run(b, 'mobile', (390, 844), True, lang)
        run(b, 'desktop', (1280, 720), False, lang)
    b.close()
bad = [r for r in res if not r[1]]
print(f'\n{len(res)-len(bad)}/{len(res)} passed')
sys.exit(1 if bad else 0)
