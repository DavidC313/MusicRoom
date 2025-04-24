'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setUser(user);
        if (user) {
          const token = await user.getIdToken();
          Cookies.set('token', token, { expires: 1 }); // Token expires in 1 day
        } else {
          Cookies.remove('token');
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create user in database');
      }

      console.log('User registered successfully');
    } catch (error: any) {
      console.error('Registration error in AuthContext:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      Cookies.set('token', token, { expires: 1 }); // Token expires in 1 day
      router.push('/music-room');
      return { success: true };
    } catch (error: any) {
      // Handle specific Firebase auth errors
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        return { success: false, message: 'Incorrect email or password' };
      } else if (error.code === 'auth/too-many-requests') {
        return { success: false, message: 'Too many failed attempts. Please try again later' };
      } else {
        return { success: false, message: 'An error occurred during login' };
      }
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      Cookies.remove('token');
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 