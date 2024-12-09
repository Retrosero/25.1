import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthGuard } from '../../hooks/use-auth-guard';

interface ProtectedRouteProps {
  children: ReactNode;
  permission?: string;
}

export function ProtectedRoute({ children, permission }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, hasAccess } = useAuthGuard(permission);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (permission && !hasAccess) {
    return <Navigate to={`/unauthorized?from=${location.pathname}&permission=${permission}`} />;
  }

  return <>{children}</>;
}