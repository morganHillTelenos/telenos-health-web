// src/components/RoleTestingPanel.js - Add this to your existing dashboard
import React, { useState, useEffect } from 'react';
import { authService } from '../services/auth';

const RoleTestingPanel = ({ onRoleChange }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState('provider');
    const [loading, setLoading] = useState(true);
    const [showPanel, setShowPanel] = useState(true);

    useEffect(() => {
        loadCurrentUser();
    }, []);

    const loadCurrentUser = async () => {
        try {
            const user = await authService.getCurrentUser();
            setCurrentUser(user);
            setSelectedRole(user?.role || 'provider');
        } catch (error) {
            console.error('Failed to load user:', error);
            // Create default user for testing
            const defaultUser = {
                email: 'demo@telenos.com',
                name: 'Dr. Demo User',
                role: 'provider'
            };
            setCurrentUser(defaultUser);
            setSelectedRole('provider');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (newRole) => {
        try {
            setLoading(true);
            const updatedUser = await authService.setDemoRole(newRole);
            setCurrentUser(updatedUser);
            setSelectedRole(newRole);

            if (onRoleChange) {
                onRoleChange(newRole, updatedUser);
            }

            // Show feedback
            console.log(`✅ Role changed to: ${newRole}`);

            // Refresh page to show role-based changes
            setTimeout(() => {
                window.location.reload();
            }, 500);

        } catch (error) {
            console.error('Failed to change role:', error);
            alert('Failed to change role: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'provider': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'patient': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin': return '👑';
            case 'provider': return '👨‍⚕️';
            case 'patient': return '👤';
            default: return '👤';
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="h-16 bg-gray-200 rounded"></div>
                        <div className="h-16 bg-gray-200 rounded"></div>
                        <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!showPanel) {
        return (
            <div className="mb-4">
                <button
                    onClick={() => setShowPanel(true)}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium"
                >
                    🧪 Show Role Testing Panel
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    🧪 Role Testing Panel
                    {currentUser && (
                        <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(selectedRole)}`}>
                            {getRoleIcon(selectedRole)} {selectedRole}
                        </span>
                    )}
                </h3>
                <button
                    onClick={() => setShowPanel(false)}
                    className="text-gray-400 hover:text-gray-600 text-lg"
                >
                    ✕
                </button>
            </div>

            {currentUser && (
                <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-3 text-sm">
                        <p className="text-blue-800">
                            <strong>Current User:</strong> {currentUser.email || 'demo@telenos.com'}
                        </p>
                        <p className="text-blue-600 mt-1">
                            <strong>Role:</strong> {selectedRole} • <strong>Permissions:</strong> {
                                currentUser.permissions?.length ? `${currentUser.permissions.length} permissions` : 'Loading...'
                            }
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Switch Role (for testing):
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                                {
                                    role: 'admin',
                                    label: 'Administrator',
                                    icon: '👑',
                                    desc: 'Full system access',
                                    color: 'purple'
                                },
                                {
                                    role: 'provider',
                                    label: 'Provider',
                                    icon: '👨‍⚕️',
                                    desc: 'Patient management',
                                    color: 'blue'
                                },
                                {
                                    role: 'patient',
                                    label: 'Patient',
                                    icon: '👤',
                                    desc: 'Personal health portal',
                                    color: 'green'
                                }
                            ].map(({ role, label, icon, desc, color }) => (
                                <button
                                    key={role}
                                    onClick={() => handleRoleChange(role)}
                                    disabled={loading || selectedRole === role}
                                    className={`p-4 rounded-lg border text-left transition-colors ${selectedRole === role
                                            ? `border-${color}-200 bg-${color}-50 text-${color}-800`
                                            : `border-gray-200 hover:border-${color}-300 hover:bg-${color}-50`
                                        } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">{icon}</span>
                                        <div>
                                            <div className="font-medium text-sm">{label}</div>
                                            <div className="text-xs text-gray-600">{desc}</div>
                                        </div>
                                    </div>
                                    {selectedRole === role && (
                                        <div className="mt-2 text-xs text-green-600 font-medium">
                                            ✓ Current Role
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded border-l-4 border-yellow-200">
                        <div className="flex items-start space-x-2">
                            <span className="text-yellow-600">⚠️</span>
                            <div>
                                <strong>Testing Mode:</strong> Switch between roles to test different access levels.
                                <br />Page will refresh automatically after role change to show new permissions.
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                        <div className="text-center">
                            <div className="text-2xl mb-1">👑</div>
                            <div className="text-xs font-medium">Admin Access</div>
                            <div className="text-xs text-gray-500">User management, system settings</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl mb-1">👨‍⚕️</div>
                            <div className="text-xs font-medium">Provider Access</div>
                            <div className="text-xs text-gray-500">Patient care, clinical notes</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl mb-1">👤</div>
                            <div className="text-xs font-medium">Patient Access</div>
                            <div className="text-xs text-gray-500">Personal records, appointments</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleTestingPanel;