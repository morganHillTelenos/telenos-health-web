// src/pages/HealthcareDashboard.js - Clean version without Doxy.me
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

const HealthcareDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({});
    const [recentActivity, setRecentActivity] = useState([]);
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        loadDashboardData();
        getCurrentUserInfo();

        // Update time every minute
        const timeInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(timeInterval);
    }, []);

    const getCurrentUserInfo = async () => {
        try {
            const user = await authService.getCurrentUser();
            setCurrentUser(user);
        } catch (error) {
            console.error('Error getting current user:', error);
        }
    };

    const loadDashboardData = async () => {
        try {
            // Simulate loading delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            setStats({
                totalPatients: 247,
                todayAppointments: 12,
                upcomingAppointments: 38,
                completedToday: 8,
                pendingReviews: 5
            });

            setRecentActivity([
                {
                    id: 1,
                    type: 'patient',
                    title: 'New patient registration: Sarah Johnson',
                    time: '12 minutes ago',
                    icon: '👤',
                    color: '#10B981',
                    priority: 'normal'
                },
                {
                    id: 2,
                    type: 'appointment',
                    title: 'Appointment completed with Michael Chen',
                    time: '45 minutes ago',
                    icon: '✅',
                    color: '#059669',
                    priority: 'normal'
                },
                {
                    id: 3,
                    type: 'urgent',
                    title: 'Lab results ready for review - Emily Davis',
                    time: '1 hour ago',
                    icon: '🔬',
                    color: '#DC2626',
                    priority: 'urgent'
                },
                {
                    id: 4,
                    type: 'appointment',
                    title: 'Upcoming appointment with Robert Wilson',
                    time: 'In 2 hours',
                    icon: '📅',
                    color: '#3B82F6',
                    priority: 'high'
                },
                {
                    id: 5,
                    type: 'system',
                    title: 'Daily backup completed successfully',
                    time: '3 hours ago',
                    icon: '💾',
                    color: '#6B7280',
                    priority: 'low'
                }
            ]);

            setUpcomingAppointments([
                {
                    id: 'apt-001',
                    patientName: 'Robert Wilson',
                    time: '2:00 PM',
                    type: 'Consultation',
                    duration: '30 min',
                    status: 'confirmed'
                },
                {
                    id: 'apt-002',
                    patientName: 'Lisa Anderson',
                    time: '3:30 PM',
                    type: 'Follow-up',
                    duration: '20 min',
                    status: 'confirmed'
                },
                {
                    id: 'apt-003',
                    patientName: 'David Martinez',
                    time: '4:15 PM',
                    type: 'Check-up',
                    duration: '45 min',
                    status: 'pending'
                }
            ]);

            setLoading(false);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await authService.signOut();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const quickActions = [
        {
            title: 'Add New Patient',
            description: 'Register a new patient in the system',
            icon: '👤',
            color: 'from-blue-500 to-blue-600',
            action: () => navigate('/patients/new')
        },
        {
            title: 'Schedule Appointment',
            description: 'Book a new appointment',
            icon: '📅',
            color: 'from-green-500 to-green-600',
            action: () => navigate('/appointments/new')
        },
        {
            title: 'Clinical Notes',
            description: 'Document patient encounters',
            icon: '📝',
            color: 'from-purple-500 to-purple-600',
            action: () => navigate('/notes')
        },
        {
            title: 'View Calendar',
            description: 'Check today\'s schedule',
            icon: '🗓️',
            color: 'from-teal-500 to-teal-600',
            action: () => navigate('/calendar')
        },
        {
            title: 'Patient Records',
            description: 'Browse all patient files',
            icon: '📋',
            color: 'from-orange-500 to-orange-600',
            action: () => navigate('/patients')
        }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Healthcare Dashboard</h1>
                            <p className="text-sm text-gray-600">
                                Welcome back, {currentUser?.name || 'Doctor'}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-600">
                                {currentTime.toLocaleDateString()} • {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalPatients}</p>
                            </div>
                            <div className="text-3xl">👥</div>
                        </div>
                        <div className="mt-2">
                            <span className="text-sm text-green-600 font-medium">↗ 12% increase</span>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.todayAppointments}</p>
                            </div>
                            <div className="text-3xl">📅</div>
                        </div>
                        <div className="mt-2">
                            <span className="text-sm text-blue-600 font-medium">{stats.completedToday} completed</span>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Upcoming This Week</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.upcomingAppointments}</p>
                            </div>
                            <div className="text-3xl">⏰</div>
                        </div>
                        <div className="mt-2">
                            <span className="text-sm text-orange-600 font-medium">Next: 2:00 PM</span>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.pendingReviews}</p>
                            </div>
                            <div className="text-3xl">📋</div>
                        </div>
                        <div className="mt-2">
                            <span className="text-sm text-red-600 font-medium">Needs attention</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {quickActions.map((action, index) => (
                            <button
                                key={index}
                                onClick={action.action}
                                className="group bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-6 shadow-lg hover:shadow-xl transition-all duration-200 text-left"
                            >
                                <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center text-white text-xl mb-4 group-hover:scale-110 transition-transform`}>
                                    {action.icon}
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                                <p className="text-sm text-gray-600">{action.description}</p>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Activity */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                        <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 shadow-lg">
                            {recentActivity.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {recentActivity.map((item) => (
                                        <div key={item.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                                            <div className="flex items-start gap-4">
                                                <div
                                                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                                                    style={{ backgroundColor: `${item.color}20`, color: item.color }}
                                                >
                                                    {item.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between">
                                                        <p className="text-sm font-medium text-gray-900 leading-5">
                                                            {item.title}
                                                        </p>
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${item.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                                                item.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {item.priority.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-500 text-xs mt-1">{item.time}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="text-6xl mb-4 opacity-30">📊</div>
                                    <div className="font-semibold text-gray-900 mb-2">No recent activity</div>
                                    <div className="text-gray-500 text-sm">
                                        Start by adding patients or scheduling appointments
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upcoming Appointments */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Today's Schedule</h2>
                        <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 shadow-lg">
                            {upcomingAppointments.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {upcomingAppointments.map((appointment) => (
                                        <div key={appointment.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">
                                                        {appointment.patientName}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        {appointment.type} • {appointment.duration}
                                                    </p>
                                                    <p className="text-sm font-medium text-blue-600">
                                                        {appointment.time}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {appointment.status.toUpperCase()}
                                                    </span>
                                                    <button
                                                        onClick={() => navigate(`/appointments/${appointment.id}`)}
                                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                                    >
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="text-6xl mb-4 opacity-30">📅</div>
                                    <div className="font-semibold text-gray-900 mb-2">No appointments today</div>
                                    <div className="text-gray-500 text-sm mb-4">
                                        Your schedule is clear for today
                                    </div>
                                    <button
                                        onClick={() => navigate('/appointments/new')}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Schedule New Appointment
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthcareDashboard;