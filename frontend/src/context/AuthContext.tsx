'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { authAPI } from '@/lib/api';

interface Client {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  industry?: string;
  country?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SUSPENDED';
  emailVerified: boolean;
  profileImage?: string;
  onboardingSteps?: OnboardingStep[];
  onboardingProgress?: { completedSteps: number; totalSteps: number; progress: number };
  createdAt: string;
}

interface OnboardingStep {
  id: string;
  stepNumber: number;
  stepType: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  completedAt?: string;
}

interface AuthContextType {
  client: Client | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupFormData) => Promise<void>;
  logout: () => Promise<void>;
  refreshClient: () => Promise<void>;
}

interface SignupFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  industry?: string;
  country?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const token = Cookies.get('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }
      const res = await authAPI.getMe();
      setClient(res.data.data);
    } catch {
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      setClient(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (email: string, password: string) => {
    const res = await authAPI.login({ email, password });
    const { client: clientData, tokens } = res.data.data;
    Cookies.set('accessToken', tokens.accessToken, { expires: 7 });
    Cookies.set('refreshToken', tokens.refreshToken, { expires: 30 });
    setClient(clientData);
  };

  const signup = async (data: SignupFormData) => {
    const res = await authAPI.signup(data);
    const { client: clientData, tokens } = res.data.data;
    Cookies.set('accessToken', tokens.accessToken, { expires: 7 });
    Cookies.set('refreshToken', tokens.refreshToken, { expires: 30 });
    setClient(clientData);
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch { /* ignore */ }
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    setClient(null);
  };

  const refreshClient = async () => {
    await fetchMe();
  };

  return (
    <AuthContext.Provider value={{
      client,
      isAuthenticated: !!client,
      isLoading,
      login,
      signup,
      logout,
      refreshClient,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
