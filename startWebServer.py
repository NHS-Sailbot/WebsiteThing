from http.server import HTTPServer, SimpleHTTPRequestHandler

httpd = HTTPServer(('localhost', 8000), SimpleHTTPRequestHandler)
print("Serving HTTP on port 8000... (aka navigate to http://localhost:8000 in your browser to see the client UI)")
httpd.serve_forever()