import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <div className="fixed top-4 left-4 right-4 z-50 flex justify-between items-center">
            <Link
                to="/"
                className="bg-white/90 hover:bg-white backdrop-blur-lg text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:border-gray-300 flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
                ← Back to Landing
            </Link>

            <div className="flex gap-2">
                <Link
                    to="/dashboard"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg ${isActive('/dashboard')
                        ? 'bg-blue-500 text-white shadow-blue-500/25'
                        : 'bg-white/90 hover:bg-white backdrop-blur-lg text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300'
                        }`}
                >
                    Dashboard
                </Link>
                <Link
                    to="/calendar"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg ${isActive('/calendar')
                        ? 'bg-blue-500 text-white shadow-blue-500/25'
                        : 'bg-white/90 hover:bg-white backdrop-blur-lg text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300'
                        }`}
                >
                    Calendar
                </Link>
            </div>
        </div>
    );
};

export default Navigation;