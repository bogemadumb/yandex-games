import http.server, socketserver, sys, os
root = sys.argv[1]; port = int(sys.argv[2])
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=root, **k)
    def do_GET(self):
        if self.path.split('?')[0] == '/sdk.js':
            self.send_response(200); self.send_header('Content-Type', 'application/javascript'); self.send_header('Content-Length', '0'); self.end_headers(); return
        if self.path.split('?')[0] == '/favicon.ico':
            self.send_response(204); self.end_headers(); return
        super().do_GET()
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
socketserver.ThreadingTCPServer(('127.0.0.1', port), H).serve_forever()
