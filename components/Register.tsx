'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FirebaseError } from 'firebase/app';
import Image from 'next/image';
import Link from 'next/link';

export default function Register() {
    const { register } = useAuth();
    const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
        setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
            setLoading(true);
      await register(email, password);
            router.push('/profile');
        } catch (err) {
            if (err instanceof FirebaseError) {
                setError(err.message);
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An error occurred during registration');
            }
        } finally {
            setLoading(false);
        }
    };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl p-8 space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <Image
            src="/musicroom.webp"
            alt="Music Room Logo"
            width={300}
            height={200}
            className="rounded-lg shadow-lg"
            priority
                        style={{ width: 'auto', height: 'auto' }}
          />
          <h1 className="text-4xl font-bold text-white tracking-wide">MusicRoom</h1>
                    <p className="text-gray-400 text-sm">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your password"
              required
            />
          </div>
          <div className="space-y-2">
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300">Confirm Password</label>
            <input
              type="password"
                            id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Confirm your password"
              required
            />
          </div>
          {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                            <p className="text-red-500 text-sm text-center">{error}</p>
            </div>
          )}
          <button 
            type="submit" 
                        disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
                        {loading ? 'Registering...' : 'Register'}
          </button>
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link 
                                href="/login" 
                className="text-blue-500 hover:text-blue-400 font-medium transition-colors"
              >
                                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
} 