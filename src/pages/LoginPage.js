// src/pages/LoginPage.js - Updated for TelenosHealth Backend
import React, { useState } from 'react';
import { authService } from '../services/auth';
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('demo@telenos.com'); // Pre-fill demo email
    const [password, setPassword] = useState('demo123');     // Pre-fill demo password
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let result;

            if (isLogin) {
                // Sign in
                result = await authService.signIn(email, password);
                console.log('Login successful:', result);
                onLogin(result.user);
            } else {
                // Sign up
                result = await authService.signUp(email, password, name);
                console.log('Registration successful:', result);

                // After successful registration, automatically sign in
                if (result.success) {
                    const loginResult = await authService.signIn(email, password);
                    onLogin(loginResult.user);
                }
            }
        } catch (error) {
            console.error('Authentication error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        setEmail('demo@telenos.com');
        setPassword('demo123');
        setError('');
        setLoading(true);

        try {
            const result = await authService.signIn('demo@telenos.com', 'demo123');
            console.log('Demo login successful:', result);
            onLogin(result.user);
        } catch (error) {
            console.error('Demo login error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const clearForm = () => {
        setEmail('');
        setPassword('');
        setName('');
        setError('');
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>TelenosHealth</h1>
                    <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <p>{isLogin ? 'Sign in to access your dashboard' : 'Join our healthcare platform'}</p>
                </div>

                {error && (
                    <div className="error-message">
                        <span>⚠️ {error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                id="name"
                                type="text"
                                placeholder="Dr. John Smith"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required={!isLogin}
                                disabled={loading}
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="doctor@telenos.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-button primary"
                        disabled={loading}
                    >
                        {loading ? (
                            <span>
                                <span className="spinner"></span>
                                {isLogin ? 'Signing In...' : 'Creating Account...'}
                            </span>
                        ) : (
                            isLogin ? 'Sign In' : 'Create Account'
                        )}
                    </button>
                </form>

                <div className="login-divider">
                    <span>or</span>
                </div>

                <button
                    type="button"
                    onClick={handleDemoLogin}
                    className="demo-button"
                    disabled={loading}
                >
                    🚀 Try Demo Account
                </button>

                <div className="login-footer">
                    <button
                        type="button"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            clearForm();
                        }}
                        className="link-button"
                        disabled={loading}
                    >
                        {isLogin
                            ? "Don't have an account? Sign Up"
                            : 'Already have an account? Sign In'
                        }
                    </button>
                </div>

                {/* Demo Credentials Info */}
                <div className="demo-info">
                    <h3>Demo Credentials:</h3>
                    <div className="demo-credentials">
                        <div><strong>Email:</strong> demo@telenos.com</div>
                        <div><strong>Password:</strong> demo123</div>
                        <div><strong>Role:</strong> Doctor</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;