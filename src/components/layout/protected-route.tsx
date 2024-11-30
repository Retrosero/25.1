import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthGuard } from '../../hooks/use-auth-guard';

interface ProtectedRouteProps {
  children: ReactNode;
  permission?: string;
}

export function ProtectedRoute({ children, permission }: ProtectedRouteProps) {
  const { isAuthenticated, hasAccess } = useAuthGuard(permission);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (permission && !hasAccess) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
}