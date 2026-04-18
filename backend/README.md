# Trang Sách — Backend (JSON Demo)

API server dùng **JSON file** làm database thay vì MongoDB. Zero setup, chạy ngay.

## Chạy 30 giây

```bash
npm install
npm run dev
```

**Đó là tất cả.** Không cần MongoDB, không cần `.env`, không cần `npm run seed`.

Lần đầu chạy, server sẽ tự tạo `data/db.json` với 6 sách + 4 user mẫu.

Server chạy tại `http://localhost:5000`.

## Tài khoản demo

| Role    | Email                     | Password    |
|---------|---------------------------|-------------|
| Admin   | admin@daiphuc.edu.vn      | admin123    |
| Student | minhanh@student.edu.vn    | student123  |
| Student | hoanglong@student.edu.vn  | student123  |
| Student | baohan@student.edu.vn     | student123  |

## Cấu trúc dữ liệu

Toàn bộ dữ liệu nằm trong **`data/db.json`**. Bạn có thể:
- Mở trực tiếp để xem/sửa dữ liệu
- Commit vào Git để chia sẻ demo với team
- Xoá file → server sẽ tự tạo lại dữ liệu mẫu lần tiếp

```json
{
  "users": [ ... ],
  "books": [ ... ],
  "reviews": [ ... ]
}
```

## Lệnh hữu ích

```bash
npm run dev      # Chạy dev server (auto-reload)
npm start        # Chạy production
npm run reset    # Xoá db.json và seed lại từ đầu
npm run seed     # Reset và seed (tương tự reset)
```

## API Endpoints

Toàn bộ API giữ nguyên như phiên bản MongoDB. Frontend không cần sửa gì.

### Auth
- `POST /api/auth/register` — `{ name, email, password, className }`
- `POST /api/auth/login` — `{ email, password }`
- `GET /api/auth/me` — current user (Bearer token)

### Books
- `GET /api/books` — list (query: category, search, featured, page, limit)
- `GET /api/books/:id`
- `POST /api/books` (admin/ctv)
- `PATCH /api/books/:id` (admin/ctv)
- `DELETE /api/books/:id` (admin)
- `POST /api/books/:id/bookmark`

### Reviews
- `GET /api/reviews`
- `GET /api/reviews/:id`
- `POST /api/reviews` — `{ book, title, content, rating }`
- `PATCH /api/reviews/:id/moderate` (admin/ctv)
- `POST /api/reviews/:id/react` — `{ type: 'inspired'|'moved'|'thoughtful'|'fun' }`
- `POST /api/reviews/:id/comments` — `{ content }`
- `DELETE /api/reviews/:id`

### Users
- `GET /api/users/leaderboard`
- `GET /api/users/:id` — public profile
- `PATCH /api/users/me`
- `POST /api/users/me/checkin`
- `GET /api/users/me/stats`

## Giới hạn của bản JSON

JSON file phù hợp cho:
- ✅ Demo / prototype
- ✅ CLB dưới ~500 user và ~10 concurrent request
- ✅ Chạy local / deploy lên single server

KHÔNG phù hợp cho:
- ❌ Production với > 1000 user
- ❌ Nhiều concurrent writes (có race condition)
- ❌ Deploy nhiều instance (file không sync giữa các server)

Khi cần scale, chuyển sang MongoDB/Postgres chỉ cần sửa file `config/db.js` —
routes giữ nguyên vì API nội bộ giống Mongoose.

## Deploy demo lên Render/Railway

1. Push lên GitHub
2. Render/Railway → New Web Service → connect repo
3. Build: `npm install` — Start: `npm start`
4. Thêm env: `JWT_SECRET=chuoi_ngau_nhien_day` và `FRONTEND_URL=https://your-frontend.vercel.app`

Với JSON file, mỗi lần server restart (Render free tier ngủ sau 15 phút không dùng) có thể **mất dữ liệu mới tạo** vì filesystem ephemeral. Nên với deploy thật, dùng MongoDB hoặc nâng cấp Render sang paid tier.
