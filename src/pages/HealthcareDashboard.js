import React, { useState, useEffect } from 'react';
import { X, Search, User, Phone, Mail, Calendar } from 'lucide-react';

// Patients Modal Component
const PatientsListModal = ({ isOpen, onClose }) => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPatients, setFilteredPatients] = useState([]);

    useEffect(() => {
        if (isOpen) {
            loadPatients();
        }
    }, [isOpen]);

    useEffect(() => {
        if (searchTerm) {
            const filtered = patients.filter(patient =>
                patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.phone.includes(searchTerm)
            );
            setFilteredPatients(filtered);
        } else {
            setFilteredPatients(patients);
        }
    }, [searchTerm, patients]);

    const loadPatients = async () => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));

        const mockPatients = [
            {
                id: '1',
                name: 'John Smith',
                email: 'john.smith@email.com',
                phone: '(555) 123-4567',
                dob: '1985-06-15',
                insurance: 'Blue Cross Blue Shield',
                lastVisit: '2024-12-10',
                status: 'Active'
            },
            {
                id: '2',
                name: 'Sarah Johnson',
                email: 'sarah.johnson@email.com',
                phone: '(555) 234-5678',
                dob: '1990-03-22',
                insurance: 'Aetna',
                lastVisit: '2024-12-08',
                status: 'Active'
            },
            {
                id: '3',
                name: 'Michael Brown',
                email: 'michael.brown@email.com',
                phone: '(555) 345-6789',
                dob: '1978-11-08',
                insurance: 'UnitedHealth',
                lastVisit: '2024-12-05',
                status: 'Active'
            },
            {
                id: '4',
                name: 'Emily Davis',
                email: 'emily.davis@email.com',
                phone: '(555) 456-7890',
                dob: '1992-09-14',
                insurance: 'Cigna',
                lastVisit: '2024-12-12',
                status: 'Active'
            },
            {
                id: '5',
                name: 'Robert Wilson',
                email: 'robert.wilson@email.com',
                phone: '(555) 567-8901',
                dob: '1975-01-30',
                insurance: 'Medicare',
                lastVisit: '2024-12-11',
                status: 'Active'
            }
        ];

        setPatients(mockPatients);
        setLoading(false);
    };

    const calculateAge = (dob) => {
        const birth = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xl">👥</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Current Patients</h2>
                            <p className="text-green-100 text-sm">
                                {loading ? 'Loading...' : `${filteredPatients.length} patients found`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                <div className="p-6 border-b border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search patients by name, email, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                        </div>
                    ) : filteredPatients.length === 0 ? (
                        <div className="text-center py-12">
                            <span className="text-6xl mb-4 block opacity-30">👥</span>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
                            <p className="text-gray-500">
                                {searchTerm ? 'Try adjusting your search terms' : 'No patients in the system yet'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {filteredPatients.map((patient) => (
                                <div
                                    key={patient.id}
                                    className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                                <span className="text-green-600 text-xl">👤</span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 text-lg">{patient.name}</h3>
                                                <p className="text-gray-500 text-sm">Age {calculateAge(patient.dob)}</p>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            {patient.status}
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-600 text-sm">{patient.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-600 text-sm">{patient.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-600 text-sm">Last visit: {formatDate(patient.lastVisit)}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Insurance</p>
                                                <p className="text-sm font-medium text-gray-900">{patient.insurance}</p>
                                            </div>
                                            <button className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg text-sm font-medium transition-colors">
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Showing {filteredPatients.length} of {patients.length} patients
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                Add New Patient
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main Dashboard Component
const HealthcareDashboard = ({ onNavigateToCalendar }) => {
    const [stats, setStats] = useState({
        totalPatients: 0,
        todayAppointments: 0,
        upcomingAppointments: 0,
        completedToday: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showPatientsModal, setShowPatientsModal] = useState(false);

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
                },
                {
                    type: 'message',
                    title: 'New message from Dr. Martinez',
                    time: '1 hour ago',
                    icon: '💬',
                    color: '#8B5CF6',
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
            action: () => alert('Navigate to New Appointment form')
        },
        {
            title: 'Patients',
            subtitle: 'View patient records',
            icon: '📋',
            gradient: 'from-purple-500 to-purple-600',
            bgPattern: 'bg-purple-50',
            action: () => setShowPatientsModal(true)
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

    const MetricCard = ({ title, value, subtitle, trend, icon, color, percentage, onClick, clickable }) => (
        <div
            className={`group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden ${clickable ? 'cursor-pointer hover:border-blue-300' : ''
                }`}
            onClick={clickable ? onClick : undefined}
        >
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

                {/* Clickable indicator */}
                {clickable && (
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="bg-blue-500 text-white p-1 rounded-full text-xs">
                            →
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const QuickActionCard = ({ title, subtitle, icon, gradient, bgPattern, action }) => (
        <div
            className={`group ${bgPattern} rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer relative overflow-hidden`}
            onClick={action}
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="text-4xl">{icon}</div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className={`w-8 h-8 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center text-white text-sm`}>
                            →
                        </div>
                    </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 text-sm">{subtitle}</p>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <div className="text-lg font-semibold text-gray-900">Loading Dashboard...</div>
                    <div className="text-sm text-gray-500">Preparing your healthcare insights</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="container mx-auto px-6 py-8 pt-20">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 18 ? 'Afternoon' : 'Evening'}! 👋
                            </h1>
                            <p className="text-gray-600 text-lg">Here's what's happening with your practice today</p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">
                                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="text-gray-500">
                                {currentTime.toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
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
                            onClick={() => setShowPatientsModal(true)}
                            clickable={true}
                        />
                        <MetricCard
                            title="Today's Appointments"
                            value={stats.todayAppointments}
                            subtitle="Scheduled for today"
                            icon="📅"
                            color="#3B82F6"
                            trend={8}
                            percentage={67}
                            onClick={onNavigateToCalendar}
                            clickable={true}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                        <div key={index} className="p-6 hover:bg-gray-50/50 transition-colors duration-200">
                                            <div className="flex items-start gap-4">
                                                <div
                                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-lg"
                                                    style={{ backgroundColor: `${item.color}15` }}
                                                >
                                                    {item.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="font-semibold text-gray-900 text-sm leading-tight">{item.title}</h4>
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
                                                    <p className="text-gray-500 text-xs">{item.time}</p>
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

                    {/* Enhanced Upcoming Appointments */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Upcoming Today</h2>
                        <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 shadow-lg">
                            {upcomingAppointments.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {upcomingAppointments.map((appointment, index) => (
                                        <div key={index} className="p-6 hover:bg-gray-50/50 transition-colors duration-200">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="font-bold text-lg text-blue-600">{appointment.time}</div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${appointment.status === 'confirmed'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {appointment.status.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="mb-2">
                                                <div className="font-semibold text-gray-900">{appointment.patient}</div>
                                                <div className="text-sm text-gray-600">{appointment.reason}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${appointment.type === 'Video Consultation' ? 'bg-blue-500' : 'bg-green-500'
                                                    }`}></span>
                                                <span className="text-xs text-gray-500">{appointment.type}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="text-6xl mb-4 opacity-30">📅</div>
                                    <div className="font-semibold text-gray-900 mb-2">No appointments today</div>
                                    <div className="text-gray-500 text-sm">Enjoy your free day!</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Patients Modal */}
            <PatientsListModal
                isOpen={showPatientsModal}
                onClose={() => setShowPatientsModal(false)}
            />
        </div>
    );
};

export default HealthcareDashboard;