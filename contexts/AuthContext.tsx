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

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string; isAdmin?: boolean }> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      Cookies.set('token', token, { expires: 1 }); // Token expires in 1 day
      const isAdminUser = userCredential.user.uid === ADMIN_UID;
      console.log('Login admin check:', {
        userUid: userCredential.user.uid,
        adminUid: ADMIN_UID,
        isAdmin: isAdminUser
      });
      setIsAdmin(isAdminUser);
      router.push('/music-room');
      return { success: true, isAdmin: isAdminUser };
    } catch (error: any) {
      let message = 'An error occurred during login';
      if (error.code === 'auth/invalid-credential') {
        message = 'Incorrect email or password';
      } else if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Incorrect password';
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