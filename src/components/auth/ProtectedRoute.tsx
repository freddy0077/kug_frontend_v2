'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/utils/permissionUtils';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  fallbackPath?: string;
}

export const ProtectedRoute = ({ 
  children, 
  allowedRoles = [UserRole.ADMIN, UserRole.OWNER],
  fallbackPath = "/user/dashboard" 
}: ProtectedRouteProps) => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Check if user has the required role
  const hasRequiredRole = () => {
    if (!user || allowedRoles.length === 0) return false;
    
    const userRole = user.role as UserRole;
    return allowedRoles.includes(userRole);
  };

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!loading && !isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // If authenticated but no access based on role
    if (
      !loading && 
      isAuthenticated && 
      allowedRoles.length > 0 && 
      user && 
      !hasRequiredRole()
    ) {
      // Redirect to fallback path (dashboard or unauthorized page)
      router.push(fallbackPath);
    }
  }, [loading, isAuthenticated, router, user, allowedRoles, pathname, fallbackPath]);

  // Show loading spinner while checking authentication
  if (loading || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // If role check is needed and user doesn't have permission
  if (allowedRoles.length > 0 && !hasRequiredRole()) {
    return null; // Will redirect in the useEffect
  }

  // If we got here, the user is authenticated and has the required role
  return <>{children}</>;
};

export default ProtectedRoute;
