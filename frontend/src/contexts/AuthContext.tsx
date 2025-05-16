'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    console.log('AuthProvider mounted, checking token...');
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Token found in localStorage, setting authenticated state');
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    console.log('Login attempt started...', { email });
    try {
      if (!process.env.NEXT_PUBLIC_STRAPI_URL) {
        console.error('NEXT_PUBLIC_STRAPI_URL is not defined');
        throw new Error('API URL not configured');
      }

      const url = `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/local`;
      console.log('Making login request to:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: email,
          password,
        }),
      });

      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Login failed:', errorData);
        throw new Error(errorData?.error?.message || 'Login failed');
      }

      const data = await response.json();
      console.log('Login successful, received data:', {
        jwt: data.jwt ? 'present' : 'missing',
        user: data.user ? 'present' : 'missing',
      });

      localStorage.setItem('token', data.jwt);
      document.cookie = `token=${data.jwt}; path=/; max-age=2592000`; // 30 days
      
      setUser(data.user);
      setIsAuthenticated(true);
      console.log('Authentication state updated:', { isAuthenticated: true });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('Logging out...');
    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    setUser(null);
    setIsAuthenticated(false);
    console.log('Logout complete');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 