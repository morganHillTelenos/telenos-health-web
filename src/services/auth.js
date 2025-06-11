class AuthService {
    constructor() {
        this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        this.tokenKey = 'auth_token';
    }

    async signIn(email, password) {
        try {
            // In production, this would be a real API call
            const response = await fetch(`${this.baseURL}/auth/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error('Invalid credentials');
            }

            const data = await response.json();

            // Store token
            localStorage.setItem(this.tokenKey, data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            return {
                success: true,
                user: data.user,
                token: data.token
            };
        } catch (error) {
            // Mock authentication for development
            if (email === 'demo@telenos.com' && password === 'demo123') {
                const mockUser = {
                    id: '1',
                    name: 'Demo Provider',
                    email: 'demo@telenos.com',
                    role: 'provider'
                };

                localStorage.setItem(this.tokenKey, 'mock_token_123');
                localStorage.setItem('user', JSON.stringify(mockUser));

                return {
                    success: true,
                    user: mockUser,
                    token: 'mock_token_123'
                };
            }

            throw new Error('Invalid email or password');
        }
    }

    async getCurrentUser() {
        const token = localStorage.getItem(this.tokenKey);
        const userString = localStorage.getItem('user');

        if (!token || !userString) {
            throw new Error('No user logged in');
        }

        try {
            return JSON.parse(userString);
        } catch (error) {
            throw new Error('Invalid user data');
        }
    }

    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem('user');
    }

    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    isAuthenticated() {
        return !!this.getToken();
    }
}

export const authService = new AuthService();