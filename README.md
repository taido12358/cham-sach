# Trang Sách — CLB Sách THCS Đại Phúc

Project đầy đủ cho website CLB Sách trường THCS, viết theo 2 kiến trúc để bạn chọn:

```
trang-sach/
├── backend/              # Node.js + Express + MongoDB
├── frontend/             # React + Vite + React Router (SPA)
└── nextjs-supabase/      # Next.js 14 + Supabase (all-in-one)
```

## Chọn phiên bản nào?

### Dùng `backend/` + `frontend/` nếu:
- Bạn muốn học cách viết full-stack truyền thống
- Muốn kiểm soát toàn bộ API server
- Có sẵn kiến thức MongoDB / Express

### Dùng `nextjs-supabase/` nếu:
- Muốn ship nhanh nhất có thể (2 giờ là xong)
- Không muốn quản lý 2 server riêng biệt
- Muốn dùng RLS + Realtime + Auth có sẵn
- **→ Khuyến nghị cho CLB trường**

## Tài khoản demo (chỉ backend version)

Sau khi chạy `npm run seed` trong `backend/`:

| Role    | Email                     | Password    |
|---------|---------------------------|-------------|
| Admin   | admin@daiphuc.edu.vn      | admin123    |
| Student | minhanh@student.edu.vn    | student123  |

## Tính năng đầy đủ

Cả 2 phiên bản đều hỗ trợ:

- 📚 Thư viện sách với 4 thể loại (Văn học / Kỹ năng / Lịch sử / Thiếu nhi)
- ✍️ Viết review, moderation workflow (pending → approved/rejected)
- ❤️ 4 loại reactions (inspired / moved / thoughtful / fun)
- 🏆 Gamification: XP, Level, Streak, Badges
- 🔐 Auth với role-based access (student / ctv / admin)
- 🎯 Thử thách đọc sách 7 ngày + Bảng xếp hạng
- 💾 Bookmark sách yêu thích
- 📱 Responsive design (mobile + desktop)

## Thiết kế

Phong cách **editorial/tạp chí văn học** — không giống website trường thông thường:
- Màu: xanh rừng (`#1F3A2D`) + amber (`#C8841C`) + cream (`#F7F3EA`)
- Font: Fraunces (serif literary) + DM Sans
- Layout: asymmetric, nhiều white space, hover tilt cho sách

## Deploy production

### Backend + Frontend
- Backend → Render/Railway (free tier)
- Frontend → Vercel (free)
- Database → MongoDB Atlas (free 512MB)

### Next.js + Supabase
- Tất cả trong 1 → Vercel (free)
- Database + Auth → Supabase (free 500MB)

→ Cả 2 phương án đều **0₫/tháng** cho CLB trường.

## Xem chi tiết

- [`backend/README.md`](backend/README.md) — hướng dẫn Node.js backend
- [`frontend/README.md`](frontend/README.md) — hướng dẫn React frontend
- [`nextjs-supabase/README.md`](nextjs-supabase/README.md) — hướng dẫn Next.js + Supabase
