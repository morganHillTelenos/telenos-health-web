// pages/DashboardPage.js - Complete version
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { calculateStats, formatDate } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import './DashboardPage.css';

const DashboardPage = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalPatients: 0,
        todayAppointments: 0,
        upcomingAppointments: 0,
        completedToday: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [patients, appointments] = await Promise.all([
                apiService.getPatients(),
                apiService.getAppointments()
            ]);

            const calculatedStats = calculateStats(patients, appointments);
            setStats(calculatedStats);

            // Create recent activity
            const activity = [
                ...calculatedStats.recentPatients.map(p => ({
                    type: 'patient',
                    title: `New patient: ${p.name}`,
                    time: formatDate(p.createdAt),
                    icon: '👤',
                    color: '#10B981'
                })),
                ...calculatedStats.recentAppointments.map(a => ({
                    type: 'appointment',
                    title: `Appointment with ${a.patient}`,
                    time: `${formatDate(a.date)} at ${a.time}`,
                    icon: '📅',
                    color: '#3B82F6'
                }))
            ].slice(0, 5);

            setRecentActivity(activity);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        {
            title: 'New Patient',
            subtitle: 'Add patient record',
            icon: '👤',
            gradient: '#10B981',
            action: () => navigate('/patients/new')
        },
        {
            title: 'Schedule',
            subtitle: 'Book appointment',
            icon: '📅',
            gradient: '#3B82F6',
            action: () => navigate('/appointments/new')
        },
        {
            title: 'Patients',
            subtitle: 'View all patients',
            icon: '📋',
            gradient: '#8B5CF6',
            action: () => navigate('/patients')
        },
        {
            title: 'Calendar',
            subtitle: 'View schedule',
            icon: '🗓️',
            gradient: '#06B6D4',
            action: () => navigate('/calendar')
        }
    ];

    if (loading) {
        return (
            <div className="page-loading">
                <LoadingSpinner size="large" text="Loading dashboard..." />
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="container">
                {/* Header */}
                <div className="dashboard-header">
                    <div>
                        <h1 className="dashboard-title">Welcome back</h1>
                        <p className="dashboard-subtitle">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                    <button
                        className="btn btn-secondary refresh-btn"
                        onClick={loadDashboardData}
                    >
                        ⟲ Refresh
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="stats-section">
                    <h2 className="section-title">Today's Overview</h2>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-header">
                                <div className="stat-icon" style={{ backgroundColor: '#10B98115' }}>
                                    <span>👥</span>
                                </div>
                                <div className="trend-badge positive">
                                    <span>↗ 12%</span>
                                </div>
                            </div>
                            <div className="stat-value" style={{ color: '#10B981' }}>
                                {stats.totalPatients}
                            </div>
                            <div className="stat-label">Total Patients</div>
                            <div className="stat-subtitle">In your care</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-header">
                                <div className="stat-icon" style={{ backgroundColor: '#3B82F615' }}>
                                    <span>📅</span>
                                </div>
                                <div className="trend-badge positive">
                                    <span>↗ 8%</span>
                                </div>
                            </div>
                            <div className="stat-value" style={{ color: '#3B82F6' }}>
                                {stats.todayAppointments}
                            </div>
                            <div className="stat-label">Today's Appointments</div>
                            <div className="stat-subtitle">Scheduled today</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-header">
                                <div className="stat-icon" style={{ backgroundColor: '#8B5CF615' }}>
                                    <span>⏰</span>
                                </div>
                                <div className="trend-badge negative">
                                    <span>↘ 3%</span>
                                </div>
                            </div>
                            <div className="stat-value" style={{ color: '#8B5CF6' }}>
                                {stats.upcomingAppointments}
                            </div>
                            <div className="stat-label">Upcoming</div>
                            <div className="stat-subtitle">Future appointments</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-header">
                                <div className="stat-icon" style={{ backgroundColor: '#06B6D415' }}>
                                    <span>✅</span>
                                </div>
                                <div className="trend-badge positive">
                                    <span>↗ 15%</span>
                                </div>
                            </div>
                            <div className="stat-value" style={{ color: '#06B6D4' }}>
                                {stats.completedToday}
                            </div>
                            <div className="stat-label">Completed</div>
                            <div className="stat-subtitle">Finished today</div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions-section">
                    <h2 className="section-title">Quick Actions</h2>
                    <div className="quick-actions-grid">
                        {quickActions.map((action, index) => (
                            <div
                                key={index}
                                className="action-card"
                                onClick={action.action}
                            >
                                <div
                                    className="action-icon"
                                    style={{ backgroundColor: action.gradient }}
                                >
                                    <span>{action.icon}</span>
                                </div>
                                <div className="action-content">
                                    <h3>{action.title}</h3>
                                    <p>{action.subtitle}</p>
                                </div>
                                <div className="action-arrow">→</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="activity-section">
                    <h2 className="section-title">Recent Activity</h2>
                    <div className="activity-container">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((item, index) => (
                                <div key={index} className="activity-item">
                                    <div
                                        className="activity-icon"
                                        style={{ backgroundColor: `${item.color}15` }}
                                    >
                                        <span>{item.icon}</span>
                                    </div>
                                    <div className="activity-content">
                                        <div className="activity-title">{item.title}</div>
                                        <div className="activity-time">{item.time}</div>
                                    </div>
                                    <div className="activity-dot"></div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-activity">
                                <div className="empty-icon">📊</div>
                                <div className="empty-title">No recent activity</div>
                                <div className="empty-subtitle">
                                    Start by adding patients or scheduling appointments
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Insights */}
                <div className="insights-section">
                    <h2 className="section-title">AI Insights</h2>
                    <div className="insights-card">
                        <div className="insight-header">
                            <div className="insight-icon">
                                <span>🧠</span>
                            </div>
                            <div className="insight-badge">Beta</div>
                        </div>
                        <h3 className="insight-title">Practice Analytics</h3>
                        <p className="insight-description">
                            Your patient satisfaction rate is 15% above average.
                            Consider scheduling follow-ups for 3 patients this week.
                        </p>
                        <button className="btn btn-secondary insight-action">
                            View Detailed Report
                        </button>
                    </div>
                </div>

                {/* Today's Appointments Preview */}
                <div className="todays-appointments-section">
                    <div className="section-header">
                        <h2 className="section-title">Today's Schedule</h2>
                        <button
                            className="btn btn-secondary"
                            onClick={() => navigate('/calendar')}
                        >
                            View Full Calendar
                        </button>
                    </div>

                    {stats.todayAppointments > 0 ? (
                        <div className="appointments-preview">
                            <div className="appointment-preview-card">
                                <div className="appointment-time">10:00 AM</div>
                                <div className="appointment-info">
                                    <h4>John Smith</h4>
                                    <p>Annual checkup</p>
                                </div>
                                <button className="btn btn-primary btn-sm">
                                    Join Video
                                </button>
                            </div>
                            <div className="appointment-preview-card">
                                <div className="appointment-time">2:30 PM</div>
                                <div className="appointment-info">
                                    <h4>Sarah Johnson</h4>
                                    <p>Follow-up consultation</p>
                                </div>
                                <button className="btn btn-primary btn-sm">
                                    Join Video
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="no-appointments-today">
                            <div className="no-appointments-icon">📅</div>
                            <h4>No appointments scheduled for today</h4>
                            <p>Enjoy your free day or schedule new appointments</p>
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate('/appointments/new')}
                            >
                                Schedule Appointment
                            </button>
                        </div>
                    )}
                </div>

                {/* Quick Stats Summary */}
                <div className="summary-section">
                    <div className="summary-card">
                        <h3 className="summary-title">Weekly Summary</h3>
                        <div className="summary-stats">
                            <div className="summary-stat">
                                <span className="summary-number">24</span>
                                <span className="summary-label">Appointments This Week</span>
                            </div>
                            <div className="summary-stat">
                                <span className="summary-number">18</span>
                                <span className="summary-label">Video Consultations</span>
                            </div>
                            <div className="summary-stat">
                                <span className="summary-number">95%</span>
                                <span className="summary-label">Attendance Rate</span>
                            </div>
                        </div>
                        <button className="btn btn-secondary summary-action">
                            View Full Report
                        </button>
                    </div>
                </div>

                {/* System Status */}
                <div className="system-status">
                    <div className="status-item">
                        <div className="status-indicator online"></div>
                        <span>All systems operational</span>
                    </div>
                    <div className="status-item">
                        <div className="status-indicator online"></div>
                        <span>Video calling ready</span>
                    </div>
                    <div className="status-item">
                        <div className="status-indicator online"></div>
                        <span>HIPAA compliance active</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;