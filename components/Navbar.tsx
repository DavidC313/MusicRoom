'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { FaBars, FaTimes } from 'react-icons/fa';

export default function Navbar() {
    const { user, logout, isAdmin } = useAuth() || { user: null, logout: () => {}, isAdmin: false };
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            if (process.env.NODE_ENV !== 'test') {
                router.push('/');
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const handleNavigation = () => {
        setIsMenuOpen(false);
    };

    return (
        <nav className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <a href="/" className="flex items-center space-x-2" tabIndex={0} onClick={handleNavigation}>
                    <Image
                        src="/musicroom.ico"
                        alt="MusicRoom Logo"
                        width={32}
                        height={32}
                    />
                    <span className="text-xl font-bold">MusicRoom</span>
                </a>

                {/* Desktop Menu */}
                <div className="hidden md:flex space-x-4">
                    <a href="/" className="hover:text-gray-300" tabIndex={0} onClick={handleNavigation}>
                        Home
                    </a>
                    <a href="/music-room" className="hover:text-gray-300" tabIndex={0} onClick={handleNavigation}>
                        Music Room
                    </a>
                    {user ? (
                        <>
                            <a href="/profile" className="hover:text-gray-300" tabIndex={0} onClick={handleNavigation}>
                                Profile
                            </a>
                            {isAdmin && (
                                <a href="/admin" className="hover:text-gray-300" tabIndex={0} onClick={handleNavigation}>
                                    Admin
                                </a>
                            )}
                            <div className="flex items-center space-x-2">
                                <span className="truncate max-w-[200px]">{user.displayName || user.email}</span>
                                <button onClick={handleLogout} className="hover:text-gray-300" tabIndex={0}>
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <a href="/login" className="hover:text-gray-300" tabIndex={0} onClick={handleNavigation}>
                                Login
                            </a>
                            <a href="/register" className="hover:text-gray-300" tabIndex={0} onClick={handleNavigation}>
                                Register
                            </a>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden"
                    aria-label="Toggle menu"
                    data-testid="mobile-menu-button"
                    tabIndex={0}
                >
                    {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div ref={menuRef} className="md:hidden bg-gray-700 p-4" data-testid="mobile-menu">
                    <div className="flex flex-col space-y-4">
                        <a href="/" className="hover:text-gray-300" tabIndex={0} onClick={handleNavigation}>
                            Home
                        </a>
                        <a href="/music-room" className="hover:text-gray-300" tabIndex={0} onClick={handleNavigation}>
                            Music Room
                        </a>
                        {user ? (
                            <>
                                <a href="/profile" className="hover:text-gray-300" tabIndex={0} onClick={handleNavigation}>
                                    Profile
                                </a>
                                {isAdmin && (
                                    <a href="/admin" className="hover:text-gray-300" tabIndex={0} onClick={handleNavigation}>
                                        Admin
                                    </a>
                                )}
                                <div className="flex flex-col space-y-2">
                                    <span className="truncate max-w-[200px]">{user.displayName || user.email}</span>
                                    <button onClick={handleLogout} className="hover:text-gray-300" tabIndex={0}>
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <a href="/login" className="hover:text-gray-300" tabIndex={0} onClick={handleNavigation}>
                                    Login
                                </a>
                                <a href="/register" className="hover:text-gray-300" tabIndex={0} onClick={handleNavigation}>
                                    Register
                                </a>
                            </>
                        )}
                    </div>
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="absolute top-4 right-4"
                        aria-label="Close menu"
                        data-testid="mobile-menu-close"
                        tabIndex={0}
                    >
                        <FaTimes size={24} />
                    </button>
                </div>
            )}
        </nav>
    );
} 