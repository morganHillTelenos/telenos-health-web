// src/components/RoleSelector.js - For testing with Cognito
import React, { useState, useEffect } from 'react';
import { authService } from '../services/auth';
import { RoleBadge } from './PermissionBasedComponents';

const RoleSelector = ({ onRoleChange }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState('provider');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCurrentUser();
    }, []);

    const loadCurrentUser = async () => {
        try {
            const user = await authService.getCurrentUser();
            setCurrentUser(user);
            setSelectedRole(user.role || 'provider');
        } catch (error) {
            console.error('Failed to load user:', error);
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

            // Force page refresh to update role-based components
            setTimeout(() => window.location.reload(), 500);

        } catch (error) {
            console.error('Failed to change role:', error);
            alert('Failed to change role: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="animate-pulse flex space-x-4">
                    <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                    <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">🧪 Role Testing Panel</h3>
                {currentUser && <RoleBadge role={currentUser.role} />}
            </div>

            {currentUser && (
                <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                            <strong>Current User:</strong> {currentUser.email}
                        </p>
                        <p className="text-sm text-blue-600">
                            <strong>Role:</strong> {currentUser.role}
                        </p>
                        <p className="text-xs text-blue-500">
                            <strong>Permissions:</strong> {currentUser.permissions?.join(', ') || 'None'}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Switch Role (for testing):
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <button
                                onClick={() => handleRoleChange('admin')}
                                disabled={loading || selectedRole === 'admin'}
                                className={`p-3 rounded-lg border text-left transition-colors ${selectedRole === 'admin'
                                        ? 'border-purple-200 bg-purple-50 text-purple-800'
                                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                                    }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <span className="text-lg">👑</span>
                                    <div>
                                        <div className="font-medium text-sm">Administrator</div>
                                        <div className="text-xs text-gray-600">Full system access</div>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleRoleChange('provider')}
                                disabled={loading || selectedRole === 'provider'}
                                className={`p-3 rounded-lg border text-left transition-colors ${selectedRole === 'provider'
                                        ? 'border-blue-200 bg-blue-50 text-blue-800'
                                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                    }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <span className="text-lg">👨‍⚕️</span>
                                    <div>
                                        <div className="font-medium text-sm">Provider</div>
                                        <div className="text-xs text-gray-600">Patient management</div>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleRoleChange('patient')}
                                disabled={loading || selectedRole === 'patient'}
                                className={`p-3 rounded-lg border text-left transition-colors ${selectedRole === 'patient'
                                        ? 'border-green-200 bg-green-50 text-green-800'
                                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                                    }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <span className="text-lg">👤</span>
                                    <div>
                                        <div className="font-medium text-sm">Patient</div>
                                        <div className="text-xs text-gray-600">Personal records</div>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="text-xs text-gray-500 bg-yellow-50 p-2 rounded">
                        <strong>Note:</strong> This is for testing role-based access. The page will refresh after role change.
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleSelector;