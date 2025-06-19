import React, { useState } from 'react';
import { authService } from '../services/auth';
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmationCode, setConfirmationCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [needsConfirmation, setNeedsConfirmation] = useState(false);
    const [userEmail, setUserEmail] = useState(''); // Store email for confirmation

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let result;

            if (isLogin) {
                // Sign in with AWS Cognito
                result = await authService.signIn(email, password);
                console.log('Login successful:', result);
                onLogin(result.user);
            } else {
                // Sign up with AWS Cognito
                result = await authService.signUp(email, password, name);
                console.log('Registration successful:', result);

                if (result.needsConfirmation) {
                    // User needs to confirm email
                    setNeedsConfirmation(true);
                    setUserEmail(email);
                    setError(''); // Clear any previous errors
                } else {
                    // Registration complete, try to sign in
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

    const handleConfirmSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await authService.confirmSignUp(userEmail, confirmationCode);

            // Now try to sign in
            const result = await authService.signIn(userEmail, password);
            console.log('Confirmation and login successful:', result);
            onLogin(result.user);
        } catch (error) {
            console.error('Confirmation error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const clearForm = () => {
        setEmail('');
        setPassword('');
        setName('');
        setConfirmationCode('');
        setError('');
        setNeedsConfirmation(false);
        setUserEmail('');
    };

    const switchMode = () => {
        setIsLogin(!isLogin);
        clearForm();
    };

    const handleSignOut = async () => {
        try {
            await authService.signOut();
            setError('');
            alert('Signed out successfully. You can now sign in again.');
        } catch (error) {
            console.error('Sign out error:', error);
            setError(error.message);
        }
      };

    // Show confirmation form if user needs to verify email
    if (needsConfirmation) {
        return (
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <h1>TelenosHealth</h1>
                        <h2>Confirm Your Email</h2>
                        <p>We sent a verification code to {userEmail}</p>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleConfirmSignUp} className="login-form">
                        <div className="form-group">
                            <label htmlFor="confirmationCode">Verification Code</label>
                            <input
                                type="text"
                                id="confirmationCode"
                                value={confirmationCode}
                                onChange={(e) => setConfirmationCode(e.target.value)}
                                placeholder="Enter 6-digit code"
                                required
                                maxLength="6"
                            />
                        </div>

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading || !confirmationCode}
                        >
                            {loading ? 'Confirming...' : 'Confirm Email'}
                        </button>
                    </form>

                    <div className="login-footer">
                        <button
                            onClick={() => setNeedsConfirmation(false)}
                            className="link-button"
                        >
                            Back to Sign Up
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>TelenosHealth</h1>
                    <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <p>{isLogin ?
                        'Sign in to access your healthcare dashboard' :
                        'Join our secure healthcare platform'
                    }</p>
                </div>

                {error && error.includes('already a signed in user') && (
                    <button
                        type="button"
                        onClick={handleSignOut}
                        className="login-button"
                        style={{ backgroundColor: '#dc2626', marginBottom: '10px' }}
                    >
                        Sign Out Current User
                    </button>
                )}

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your full name"
                                required={!isLogin}
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                            required
                            minLength={isLogin ? undefined : 8}
                        />
                        {!isLogin && (
                            <small className="password-hint">
                                Password must be at least 8 characters with uppercase, lowercase, numbers, and symbols
                            </small>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ?
                            (isLogin ? 'Signing In...' : 'Creating Account...') :
                            (isLogin ? 'Sign In' : 'Create Account')
                        }
                    </button>
                </form>

                <div className="login-footer">
                    <p>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button onClick={switchMode} className="link-button">
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>

                {/* Demo credentials info for testing */}
                <div className="demo-info">
                    <p><strong>For Testing:</strong></p>
                    <p>Use your real email for sign up, or test with the account you created earlier</p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;