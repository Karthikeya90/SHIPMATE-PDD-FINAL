import React, { useEffect, useState, createContext, useContext } from 'react';
import { User, Role } from '../data/types';
import { authService } from '../services/authService';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: Role
  ) => Promise<void>;
  logout: () => void;
  updateUser: (updatedFields: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to restore session', error);
      }
      setIsLoading(false);
    };
    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (event === 'SIGNED_IN' && session) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { user } = await authService.login(email, password);
      setUser(user);
      toast.success(`Welcome back, ${user.name}!`);
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: Role
  ) => {
    try {
      const { user } = await authService.register(name, email, password, role);
      setUser(user);
      toast.success('Account created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      throw error;
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    toast.info('Logged out successfully');
  };

  const updateUser = async (updatedFields: Partial<User>) => {
    if (!user) return;
    try {
      await authService.updateProfile(user.user_id, updatedFields);
      const updatedUser = { ...user, ...updatedFields };
      setUser(updatedUser);
      toast.success('Profile updated!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser
      }}>
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