// src/utils/simpleAuth.js - Simple Cognito Authentication Helper
import { signUp, signIn, signOut, getCurrentUser, confirmSignUp } from 'aws-amplify/auth';

class SimpleAuth {
    // Simple sign up for testing
    async signUpTestUser() {
        try {
            console.log('📝 Creating test Cognito user...');

            const username = `testuser-${Date.now()}`;
            const email = `${username}@test.com`;
            const password = 'TempPass123!';

            const signUpResult = await signUp({
                username: email,
                password: password,
                options: {
                    userAttributes: {
                        email: email
                    }
                }
            });

            console.log('✅ Test user created:', signUpResult);

            // For testing, we can auto-confirm if needed
            if (signUpResult.nextStep?.signUpStep === 'CONFIRM_SIGN_UP') {
                console.log('⚠️ User needs email confirmation');
                return {
                    success: true,
                    needsConfirmation: true,
                    username: email,
                    password: password
                };
            }

            return {
                success: true,
                needsConfirmation: false,
                username: email,
                password: password
            };

        } catch (error) {
            console.error('❌ Failed to create test user:', error);
            if (error.name === 'UsernameExistsException') {
                // User already exists, try to sign in
                return {
                    success: false,
                    error: 'User exists - will try to sign in instead'
                };
            }
            throw error;
        }
    }

    // Simple sign in for testing
    async signInTestUser(username = 'test@example.com', password = 'TempPass123!') {
        try {
            console.log('🔐 Signing in test user:', username);

            const signInResult = await signIn({
                username: username,
                password: password
            });

            console.log('✅ User signed in successfully:', signInResult);

            const currentUser = await getCurrentUser();
            console.log('👤 Current user:', currentUser.username);

            return {
                success: true,
                user: currentUser
            };

        } catch (error) {
            console.error('❌ Sign in failed:', error);

            if (error.name === 'UserNotConfirmedException') {
                return {
                    success: false,
                    error: 'User not confirmed - check email for confirmation code',
                    needsConfirmation: true
                };
            } else if (error.name === 'NotAuthorizedException') {
                return {
                    success: false,
                    error: 'Invalid username/password'
                };
            } else if (error.name === 'UserNotFoundException') {
                return {
                    success: false,
                    error: 'User not found'
                };
            }

            throw error;
        }
    }

    // Check current auth status
    async getCurrentAuthStatus() {
        try {
            const user = await getCurrentUser();
            return {
                authenticated: true,
                user: user
            };
        } catch (error) {
            return {
                authenticated: false,
                error: error.message
            };
        }
    }

    // Sign out
    async signOutUser() {
        try {
            await signOut();
            console.log('✅ User signed out successfully');
            return { success: true };
        } catch (error) {
            console.error('❌ Sign out failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Confirm sign up (if needed)
    async confirmUser(username, confirmationCode) {
        try {
            await confirmSignUp({
                username: username,
                confirmationCode: confirmationCode
            });

            console.log('✅ User confirmed successfully');
            return { success: true };
        } catch (error) {
            console.error('❌ Confirmation failed:', error);
            return { success: false, error: error.message };
        }
    }
}

// Export singleton
const simpleAuth = new SimpleAuth();
export { simpleAuth };
export default simpleAuth;