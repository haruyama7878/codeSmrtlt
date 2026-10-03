# Triển khai database trên server (k3s) — tài liệu vận hành

## Kiến trúc
Mọi thứ chạy trên server `118.70.169.236` (SSH port 1912, user `sonvx`), trong k3s namespace `default`:

| Thành phần | Cách chạy | Port nội bộ | Port ngoài |
|---|---|---|---|
| PostgreSQL 14 (drizzle app) | StatefulSet `pg-db` + PVC `pg-db-data` (20Gi, local-path) | NodePort **30432** | bị NAT chặn |
| Supabase Auth (GoTrue v2.170 + nginx sidecar) | Deployment `supabase-auth` | NodePort **30800** | bị NAT chặn |
| App Next.js production | process node trên host, `~/app` | **3456** | cần mở port nếu truy cập ngoài LAN |

- DB `app_db` → bảng app: `users`, `lessons`, `quiz_attempts`, `daily_activity` (drizzle-kit push).
- DB `supabase_auth` → schema `auth` của GoTrue (tự migrate).
- GoTrue được đặt sau nginx sidecar để strip prefix `/auth/v1`.
- App Next.js dùng **rewrite proxy** `/auth/v1/*` → `127.0.0.1:30800` (cùng origin, chỉ cần mở 1 port).

## Endpoints
- Supabase Auth (qua tunnel / nội bộ): `http://localhost:30800` hoặc `http://127.0.0.1:30800`
- PostgreSQL: `postgresql://postgres:<DB_PASSWORD>@<host>:30432/app_db`
- App trên server: `http://192.168.167.251:3456` (LAN), `http://127.0.0.1:3456` (server)

## Secret
Xem `d:\Games\rrr\.env.local` / `.env.production` và manifest `~/deploy/*.yaml` trên server.
- `DB_PASSWORD`, `JWT_SECRET`, `OPERATOR_TOKEN`, `ANON_KEY`, `SERVICE_ROLE_KEY`
- Đổi secret = sửa manifest + `.env`, restart pod, **tạo lại ANON_KEY/SERVICE_ROLE_KEY** bằng `generate-secrets.js`.

## Local dev (máy Windows)
1. Mở tunnel: `powershell -ExecutionPolicy Bypass -File deploy-k8s\tunnel.ps1`
   (mở localhost:30432 → Postgres, localhost:30800 → Auth; cần SSH key đã cài lên server).
2. `npm run dev` → `http://localhost:3000` (dùng `.env.local`).
3. Nếu sửa schema: `npx drizzle-kit push`.

## Deploy lên server
```bash
# đóng gói (loại node_modules/.next/ui_game_level deploy-k8s)
tar -czf app-src.tar.gz --exclude=node_modules --exclude=.next --exclude=ui_game_level --exclude=deploy-k8s --exclude=.env.local --exclude=tsconfig.tsbuildinfo .
scp -P 1912 app-src.tar.gz sonvx@118.70.169.236:~/
ssh -p 1912 sonvx@118.70.169.236 "rm -rf ~/app && mkdir -p ~/app && tar -xzf ~/app-src.tar.gz -C ~/app && cd ~/app && npm ci && npm run build"
ssh -p 1912 sonvx@118.70.169.236 "cd ~/app && (nohup env HOSTNAME=0.0.0.0 PORT=3456 npm run start > app.log 2>&1 &)"
# ui_game_level/src phải upload riêng nếu đổi:
tar -czf game-src.tar.gz -C ui_game_level src && scp -P 1912 game-src.tar.gz sonvx@118.70.169.236:~/ && ssh -p 1912 sonvx@118.70.169.236 "tar -xzf ~/game-src.tar.gz -C ~/app/ui_game_level"
```

## Ghi chú quan trọng
- Server nằm sau NAT: từ Internet chỉ mở port **1912 (SSH)**. Muốn truy cập app từ ngoài phải nhờ quản trị mạng forward 1 port (vd 3456) vào máy, rồi đổi `NEXT_PUBLIC_SUPABASE_URL` trong `.env.production` thành địa chỉ công khai + build lại.
- Không chạy app ở port 3000 (đã có service khác dùng). Các port 5430/5431/5435/15432 là của hệ thống lab, đừng đụng vào.
- Pod app (nohup) không tự khởi động khi máy reboot — dùng `~/app/start.sh`.
- `sonvx` không có sudo/docker; mọi thứ chạy qua k3s (toàn quyền namespace `default`).
