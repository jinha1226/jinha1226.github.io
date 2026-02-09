#!/usr/bin/env python3
"""ScreenPad proxy server — serves static files + proxies game pages as same-origin."""
import http.server
import urllib.request
import urllib.parse
import ssl
import re
import os
import sys
from urllib.parse import urljoin

PORT = 8080
STATIC_DIR = os.path.dirname(os.path.abspath(__file__))


class ScreenPadHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=STATIC_DIR, **kwargs)

    def end_headers(self):
        # Prevent browser caching of ALL responses
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/proxy':
            self.handle_proxy(parsed)
        else:
            super().do_GET()

    def handle_proxy(self, parsed):
        params = urllib.parse.parse_qs(parsed.query)
        url = params.get('url', [None])[0]
        if not url:
            self.send_error(400, 'Missing url parameter')
            return

        try:
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE

            req = urllib.request.Request(url, headers={
                'User-Agent': (
                    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) '
                    'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 '
                    'Mobile/15E148 Safari/604.1'
                ),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'identity',
            })

            with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
                content_type = resp.headers.get('Content-Type', 'application/octet-stream')
                data = resp.read()

                # For HTML: inject <base> tag so relative resources load from the original domain
                if 'text/html' in content_type:
                    base_url = urljoin(url, '.')
                    base_tag = f'<base href="{base_url}">'.encode()

                    # Insert after <head...>
                    head_re = re.compile(b'(<head[^>]*>)', re.IGNORECASE)
                    if head_re.search(data):
                        data = head_re.sub(b'\\1' + base_tag, data, count=1)
                    else:
                        data = base_tag + data

                self.send_response(200)
                self.send_header('Content-Type', content_type)
                self.send_header('Content-Length', len(data))
                self.end_headers()
                self.wfile.write(data)

        except urllib.error.HTTPError as e:
            self.send_error(e.code, f'Upstream: {e.reason}')
        except Exception as e:
            self.send_error(502, f'Proxy error: {e}')

    def log_message(self, fmt, *args):
        sys.stderr.write(f'[ScreenPad] {args[0]}\n')


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    server = http.server.HTTPServer(('0.0.0.0', port), ScreenPadHandler)
    print(f'ScreenPad server on http://0.0.0.0:{port}')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()
