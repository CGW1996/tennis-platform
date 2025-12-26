'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores';

export default function Header() {
    const { user, logout } = useAuthStore();
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const handleLogout = () => {
        logout();
        setUserMenuOpen(false);
    };

    // Close user menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <nav className="bg-white shadow-sm">
            <div className="container">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        <Link href="/">
                            <h1 className="text-2xl font-bold text-primary-600 cursor-pointer">
                                🎾 網球平台
                            </h1>
                        </Link>
                    </div>
                    <div className="hidden md:flex items-center space-x-6">
                        <Link href="/partners" className="text-gray-700 hover:text-primary-600 font-medium">
                            找球友
                        </Link>
                        <Link href="/courts" className="text-gray-700 hover:text-primary-600 font-medium">
                            場地預訂
                        </Link>
                        <Link href="/coaches" className="text-gray-700 hover:text-primary-600 font-medium">
                            教練服務
                        </Link>
                        <Link href="/rackets" className="text-gray-700 hover:text-primary-600 font-medium">
                            球拍推薦
                        </Link>
                        <Link href="/chat" className="text-gray-700 hover:text-primary-600 font-medium">
                            聊天
                        </Link>
                    </div>

                    {/* Mobile menu button - keeping existing placeholder behavior for now */}
                    <div className="md:hidden">
                        <button className="text-gray-600 hover:text-gray-900">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex items-center space-x-4">
                        {user ? (
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    type="button"
                                    className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                >
                                    <span className="sr-only">Open user menu</span>
                                    {user.profile?.avatarUrl ? (
                                        <img
                                            className="h-8 w-8 rounded-full object-cover"
                                            src={user.profile.avatarUrl}
                                            alt={user.name || 'User'}
                                        />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                                            <span className="text-white text-sm font-medium">
                                                {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                    )}
                                </button>

                                {/* User dropdown menu */}
                                {userMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                                        <div className="py-1">
                                            <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                                                <p className="font-medium">{user.name || 'User'}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            </div>
                                            <Link
                                                href="/profile"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                個人檔案
                                            </Link>
                                            <Link
                                                href="/settings"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                設定
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                登出
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link href="/login">
                                    <button className="btn-ghost">登入</button>
                                </Link>
                                <Link href="/register">
                                    <button className="btn-primary">註冊</button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
