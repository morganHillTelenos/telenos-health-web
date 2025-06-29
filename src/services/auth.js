// src/services/auth.js - Simplified version for demo login
class AuthService {
    constructor() {
        this.tokenKey = 'healthcare_token';
        this.userKey = 'healthcare_user';

        // Demo user accounts
        this.demoUsers = {
            'demo@telenos.com': {
                id: '1',
                email: 'demo@telenos.com',
                password: 'demo123',
                name: 'Dr. Smith',
                firstName: 'Dr.',
                lastName: 'Smith',
                role: 'provider',
                type: 'provider',
                permissions: ['all'],
                isProvider: true,
                isPatient: false
            },
            'provider@telenos.com': {
                id: '2',
                email: 'provider@telenos.com',
                password: 'provider123',
                name: 'Dr. Johnson',
                firstName: 'Dr.',
                lastName: 'Johnson',
                role: 'provider',
                type: 'provider',
                permissions: ['all'],
                isProvider: true,
                isPatient: false
            },
            'patient@telenos.com': {
                id: '3',
                email: 'patient@telenos.com',
                password: 'patient123',
                name: 'John Doe',
                firstName: 'John',
                lastName: 'Doe',
                role: 'patient',
                type: 'patient',
                permissions: ['limited'],
                isProvider: false,
                isPatient: true
            }
        };
    }

    // Simple sign in for demo
    async signIn(email, password) {
        try {
            console.log('Attempting login with:', email);

            // Ensure email is a string and handle edge cases
            const emailStr = String(email || '').toLowerCase().trim();

            if (!emailStr) {
                throw new Error('Email is required');
            }

            const user = this.demoUsers[emailStr];

            if (!user) {
                throw new Error('User not found');
            }

            if (user.password !== password) {
                throw new Error('Invalid password');
            }

            // Create user session (remove password from stored data)
            const userSession = {
                ...user,
                loginTime: new Date().toISOString(),
                sessionId: `session_${Date.now()}`
            };
            delete userSession.password;

            // Store session
            localStorage.setItem(this.userKey, JSON.stringify(userSession));
            localStorage.setItem(this.tokenKey, `demo_token_${Date.now()}`);

            console.log('✅ Login successful as:', userSession.role);

            return {
                success: true,
                user: userSession
            };

        } catch (error) {
            console.error('❌ Login error:', error);
            throw error;
        }
    }

    // Alternative method name for compatibility
    async login(email, password) {
        return this.signIn(email, password);
    }

    // Check if user is authenticated
    isAuthenticated() {
        try {
            const token = localStorage.getItem(this.tokenKey);
            const user = localStorage.getItem(this.userKey);
            return !!(token && user);
        } catch (error) {
            return false;
        }
    }

    // Get current user
    async getCurrentUser() {
        try {
            const userStr = localStorage.getItem(this.userKey);
            if (!userStr) {
                throw new Error('No user session found');
            }

            const user = JSON.parse(userStr);
            console.log('Current user:', user);
            return user;
        } catch (error) {
            console.error('Error getting current user:', error);
            throw error;
        }
    }

    // Get user role
    getUserRole() {
        try {
            const user = JSON.parse(localStorage.getItem(this.userKey) || '{}');
            return user.role || 'unknown';
        } catch (error) {
            return 'unknown';
        }
    }

    // Check if user is provider
    isProvider() {
        try {
            const user = JSON.parse(localStorage.getItem(this.userKey) || '{}');
            return user.role === 'provider' || user.isProvider === true;
        } catch (error) {
            return false;
        }
    }

    // Check if user is patient
    isPatient() {
        try {
            const user = JSON.parse(localStorage.getItem(this.userKey) || '{}');
            return user.role === 'patient' || user.isPatient === true;
        } catch (error) {
            return false;
        }
    }

    // Sign out
    async signOut() {
        try {
            localStorage.removeItem(this.userKey);
            localStorage.removeItem(this.tokenKey);
            console.log('✅ Signed out successfully');
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    }

    // Alternative method name for compatibility
    async logout() {
        return this.signOut();
    }

    // Register new user (for demo)
    async signUp(email, password, name) {
        try {
            // Ensure email is a string
            const emailStr = String(email || '').toLowerCase().trim();

            if (!emailStr) {
                throw new Error('Email is required');
            }

            // For demo, just create a new patient user
            const newUser = {
                id: `user_${Date.now()}`,
                email: emailStr,
                password: password,
                name: name,
                firstName: name.split(' ')[0] || name,
                lastName: name.split(' ').slice(1).join(' ') || '',
                role: 'patient',
                type: 'patient',
                permissions: ['limited'],
                isProvider: false,
                isPatient: true,
                createdAt: new Date().toISOString()
            };

            // For demo purposes, add to demo users
            this.demoUsers[emailStr] = newUser;

            console.log('✅ Demo registration successful');

            return {
                success: true,
                user: { ...newUser, password: undefined },
                needsConfirmation: false
            };

        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    // Alternative method name for compatibility
    async register(userData) {
        const { email, password, firstName, lastName } = userData;
        const name = `${firstName} ${lastName}`.trim();
        return this.signUp(email, password, name);
    }

    // Get demo accounts info
    getDemoAccounts() {
        return {
            provider: {
                email: 'demo@telenos.com',
                password: 'demo123',
                role: 'Provider/Doctor'
            },
            alternativeProvider: {
                email: 'provider@telenos.com',
                password: 'provider123',
                role: 'Provider/Doctor'
            },
            patient: {
                email: 'patient@telenos.com',
                password: 'patient123',
                role: 'Patient'
            }
        };
    }
}

// Create and export singleton instance
const authService = new AuthService();
export { authService };
export default authService;