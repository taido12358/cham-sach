# Trang Sách — Next.js 14 + Supabase

Bản này gộp toàn bộ backend + frontend thành một app Next.js duy nhất, dùng Supabase cho database + auth + RLS.

## Ưu điểm so với Node.js + Express

- ✅ Không cần chạy 2 server riêng biệt
- ✅ Auth sẵn (email/password, OAuth, magic link) — không cần viết JWT
- ✅ Phân quyền bằng RLS ở tầng database — an toàn hơn
- ✅ Server Components fetch trực tiếp, không cần REST API
- ✅ Deploy 1 lệnh `vercel` — khỏi lo CORS

## Setup

### 1. Tạo Supabase project (2 phút)

1. Vào [app.supabase.com](https://app.supabase.com) → **New Project**
2. Đặt tên, chọn region gần nhất (Singapore cho VN)
3. Đợi project khởi tạo xong (~1 phút)
4. Vào **Project Settings → API** → copy **URL** và **anon public key**

### 2. Chạy schema SQL

Vào **SQL Editor** trong Supabase dashboard → **New query** → paste toàn bộ `schema.sql` → **Run**.

Tạo xong 7 bảng + RLS policies + 6 sách mẫu.

### 3. Tạo admin đầu tiên

Vì RLS yêu cầu phải có role `admin` mới tạo sách được, bạn cần tạo 1 admin:

1. Đăng ký tài khoản bình thường qua `/dang-ky`
2. Vào Supabase → **Table Editor → profiles** → tìm user vừa tạo → đổi `role` thành `admin`

### 4. Chạy local

```bash
cd nextjs-supabase
cp .env.local.example .env.local
# → Điền NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY
npm install
npm run dev
```

Mở `http://localhost:3000`.

## Cấu trúc

```
nextjs-supabase/
├── middleware.js              # Refresh session + protect routes
├── schema.sql                 # Chạy trong Supabase SQL Editor
├── lib/
│   ├── supabase-browser.js    # Client-side
│   └── supabase-server.js     # Server components (cookies)
└── app/
    ├── layout.js              # Root layout + header + user menu
    ├── globals.css
    ├── user-menu.js
    ├── page.js                # / (trang chủ)
    ├── thu-vien/page.js       # /thu-vien
    ├── sach/[id]/page.js      # /sach/xxx
    ├── cam-nhan/
    │   ├── page.js            # /cam-nhan
    │   └── reaction-bar.js    # Client reaction buttons
    ├── viet-cam-nhan/
    │   ├── page.js            # /viet-cam-nhan (protected)
    │   └── form.js
    ├── dang-nhap/page.js
    ├── dang-ky/page.js
    └── ho-so/page.js          # /ho-so (protected)
```

## Deploy (1 lệnh)

```bash
npm install -g vercel
vercel
```

Thêm 2 env vars trong Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Push lên GitHub → Vercel tự auto-deploy mỗi commit.

## Chi phí

| Dịch vụ | Gói | Giới hạn | Giá |
|---|---|---|---|
| Vercel | Hobby | 100GB bandwidth/tháng | Free |
| Supabase | Free | 500MB DB, 2GB file, 50K MAU | Free |
| Domain | .com | - | ~250k/năm |

**Tổng: 0₫/tháng** cho đến khi CLB có > 50,000 MAU 😄

## So sánh nhanh 2 phiên bản

| | Node.js + Express + React | Next.js + Supabase |
|---|---|---|
| Số server | 2 (backend + frontend) | 1 |
| LOC | ~2,500 | ~1,500 |
| Auth | Tự viết JWT | Supabase lo sẵn |
| RLS | Logic trong code | Định nghĩa trong DB |
| Deploy | 2 dịch vụ riêng | 1 lệnh Vercel |
| Realtime | Cần thêm Socket.io | Supabase Realtime sẵn |
| Phù hợp khi | Muốn hiểu full-stack | Muốn ship nhanh |

Cho CLB trường, **Next.js + Supabase là lựa chọn khuyến nghị**.
