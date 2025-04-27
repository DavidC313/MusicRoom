'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; isAdmin?: boolean }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  register: async () => {},
  login: async () => ({ success: false }),
  logout: async () => {},
  isAdmin: false,
});

const ADMIN_UID = 'XbJ8BBGIJsTTJeaGrMwXilEdOkc2';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        console.log('Auth state changed, user:', user);
        setUser(user);
        if (user) {
          const token = await user.getIdToken();
          Cookies.set('token', token, { expires: 1 }); // Token expires in 1 day
          // Check if user is admin using UID
          const isAdminUser = user.uid === ADMIN_UID;
          console.log('Checking admin status:', {
            userUid: user.uid,
            adminUid: ADMIN_UID,
            isAdmin: isAdminUser
          });
          setIsAdmin(isAdminUser);
        } else {
          Cookies.remove('token');
          setIsAdmin(false);
        }
        setLoading(false);
      });
      return unsubscribe;
    } catch (error) {
      console.error('Auth state change error:', error);
      setLoading(false);
    }
  }, []);

  const register = async (email: string, password: string) => {
    try {
      console.log('Starting registration process');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Firebase auth successful, creating user in MongoDB');
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await userCredential.user.getIdToken()}`
        },
        body: JSON.stringify({
          email: userCredential.user.email,
          name: userCredential.user.email?.split('@')[0] || 'User'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user in database');
      }

      console.log('User registered successfully');
      router.push('/profile');
    } catch (error: any) {
      console.error('Registration error in AuthContext:', error);
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Email is already in use');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address');
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Registration is currently disabled');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak');
      } else {
        throw new Error(error.message || 'Failed to create user');
      }
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string; isAdmin?: boolean }> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      Cookies.set('token', token, { expires: 1 }); // Token expires in 1 day
      const isAdminUser = userCredential.user.uid === ADMIN_UID;
      setIsAdmin(isAdminUser);
      
      // Wait for the auth state to be updated before redirecting
      await new Promise(resolve => setTimeout(resolve, 100));
      router.push('/music-room');
      
      return { success: true, isAdmin: isAdminUser };
    } catch (error: any) {
      let message = 'An error occurred during login';
      
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        message = 'Incorrect email or password';
          break;
        case 'auth/user-not-found':
        message = 'No account found with this email';
          break;
        case 'auth/too-many-requests':
          message = 'Too many failed attempts. Please try again later';
          break;
        case 'auth/user-disabled':
          message = 'This account has been disabled';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email address';
          break;
        default:
          message = 'An unexpected error occurred. Please try again.';
      }
      
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      Cookies.remove('token');
      setIsAdmin(false);
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, isAdmin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 