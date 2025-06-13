import React from 'react';
const { useState, useEffect } = React;

const EnhancedHealthcareDashboard = () => {
    const [stats, setStats] = useState({
        totalPatients: 0,
        todayAppointments: 0,
        upcomingAppointments: 0,
        completedToday: 0
    });
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
                    priority: 'high'
                },
                {
                    type: 'alert',
                    title: 'Critical lab results ready for review',
                    time: '5 minutes ago',
                    icon: '⚠️',
                    color: '#F59E0B',
                    priority: 'urgent'
                },
                {
                    type: 'completion',
                    title: 'Telehealth session with Emma Davis completed',
                    time: '1 hour ago',
                    icon: '✅',
                    color: '#8B5CF6',
                    priority: 'normal'
                },
                {
                    type: 'schedule',
                    title: 'Tomorrow: 14 appointments scheduled',
                    time: 'Tomorrow',
                    icon: '📅',
                    color: '#06B6D4',
                    priority: 'normal'
                }
            ]);

            setLoading(false);
        };

        loadDashboardData();

        // Update time every minute
        const timeInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(timeInterval);
    }, []);

    const quickActions = [
        {
            title: 'New Patient',
            subtitle: 'Register new patient',
            icon: '👥',
            gradient: 'from-emerald-500 to-emerald-600',
            bgPattern: 'bg-emerald-50',
            action: () => alert('Navigate to New Patient form')
        },
        {
            title: 'Schedule',
            subtitle: 'Book appointment',
            icon: '📅',
            gradient: 'from-blue-500 to-blue-600',
            bgPattern: 'bg-blue-50',
            action: () => alert('Navigate to New Appointment form')
        },
        {
            title: 'Patients',
            subtitle: 'View patient records',
            icon: '📋',
            gradient: 'from-purple-500 to-purple-600',
            bgPattern: 'bg-purple-50',
            action: () => alert('Navigate to Current Patients')
        },
        {
            title: 'Video Call',
            subtitle: 'Start telemedicine',
            icon: '🎥',
            gradient: 'from-cyan-500 to-cyan-600',
            bgPattern: 'bg-cyan-50',
            action: () => alert('Start video consultation')
        }
    ];

    const upcomingAppointments = [
        {
            time: '2:00 PM',
            patient: 'Michael Chen',
            type: 'Video Consultation',
            reason: 'Follow-up visit',
            status: 'confirmed'
        },
        {
            time: '3:30 PM',
            patient: 'Sarah Williams',
            type: 'In-Person',
            reason: 'Annual checkup',
            status: 'confirmed'
        },
        {
            time: '4:15 PM',
            patient: 'Robert Johnson',
            type: 'Video Consultation',
            reason: 'Medication review',
            status: 'pending'
        }
    ];

    const MetricCard = ({ title, value, subtitle, trend, icon, color, percentage }) => (
        <div className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden">
            {/* Background Pattern */}
            <div
                className="absolute inset-0 opacity-5"
                style={{
                    backgroundImage: `radial-gradient(circle at 20% 50%, ${color} 1px, transparent 1px)`,
                    backgroundSize: '20px 20px'
                }}
            ></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl shadow-lg" style={{ backgroundColor: `${color}15` }}>
                        <span className="text-2xl">{icon}</span>
                    </div>
                    {trend && (
                        <div className={`flex items-center px-3 py-1 rounded-full text-xs font-bold ${trend > 0
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                            <span className="mr-1">{trend > 0 ? '↗️' : '↘️'}</span>
                            {Math.abs(trend)}%
                        </div>
                    )}
                </div>

                <div className="mb-4">
                    <div className="text-4xl font-bold mb-2" style={{ color }}>{value}</div>
                    <div className="text-gray-900 font-semibold text-sm mb-1">{title}</div>
                    {subtitle && <div className="text-gray-500 text-xs">{subtitle}</div>}
                </div>

                {/* Progress bar */}
                {percentage && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="h-2 rounded-full transition-all duration-1000 delay-500"
                            style={{
                                backgroundColor: color,
                                width: `${percentage}%`,
                                background: `linear-gradient(90deg, ${color}, ${color}dd)`
                            }}
                        ></div>
                    </div>
                )}
            </div>
        </div>
    );

    const QuickActionCard = ({ title, subtitle, icon, gradient, bgPattern, action }) => (
        <button
            onClick={action}
            className={`group relative overflow-hidden bg-gradient-to-r ${gradient} text-white rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/20`}
        >
            {/* Animated background pattern */}
            <div className="absolute inset-0 bg-white opacity-10 transform rotate-12 scale-150 translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>

            <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center">
                    <div className="p-4 bg-white bg-opacity-20 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-3xl">{icon}</span>
                    </div>
                    <div className="text-left">
                        <div className="font-bold text-xl mb-1">{title}</div>
                        <div className="text-white text-opacity-90 text-sm">{subtitle}</div>
                    </div>
                </div>
                <div className="text-white text-2xl group-hover:translate-x-2 transition-transform duration-300">
                    →
                </div>
            </div>
        </button>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-blue-300 rounded-full animate-spin animation-delay-150"></div>
                    </div>
                    <div className="text-slate-700 font-semibold text-lg">Loading your dashboard...</div>
                    <div className="text-slate-500 text-sm mt-2">Preparing your healthcare insights</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Enhanced Header */}
            <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 px-6 py-6 sticky top-0 z-50 shadow-sm">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                            <span className="text-white text-xl">🏥</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                                Welcome back, <span className="text-blue-600">Dr. Smith</span>
                            </h1>
                            <p className="text-gray-600 text-sm font-medium flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                {currentTime.toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })} • {currentTime.toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200 group">
                            <span className="text-blue-500 text-xl group-hover:rotate-180 transition-transform duration-300">🔄</span>
                        </button>
                        <button className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors duration-200 shadow-lg hover:shadow-blue-500/25">
                            <span className="text-xl">🔔</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6 max-w-7xl mx-auto">
                {/* Enhanced Metrics Overview */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Today's Overview</h2>
                            <p className="text-gray-600">Real-time insights into your practice</p>
                        </div>
                        <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            All systems operational
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <MetricCard
                            title="Total Patients"
                            value={stats.totalPatients}
                            subtitle="Active in your care"
                            icon="👥"
                            color="#10B981"
                            trend={12}
                            percentage={85}
                        />
                        <MetricCard
                            title="Today's Appointments"
                            value={stats.todayAppointments}
                            subtitle="Scheduled for today"
                            icon="📅"
                            color="#3B82F6"
                            trend={8}
                            percentage={67}
                        />
                        <MetricCard
                            title="Upcoming"
                            value={stats.upcomingAppointments}
                            subtitle="Future appointments"
                            icon="⏰"
                            color="#8B5CF6"
                            trend={-3}
                            percentage={92}
                        />
                        <MetricCard
                            title="Completed Today"
                            value={stats.completedToday}
                            subtitle="Sessions finished"
                            icon="✅"
                            color="#06B6D4"
                            trend={15}
                            percentage={75}
                        />
                    </div>
                </div>

                {/* Enhanced Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {quickActions.map((action, index) => (
                            <QuickActionCard key={index} {...action} />
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Enhanced Recent Activity */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Recent Activity</h2>
                        <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 overflow-hidden shadow-lg">
                            {recentActivity.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {recentActivity.map((item, index) => (
                                        <div key={index} className="p-6 hover:bg-gray-50/50 transition-colors duration-200 group">
                                            <div className="flex items-start">
                                                <div
                                                    className="p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-200"
                                                    style={{ backgroundColor: `${item.color}15` }}
                                                >
                                                    <span className="text-lg">{item.icon}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-gray-900 text-sm mb-1">
                                                                {item.title}
                                                            </p>
                                                            <p className="text-gray-500 text-xs">{item.time}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {item.priority === 'urgent' && (
                                                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">
                                                                    URGENT
                                                                </span>
                                                            )}
                                                            {item.priority === 'high' && (
                                                                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-bold">
                                                                    HIGH
                                                                </span>
                                                            )}
                                                            <div
                                                                className="w-3 h-3 rounded-full"
                                                                style={{ backgroundColor: item.color }}
                                                            ></div>
                                                        </div>
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

                    {/* Enhanced Sidebar Content */}
                    <div className="space-y-8">
                        {/* Next Appointment */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Next Appointment</h3>
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h4 className="text-lg font-semibold">Michael Chen</h4>
                                        <p className="text-blue-100 text-sm">Video Consultation</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold">2:00 PM</div>
                                        <div className="text-blue-100 text-sm">In 15 minutes</div>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105">
                                        <span>🎥</span>
                                        Start Video
                                    </button>
                                    <button className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105">
                                        <span>👤</span>
                                        Patient Info
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-blue-100 mt-4">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    HIPAA Compliant • End-to-End Encrypted
                                </div>
                            </div>
                        </div>

                        {/* AI Insights */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">AI Insights</h3>
                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-white/20 rounded-xl">
                                        <span className="text-2xl">🧠</span>
                                    </div>
                                    <div className="bg-yellow-400 text-purple-900 px-3 py-1 rounded-full text-xs font-bold">
                                        NEW INSIGHTS
                                    </div>
                                </div>
                                <h4 className="text-lg font-semibold mb-3">Practice Analytics</h4>
                                <p className="text-purple-100 text-sm leading-relaxed mb-4">
                                    Your patient satisfaction rate is 18% above average this month.
                                    Consider scheduling follow-ups for 3 patients showing improvement trends.
                                </p>
                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-purple-200">AI Confidence</span>
                                        <span className="font-bold">94.2%</span>
                                    </div>
                                    <div className="w-full bg-purple-400/30 rounded-full h-2">
                                        <div className="bg-white h-2 rounded-full w-[94%] transition-all duration-1000"></div>
                                    </div>
                                </div>
                                <button className="text-sm font-semibold text-white hover:text-purple-200 transition-colors underline">
                                    View Detailed Report →
                                </button>
                            </div>
                        </div>

                        {/* Upcoming Appointments Preview */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Today's Schedule</h3>
                            <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-4 space-y-3 shadow-lg">
                                {upcomingAppointments.map((apt, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <span className="text-blue-600 font-bold text-sm">{apt.time}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 text-sm truncate">{apt.patient}</p>
                                            <p className="text-gray-500 text-xs">{apt.reason}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {apt.type === 'Video Consultation' && (
                                                <span className="text-blue-500">🎥</span>
                                            )}
                                            <div className={`w-2 h-2 rounded-full ${apt.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'
                                                }`}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnhancedHealthcareDashboard;