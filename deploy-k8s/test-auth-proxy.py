import json
import urllib.request

ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzkwNDAyMTcxLCJleHAiOjIxMDU3NjIxNzF9.kYiOX2K0IFNGlNykbVIUVALnRTSkisyKMVk8ghmPY6E"

base = "http://127.0.0.1:3456"

body = json.dumps({"email": "demo2@example.com", "password": "demo123456"}).encode()

for name, path in [("health", "/auth/v1/health"), ("signup", "/auth/v1/signup")]:
    req = urllib.request.Request(
        base + path,
        data=body if name == "signup" else None,
        headers={"Content-Type": "application/json", "apikey": ANON},
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            print(name, "->", r.status, r.read()[:220])
    except urllib.error.HTTPError as e:
        print(name, "->", e.code, e.read()[:220])
