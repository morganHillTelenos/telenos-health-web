// src/services/auth.js - Real AWS Cognito Implementation
import { signIn, signUp, signOut, getCurrentUser, confirmSignUp, fetchAuthSession } from 'aws-amplify/auth';

class AuthService {
    constructor() {
        this.tokenKey = 'telenos_auth_token';
        this.userKey = 'telenos_auth_user';
        this.isInitialized = false;
        this.currentUser = null;
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            console.log('🔐 Initializing real AWS Cognito auth service...');

            // Check if user is already authenticated with AWS Cognito
            const user = await this.getCurrentUser();
            if (user) {
                this.currentUser = user;
                console.log('✅ Found existing AWS session:', user.username);
            }
        } catch (error) {
            console.log('ℹ️ No existing AWS session found');
            this.currentUser = null;
        } finally {
            this.isInitialized = true;
        }
    }

    async login(credentials) {
        try {
            console.log('🔐 Processing AWS Cognito login for:', credentials.email);

            // Clear any existing session first
            this.logout();

            // Simple validation
            if (!credentials.email || !credentials.password) {
                throw new Error('Email and password are required');
            }

            // Sign in with AWS Cognito
            const result = await signIn({
                username: credentials.email,
                password: credentials.password,
            });

            console.log('AWS Cognito sign in result:', result);

            if (result.isSignedIn) {
                // Get the authenticated user details
                const user = await this.getCurrentUser();
                console.log('✅ AWS Cognito login successful:', user.username);

                // Store user session
                this.currentUser = user;
                localStorage.setItem(this.userKey, JSON.stringify({
                    id: user.userId,
                    email: user.username,
                    name: this.getDisplayName(user.username),
                    role: 'doctor', // Default role for now
                    loginTime: new Date().toISOString(),
                    provider: 'cognito'
                }));

                return this.currentUser;
            } else {
                throw new Error('Sign in not complete - may need additional steps');
            }

        } catch (error) {
            console.error('❌ AWS Cognito login failed:', error);

            // Handle specific AWS Cognito errors
            if (error.name === 'UserNotConfirmedException') {
                throw new Error('Please check your email and confirm your account');
            } else if (error.name === 'NotAuthorizedException') {
                throw new Error('Invalid email or password');
            } else if (error.name === 'UserNotFoundException') {
                throw new Error('User not found');
            } else if (error.name === 'TooManyFailedAttemptsException') {
                throw new Error('Too many failed attempts. Please try again later.');
            } else if (error.name === 'LimitExceededException') {
                throw new Error('Attempt limit exceeded. Please try again later.');
            }

            throw error;
        }
    }

    async signUp(email, password, name) {
        try {
            console.log('📝 Creating AWS Cognito account for:', email);

            const result = await signUp({
                username: email,
                password: password,
                attributes: {
                    email: email,
                    name: name
                },
                autoSignIn: {
                    enabled: true,
                }
            });

            console.log('AWS Cognito sign up result:', result);

            return {
                success: true,
                needsConfirmation: !result.isSignUpComplete,
                user: result.user,
                nextStep: result.nextStep
            };

        } catch (error) {
            console.error('❌ AWS Cognito sign up failed:', error);

            // Handle specific AWS Cognito errors
            if (error.name === 'UsernameExistsException') {
                throw new Error('An account with this email already exists');
            } else if (error.name === 'InvalidPasswordException') {
                throw new Error('Password does not meet requirements');
            } else if (error.name === 'InvalidParameterException') {
                throw new Error('Invalid email address');
            }

            throw error;
        }
    }

    async confirmSignUp(email, confirmationCode) {
        try {
            console.log('✅ Confirming AWS Cognito account for:', email);

            const result = await confirmSignUp({
                username: email,
                confirmationCode: confirmationCode
            });

            console.log('AWS Cognito confirmation result:', result);
            return result;

        } catch (error) {
            console.error('❌ AWS Cognito confirmation failed:', error);

            if (error.name === 'CodeMismatchException') {
                throw new Error('Invalid confirmation code');
            } else if (error.name === 'ExpiredCodeException') {
                throw new Error('Confirmation code has expired');
            } else if (error.name === 'LimitExceededException') {
                throw new Error('Too many attempts. Please try again later.');
            }

            throw error;
        }
    }

    async logout() {
        try {
            console.log('🚪 Logging out from AWS Cognito...');

            // Clear local state first
            this.currentUser = null;
            localStorage.removeItem(this.userKey);
            localStorage.removeItem(this.tokenKey);

            // Sign out from AWS Cognito
            await signOut();

            console.log('✅ AWS Cognito logout complete');
        } catch (error) {
            console.error('❌ AWS Cognito logout error:', error);
            // Even if AWS logout fails, clear local state
            this.currentUser = null;
            localStorage.removeItem(this.userKey);
            localStorage.removeItem(this.tokenKey);
        }
    }

    isAuthenticated() {
        try {
            if (!this.isInitialized) {
                // Synchronously check localStorage as fallback
                const stored = localStorage.getItem(this.userKey);
                return !!stored;
            }
            return !!this.currentUser;
        } catch (error) {
            console.error('❌ Auth check error:', error);
            return false;
        }
    }

    async getCurrentUser() {
        try {
            // Get current user from AWS Cognito
            const user = await getCurrentUser();
            return user;
        } catch (error) {
            // If no AWS session, check localStorage
            const stored = localStorage.getItem(this.userKey);
            if (stored) {
                return JSON.parse(stored);
            }
            throw new Error('No authenticated user');
        }
    }

    async getAuthToken() {
        try {
            const session = await fetchAuthSession();
            return session.tokens?.idToken?.toString();
        } catch (error) {
            console.error('❌ Failed to get auth token:', error);
            return null;
        }
    }

    getDisplayName(email) {
        if (!email) return 'User';

        // Extract name from email or use email
        if (email.includes('@')) {
            const username = email.split('@')[0];
            return username.charAt(0).toUpperCase() + username.slice(1);
        }
        return email;
    }

    getUserRole(email) {
        // For now, all users are doctors - you can enhance this later
        return 'doctor';
    }

    // Utility method to check if user has specific role
    hasRole(requiredRole) {
        try {
            const user = this.getUserInfo();
            if (!user) return false;
            return user.role === requiredRole || user.role === 'admin';
        } catch (error) {
            return false;
        }
    }

    // Get user info safely
    getUserInfo() {
        if (this.currentUser) {
            return { ...this.currentUser };
        }

        // Fallback to localStorage
        try {
            const stored = localStorage.getItem(this.userKey);
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            return null;
        }
    }

    // Add compatibility method for existing code
    async signIn(email, password) {
        console.log('🔧 signIn called - redirecting to login method');
        return this.login({ email, password });
    }
}

// Create and export singleton instance
export const authService = new AuthService();

// Initialize immediately
authService.initialize();

export default authService;