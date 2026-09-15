import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import StaffRoute from './components/StaffRoute';

import Home from './pages/Home';
import Library from './pages/Library';
import BookDetail from './pages/BookDetail';
import Reviews from './pages/Reviews';
import WriteReview from './pages/WriteReview';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Challenges from './pages/Challenges';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/thu-vien" element={<Library />} />
        <Route path="/sach/:id" element={<BookDetail />} />
        <Route path="/cam-nhan" element={<Reviews />} />
        <Route path="/thu-thach" element={<Challenges />} />
        <Route path="/dang-nhap" element={<Login />} />
        <Route path="/dang-ky" element={<Register />} />

        {/* Routes cần đăng nhập */}
        <Route element={<ProtectedRoute />}>
          <Route path="/viet-cam-nhan/:bookId?" element={<WriteReview />} />
          <Route path="/ho-so" element={<Profile />} />
          <Route path="/ho-so/:id" element={<Profile />} />
        </Route>

        {/* Routes cần quyền admin/ctv */}
        <Route element={<StaffRoute />}>
          <Route path="/quan-tri" element={<Admin />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
