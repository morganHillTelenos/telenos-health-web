// src/pages/LoginPage.js - Updated with Admin Role Testing
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await authService.signIn(email, password);

            if (result.success) {
                console.log('✅ Login successful:', result.user);

                // Redirect based on role
                const userRole = result.user.role;
                switch (userRole) {
                    case 'admin':
                        navigate('/admin');
                        break;
                    case 'provider':
                        navigate('/dashboard');
                        break;
                    case 'patient':
                        navigate('/patient/records');
                        break;
                    default:
                        navigate('/dashboard');
                }
            }
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
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

                {/* Quick Login Demo Accounts */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium mb-3">Demo Accounts:</p>
                    <div className="space-y-2">
                        <button
                            type="button"
                            onClick={() => handleQuickLogin('admin')}
                            className="w-full text-left p-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded text-sm transition-colors"
                        >
                            👑 <strong>Administrator</strong><br />
                            <span className="text-xs">admin@telenos.com • Full system access</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleQuickLogin('provider')}
                            className="w-full text-left p-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-sm transition-colors"
                        >
                            👨‍⚕️ <strong>Doctor/Provider</strong><br />
                            <span className="text-xs">demo@telenos.com • Patient management</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleQuickLogin('patient')}
                            className="w-full text-left p-2 bg-green-100 hover:bg-green-200 text-green-800 rounded text-sm transition-colors"
                        >
                            👤 <strong>Patient</strong><br />
                            <span className="text-xs">patient@telenos.com • Personal health portal</span>
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

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
                    <p className="text-xs text-gray-600 font-medium mb-2">🧪 Testing Role-Based Access:</p>
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