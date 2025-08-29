// src/pages/LoginPage.js - Updated without automatic routing
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [loginSuccess, setLoginSuccess] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setLoginSuccess(false);

        try {
            const result = await authService.signIn(email, password);

            if (result.success) {
                console.log('Login successful:', result.user);
                setLoginSuccess(true);
                setUserInfo(result.user);

                // Don't auto-route - just show success message
            }
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleManualNavigation = (path) => {
        navigate(path);
    };

    const handleQuickLogin = (userType) => {
        const accounts = authService.getDemoAccounts();
        const account = accounts[userType];
        if (account) {
            setEmail(account.email);
            setPassword(account.password);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200/50 p-8 shadow-lg">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                    <p className="text-gray-600 mt-2">Sign in to your healthcare portal</p>
                </div>

                {/* Login Success Message */}
                {loginSuccess && userInfo && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800 font-medium mb-3">Login Successful!</p>
                        <p className="text-sm text-green-700 mb-4">
                            Welcome, {userInfo.name} ({userInfo.role})
                        </p>

                        {/* Manual Navigation Options */}
                        <div className="space-y-2">
                            <button
                                onClick={() => handleManualNavigation('/dashboard')}
                                className="w-full p-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
                            >
                                Go to Provider Dashboard
                            </button>

                            {userInfo.role === 'patient' && (
                                <button
                                    onClick={() => handleManualNavigation('/patient-dashboard')}
                                    className="w-full p-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-colors"
                                >
                                    Go to Patient Portal
                                </button>
                            )}

                            <button
                                onClick={() => handleManualNavigation('/debug')}
                                className="w-full p-2 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                            >
                                Go to Debug Page
                            </button>
                        </div>
                    </div>
                )}

                {/* Quick Login Demo Accounts - Commented out */}
                {/*
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium mb-3">Demo Accounts:</p>
                    <div className="space-y-2">
                        <button
                            type="button"
                            onClick={() => handleQuickLogin('admin')}
                            className="w-full text-left p-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded text-sm transition-colors"
                        >
                            Administrator<br />
                            <span className="text-xs">admin@telenos.com • Full system access</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleQuickLogin('provider')}
                            className="w-full text-left p-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-sm transition-colors"
                        >
                            Doctor/Provider<br />
                            <span className="text-xs">demo@telenos.com • Patient management</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleQuickLogin('patient')}
                            className="w-full text-left p-2 bg-green-100 hover:bg-green-200 text-green-800 rounded text-sm transition-colors"
                        >
                            Patient<br />
                            <span className="text-xs">patient@telenos.com • Personal health portal</span>
                        </button>
                    </div>
                </div>
                */}

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                {!loginSuccess && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="Enter your password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                )}

                {loginSuccess && (
                    <div className="mt-4">
                        <button
                            onClick={() => {
                                setLoginSuccess(false);
                                setUserInfo(null);
                                setEmail('');
                                setPassword('');
                            }}
                            className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Login as Different User
                        </button>
                    </div>
                )}

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Need help?{' '}
                        <a href="/support" className="text-blue-600 hover:text-blue-500">
                            Contact Support
                        </a>
                    </p>
                </div>

                {/* Role Testing Info */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 font-medium mb-2">Testing Role-Based Access:</p>
                    <ul className="text-xs text-gray-500 space-y-1">
                        <li>• Admin: Can access all system features</li>
                        <li>• Provider: Can manage patients and appointments</li>
                        <li>• Patient: Can view own records only</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;