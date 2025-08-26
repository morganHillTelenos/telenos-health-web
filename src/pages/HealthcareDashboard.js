// src/pages/HealthcareDashboard.js - Simple version with Role Testing
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const HealthcareDashboard = ({ user }) => {
    const [currentTime, setCurrentTime] = useState('');
    const [currentRole, setCurrentRole] = useState('provider');
    const [stats, setStats] = useState({
        todayPatients: 8,
        upcomingAppointments: 3,
        activeNotes: 12,
        pendingReviews: 2
    });

    useEffect(() => {
        updateTime();
        const timeInterval = setInterval(updateTime, 1000);
        return () => clearInterval(timeInterval);
    }, []);

    const updateTime = () => {
        const now = new Date();
        setCurrentTime(now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }));
    };

    const testRoleChange = async (newRole) => {
        console.log(`🔄 Switching to ${newRole} role...`);
        setCurrentRole(newRole);

        // Update stats based on role
        if (newRole === 'admin') {
            setStats({
                totalUsers: 156,
                activeProviders: 12,
                systemHealth: 98,
                pendingReviews: 5
            });
        } else if (newRole === 'patient') {
            setStats({
                myAppointments: 2,
                messageCount: 1,
                healthAlerts: 0,
                documentCount: 8
            });
        } else {
            setStats({
                todayPatients: 8,
                upcomingAppointments: 3,
                activeNotes: 12,
                pendingReviews: 2
            });
        }

        alert(`✅ Switched to ${newRole} role! Stats updated. Role-based features will be added in the next steps.`);
    };

    const getRoleBadge = () => {
        const badges = {
            admin: { icon: '👑', label: 'Admin', color: '#8B5CF6' },
            provider: { icon: '👨‍⚕️', label: 'Provider', color: '#3B82F6' },
            patient: { icon: '👤', label: 'Patient', color: '#10B981' }
        };

        const badge = badges[currentRole] || badges.provider;
        return (
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: '500',
                backgroundColor: badge.color + '20',
                color: badge.color,
                border: `1px solid ${badge.color}40`
            }}>
                {badge.icon} {badge.label}
            </span>
        );
    };

    const getStatsForRole = () => {
        switch (currentRole) {
            case 'admin':
                return [
                    { label: 'Total Users', value: stats.totalUsers || 156, icon: '👥' },
                    { label: 'Active Providers', value: stats.activeProviders || 12, icon: '👨‍⚕️' },
                    { label: 'System Health', value: `${stats.systemHealth || 98}%`, icon: '💚' },
                    { label: 'Pending Reviews', value: stats.pendingReviews || 5, icon: '📋' }
                ];
            case 'patient':
                return [
                    { label: 'My Appointments', value: stats.myAppointments || 2, icon: '📅' },
                    { label: 'New Messages', value: stats.messageCount || 1, icon: '💬' },
                    { label: 'Health Alerts', value: stats.healthAlerts || 0, icon: '⚠️' },
                    { label: 'Documents', value: stats.documentCount || 8, icon: '📄' }
                ];
            default: // provider
                return [
                    { label: "Today's Patients", value: stats.todayPatients, icon: '👤' },
                    { label: 'Upcoming Appointments', value: stats.upcomingAppointments, icon: '📅' },
                    { label: 'Active Notes', value: stats.activeNotes, icon: '📝' },
                    { label: 'Pending Reviews', value: stats.pendingReviews, icon: '📋' }
                ];
        }
    };

    const containerStyle = {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #fef3f2 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
    };

    const headerStyle = {
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '1rem 0'
    };

    const cardStyle = {
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
    };

    return (
        <div style={containerStyle}>
            {/* Header */}
            <div style={headerStyle}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                                📊 Dashboard
                            </h1>
                            <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                                Welcome back, {user?.email || user?.name || 'User'}
                            </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {getRoleBadge()}
                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{currentTime}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>

                {/* Role Testing Panel */}
                <div style={{
                    ...cardStyle,
                    backgroundColor: '#EBF8FF',
                    border: '1px solid #BEE3F8',
                    marginBottom: '2rem'
                }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1A365D', marginBottom: '1rem' }}>
                        🧪 Role Testing Panel
                    </h3>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        marginBottom: '1rem'
                    }}>
                        <button
                            onClick={() => testRoleChange('admin')}
                            style={{
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                border: currentRole === 'admin' ? '2px solid #8B5CF6' : '1px solid #E2E8F0',
                                backgroundColor: currentRole === 'admin' ? '#F3E8FF' : '#FFFFFF',
                                color: currentRole === 'admin' ? '#6B46C1' : '#4A5568',
                                cursor: 'pointer',
                                textAlign: 'center',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👑</div>
                            <div style={{ fontWeight: '600' }}>Administrator</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Full system access</div>
                            {currentRole === 'admin' && <div style={{ fontSize: '0.75rem', fontWeight: '600', marginTop: '0.25rem' }}>✓ Active</div>}
                        </button>

                        <button
                            onClick={() => testRoleChange('provider')}
                            style={{
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                border: currentRole === 'provider' ? '2px solid #3B82F6' : '1px solid #E2E8F0',
                                backgroundColor: currentRole === 'provider' ? '#EBF8FF' : '#FFFFFF',
                                color: currentRole === 'provider' ? '#1E40AF' : '#4A5568',
                                cursor: 'pointer',
                                textAlign: 'center',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👨‍⚕️</div>
                            <div style={{ fontWeight: '600' }}>Provider</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Patient management</div>
                            {currentRole === 'provider' && <div style={{ fontSize: '0.75rem', fontWeight: '600', marginTop: '0.25rem' }}>✓ Active</div>}
                        </button>

                        <button
                            onClick={() => testRoleChange('patient')}
                            style={{
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                border: currentRole === 'patient' ? '2px solid #10B981' : '1px solid #E2E8F0',
                                backgroundColor: currentRole === 'patient' ? '#ECFDF5' : '#FFFFFF',
                                color: currentRole === 'patient' ? '#047857' : '#4A5568',
                                cursor: 'pointer',
                                textAlign: 'center',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👤</div>
                            <div style={{ fontWeight: '600' }}>Patient</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Personal portal</div>
                            {currentRole === 'patient' && <div style={{ fontSize: '0.75rem', fontWeight: '600', marginTop: '0.25rem' }}>✓ Active</div>}
                        </button>
                    </div>

                    <div style={{
                        fontSize: '0.75rem',
                        color: '#1E40AF',
                        backgroundColor: '#FFFFFF',
                        padding: '0.75rem',
                        borderRadius: '0.25rem',
                        border: '1px solid #BEE3F8'
                    }}>
                        <strong>Current Role:</strong> {currentRole} • <strong>Testing:</strong> Click buttons above to test different user roles and permissions.
                    </div>
                </div>

                {/* Stats Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    {getStatsForRole().map((stat, index) => (
                        <div key={index} style={cardStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div>
                                    <p style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', margin: 0 }}>
                                        {stat.label}
                                    </p>
                                    <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', margin: '0.25rem 0 0 0' }}>
                                        {stat.value}
                                    </p>
                                </div>
                                <div style={{ fontSize: '2rem' }}>{stat.icon}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions - Role-Based */}
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '1.5rem' }}>
                        Quick Actions
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem'
                    }}>
                        {/* Admin Actions */}
                        {currentRole === 'admin' && (
                            <>
                                <div style={{ ...cardStyle, textAlign: 'center', color: '#4A5568', backgroundColor: '#F3E8FF', border: '1px solid #DDD6FE' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
                                    <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>User Management</div>
                                    <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>Manage all system users</div>
                                </div>

                                <Link to="/doctors" style={{ textDecoration: 'none' }}>
                                    <div style={{ ...cardStyle, cursor: 'pointer', textAlign: 'center', color: '#4A5568', backgroundColor: '#F3E8FF', border: '1px solid #DDD6FE' }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👨‍⚕️</div>
                                        <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Manage Doctors</div>
                                        <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>Add and manage healthcare providers</div>
                                    </div>
                                </Link>

                                <div style={{ ...cardStyle, textAlign: 'center', color: '#4A5568', backgroundColor: '#F3E8FF', border: '1px solid #DDD6FE' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                                    <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Reports & Analytics</div>
                                    <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>View system reports</div>
                                </div>

                                <div style={{ ...cardStyle, textAlign: 'center', color: '#4A5568', backgroundColor: '#F3E8FF', border: '1px solid #DDD6FE' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔒</div>
                                    <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Security & Compliance</div>
                                    <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>Manage security settings</div>
                                </div>
                            </>
                        )}

                        {/* Provider Actions */}
                        {currentRole === 'provider' && (
                            <>
                                <Link to="/patients" style={{ textDecoration: 'none' }}>
                                    <div style={{ ...cardStyle, cursor: 'pointer', textAlign: 'center', color: '#4A5568', backgroundColor: '#EBF8FF', border: '1px solid #BFDBFE' }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👤</div>
                                        <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Patients</div>
                                        <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>Manage patient records</div>
                                    </div>
                                </Link>

                                <Link to="/notes" style={{ textDecoration: 'none' }}>
                                    <div style={{ ...cardStyle, cursor: 'pointer', textAlign: 'center', color: '#4A5568', backgroundColor: '#EBF8FF', border: '1px solid #BFDBFE' }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
                                        <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Clinical Notes</div>
                                        <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>Document patient care</div>
                                    </div>
                                </Link>

                                <div style={{ ...cardStyle, textAlign: 'center', color: '#4A5568', backgroundColor: '#EBF8FF', border: '1px solid #BFDBFE' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</div>
                                    <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Schedule</div>
                                    <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>View appointments and calendar</div>
                                </div>

                                <Link to="/test" style={{ textDecoration: 'none' }}>
                                    <div style={{ ...cardStyle, cursor: 'pointer', textAlign: 'center', color: '#4A5568', backgroundColor: '#EBF8FF', border: '1px solid #BFDBFE' }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🧪</div>
                                        <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>API Test</div>
                                        <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>Test API functionality</div>
                                    </div>
                                </Link>
                            </>
                        )}

                        {/* Patient Actions */}
                        {currentRole === 'patient' && (
                            <>
                                <div style={{ ...cardStyle, textAlign: 'center', color: '#4A5568', backgroundColor: '#ECFDF5', border: '1px solid #BBF7D0' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
                                    <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>My Records</div>
                                    <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>View personal health records</div>
                                </div>

                                <div style={{ ...cardStyle, textAlign: 'center', color: '#4A5568', backgroundColor: '#ECFDF5', border: '1px solid #BBF7D0' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</div>
                                    <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Appointments</div>
                                    <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>Schedule and manage appointments</div>
                                </div>

                                <div style={{ ...cardStyle, textAlign: 'center', color: '#4A5568', backgroundColor: '#ECFDF5', border: '1px solid #BBF7D0' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💬</div>
                                    <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Messages</div>
                                    <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>Communicate with providers</div>
                                </div>

                                <div style={{ ...cardStyle, textAlign: 'center', color: '#4A5568', backgroundColor: '#ECFDF5', border: '1px solid #BBF7D0' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>❤️</div>
                                    <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Health Tracker</div>
                                    <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>Track symptoms and vitals</div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Access Denied Message for Missing Actions */}
                    <div style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        backgroundColor: '#FEF3C7',
                        border: '1px solid #FCD34D',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        color: '#92400E'
                    }}>
                        <strong>Role-Based Access:</strong> You can only see actions available to your current role ({currentRole}).
                        {currentRole === 'patient' && ' As a patient, you cannot access clinical management tools or administrative functions.'}
                        {currentRole === 'provider' && ' As a provider, you can manage patients and clinical data but cannot manage doctors or access system administration.'}
                        {currentRole === 'admin' && ' As an administrator, you have access to system management tools including user and doctor management.'}
                    </div>
                </div>

                {/* Role-specific content */}
                <div style={cardStyle}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '1.5rem' }}>
                        {currentRole === 'admin' ? 'System Overview' :
                            currentRole === 'patient' ? 'My Health Summary' : 'Recent Activity'}
                    </h2>

                    {currentRole === 'admin' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#F0FDF4', borderRadius: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '0.5rem', height: '0.5rem', backgroundColor: '#22C55E', borderRadius: '50%' }}></div>
                                    <span style={{ fontSize: '0.875rem', color: '#1f2937' }}>System Status: Operational</span>
                                </div>
                                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Last checked: 2 minutes ago</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#EBF8FF', borderRadius: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '0.5rem', height: '0.5rem', backgroundColor: '#3B82F6', borderRadius: '50%' }}></div>
                                    <span style={{ fontSize: '0.875rem', color: '#1f2937' }}>Database backup completed</span>
                                </div>
                                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>4 hours ago</span>
                            </div>
                        </div>
                    ) : currentRole === 'patient' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#EBF8FF', borderRadius: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '0.5rem', height: '0.5rem', backgroundColor: '#3B82F6', borderRadius: '50%' }}></div>
                                    <span style={{ fontSize: '0.875rem', color: '#1f2937' }}>Next appointment: Dr. Smith on March 15</span>
                                </div>
                                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>in 3 days</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#F0FDF4', borderRadius: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '0.5rem', height: '0.5rem', backgroundColor: '#22C55E', borderRadius: '50%' }}></div>
                                    <span style={{ fontSize: '0.875rem', color: '#1f2937' }}>Lab results available</span>
                                </div>
                                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>2 days ago</span>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#EBF8FF', borderRadius: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '0.5rem', height: '0.5rem', backgroundColor: '#3B82F6', borderRadius: '50%' }}></div>
                                    <span style={{ fontSize: '0.875rem', color: '#1f2937' }}>Patient consultation completed - Sarah Johnson</span>
                                </div>
                                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>2 hours ago</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#F0FDF4', borderRadius: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '0.5rem', height: '0.5rem', backgroundColor: '#22C55E', borderRadius: '50%' }}></div>
                                    <span style={{ fontSize: '0.875rem', color: '#1f2937' }}>New patient registered - Mike Davis</span>
                                </div>
                                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>4 hours ago</span>
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                            {currentRole === 'admin' ? 'Manage your healthcare system with full administrative access.' :
                                currentRole === 'patient' ? 'Access your personal health information and communicate with providers.' :
                                    'Full dashboard functionality available. Test API functions and manage records.'}
                        </p>
                        <Link
                            to="/test"
                            style={{
                                color: '#3B82F6',
                                textDecoration: 'none',
                                fontWeight: '500'
                            }}
                        >
                            Go to API Test →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthcareDashboard;