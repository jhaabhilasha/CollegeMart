import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string | null;
  role: 'user' | 'admin';
  mobile: string;
  isEmailVerified?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string, mobile: string) => Promise<void>;
  signup: (name: string, email: string, password: string, mobile: string) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

// Mock authentication for demo purposes
// In a real application, this would call an API
export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      
      login: async (email: string | undefined, password: string, mobile: string | undefined) => {
        set({ isLoading: true, error: null });
        try {
          const body: any = { password };
          if (email) body.email = email;
          if (mobile) body.mobile = mobile;
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Login failed');
          }
          const data = await res.json();
          set({
            user: data.user,
            token: data.token,
            isLoading: false,
          });
          toast.success('Successfully logged in!');
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'An unknown error occurred',
          });
          toast.error('Login failed. Please check your credentials.');
        }
      },

      signup: async (name: string, email: string, password: string, mobile: string) => {
        set({ isLoading: true, error: null });
        try {
          // Map 'name' to 'username' for backend
          const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: name, email, password, mobile }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Signup failed');
          }
          const data = await res.json();
          set({
            user: data.user,
            token: data.token,
            isLoading: false,
          });
          toast.success('Successfully signed up!');
        } catch (error) {
          let errorMsg = 'Signup failed. Please check your information.';
          if (error instanceof Error && error.message) {
            errorMsg = error.message;
          }
          set({
            isLoading: false,
            error: errorMsg,
          });
          toast.error(errorMsg);
        }
      },
      
      logout: () => {
        set({ user: null, token: null });
        toast.success('You have been logged out');
      },
      
      updateProfile: async (userData: Partial<User>) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const currentUser = get().user;
          
          if (!currentUser) {
            throw new Error('Not authenticated');
          }
          
          // Update user data
          const updatedUser = {
            ...currentUser,
            ...userData,
          };
          
          set({ 
            user: updatedUser,
            isLoading: false,
          });
          
          toast.success('Profile updated successfully!');
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'An unknown error occurred' 
          });
          toast.error('Failed to update profile');
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);