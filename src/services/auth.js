// src/services/auth.js - Enhanced to work with Cognito + Demo roles
import { getCurrentUser } from 'aws-amplify/auth';

class AuthService {
    constructor() {
        this.tokenKey = 'healthcare_token';
        this.userKey = 'healthcare_user';
        this.roleKey = 'healthcare_user_role'; // Store role separately for demo

        // Demo role mapping - in real app, this would come from Cognito user attributes
        this.demoRoleMappings = {
            'admin@telenos.com': 'admin',
            'demo@telenos.com': 'provider',
            'provider@telenos.com': 'provider',
            'patient@telenos.com': 'patient'
        };

        // Define permission sets for each role
        this.rolePermissions = {
            admin: [
                'user_management',
                'system_settings',
                'view_all_data',
                'generate_reports',
                'audit_logs',
                'backup_restore',
                'compliance_management',
                'integration_settings'
            ],
            provider: [
                'view_assigned_patients',
                'create_clinical_notes',
                'schedule_appointments',
                'video_consultations',
                'prescription_management',
                'patient_communication',
                'patient_management',
                'clinical_notes',
                'appointments'
            ],
            patient: [
                'view_own_records',
                'request_appointments',
                'patient_portal_access',
                'secure_messaging',
                'join_video_calls'
            ]
        };
    }

    // Get current user from Cognito or localStorage
    async getCurrentUser() {
        try {
            // Try Cognito first
            const cognitoUser = await getCurrentUser();
            if (cognitoUser) {
                const email = cognitoUser.signInDetails?.loginId || cognitoUser.attributes?.email || cognitoUser.username;
                const role = this.getUserRoleByEmail(email);

                return {
                    id: cognitoUser.userId,
                    username: cognitoUser.username,
                    email: email,
                    name: email, // Could be enhanced with proper name from Cognito attributes
                    role: role,
                    type: role,
                    permissions: this.rolePermissions[role] || [],
                    isAdmin: role === 'admin',
                    isProvider: role === 'provider',
                    isPatient: role === 'patient',
                    source: 'cognito'
                };
            }
        } catch (error) {
            // If Cognito fails, try localStorage (demo mode)
            const userStr = localStorage.getItem(this.userKey);
            if (userStr) {
                const user = JSON.parse(userStr);
                return user;
            }
        }

        throw new Error('No user session found');
    }

    // Determine role by email (demo purposes)
    getUserRoleByEmail(email) {
        // In a real app, this would be stored in Cognito user attributes
        const emailStr = String(email || '').toLowerCase().trim();
        return this.demoRoleMappings[emailStr] || 'patient'; // Default to patient
    }

    // Set demo role for testing
    async setDemoRole(role) {
        try {
            const user = await this.getCurrentUser();
            if (user) {
                user.role = role;
                user.type = role;
                user.permissions = this.rolePermissions[role] || [];
                user.isAdmin = role === 'admin';
                user.isProvider = role === 'provider';
                user.isPatient = role === 'patient';

                localStorage.setItem(this.userKey, JSON.stringify(user));
                localStorage.setItem(this.roleKey, role);
                return user;
            }
        } catch (error) {
            console.error('Failed to set demo role:', error);
        }
    }

    // Role checking methods
    async isAdmin() {
        try {
            const user = await this.getCurrentUser();
            return user && (user.role === 'admin' || user.isAdmin === true);
        } catch (error) {
            return false;
        }
    }

    async isProvider() {
        try {
            const user = await this.getCurrentUser();
            return user && (user.role === 'provider' || user.isProvider === true);
        } catch (error) {
            return false;
        }
    }

    async isPatient() {
        try {
            const user = await this.getCurrentUser();
            return user && (user.role === 'patient' || user.isPatient === true);
        } catch (error) {
            return false;
        }
    }

    // Permission checking method
    async hasPermission(permission) {
        try {
            const user = await this.getCurrentUser();
            return user && user.permissions && user.permissions.includes(permission);
        } catch (error) {
            return false;
        }
    }

    // Check multiple permissions
    async hasAnyPermission(permissions) {
        const results = await Promise.all(permissions.map(p => this.hasPermission(p)));
        return results.some(Boolean);
    }

    async hasAllPermissions(permissions) {
        const results = await Promise.all(permissions.map(p => this.hasPermission(p)));
        return results.every(Boolean);
    }

    // Get user role
    async getUserRole() {
        try {
            const user = await this.getCurrentUser();
            return user ? user.role : 'unknown';
        } catch (error) {
            return 'unknown';
        }
    }

    // Authentication check - works with both Cognito and demo
    async isAuthenticated() {
        try {
            await this.getCurrentUser();
            return true;
        } catch (error) {
            return false;
        }
    }

    // Legacy methods for compatibility (now async)
    isAdminSync() {
        // Synchronous fallback for compatibility - not recommended
        const roleOverride = localStorage.getItem(this.roleKey);
        return roleOverride === 'admin';
    }

    isProviderSync() {
        const roleOverride = localStorage.getItem(this.roleKey);
        return roleOverride === 'provider';
    }

    isPatientSync() {
        const roleOverride = localStorage.getItem(this.roleKey);
        return roleOverride === 'patient';
    }

    // Get demo accounts for testing
    getDemoAccounts() {
        return {
            admin: {
                email: 'admin@telenos.com',
                role: 'Administrator'
            },
            provider: {
                email: 'demo@telenos.com',
                role: 'Provider/Doctor'
            },
            patient: {
                email: 'patient@telenos.com',
                role: 'Patient'
            }
        };
    }
}

// Create and export singleton instance
const authService = new AuthService();
export { authService };
export default authService;