'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

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
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        if (!isAdmin) {
            router.push('/');
            return;
        }

        fetchUsers();
    }, [user, isAdmin, router]);

    const fetchUsers = async () => {
        try {
            console.log('Fetching users...');
            const token = await user?.getIdToken();
            if (!token) {
                throw new Error('No authentication token available');
            }

            const response = await fetch('/api/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
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
        } catch (error) {
            console.error('Error in fetchUsers:', error);
            setError(error instanceof Error ? error.message : 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

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
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete user');
            }

            setUsers(users.filter(user => user.uid !== userId));
        } catch (error) {
            console.error('Error deleting user:', error);
            setError(error instanceof Error ? error.message : 'Failed to delete user');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 p-8">
                <Navbar />
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold text-white mb-8">Loading...</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <Navbar />
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-white mb-8">User Management</h1>
                
                {error && (
                    <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <div className="bg-gray-800 rounded-lg overflow-hidden">
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
                                            {user.photoURL ? (
                                                <img
                                                    className="h-8 w-8 rounded-full"
                                                    src={user.photoURL}
                                                    alt=""
                                                />
                                            ) : (
                                                <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
                                                    <span className="text-white text-sm">
                                                        {user.email?.[0]?.toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-white">
                                                    {user.displayName || 'No name'}
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