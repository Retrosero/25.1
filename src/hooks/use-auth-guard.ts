import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './use-auth';
import { useUsers } from './use-users';
import { useAccessRequests } from './use-access-requests'; 

export function useAuthGuard(requiredPermission?: string) {
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();
  const { hasPermission } = useUsers();
  const { addRequest } = useAccessRequests();
  const [requestedPath] = useState(window.location.pathname);
  const [requestedPermission] = useState(requiredPermission);

  const checkAccess = () => {
    if (!currentUser || !isAuthenticated) {
      return false;
    }

    // Admin always has access
    if (currentUser.role === 'admin') { 
      return true;
    }

    // If no specific permission required, allow access
    if (!requiredPermission) {
      return true;
    }

    // Check if user has the required permission
    const hasAccess = hasPermission(currentUser.id, requiredPermission);
    return hasAccess;
  };

  useEffect(() => {
    const access = checkAccess();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!access) {
      navigate(`/unauthorized?from=${requestedPath}&permission=${requestedPermission}`);
      return;
    }
  }, [isAuthenticated, navigate, currentUser, requiredPermission]);

  return { isAuthenticated, currentUser, hasAccess: checkAccess() };
}