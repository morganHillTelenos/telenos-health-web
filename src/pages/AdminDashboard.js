// src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { Users, Settings, BarChart3, Shield, Database, Activity } from 'lucide-react';
import { authService } from '../services/auth';
import { PermissionGate, AccessDenied } from '../components/PermissionBasedComponents';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeProviders: 0,
        totalPatients: 0,
        systemHealth: 'Good',
        lastBackup: 'Never'
    });

    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        loadCurrentUser();
        loadSystemStats();
    }, []);

    const loadCurrentUser = async () => {
        try {
            const user = await authService.getCurrentUser();
            setCurrentUser(user);
        } catch (error) {
            console.error('Failed to load current user:', error);
        }
    };

    const loadSystemStats = () => {
        // Mock system statistics - replace with real API calls
        setStats({
            totalUsers: 156,
            activeProviders: 12,
            totalPatients: 144,
            systemHealth: 'Good',
            lastBackup: '2 hours ago'
        });
    };

    // Check if user is admin
    if (!authService.isAdmin()) {
        return <AccessDenied message="Administrator access required." />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">System Administration</h1>
                            <p className="text-gray-600">Welcome back, {currentUser?.name}</p>
                        </div>
                        <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                            Administrator
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                        title="Total Users"
                        value={stats.totalUsers}
                        icon={<Users className="w-6 h-6" />}
                        color="blue"
                    />
                    <StatsCard
                        title="Active Providers"
                        value={stats.activeProviders}
                        icon={<Activity className="w-6 h-6" />}
                        color="green"
                    />
                    <StatsCard
                        title="Total Patients"
                        value={stats.totalPatients}
                        icon={<Shield className="w-6 h-6" />}
                        color="purple"
                    />
                    <StatsCard
                        title="System Health"
                        value={stats.systemHealth}
                        icon={<BarChart3 className="w-6 h-6" />}
                        color="emerald"
                    />
                </div>

                {/* Admin Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <AdminActionCard
                        title="User Management"
                        description="Manage providers, patients, and admin accounts"
                        icon={<Users className="w-8 h-8" />}
                        href="/admin/users"
                        color="blue"
                    />
                    <AdminActionCard
                        title="System Settings"
                        description="Configure system preferences and policies"
                        icon={<Settings className="w-8 h-8" />}
                        href="/admin/settings"
                        color="gray"
                    />
                    <AdminActionCard
                        title="Reports & Analytics"
                        description="View system usage and performance reports"
                        icon={<BarChart3 className="w-8 h-8" />}
                        href="/admin/reports"
                        color="green"
                    />
                    <AdminActionCard
                        title="Security & Compliance"
                        description="Manage security settings and HIPAA compliance"
                        icon={<Shield className="w-8 h-8" />}
                        href="/admin/security"
                        color="red"
                    />
                    <AdminActionCard
                        title="Data Management"
                        description="Backup, restore, and manage system data"
                        icon={<Database className="w-8 h-8" />}
                        href="/admin/data"
                        color="purple"
                    />
                    <AdminActionCard
                        title="System Health"
                        description="Monitor system performance and logs"
                        icon={<Activity className="w-8 h-8" />}
                        href="/admin/health"
                        color="orange"
                    />
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Recent System Activity</h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {[
                                { action: 'New provider registered', user: 'Dr. Wilson', time: '2 hours ago', type: 'user' },
                                { action: 'System backup completed', user: 'System', time: '4 hours ago', type: 'system' },
                                { action: 'Security settings updated', user: 'Admin', time: '1 day ago', type: 'security' },
                                { action: 'Patient data export', user: 'Dr. Smith', time: '2 days ago', type: 'data' }
                            ].map((activity, index) => (
                                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <div className={`w-2 h-2 rounded-full ${getActivityColor(activity.type)}`}></div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-900">{activity.action}</p>
                                        <p className="text-xs text-gray-500">By {activity.user} • {activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatsCard = ({ title, value, icon, color }) => {
    const colorClasses = {
        blue: 'text-blue-600 bg-blue-100',
        green: 'text-green-600 bg-green-100',
        purple: 'text-purple-600 bg-purple-100',
        emerald: 'text-emerald-600 bg-emerald-100'
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};

const AdminActionCard = ({ title, description, icon, href, color }) => {
    const colorClasses = {
        blue: 'text-blue-600 bg-blue-100 hover:bg-blue-200',
        gray: 'text-gray-600 bg-gray-100 hover:bg-gray-200',
        green: 'text-green-600 bg-green-100 hover:bg-green-200',
        red: 'text-red-600 bg-red-100 hover:bg-red-200',
        purple: 'text-purple-600 bg-purple-100 hover:bg-purple-200',
        orange: 'text-orange-600 bg-orange-100 hover:bg-orange-200'
    };

    return (
        <a
            href={href}
            className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
            <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    {icon}
                </div>
                <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{title}</h4>
                    <p className="text-gray-600 text-sm">{description}</p>
                </div>
            </div>
        </a>
    );
};

const getActivityColor = (type) => {
    const colors = {
        user: 'bg-blue-500',
        system: 'bg-gray-500',
        security: 'bg-red-500',
        data: 'bg-green-500'
    };
    return colors[type] || 'bg-gray-500';
};

export default AdminDashboard;