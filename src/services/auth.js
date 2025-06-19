import { signIn, signUp, signOut, getCurrentUser, confirmSignUp } from 'aws-amplify/auth';

export class AuthService {
    async login(email, password) {
        try {
            const result = await signIn({
                username: email,
                password,
            });

            console.log('Sign in success:', result);

            if (result.isSignedIn) {
                const userData = await this.getCurrentUser();
                return {
                    success: true,
                    user: userData
                };
            } else {
                throw new Error('Sign in not complete');
            }
        } catch (error) {
            console.error('Login error:', error);

            // Handle specific Cognito errors
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

    async register(userData) {
        try {
            const { email, password, firstName, lastName } = userData;

            const result = await signUp({
                username: email,
                password,
                options: {
                    userAttributes: {
                        email,
                    }
                }
            });

            console.log('Sign up success:', result);

            return {
                success: true,
                user: result.user,
                needsConfirmation: !result.isSignUpComplete
            };
        } catch (error) {
            console.error('Registration error:', error);

            if (error.name === 'UsernameExistsException') {
                throw new Error('An account with this email already exists');
            }

            throw new Error(error.message || 'Registration failed');
        }
    }

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

    async logout() {
        try {
            await signOut();
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            throw new Error(error.message || 'Logout failed');
        }
    }

    async getCurrentUser() {
        try {
            const user = await getCurrentUser();
            return {
                userId: user.userId,
                email: user.signInDetails?.loginId || user.username,
                username: user.username,
            };
        } catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    }

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
        // For compatibility - Amplify handles tokens automatically
        return 'amplify-handled';
    }

    getStoredUser() {
        // For compatibility
        return this.getCurrentUser();
    }
}

export const authService = new AuthService();
export default authService;