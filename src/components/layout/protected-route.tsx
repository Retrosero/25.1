import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthGuard } from '../../hooks/use-auth-guard';

interface ProtectedRouteProps {
  children: ReactNode;
  permission?: string;
}

export function ProtectedRoute({ children, permission }: ProtectedRouteProps) {
  const { isAuthenticated, currentUser, hasAccess } = useAuthGuard(permission);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Admin always has access
  if (currentUser?.role === 'admin') {
    return <>{children}</>;
  }

  // Check permission if specified
  if (permission && !hasAccess) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
}