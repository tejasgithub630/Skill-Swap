import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRole }) => {
  const saved = localStorage.getItem('user');

  if (!saved) {
    return <Navigate to="/login" replace />;
  }

  let user;
  try {
    user = JSON.parse(saved);
  } catch {
    return <Navigate to="/login" replace />;
  }

  if (!user?.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = user.role === 'admin' || !!user.is_admin;

  // Protect admin routes from non-admins
  if (allowedRole === 'admin' && !isAdmin) {
    const dest = user.role === 'medical' ? '/dashboard/medical' : '/dashboard/engineering';
    return <Navigate to={dest} replace />;
  }

  // Protect role-specific student dashboards from wrong roles (admins can still inspect)
  if (allowedRole && allowedRole !== 'admin' && !isAdmin && user.role !== allowedRole) {
    const dest = user.role === 'medical' ? '/dashboard/medical' : '/dashboard/engineering';
    return <Navigate to={dest} replace />;
  }

  return children;
};

export default ProtectedRoute;
