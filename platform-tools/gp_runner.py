import sys, re, runpy
from playwright.sync_api import sync_playwright, BrowserContext, Browser
MOCK = open(__file__.rsplit('/', 1)[0] + '/gp-mock.js').read()

def handler(route):
    cb = re.search(r'callback=([A-Za-z0-9_]+)', route.request.url)
    body = MOCK + ';setTimeout(function(){window["%s"](window.__gpMock)},30);' % (cb.group(1) if cb else 'onGPInit')
    route.fulfill(status=200, content_type='application/javascript', body=body)

orig = Browser.new_context
def new_context(self, *a, **k):
    ctx = orig(self, *a, **k)
    ctx.route(re.compile(r'game-score\.js'), handler)
    return ctx
Browser.new_context = new_context

if __name__ == '__main__':
    script = sys.argv[1]
    sys.argv = sys.argv[1:]
    runpy.run_path(script, run_name='__main__')
