// src/services/auth.js - Updated for TelenosHealth Backend API
class AuthService {
    constructor() {
        this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        this.tokenKey = 'telenos_auth_token';
        this.userKey = 'telenos_user';
    }

    // Make API request with error handling
    async apiRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        // Add auth token if available
        const token = this.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Sign in user
    async signIn(email, password) {
        try {
            const result = await this.apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            if (result.success && result.token) {
                // Store token and user data
                localStorage.setItem(this.tokenKey, result.token);
                localStorage.setItem(this.userKey, JSON.stringify(result.user));

                return {
                    success: true,
                    user: result.user,
                    token: result.token
                };
            } else {
                throw new Error(result.error || 'Login failed');
            }
        } catch (error) {
            console.error('Sign in error:', error);
            throw new Error(error.message);
        }
    }

    // Sign up new user (if your backend supports it)
    async signUp(email, password, name) {
        try {
            const result = await this.apiRequest('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ email, password, name }),
            });

            if (result.success) {
                return {
                    success: true,
                    user: result.user,
                    needsConfirmation: false // Since we're not using email verification
                };
            } else {
                throw new Error(result.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Sign up error:', error);
            throw new Error(error.message);
        }
    }

    // Get current authenticated user
    async getCurrentUser() {
        try {
            const token = this.getToken();
            if (!token) {
                throw new Error('No authentication token');
            }

            const result = await this.apiRequest('/auth/me');

            if (result.success) {
                // Update stored user data
                localStorage.setItem(this.userKey, JSON.stringify(result.user));
                return result.user;
            } else {
                throw new Error(result.error || 'Failed to get user');
            }
        } catch (error) {
            console.error('Get current user error:', error);
            // Clear invalid token
            this.signOut();
            throw new Error('No authenticated user');
        }
    }

    // Sign out user
    async signOut() {
        try {
            const token = this.getToken();
            if (token) {
                // Call logout endpoint (optional)
                try {
                    await this.apiRequest('/auth/logout', {
                        method: 'POST',
                    });
                } catch (error) {
                    console.warn('Logout API call failed:', error);
                    // Continue with local logout even if API fails
                }
            }

            // Clear local storage
            localStorage.removeItem(this.tokenKey);
            localStorage.removeItem(this.userKey);

            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            // Clear storage anyway
            localStorage.removeItem(this.tokenKey);
            localStorage.removeItem(this.userKey);
            throw new Error(error.message);
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        const token = this.getToken();
        const user = this.getStoredUser();
        return !!(token && user);
    }

    // Get stored token
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    // Get stored user data
    getStoredUser() {
        try {
            const userData = localStorage.getItem(this.userKey);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error parsing stored user data:', error);
            return null;
        }
    }

    // Reset password (placeholder - implement if needed)
    async forgotPassword(email) {
        try {
            // This would need to be implemented in your backend
            throw new Error('Password reset not implemented yet');
        } catch (error) {
            console.error('Forgot password error:', error);
            throw new Error(error.message);
        }
    }

    // Confirm password reset (placeholder)
    async confirmResetPassword(email, code, newPassword) {
        try {
            throw new Error('Password reset confirmation not implemented yet');
        } catch (error) {
            console.error('Reset password error:', error);
            throw new Error(error.message);
        }
    }

    // Change password (placeholder)
    async changePassword(oldPassword, newPassword) {
        try {
            const result = await this.apiRequest('/auth/change-password', {
                method: 'POST',
                body: JSON.stringify({ currentPassword: oldPassword, newPassword }),
            });

            if (result.success) {
                return { success: true };
            } else {
                throw new Error(result.error || 'Password change failed');
            }
        } catch (error) {
            console.error('Change password error:', error);
            throw new Error(error.message);
        }
    }

    // Confirm sign up (not needed for your backend, but kept for compatibility)
    async confirmSignUp(email, code) {
        try {
            // Not implemented for your backend
            return { success: true };
        } catch (error) {
            console.error('Confirmation error:', error);
            throw new Error(error.message);
        }
    }
}

// Export instance
export const authService = new AuthService();

// Default export for backward compatibility
export default authService;