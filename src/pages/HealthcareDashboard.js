import React from 'react';
const { useState, useEffect } = React;

const HealthcareDashboard = () => {
    const [stats, setStats] = useState({
        totalPatients: 0,
        todayAppointments: 0,
        upcomingAppointments: 0,
        completedToday: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            await new Promise(resolve => setTimeout(resolve, 1000));

            setStats({
                totalPatients: 47,
                todayAppointments: 8,
                upcomingAppointments: 23,
                completedToday: 5
            });

            setRecentActivity([
                {
                    type: 'patient',
                    title: 'New patient: Sarah Johnson',
                    time: '2 hours ago',
                    icon: '👤',
                    color: '#10B981'
                },
                {
                    type: 'appointment',
                    title: 'Appointment with Michael Chen',
                    time: 'Today at 2:00 PM',
                    icon: '📅',
                    color: '#3B82F6'
                },
                {
                    type: 'video',
                    title: 'Video session completed',
                    time: '1 hour ago',
                    icon: '🎥',
                    color: '#8B5CF6'
                },
                {
                    type: 'patient',
                    title: 'New patient: Emma Davis',
                    time: 'Yesterday',
                    icon: '👤',
                    color: '#10B981'
                },
                {
                    type: 'appointment',
                    title: 'Appointment with Robert Wilson',
                    time: 'Tomorrow at 10:00 AM',
                    icon: '📅',
                    color: '#3B82F6'
                }
            ]);

            setLoading(false);
        };

        loadDashboardData();
    }, []);

    const quickActions = [
        {
            title: 'New Patient',
            subtitle: 'Add patient record',
            icon: '👥',
            gradient: 'from-emerald-500 to-emerald-600',
            action: () => alert('Navigate to New Patient form')
        },
        {
            title: 'Schedule',
            subtitle: 'Book appointment',
            icon: '📅',
            gradient: 'from-blue-500 to-blue-600',
            action: () => alert('Navigate to New Appointment form')
        },
        {
            title: 'Patients',
            subtitle: 'View all patients',
            icon: '👥',
            gradient: 'from-purple-500 to-purple-600',
            action: () => alert('Navigate to Current Patients')
        },
        {
            title: 'Calendar',
            subtitle: 'View schedule',
            icon: '🗓️',
            gradient: 'from-cyan-500 to-cyan-600',
            action: () => alert('Navigate to Calendar')
        }
    ];

    const MetricCard = ({ title, value, subtitle, trend, icon, color }) => (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-opacity-10`} style={{ backgroundColor: `${color}15` }}>
                    <span className="text-2xl">{icon}</span>
                </div>
                {trend && (
                    <div className={`flex items-center px-2 py-1 rounded-full text-xs font-semibold ${trend > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}>
                        <span className="mr-1">{trend > 0 ? '↗️' : '↘️'}</span>
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color }}>{value}</div>
            <div className="text-slate-900 font-semibold text-sm mb-1">{title}</div>
            {subtitle && <div className="text-slate-500 text-xs">{subtitle}</div>}
        </div>
    );

    const QuickActionCard = ({ title, subtitle, icon, gradient, action }) => (
        <button
            onClick={action}
            className={`bg-gradient-to-r ${gradient} text-white rounded-2xl p-6 flex items-center justify-between hover:shadow-lg transition-all duration-200 hover:scale-105`}
        >
            <div className="flex items-center">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl mr-4">
                    <span className="text-2xl">{icon}</span>
                </div>
                <div className="text-left">
                    <div className="font-semibold text-lg">{title}</div>
                    <div className="text-white text-opacity-80 text-sm">{subtitle}</div>
                </div>
            </div>
            <span className="text-white text-xl">→</span>
        </button>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <div className="text-slate-600 font-medium">Loading dashboard...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mr-3">
                            <span className="text-white text-xl">🏥</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
                            <p className="text-slate-600 text-sm font-medium">
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                    <button className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                        <span className="text-blue-500 text-xl">🔄</span>
                    </button>
                </div>
            </div>

            <div className="p-6 max-w-7xl mx-auto">
                {/* Metrics Overview */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-slate-900 mb-4 tracking-tight">Today's Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <MetricCard
                            title="Total Patients"
                            value={stats.totalPatients}
                            subtitle="In your care"
                            icon="👥"
                            color="#10B981"
                            trend={12}
                        />
                        <MetricCard
                            title="Today's Appointments"
                            value={stats.todayAppointments}
                            subtitle="Scheduled today"
                            icon="📅"
                            color="#3B82F6"
                            trend={8}
                        />
                        <MetricCard
                            title="Upcoming"
                            value={stats.upcomingAppointments}
                            subtitle="Future appointments"
                            icon="⏰"
                            color="#8B5CF6"
                            trend={-3}
                        />
                        <MetricCard
                            title="Completed"
                            value={stats.completedToday}
                            subtitle="Finished today"
                            icon="✅"
                            color="#06B6D4"
                            trend={15}
                        />
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-slate-900 mb-4 tracking-tight">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {quickActions.map((action, index) => (
                            <QuickActionCard key={index} {...action} />
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Activity */}
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900 mb-4 tracking-tight">Recent Activity</h2>
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                            {recentActivity.length > 0 ? (
                                recentActivity.map((item, index) => (
                                    <div key={index} className="p-5 border-b border-slate-100 last:border-b-0 flex items-center">
                                        <div className="p-2 rounded-xl mr-4" style={{ backgroundColor: `${item.color}15` }}>
                                            <span className="text-base">{item.icon}</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-slate-900 text-sm">{item.title}</div>
                                            <div className="text-slate-500 text-xs">{item.time}</div>
                                        </div>
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-10 text-center">
                                    <div className="text-4xl mb-4">📊</div>
                                    <div className="font-semibold text-slate-900 mb-2">No recent activity</div>
                                    <div className="text-slate-500 text-sm">
                                        Start by adding patients or scheduling appointments
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* AI Insights */}
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900 mb-4 tracking-tight">AI Insights</h2>
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-purple-50 rounded-xl">
                                    <span className="text-purple-600 text-2xl">🧠</span>
                                </div>
                                <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                                    Beta
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-3">Practice Analytics</h3>
                            <p className="text-slate-600 text-sm leading-relaxed mb-5">
                                Your patient satisfaction rate is 15% above average.
                                Consider scheduling follow-ups for 3 patients this week.
                            </p>
                            <button className="text-blue-500 text-sm font-semibold hover:text-blue-600 transition-colors">
                                View Detailed Report
                            </button>
                        </div>
                    </div>
                </div>

                {/* Video Session Demo */}
                <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Next Appointment</h3>
                            <p className="text-slate-600 text-sm mb-4">Michael Chen - 2:00 PM Today</p>
                            <div className="flex items-center gap-3">
                                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                                    <span>🎥</span>
                                    Start Video Session
                                </button>
                                <button className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                                    <span>📤</span>
                                    Share Patient Link
                                </button>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                                <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                                HIPAA Compliant
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                                End-to-End Encrypted
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthcareDashboard;