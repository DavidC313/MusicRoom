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
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { doc, getDoc, setDoc, Firestore, getFirestore } from 'firebase/firestore';

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
  isAdmin: false
});

const ADMIN_UID = 'XbJ8BBGIJsTTJeaGrMwXilEdOkc2';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const token = await user.getIdToken();
        Cookies.set('token', token, { expires: 1 });
        const isAdminUser = user.uid === ADMIN_UID;
        setIsAdmin(isAdminUser);

        // Handle protected routes
        if (pathname === '/' || pathname === '/register') {
          router.push('/music-room');
        }
      } else {
        Cookies.remove('token');
        setIsAdmin(false);
        // Handle public routes
        if (pathname === '/music-room' || pathname === '/profile') {
          router.push('/');
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [pathname, router]);

  const register = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      const db = getFirestore();
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      console.log('User registered successfully');
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      Cookies.set('token', token, { expires: 1 });
      const isAdminUser = userCredential.user.uid === ADMIN_UID;
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
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 