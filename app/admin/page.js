'use client';

import { useState, useEffect } from 'react';
import SystemHealthMonitor from '@/components/SystemHealthMonitor';

export default function AdminPage() {
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Check if user is admin (you can implement your own authentication logic here)
        const checkAdminStatus = async () => {
            try {
                // For now, we'll just set it to true for demonstration
                setIsAdmin(true);
            } catch (error) {
                console.error('Error checking admin status:', error);
                setIsAdmin(false);
            }
        };

        checkAdminStatus();
    }, []);

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
                    <p className="text-gray-400">You do not have permission to access this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>
                
                {/* System Health Monitor */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-4">System Health Monitor</h2>
                    <SystemHealthMonitor />
                </div>

                {/* Additional admin features can be added here */}
            </div>
        </div>
    );
} 