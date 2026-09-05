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
  isCheckingAuth: boolean;
  error: string | null;
  
  // Actions
  login: (email: string | undefined, password: string, mobile: string | undefined, rememberMe?: boolean) => Promise<void>;
  loginWithOtp: (email: string, otp: string) => Promise<void>;
  signup: (name: string, email: string, password: string, mobile: string) => Promise<void>;
  logout: (notify?: boolean) => void;
  handleSessionExpired: () => void;
  checkAuth: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

let sessionExpiredToastShown = false;

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isCheckingAuth: false,
      error: null,
      
      login: async (email: string | undefined, password: string, mobile: string | undefined, rememberMe?: boolean) => {
        set({ isLoading: true, error: null });
        try {
          const body: any = { password, rememberMe };
          if (email) body.email = email;
          if (mobile) body.mobile = mobile;

          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });

          const data = await res.json().catch(() => ({}));

          if (!res.ok) {
            const errorMsg = data.message || 'Login failed. Please check your credentials.';
            throw new Error(errorMsg);
          }

          set({
            user: data.user,
            token: data.token,
            isLoading: false,
            error: null,
          });

          // Mirror to standard token storage for compatibility
          if (data.token) {
            localStorage.setItem('token', data.token);
          }

          toast.success('Successfully logged in!');
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'An unknown error occurred';
          set({
            isLoading: false,
            error: errorMsg,
          });
          toast.error(errorMsg);
          // Rethrow error so callers (like LoginPage) know the login was unsuccessful
          throw error;
        }
      },

      loginWithOtp: async (email: string, otp: string) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch('/api/auth/login-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp }),
          });

          const data = await res.json().catch(() => ({}));

          if (!res.ok) {
            const errorMsg = data.message || 'OTP verification failed';
            throw new Error(errorMsg);
          }

          set({
            user: data.user,
            token: data.token,
            isLoading: false,
            error: null,
          });

          if (data.token) {
            localStorage.setItem('token', data.token);
          }

          toast.success('Successfully logged in!');
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'OTP login failed';
          set({
            isLoading: false,
            error: errorMsg,
          });
          toast.error(errorMsg);
          throw error;
        }
      },

      signup: async (name: string, email: string, password: string, mobile: string) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: name, email, password, mobile }),
          });

          const data = await res.json().catch(() => ({}));

          if (!res.ok) {
            const errorMsg = data.message || 'Signup failed. Please check your information.';
            throw new Error(errorMsg);
          }

          set({
            user: data.user,
            token: data.token,
            isLoading: false,
            error: null,
          });

          if (data.token) {
            localStorage.setItem('token', data.token);
          }

          toast.success(data.message || 'Successfully signed up!');
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Signup failed. Please check your information.';
          set({
            isLoading: false,
            error: errorMsg,
          });
          toast.error(errorMsg);
          // Rethrow error so callers (like SignupPage) know the signup failed
          throw error;
        }
      },
      
      logout: (notify = true) => {
        set({ user: null, token: null, error: null, isLoading: false });
        localStorage.removeItem('token');
        localStorage.removeItem('auth-storage');
        sessionStorage.clear();
        if (notify) {
          toast.success('You have been logged out');
        }
      },

      handleSessionExpired: () => {
        const hadToken = !!get().token;
        set({ user: null, token: null, error: null, isLoading: false });
        localStorage.removeItem('token');
        localStorage.removeItem('auth-storage');

        if (hadToken && !sessionExpiredToastShown) {
          sessionExpiredToastShown = true;
          toast.error('Your session has expired. Please sign in again.');
          setTimeout(() => {
            sessionExpiredToastShown = false;
          }, 3000);

          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
      },

      checkAuth: async () => {
        const token = get().token || localStorage.getItem('token');
        if (!token) {
          set({ user: null, token: null, isCheckingAuth: false });
          return;
        }

        set({ isCheckingAuth: true });
        try {
          const res = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (res.status === 401) {
            // Token is invalid or expired on server
            get().handleSessionExpired();
            return;
          }

          if (res.ok) {
            const data = await res.json();
            if (data.user) {
              set({ user: data.user, isCheckingAuth: false });
              localStorage.setItem('token', token);
            }
          } else {
            set({ isCheckingAuth: false });
          }
        } catch (err) {
          // Network error or backend temporarily unavailable: do not wipe session
          console.warn('[AUTH] Could not verify session with server:', err);
          set({ isCheckingAuth: false });
        }
      },
      
      updateProfile: async (userData: Partial<User>) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentUser = get().user;
          const token = get().token;
          
          if (!currentUser || !token) {
            throw new Error('Not authenticated');
          }

          // Call backend user update endpoint
          const res = await fetch(`/api/users/${currentUser.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Failed to update profile');
          }

          const updatedData = await res.json();
          
          const updatedUser: User = {
            ...currentUser,
            name: updatedData.username || currentUser.name,
            email: updatedData.email || currentUser.email,
            mobile: updatedData.mobile || currentUser.mobile,
            profileImage: updatedData.profileImage ?? currentUser.profileImage,
          };
          
          set({ 
            user: updatedUser,
            isLoading: false,
          });
          
          toast.success('Profile updated successfully!');
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'An unknown error occurred';
          set({ 
            isLoading: false, 
            error: errorMsg
          });
          toast.error(errorMsg);
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);