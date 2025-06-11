import React, { useState } from 'react';
import { authService } from '../services/auth';
import { handleApiError } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
    const [formData, setFormData] = useState({
        email: 'demo@telenos.com', // Pre-filled for demo
        password: 'demo123'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setError('Please enter both email and password');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await authService.signIn(formData.email, formData.password);

            if (result.success) {
                onLogin(result.user);
            }
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <h1 className="login-title">Healthcare Provider Login</h1>
                    <p className="login-subtitle">HIPAA-Compliant Platform</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label" htmlFor="email">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-input"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={loading}
                            placeholder="Enter your email"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="form-input"
                            value={formData.password}
                            onChange={handleInputChange}
                            disabled={loading}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary login-button"
                        disabled={loading}
                    >
                        {loading ? <LoadingSpinner size="small" text="" /> : 'Sign In'}
                    </button>

                    <div className="demo-credentials">
                        <p className="demo-title">Demo Credentials:</p>
                        <p className="demo-info">Email: demo@telenos.com</p>
                        <p className="demo-info">Password: demo123</p>
                    </div>

                    <div className="security-note">
                        🔒 Your session is secured with AWS Cognito and encrypted end-to-end
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;