'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FirebaseError } from 'firebase/app';

export default function TestAuth() {
    const { user, login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await login(email, password);
        } catch (err) {
            if (err instanceof FirebaseError) {
                setError(err.message);
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An error occurred during login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setError(null);
        setLoading(true);

        try {
            await logout();
        } catch (err) {
            if (err instanceof FirebaseError) {
                setError(err.message);
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An error occurred during logout');
            }
        } finally {
            setLoading(false);
    }
  };

  return (
        <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                    {user ? 'Welcome!' : 'Test Login'}
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {!user ? (
                        <form className="space-y-6" onSubmit={handleLogin}>
        <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                                    Email address
                                </label>
                                <div className="mt-1">
          <input
                                        id="email"
                                        name="email"
            type="email"
                                        autoComplete="email"
                                        required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-700 text-white"
          />
        </div>
                            </div>

        <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                    Password
                                </label>
                                <div className="mt-1">
          <input
                                        id="password"
                                        name="password"
            type="password"
                                        autoComplete="current-password"
                                        required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-700 text-white"
          />
        </div>
                            </div>

                            {error && (
                                <div className="text-red-500 text-sm mt-2">
                                    {error}
                                </div>
                            )}

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                                        loading
                                            ? 'bg-blue-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                    }`}
                                >
                                    {loading ? 'Logging in...' : 'Login'}
        </button>
                            </div>
      </form>
                    ) : (
                        <div className="space-y-6">
                            <div className="text-center">
                                <p className="text-lg font-medium text-white">
                                    Logged in as: {user.email}
                                </p>
                            </div>
                            <button
                                onClick={handleLogout}
                                disabled={loading}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                                    loading
                                        ? 'bg-red-400 cursor-not-allowed'
                                        : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                                }`}
                            >
                                {loading ? 'Logging out...' : 'Logout'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
    </div>
  );
} 