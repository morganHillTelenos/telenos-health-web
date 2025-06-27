// src/components/Header.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/auth';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [showUserMenu, setShowUserMenu] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            try {
                if (authService.isAuthenticated()) {
                    const currentUser = await authService.getCurrentUser();
                    setUser(currentUser);
                }
            } catch (error) {
                console.error('Failed to load user:', error);
            }
        };

        loadUser();
    }, []);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const getNavButtonClass = (path) => {
        return `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(path)
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300'
            }`;
    };

    return (
        <header className="bg-white/95 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => navigate('/dashboard')}
                    >
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                            T
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">TelenosHealth</h1>
                            <p className="text-xs text-gray-500">Healthcare Platform</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-2">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className={getNavButtonClass('/dashboard')}
                        >
                            🏠 Dashboard
                        </button>
                        <button
                            onClick={() => navigate('/patients')}
                            className={getNavButtonClass('/patients')}
                        >
                            👥 Patients
                        </button>
                        <button
                            onClick={() => navigate('/calendar')}
                            className={getNavButtonClass('/calendar')}
                        >
                            📅 Calendar
                        </button>
                    </nav>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-3 bg-white/90 hover:bg-white px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200"
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="hidden sm:block text-left">
                                <div className="text-sm font-medium text-gray-900">
                                    {user?.name || 'User'}
                                </div>
                                <div className="text-xs text-gray-500 capitalize">
                                    {user?.role || 'Staff'}
                                </div>
                            </div>
                            <svg
                                className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                <div className="px-4 py-2 border-b border-gray-100">
                                    <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                                    <div className="text-xs text-gray-500">{user?.email}</div>
                                </div>

                                <button
                                    onClick={() => {
                                        setShowUserMenu(false);
                                        navigate('/dashboard');
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    🏠 Dashboard
                                </button>

                                <button
                                    onClick={() => {
                                        setShowUserMenu(false);
                                        // Add profile/settings functionality here
                                        alert('Profile settings coming soon!');
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    ⚙️ Settings
                                </button>

                                <div className="border-t border-gray-100 mt-2 pt-2">
                                    <button
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            handleLogout();
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        🚪 Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Navigation */}
                <nav className="md:hidden mt-4 flex items-center gap-2 overflow-x-auto pb-2">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className={getNavButtonClass('/dashboard')}
                    >
                        🏠 Dashboard
                    </button>
                    <button
                        onClick={() => navigate('/patients')}
                        className={getNavButtonClass('/patients')}
                    >
                        👥 Patients
                    </button>
                    <button
                        onClick={() => navigate('/calendar')}
                        className={getNavButtonClass('/calendar')}
                    >
                        📅 Calendar
                    </button>
                </nav>
            </div>
        </header>
    );
};

export default Header;