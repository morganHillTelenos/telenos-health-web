import React, { useState } from 'react';
import { authService } from '../services/auth';

const LoginPage = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmationCode, setConfirmationCode] = useState('');
    const [needsConfirmation, setNeedsConfirmation] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (needsConfirmation) {
                // Confirm sign up
                await authService.confirmSignUp(email, confirmationCode);
                const loginResult = await authService.signIn(email, password);
                onLogin(loginResult.user);
            } else if (isLogin) {
                // Sign in
                const result = await authService.signIn(email, password);
                onLogin(result.user);
            } else {
                // Sign up
                const result = await authService.signUp(email, password, name);
                if (result.needsConfirmation) {
                    setNeedsConfirmation(true);
                }
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setError('Please enter your email address');
            return;
        }

        try {
            setLoading(true);
            await authService.forgotPassword(email);
            alert('Password reset email sent! Check your inbox.');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h2>
                    {needsConfirmation ? 'Confirm Your Email' :
                        isLogin ? 'Sign In' : 'Create Account'}
                </h2>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {needsConfirmation ? (
                        <>
                            <p>Please enter the confirmation code sent to {email}</p>
                            <input
                                type="text"
                                placeholder="Confirmation Code"
                                value={confirmationCode}
                                onChange={(e) => setConfirmationCode(e.target.value)}
                                required
                            />
                        </>
                    ) : (
                        <>
                            {!isLogin && (
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            )}
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Loading...' :
                            needsConfirmation ? 'Confirm Account' :
                                isLogin ? 'Sign In' : 'Sign Up'}
                    </button>
                </form>

                {!needsConfirmation && (
                    <>
                        <div className="form-toggle">
                            <button
                                type="button"
                                onClick={() => setIsLogin(!isLogin)}
                                className="link-button"
                            >
                                {isLogin ? 'Need an account? Sign Up' : 'Have an account? Sign In'}
                            </button>
                        </div>

                        {isLogin && (
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="link-button"
                                disabled={loading}
                            >
                                Forgot Password?
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default LoginPage;