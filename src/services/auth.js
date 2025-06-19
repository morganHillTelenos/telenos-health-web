import { signIn, signUp, signOut, getCurrentUser, confirmSignUp } from 'aws-amplify/auth';

export class AuthService {
    constructor() {
        // Keep the same interface as your existing auth service
        this.tokenKey = 'healthcare_token';
        this.userKey = 'healthcare_user';
    }

    // Sign in user (replacing your existing signIn method)
    async signIn(email, password) {
        try {
            const result = await signIn({
                username: email,
                password,
            });

            console.log('AWS Cognito sign in success:', result);

            if (result.isSignedIn) {
                const userData = await this.getCurrentUser();

                // Store user data in the same format as before for compatibility
                localStorage.setItem(this.userKey, JSON.stringify(userData));
                localStorage.setItem(this.tokenKey, 'amplify-managed'); // Amplify handles tokens

                return {
                    success: true,
                    user: userData
                };
            } else {
                throw new Error('Sign in not complete');
            }
        } catch (error) {
            console.error('Login error:', error);

            // Handle specific AWS Cognito errors
            if (error.name === 'UserNotConfirmedException') {
                throw new Error('Please check your email and confirm your account');
            } else if (error.name === 'NotAuthorizedException') {
                throw new Error('Invalid email or password');
            } else if (error.name === 'UserNotFoundException') {
                throw new Error('User not found');
            }

            throw new Error(error.message || 'Login failed');
        }
    }

    // Sign up user (replacing your existing signUp method)
    async signUp(email, password, name) {
        try {
            const result = await signUp({
                username: email,
                password,
                options: {
                    userAttributes: {
                        email,
                        name: name || `${email.split('@')[0]}`, // Use part of email as name if not provided
                    }
                }
            });

            console.log('AWS Cognito sign up success:', result);

            return {
                success: true,
                user: result.user,
                needsConfirmation: !result.isSignUpComplete,
                userSub: result.userSub
            };
        } catch (error) {
            console.error('Registration error:', error);

            if (error.name === 'UsernameExistsException') {
                throw new Error('An account with this email already exists');
            } else if (error.name === 'InvalidPasswordException') {
                throw new Error('Password must be at least 8 characters with uppercase, lowercase, numbers, and symbols');
            }

            throw new Error(error.message || 'Registration failed');
        }
    }

    // Confirm sign up (for email verification)
    async confirmSignUp(email, code) {
        try {
            await confirmSignUp({
                username: email,
                confirmationCode: code
            });
            return { success: true };
        } catch (error) {
            console.error('Confirmation error:', error);
            throw new Error(error.message || 'Confirmation failed');
        }
    }

    // Sign out user (replacing your existing signOut method)
    async signOut() {
        try {
            await signOut();

            // Clear local storage for compatibility
            localStorage.removeItem(this.tokenKey);
            localStorage.removeItem(this.userKey);

            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            // Clear storage anyway
            localStorage.removeItem(this.tokenKey);
            localStorage.removeItem(this.userKey);
            throw new Error(error.message || 'Logout failed');
        }
    }

    // Get current user (replacing your existing getCurrentUser method)
    async getCurrentUser() {
        try {
            const user = await getCurrentUser();
            return {
                userId: user.userId,
                email: user.signInDetails?.loginId || user.username,
                username: user.username,
                name: user.signInDetails?.loginId || user.username, // Fallback for name
            };
        } catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    }

    // Check if user is authenticated (keeping your existing method signature)
    async isAuthenticated() {
        try {
            await getCurrentUser();
            return true;
        } catch (error) {
            return false;
        }
    }

    // Legacy methods for compatibility with existing code
    getToken() {
        // Amplify handles tokens automatically, but return something for compatibility
        return localStorage.getItem(this.tokenKey) || 'amplify-managed';
    }

    getStoredUser() {
        try {
            const userData = localStorage.getItem(this.userKey);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error parsing stored user data:', error);
            return null;
        }
    }

    // Placeholder methods to maintain compatibility
    async forgotPassword(email) {
        // TODO: Implement with AWS Cognito forgot password
        throw new Error('Password reset not implemented yet');
    }

    async confirmResetPassword(email, code, newPassword) {
        // TODO: Implement with AWS Cognito
        throw new Error('Password reset confirmation not implemented yet');
    }

    async changePassword(oldPassword, newPassword) {
        // TODO: Implement with AWS Cognito
        throw new Error('Password change not implemented yet');
    }
}

// Export instance (keeping the same export structure)
export const authService = new AuthService();
export default authService;