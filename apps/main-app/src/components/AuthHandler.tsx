// apps/main-app/FleetMasterProMain-v00/src/components/AuthHandler.tsx
import React, { useEffect, useState } from 'react';
import { NavigationService } from '../services/NavigationService';

export function AuthHandler({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  // In development mode, bypass all authentication checks
  if (process.env.NODE_ENV === 'development') {
    return (
      <>
        {children}
        {/* Dev mode indicator */}
        <div className="fixed bottom-4 left-4 z-50 bg-yellow-100 border border-yellow-300 text-yellow-800 px-3 py-1 rounded-md text-xs font-medium">
          🚀 Dev Mode - Auth Bypassed
        </div>
      </>
    );
  }

  useEffect(() => {
    const handleAuthFromURL = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const authToken = urlParams.get('auth_token');
      const redirectPath = urlParams.get('redirect');

      if (authToken) {
        // Store token in localStorage/sessionStorage
        localStorage.setItem('auth_token', authToken);
        
        // Clean URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('auth_token');
        newUrl.searchParams.delete('redirect');
        window.history.replaceState({}, '', newUrl.toString());

        // Redirect if needed
        if (redirectPath && redirectPath !== '/') {
          window.location.hash = redirectPath;
        }
      }

      // Check if user is authenticated
      const token = localStorage.getItem('auth_token');
      if (!token) {
        // Redirect to marketing site login
        NavigationService.navigateToLogin(window.location.pathname);
        return;
      }

      setIsInitialized(true);
    };

    handleAuthFromURL();
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}