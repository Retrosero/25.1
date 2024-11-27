import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './use-auth';
import { useUsers } from './use-users';

export function useAuthGuard(requiredPermission?: string) {
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();
  const { hasPermission } = useUsers();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (requiredPermission && currentUser) {
      const hasAccess = hasPermission(currentUser.id, requiredPermission);
      if (!hasAccess) {
        navigate('/unauthorized');
      }
    }
  }, [isAuthenticated, currentUser, requiredPermission, navigate, hasPermission]);

  return { isAuthenticated, currentUser };
}