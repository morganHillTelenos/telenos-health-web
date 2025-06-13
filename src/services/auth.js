// src/services/auth.js - Updated for Amplify v6
import {
    signUp,
    confirmSignUp,
    signIn,
    signOut,
    getCurrentUser,
    resetPassword,
    confirmResetPassword,
    updatePassword
} from 'aws-amplify/auth';

export const authService = {
    // Sign up new user
    async signUp(email, password, name) {
        try {
            const result = await signUp({
                username: email,
                password: password,
                options: {
                    userAttributes: {
                        email: email,
                        name: name,
                    }
                }
            });
            return {
                success: true,
                user: result.user,
                needsConfirmation: !result.isSignUpComplete
            };
        } catch (error) {
            console.error('Sign up error:', error);
            throw new Error(error.message);
        }
    },

    // Confirm sign up with verification code
    async confirmSignUp(email, code) {
        try {
            await confirmSignUp({
                username: email,
                confirmationCode: code
            });
            return { success: true };
        } catch (error) {
            console.error('Confirmation error:', error);
            throw new Error(error.message);
        }
    },

    // Sign in user
    async signIn(email, password) {
        try {
            const result = await signIn({
                username: email,
                password: password
            });

            // Get user attributes after successful sign in
            const user = await getCurrentUser();
            return {
                success: true,
                user: {
                    id: user.userId,
                    email: user.signInDetails?.loginId || email,
                    name: user.signInDetails?.loginId || email, // Will be updated when we get attributes
                    emailVerified: true
                }
            };
        } catch (error) {
            console.error('Sign in error:', error);
            throw new Error(error.message);
        }
    },

    // Get current authenticated user
    async getCurrentUser() {
        try {
            const user = await getCurrentUser();
            return {
                id: user.userId,
                email: user.signInDetails?.loginId || 'user@example.com',
                name: user.signInDetails?.loginId || 'User',
                emailVerified: true
            };
        } catch (error) {
            console.error('Get current user error:', error);
            throw new Error('No authenticated user');
        }
    },

    // Sign out user
    async logout() {
        try {
            await signOut();
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            throw new Error(error.message);
        }
    },

    // Reset password
    async forgotPassword(email) {
        try {
            await resetPassword({ username: email });
            return { success: true };
        } catch (error) {
            console.error('Forgot password error:', error);
            throw new Error(error.message);
        }
    },

    // Confirm new password
    async forgotPasswordSubmit(email, code, newPassword) {
        try {
            await confirmResetPassword({
                username: email,
                confirmationCode: code,
                newPassword: newPassword
            });
            return { success: true };
        } catch (error) {
            console.error('Reset password error:', error);
            throw new Error(error.message);
        }
    },

    // Change password for authenticated user
    async changePassword(oldPassword, newPassword) {
        try {
            await updatePassword({
                oldPassword: oldPassword,
                newPassword: newPassword
            });
            return { success: true };
        } catch (error) {
            console.error('Change password error:', error);
            throw new Error(error.message);
        }
    }
};