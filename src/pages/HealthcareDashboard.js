// src/pages/HealthcareDashboard.js - Updated with Proper Routing
import React, { useState, useEffect } from 'react';

const HealthcareDashboard = ({
    onNavigateToCalendar,
    onStartVideoCall,
    onNavigateToPatients,
    onNavigateToNewPatient,
    onNavigateToNewAppointment
}) => {
    const [stats, setStats] = useState({});
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const loadDashboardData = async () => {
            await new Promise(resolve => setTimeout(resolve, 1000));

            setStats({
                totalPatients: 247,
                todayAppointments: 12,
                upcomingAppointments: 38,
                completedToday: 8
            });

            setRecentActivity([
                {
                    type: 'patient',
                    title: 'New patient registration: Sarah Johnson',
                    time: '12 minutes ago',
                    icon: '👤',
                    color: '#10B981',
                    priority: 'normal'
                },
                {
                    type: 'appointment',
                    title: 'Video appointment with Michael Chen starting soon',
                    time: 'In 15 minutes',
                    icon: '🎥',
                    color: '#3B82F6',
                    priority: 'high',
                    appointmentId: 'apt-123',
                    hasVideoCall: true
                },
                {
                    type: 'alert',
                    title: 'Critical lab results ready for review',
                    time: '8 minutes ago',
                    icon: '⚠️',
                    color: '#EF4444',
                    priority: 'urgent'
                },
                {
                    type: 'appointment',
                    title: 'Appointment completed: Robert Johnson',
                    time: '25 minutes ago',
                    icon: '✅',
                    color: '#10B981',
                    priority: 'normal'
                }
            ]);

            setLoading(false);
        };

        loadDashboardData();

        const timeInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timeInterval);
    }, []);

    const quickActions = [
        {
            title: 'New Appointment',
            subtitle: 'Schedule patient visit',
            icon: '📅',
            gradient: 'from-blue-500 to-blue-600',
            bgPattern: 'bg-blue-50',
            action: () => {
                console.log('📅 Navigate to New Appointment clicked');
                if (onNavigateToNewAppointment) {
                    onNavigateToNewAppointment();
                } else {
                    alert('Navigate to New Appointment form - Navigation not configured');
                }
            }
        },
        {
            title: 'New Patient',
            subtitle: 'Register new patient',
            icon: '👤',
            gradient: 'from-green-500 to-green-600',
            bgPattern: 'bg-green-50',
            action: () => {
                console.log('👤 Navigate to New Patient clicked');
                if (onNavigateToNewPatient) {
                    onNavigateToNewPatient();
                } else {
                    alert('Navigate to New Patient form - Navigation not configured');
                }
            }
        },
        {
            title: 'Patients',
            subtitle: 'View patient records',
            icon: '📋',
            gradient: 'from-purple-500 to-purple-600',
            bgPattern: 'bg-purple-50',
            action: () => {
                console.log('📋 Navigate to Patients clicked');
                if (onNavigateToPatients) {
                    onNavigateToPatients();
                } else {
                    alert('Navigate to Patients list - Navigation not configured');
                }
            }
        },
        {
            title: 'Calendar',
            subtitle: 'View schedule',
            icon: '🗓️',
            gradient: 'from-indigo-500 to-indigo-600',
            bgPattern: 'bg-indigo-50',
            action: () => {
                console.log('🗓️ Navigate to Calendar clicked');
                if (onNavigateToCalendar) {
                    onNavigateToCalendar();
                } else {
                    alert('Navigate to Calendar - Navigation not configured');
                }
            }
        }
    ];

    const upcomingAppointments = [
        {
            time: '2:00 PM',
            patient: 'Michael Chen',
            type: 'Video Consultation',
            reason: 'Follow-up visit',
            status: 'confirmed',
            appointmentId: 'apt-123',
            hasVideoCall: true
        },
        {
            time: '3:30 PM',
            patient: 'Sarah Williams',
            type: 'In-Person',
            reason: 'Annual checkup',
            status: 'confirmed',
            appointmentId: 'apt-124',
            hasVideoCall: false
        },
        {
            time: '4:15 PM',
            patient: 'Robert Johnson',
            type: 'Video Consultation',
            reason: 'Medication review',
            status: 'pending',
            appointmentId: 'apt-125',
            hasVideoCall: true
        }
    ];

    const handleJoinVideoCall = (appointmentId) => {
        console.log('🎥 Join Video Call clicked for appointment:', appointmentId);
        if (onStartVideoCall) {
            onStartVideoCall(appointmentId);
        } else {
            // Fallback to direct navigation
            window.location.href = `/video-call/${appointmentId}`;
        }
    };

    const MetricCard = ({ title, value, subtitle, trend, icon, color, percentage, onClick, clickable }) => (
        <div
            className={`group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden ${clickable ? 'cursor-pointer hover:border-blue-300' : ''}`}
            onClick={clickable ? onClick : undefined}
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full -mr-12 -mt-12 opacity-50" />
            <div className="relative">
                <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl">{icon}</div>
                    {trend && (
                        <div className={`text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
                        </div>
                    )}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1" style={{ color }}>{value}</div>
                <div className="text-sm text-gray-600">{title}</div>
                {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
                {percentage !== undefined && (
                    <div className="mt-2 bg-gray-200 rounded-full h-1">
                        <div
                            className="h-1 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%`, backgroundColor: color }}
                        />
                    </div>
                )}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4 animate-pulse">🏥</div>
                    <div className="text-xl font-semibold text-gray-700">Loading your dashboard...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="container mx-auto px-6 py-8 pt-20">
                {/* Header with Time */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                                Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 17 ? 'Afternoon' : 'Evening'}!
                            </h1>
                            <p className="text-gray-600 text-lg">Welcome back to your healthcare dashboard</p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">
                                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="text-gray-600">
                                {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <MetricCard
                        title="Total Patients"
                        value={stats.totalPatients}
                        icon="👥"
                        color="#3B82F6"
                        trend={12}
                        clickable={true}
                        onClick={() => {
                            console.log('📊 Total Patients metric clicked');
                            if (onNavigateToPatients) {
                                onNavigateToPatients();
                            } else {
                                alert('Navigate to Patients - Navigation not configured');
                            }
                        }}
                    />
                    <MetricCard
                        title="Today's Appointments"
                        value={stats.todayAppointments}
                        icon="📅"
                        color="#10B981"
                        percentage={75}
                        clickable={true}
                        onClick={() => {
                            console.log('📅 Today\'s Appointments metric clicked');
                            if (onNavigateToCalendar) {
                                onNavigateToCalendar();
                            } else {
                                alert('Navigate to Calendar - Navigation not configured');
                            }
                        }}
                    />
                    <MetricCard
                        title="Upcoming This Week"
                        value={stats.upcomingAppointments}
                        icon="📊"
                        color="#8B5CF6"
                        trend={8}
                        clickable={true}
                        onClick={() => {
                            console.log('📊 Upcoming This Week metric clicked');
                            if (onNavigateToCalendar) {
                                onNavigateToCalendar();
                            } else {
                                alert('Navigate to Calendar - Navigation not configured');
                            }
                        }}
                    />
                    <MetricCard
                        title="Completed Today"
                        value={stats.completedToday}
                        icon="✅"
                        color="#F59E0B"
                        percentage={67}
                    />
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {quickActions.map((action, index) => (
                            <div
                                key={index}
                                onClick={action.action}
                                className="group cursor-pointer bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                                <div className={`absolute top-0 right-0 w-20 h-20 ${action.bgPattern} rounded-full -mr-10 -mt-10 opacity-20`} />
                                <div className="relative">
                                    <div className="text-3xl mb-4">{action.icon}</div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{action.title}</h3>
                                    <p className="text-gray-600 text-sm">{action.subtitle}</p>
                                    <div className={`mt-4 w-8 h-8 bg-gradient-to-r ${action.gradient} rounded-lg flex items-center justify-center text-white text-sm group-hover:scale-110 transition-transform duration-200`}>
                                        →
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Activity */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Recent Activity</h2>
                        <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 shadow-lg">
                            {recentActivity.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {recentActivity.map((item, index) => (
                                        <div key={index} className="p-6 hover:bg-gray-50/50 transition-colors duration-200">
                                            <div className="flex items-start gap-4">
                                                <div
                                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0"
                                                    style={{ backgroundColor: item.color }}
                                                >
                                                    {item.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <p className="font-semibold text-gray-900 text-sm truncate">{item.title}</p>
                                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${item.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                                            item.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                                                'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {item.priority.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-gray-500 text-xs">{item.time}</p>
                                                        {item.hasVideoCall && (
                                                            <button
                                                                onClick={() => handleJoinVideoCall(item.appointmentId)}
                                                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1"
                                                            >
                                                                🎥 Join Call
                                                            </button>
                                                        )}
                                                    </div>
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
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Upcoming Today</h2>
                        <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 shadow-lg">
                            {upcomingAppointments.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {upcomingAppointments.map((appointment, index) => (
                                        <div key={index} className="p-6 hover:bg-gray-50/50 transition-colors duration-200">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="font-bold text-lg text-blue-600">{appointment.time}</div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${appointment.status === 'confirmed'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {appointment.status.toUpperCase()}
                                                    </span>
                                                    {appointment.hasVideoCall && (
                                                        <button
                                                            onClick={() => handleJoinVideoCall(appointment.appointmentId)}
                                                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1"
                                                        >
                                                            🎥 Start Call
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mb-2">
                                                <div className="font-semibold text-gray-900">{appointment.patient}</div>
                                                <div className="text-sm text-gray-600">{appointment.reason}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${appointment.type === 'Video Consultation' ? 'bg-blue-500' : 'bg-green-500'
                                                    }`} />
                                                <span className="text-sm text-gray-700">{appointment.type}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="text-6xl mb-4 opacity-30">📅</div>
                                    <div className="font-semibold text-gray-900 mb-2">No appointments today</div>
                                    <div className="text-gray-500 text-sm">
                                        Your schedule is clear for today
                                    </div>
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