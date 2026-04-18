import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
});

// Tự động gắn token vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Nếu 401 → tự xóa token và redirect login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config.url.includes('/auth/')) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/dang-nhap') {
        window.location.href = '/dang-nhap';
      }
    }
    return Promise.reject(err);
  }
);

export default api;

// Helper functions
export const handleError = (err) =>
  err.response?.data?.error || err.message || 'Đã có lỗi xảy ra';
