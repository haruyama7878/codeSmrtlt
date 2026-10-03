# Mo SSH tunnel toi server de local dev ket noi DB + Supabase Auth + APP
# Chay:  powershell -ExecutionPolicy Bypass -File tunnel.ps1
# Tunnel:
#   localhost:30432 -> server postgres (app_db)   [127.0.0.1:30432]
#   localhost:30800 -> server supabase auth       [127.0.0.1:30800]
#   localhost:3456  -> server app Next.js         [127.0.0.1:3456]
Write-Host "Opening SSH tunnel:"
Write-Host "  http://localhost:3456  (app)"
Write-Host "  localhost:30432 (Postgres) | localhost:30800 (Supabase Auth)"
Write-Host "Press Ctrl+C to close."
ssh -N -o ServerAliveInterval=30 -o ExitOnForwardFailure=yes -p 1912 `
  -L 30432:127.0.0.1:30432 `
  -L 30800:127.0.0.1:30800 `
  -L 3456:127.0.0.1:3456 `
  sonvx@118.70.169.236
