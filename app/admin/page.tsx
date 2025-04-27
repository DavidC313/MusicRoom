'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import SystemHealthMonitor from '@/components/SystemHealthMonitor';
import Image from 'next/image';

interface User {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    metadata: {
        creationTime: string;
        lastSignInTime: string;
    };
}

export default function AdminPage() {
    const { user, isAdmin } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        if (!isAdmin) {
            router.push('/');
            return;
        }

    const fetchUsers = async () => {
        try {
            console.log('Fetching users...');
                const token = await user.getIdToken();
            if (!token) {
                throw new Error('No authentication token available');
            }

            const response = await fetch('/api/users', {
                headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    cache: 'no-store'
            });

            console.log('Response status:', response.status);
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error response:', errorData);
                throw new Error(errorData.error || 'Failed to fetch users');
            }

            const data = await response.json();
            console.log('Fetched users:', data);
            setUsers(data);
            } catch (err) {
                console.error('Error in fetchUsers:', err);
                setError(err instanceof Error ? err.message : 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

        fetchUsers();
    }, [user, isAdmin, router]);

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            const token = await user?.getIdToken();
            if (!token) {
                throw new Error('No authentication token available');
            }

            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 403) {
                    throw new Error('You do not have permission to delete users');
                } else if (response.status === 404) {
                    throw new Error('User not found. They may have already been deleted.');
                } else if (response.status === 500) {
                    throw new Error('Failed to delete user. Please try again later.');
                }
                throw new Error(errorData.error || 'Failed to delete user');
            }

            setUsers(users.filter(user => user.uid !== userId));
            setError(null); // Clear any previous errors
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete user');
        }
    };

    if (!user || !isAdmin) {
        return (
            <div className="min-h-screen bg-gray-900">
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center text-white">
                        <h1 className="text-2xl font-bold">Access Denied</h1>
                        <p>You do not have permission to access this page.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900">
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center text-white">
                        <h1 className="text-2xl font-bold">Loading...</h1>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900">
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center text-white">
                        <h1 className="text-2xl font-bold">Error</h1>
                        <p className="text-red-500">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>

                {/* System Health Monitor */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4">System Health Monitor</h2>
                    <SystemHealthMonitor />
                </div>

                <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Last Login
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {users.map((user) => (
                                <tr key={user.uid}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                            {user.photoURL ? (
                                                    <Image
                                                    src={user.photoURL}
                                                        alt={user.displayName || 'User'}
                                                        width={40}
                                                        height={40}
                                                        className="rounded-full"
                                                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                    <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                                                    <span className="text-white text-sm">
                                                            {user.email?.[0]?.toUpperCase() || 'U'}
                                                    </span>
                                                </div>
                                            )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-white">
                                                    {user.displayName || 'Anonymous User'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-300">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-300">
                                            {new Date(user.metadata.creationTime).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-300">
                                            {new Date(user.metadata.lastSignInTime).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        <button
                                            onClick={() => handleDeleteUser(user.uid)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
} 