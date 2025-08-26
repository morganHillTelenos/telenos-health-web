// src/components/RoleTestComponent.js
import React, { useState, useEffect } from 'react';
import { authService } from '../services/auth';
import { PermissionGate, RoleBadge, PermissionButton } from './PermissionBasedComponents';

const RoleTestComponent = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [testResults, setTestResults] = useState([]);

    useEffect(() => {
        loadCurrentUser();
        runRoleTests();
    }, []);

    const loadCurrentUser = async () => {
        try {
            const user = await authService.getCurrentUser();
            setCurrentUser(user);
        } catch (error) {
            console.error('Failed to load user:', error);
        }
    };

    const runRoleTests = () => {
        const tests = [
            {
                name: 'Is Admin',
                result: authService.isAdmin(),
                expected: 'Based on current login'
            },
            {
                name: 'Is Provider',
                result: authService.isProvider(),
                expected: 'Based on current login'
            },
            {
                name: 'Is Patient',
                result: authService.isPatient(),
                expected: 'Based on current login'
            },
            {
                name: 'Has User Management Permission',
                result: authService.hasPermission('user_management'),
                expected: 'Admin only'
            },
            {
                name: 'Has Patient Management Permission',
                result: authService.hasPermission('patient_management'),
                expected: 'Provider/Admin only'
            },
            {
                name: 'Has View Own Records Permission',
                result: authService.hasPermission('view_own_records'),
                expected: 'Patient only'
            }
        ];

        setTestResults(tests);
    };

    const handleSwitchRole = async (newRole) => {
        try {
            const accounts = authService.getDemoAccounts();
            let account;

            switch (newRole) {
                case 'admin':
                    account = accounts.admin;
                    break;
                case 'provider':
                    account = accounts.provider;
                    break;
                case 'patient':
                    account = accounts.patient;
                    break;
                default:
                    return;
            }

            await authService.signOut();
            await authService.signIn(account.email, account.password);

            // Reload the component
            loadCurrentUser();
            runRoleTests();

            alert(`✅ Switched to ${newRole} role!`);
        } catch (error) {
            alert(`❌ Failed to switch role: ${error.message}`);
        }
    };

    if (!currentUser) {
        return (
            <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">Please log in to test role-based access.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">🧪 Role-Based Access Testing</h2>

                {/* Current User Info */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-blue-900">Current User</h3>
                            <p className="text-blue-800">{currentUser.name} ({currentUser.email})</p>
                            <p className="text-sm text-blue-600">Role: {currentUser.role}</p>
                        </div>
                        <RoleBadge role={currentUser.role} />
                    </div>
                </div>

                {/* Role Switch Buttons */}
                <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Quick Role Switch (for testing):</h4>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => handleSwitchRole('admin')}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm"
                        >
                            👑 Switch to Admin
                        </button>
                        <button
                            onClick={() => handleSwitchRole('provider')}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                        >
                            👨‍⚕️ Switch to Provider
                        </button>
                        <button
                            onClick={() => handleSwitchRole('patient')}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                        >
                            👤 Switch to Patient
                        </button>
                    </div>
                </div>

                {/* Permission Test Results */}
                <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Permission Test Results:</h4>
                    <div className="space-y-2">
                        {testResults.map((test, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-700">{test.name}</span>
                                <div className="flex items-center space-x-2">
                                    <span className={`text-sm ${test.result ? 'text-green-600' : 'text-red-600'}`}>
                                        {test.result ? '✅ PASS' : '❌ FAIL'}
                                    </span>
                                    <span className="text-xs text-gray-500">({test.expected})</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Permission Gate Tests */}
                <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Permission Gate Component Tests:</h4>

                    <PermissionGate
                        requiredRole="admin"
                        fallback={<div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">❌ Admin-only content hidden</div>}
                    >
                        <div className="p-3 bg-purple-50 text-purple-700 rounded-lg text-sm">
                            ✅ <strong>Admin-only content visible!</strong> You can see this because you're an administrator.
                        </div>
                    </PermissionGate>

                    <PermissionGate
                        requiredRole="provider"
                        fallback={<div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">❌ Provider-only content hidden</div>}
                    >
                        <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                            ✅ <strong>Provider-only content visible!</strong> You can see this because you're a healthcare provider.
                        </div>
                    </PermissionGate>

                    <PermissionGate
                        requiredRole="patient"
                        fallback={<div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">❌ Patient-only content hidden</div>}
                    >
                        <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                            ✅ <strong>Patient-only content visible!</strong> You can see this because you're a patient.
                        </div>
                    </PermissionGate>

                    <PermissionGate
                        requiredPermissions={['user_management']}
                        fallback={<div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">❌ User management permission required</div>}
                    >
                        <div className="p-3 bg-orange-50 text-orange-700 rounded-lg text-sm">
                            ✅ <strong>User Management Access!</strong> You have permission to manage users.
                        </div>
                    </PermissionGate>
                </div>

                {/* Permission Button Tests */}
                <div className="mt-6 space-y-3">
                    <h4 className="font-semibold text-gray-900">Permission Button Tests:</h4>

                    <div className="flex space-x-3 flex-wrap">
                        <PermissionButton
                            requiredRole="admin"
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                            onClick={() => alert('Admin button clicked!')}
                        >
                            Admin Only Button
                        </PermissionButton>

                        <PermissionButton
                            requiredRole="provider"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                            onClick={() => alert('Provider button clicked!')}
                        >
                            Provider Only Button
                        </PermissionButton>

                        <PermissionButton
                            requiredRole="patient"
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                            onClick={() => alert('Patient button clicked!')}
                        >
                            Patient Only Button
                        </PermissionButton>

                        <PermissionButton
                            requiredPermissions={['user_management']}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm"
                            onClick={() => alert('User management action!')}
                        >
                            Manage Users
                        </PermissionButton>
                    </div>

                    <p className="text-xs text-gray-600 mt-2">
                        Note: Buttons that you can't see are hidden based on your current role and permissions.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RoleTestComponent;