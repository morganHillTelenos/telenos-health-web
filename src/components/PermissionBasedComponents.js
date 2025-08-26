// src/components/PermissionBasedComponents.js
import React from 'react';
import { authService } from '../services/auth';

// Higher-order component for role-based rendering
export const withRoleAccess = (WrappedComponent, allowedRoles) => {
    return function RoleAccessComponent(props) {
        const userRole = authService.getUserRole();

        if (!allowedRoles.includes(userRole)) {
            return (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <h3 className="text-red-800 font-semibold">Access Denied</h3>
                    <p className="text-red-600">You don't have permission to view this content.</p>
                </div>
            );
        }

        return <WrappedComponent {...props} />;
    };
};

// Component for permission-based content rendering
export const PermissionGate = ({
    children,
    requiredPermissions = [],
    requiredRole = null,
    fallback = null,
    requireAll = false
}) => {
    const [hasAccess, setHasAccess] = React.useState(false);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const checkAccess = async () => {
            try {
                // Check role if specified
                if (requiredRole) {
                    const userRole = await authService.getUserRole();
                    if (userRole !== requiredRole) {
                        setHasAccess(false);
                        setLoading(false);
                        return;
                    }
                }

                // Check permissions if specified
                if (requiredPermissions.length > 0) {
                    const hasPermission = requireAll
                        ? await authService.hasAllPermissions(requiredPermissions)
                        : await authService.hasAnyPermission(requiredPermissions);

                    setHasAccess(hasPermission);
                } else {
                    setHasAccess(true);
                }
            } catch (error) {
                setHasAccess(false);
            }
            setLoading(false);
        };

        checkAccess();
    }, [requiredPermissions, requiredRole, requireAll]);

    if (loading) {
        return <div className="animate-pulse bg-gray-200 rounded h-4 w-24"></div>;
    }

    return hasAccess ? children : fallback;
};

// Role-specific navigation component
export const RoleBasedNavigation = () => {
    const userRole = authService.getUserRole();

    const navigationItems = {
        admin: [
            { label: 'Dashboard', path: '/dashboard', icon: '📊' },
            { label: 'User Management', path: '/admin/users', icon: '👥' },
            { label: 'System Settings', path: '/admin/settings', icon: '⚙️' },
            { label: 'Reports', path: '/admin/reports', icon: '📈' },
            { label: 'Audit Logs', path: '/admin/audit', icon: '📋' }
        ],
        provider: [
            { label: 'Dashboard', path: '/dashboard', icon: '📊' },
            { label: 'Patients', path: '/patients', icon: '👤' },
            { label: 'Calendar', path: '/calendar', icon: '📅' },
            { label: 'Notes', path: '/notes', icon: '📝' },
            { label: 'Video Calls', path: '/video', icon: '🎥' }
        ],
        patient: [
            { label: 'My Records', path: '/patient/records', icon: '📄' },
            { label: 'Appointments', path: '/patient/appointments', icon: '📅' },
            { label: 'Messages', path: '/patient/messages', icon: '💬' },
            { label: 'Profile', path: '/patient/profile', icon: '👤' }
        ]
    };

    const items = navigationItems[userRole] || [];

    return (
        <nav className="space-y-2">
            {items.map((item, index) => (
                <a
                    key={index}
                    href={item.path}
                    className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                </a>
            ))}
        </nav>
    );
};

// Permission-based button component
export const PermissionButton = ({
    children,
    requiredPermissions = [],
    requiredRole = null,
    onClick,
    className = "",
    disabled = false,
    ...props
}) => {
    const userRole = authService.getUserRole();

    // Check role access
    const hasRoleAccess = !requiredRole || userRole === requiredRole;

    // Check permission access
    const hasPermissionAccess = requiredPermissions.length === 0 ||
        authService.hasAnyPermission(requiredPermissions);

    const canAccess = hasRoleAccess && hasPermissionAccess;

    if (!canAccess) {
        return null; // Don't render the button if no access
    }

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            {...props}
        >
            {children}
        </button>
    );
};

// Role badge component
export const RoleBadge = ({ role, className = "" }) => {
    const roleStyles = {
        admin: 'bg-purple-100 text-purple-800 border-purple-200',
        provider: 'bg-blue-100 text-blue-800 border-blue-200',
        patient: 'bg-green-100 text-green-800 border-green-200'
    };

    const roleLabels = {
        admin: 'Administrator',
        provider: 'Provider',
        patient: 'Patient'
    };

    return (
        <span className={`
            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
            ${roleStyles[role] || 'bg-gray-100 text-gray-800 border-gray-200'}
            ${className}
        `}>
            {roleLabels[role] || role}
        </span>
    );
};

// Access denied component
export const AccessDenied = ({ message = "You don't have permission to access this resource." }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                <button
                    onClick={() => window.history.back()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
};