# Trang Sách - Frontend

React + Vite + React Router, kết nối backend qua REST API.

## Chạy trên máy

```bash
# 1. Cài dependencies
npm install

# 2. Đảm bảo backend đang chạy ở http://localhost:5000

# 3. Chạy dev server
npm run dev
```

Frontend chạy tại `http://localhost:5173`. Vite đã setup proxy `/api` → backend, nên không cần cấu hình CORS khi dev.

## Cấu trúc

```
src/
├── main.jsx              # Entry + BrowserRouter + AuthProvider
├── App.jsx               # Tất cả routes
├── api/client.js         # Axios instance + auto-gắn JWT
├── context/AuthContext.jsx  # Login/register/logout state
├── components/
│   ├── Layout.jsx        # Wrapper Header + Outlet + Footer
│   ├── Header.jsx        # Nav + user menu
│   ├── Footer.jsx
│   ├── BookCard.jsx      # Card sách dùng chung
│   └── ProtectedRoute.jsx # Redirect nếu chưa login
└── pages/
    ├── Home.jsx          # /
    ├── Library.jsx       # /thu-vien
    ├── BookDetail.jsx    # /sach/:id
    ├── Reviews.jsx       # /cam-nhan
    ├── WriteReview.jsx   # /viet-cam-nhan/:bookId?  (cần login)
    ├── Login.jsx         # /dang-nhap
    ├── Register.jsx      # /dang-ky
    ├── Profile.jsx       # /ho-so  (cần login)
    ├── Challenges.jsx    # /thu-thach
    └── NotFound.jsx      # 404
```

## Design system

Nằm trong `src/styles/global.css` dùng CSS variables:
- Màu: `--forest` `--amber` `--cream` `--ivory` `--sage`
- Font: Fraunces (serif) + DM Sans (sans)
- Classes tiện: `.btn`, `.btn-primary`, `.btn-outline`, `.card`, `.form-input`, `.paper-texture`, `.book-hover`

Không dùng Tailwind hay UI library - thiết kế custom theo phong cách editorial.

## Deploy lên Vercel

```bash
npm install -g vercel
vercel
```

Nhớ set env var `VITE_API_URL` = URL backend của bạn (VD: `https://trang-sach-api.onrender.com`), rồi sửa `api/client.js`:

```js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api'
});
```
