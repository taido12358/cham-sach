import { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const STAFF_ROLES = ['admin', 'ctv'];

export default function StaffRoute() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const warned = useRef(false);

  const isStaff = user && STAFF_ROLES.includes(user.role);

  useEffect(() => {
    if (!loading && user && !isStaff && !warned.current) {
      warned.current = true;
      toast.error('Bạn không có quyền truy cập trang này');
    }
  }, [loading, user, isStaff, toast]);

  if (loading) {
    return (
      <div style={{ padding: 80, textAlign: 'center', color: 'var(--sage)' }}>
        Đang tải…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/dang-nhap" state={{ from: location }} replace />;
  }

  if (!isStaff) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
