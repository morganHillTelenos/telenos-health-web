// Updated LandingPage.js with development dashboard link
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = ({ onEnterDashboard }) => {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleLogin = () => {
        navigate('/login');
    };

    // Development function to go directly to dashboard
    const handleDevDashboard = () => {
        // Set a temporary auth token for development
        localStorage.setItem('auth_token', 'dev-token-' + Date.now());
        localStorage.setItem('user_data', JSON.stringify({
            id: 'dev-user',
            name: 'Dev User',
            email: 'dev@telenos.com',
            role: 'doctor'
        }));

        navigate('/dashboard');
    };

    const scrollToDemo = () => {
        const demoSection = document.getElementById('demo-section');
        if (demoSection) {
            demoSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="landing-page">
            {/* Development Helper Bar - Only show in development */}
            {process.env.NODE_ENV === 'development' && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    background: '#FEF3C7',
                    border: '1px solid #F59E0B',
                    padding: '8px 16px',
                    zIndex: 9999,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '14px',
                    fontWeight: '500'
                }}>
                    <span>🚧 Development Mode:</span>
                    <button
                        onClick={handleDevDashboard}
                        style={{
                            background: '#3B82F6',
                            color: 'white',
                            border: 'none',
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Skip to Dashboard
                    </button>
                    <button
                        onClick={handleLogin}
                        style={{
                            background: '#6B7280',
                            color: 'white',
                            border: 'none',
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Go to Login
                    </button>
                </div>
            )}

            {/* Adjust main content margin if dev bar is showing */}
            <div style={{ marginTop: process.env.NODE_ENV === 'development' ? '50px' : '0' }}>
                {/* Hero Section */}
                <section className="hero-section">
                    <div className="container">
                        <div className="hero-content">
                            <div className="hero-badge">
                                🔒 HIPAA Compliant • ⚡ Powered by AWS • 🏆 Industry Leading
                            </div>
                            <h1 className="hero-title">
                                Modern Healthcare
                                <span className="gradient-text"> Made Simple</span>
                            </h1>
                            <p className="hero-subtitle">
                                Streamline your practice with our comprehensive healthcare management platform.
                                Secure patient records, seamless scheduling, and integrated video consultations.
                            </p>
                            <div className="hero-buttons">
                                <button onClick={scrollToDemo} className="primary-button">
                                    <span className="button-icon">🚀</span>
                                    Try Interactive Demo
                                </button>
                                <button onClick={handleLogin} className="secondary-button">
                                    <span className="button-icon">👩‍⚕️</span>
                                    Healthcare Provider Login
                                </button>
                            </div>
                            <div className="hero-stats">
                                <div className="stat">
                                    <span className="stat-number">10,000+</span>
                                    <span className="stat-label">Healthcare Providers</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-number">500,000+</span>
                                    <span className="stat-label">Patients Served</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-number">99.9%</span>
                                    <span className="stat-label">Uptime</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="features-section">
                    <div className="container">
                        <div className="section-header">
                            <h2 className="section-title">Comprehensive Healthcare Solutions</h2>
                            <p className="section-subtitle">
                                Everything you need to provide exceptional patient care in one integrated platform
                            </p>
                        </div>

                        <div className="features-grid">
                            <div className="feature-card">
                                <span className="feature-icon">👥</span>
                                <h3 className="feature-title">Patient Management</h3>
                                <p className="feature-description">
                                    Comprehensive patient records with secure storage, easy search, and complete medical history tracking.
                                </p>
                                <div className="feature-benefits">
                                    <span className="benefit">✓ HIPAA-compliant storage</span>
                                    <span className="benefit">✓ Advanced search & filtering</span>
                                    <span className="benefit">✓ Complete medical histories</span>
                                    <span className="benefit">✓ Secure document sharing</span>
                                </div>
                            </div>

                            <div className="feature-card">
                                <span className="feature-icon">📅</span>
                                <h3 className="feature-title">Smart Scheduling</h3>
                                <p className="feature-description">
                                    Intelligent appointment scheduling with automated reminders, conflict detection, and seamless calendar integration.
                                </p>
                                <div className="feature-benefits">
                                    <span className="benefit">✓ Automated reminders</span>
                                    <span className="benefit">✓ Conflict prevention</span>
                                    <span className="benefit">✓ Multiple calendar views</span>
                                    <span className="benefit">✓ Resource optimization</span>
                                </div>
                            </div>

                            <div className="feature-card">
                                <span className="feature-icon">🎥</span>
                                <h3 className="feature-title">Secure Video Consultations</h3>
                                <p className="feature-description">
                                    High-quality, encrypted video calls with screen sharing, recording capabilities, and seamless integration.
                                </p>
                                <div className="feature-benefits">
                                    <span className="benefit">✓ End-to-end encryption</span>
                                    <span className="benefit">✓ HD video quality</span>
                                    <span className="benefit">✓ Screen sharing</span>
                                    <span className="benefit">✓ Session recording</span>
                                </div>
                            </div>

                            <div className="feature-card">
                                <span className="feature-icon">📊</span>
                                <h3 className="feature-title">Analytics & Insights</h3>
                                <p className="feature-description">
                                    Powerful analytics dashboard with real-time insights, performance metrics, and comprehensive reporting.
                                </p>
                                <div className="feature-benefits">
                                    <span className="benefit">✓ Real-time analytics</span>
                                    <span className="benefit">✓ Custom reports</span>
                                    <span className="benefit">✓ Performance metrics</span>
                                    <span className="benefit">✓ Trend analysis</span>
                                </div>
                            </div>

                            <div className="feature-card">
                                <span className="feature-icon">🔒</span>
                                <h3 className="feature-title">Enterprise Security</h3>
                                <p className="feature-description">
                                    Bank-grade security with multi-factor authentication, role-based access, and comprehensive audit trails.
                                </p>
                                <div className="feature-benefits">
                                    <span className="benefit">✓ Multi-factor authentication</span>
                                    <span className="benefit">✓ Role-based permissions</span>
                                    <span className="benefit">✓ Audit logging</span>
                                    <span className="benefit">✓ SOC 2 compliant</span>
                                </div>
                            </div>

                            <div className="feature-card">
                                <span className="feature-icon">🔗</span>
                                <h3 className="feature-title">System Integration</h3>
                                <p className="feature-description">
                                    Seamless integration with existing EMR systems, billing platforms, and third-party healthcare tools.
                                </p>
                                <div className="feature-benefits">
                                    <span className="benefit">✓ EMR integration</span>
                                    <span className="benefit">✓ Billing system sync</span>
                                    <span className="benefit">✓ Third-party APIs</span>
                                    <span className="benefit">✓ Data migration tools</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Demo Section */}
                <section className="demo-section" id="demo-section">
                    <div className="container">
                        <div className="demo-content">
                            <div>
                                <h2 className="demo-title">
                                    Experience the Platform
                                    <span className="gradient-text"> Live Demo</span>
                                </h2>
                                <p className="demo-description">
                                    Take a comprehensive tour of our healthcare platform. Explore patient management,
                                    schedule appointments, and experience our video consultation features firsthand.
                                </p>

                                <div className="demo-credentials">
                                    <h3>Demo Account:</h3>
                                    <div className="credential-item">
                                        <strong>Email:</strong> demo@telenos.com
                                    </div>
                                    <div className="credential-item">
                                        <strong>Password:</strong> demo123
                                    </div>
                                    <div className="credential-item">
                                        <strong>Role:</strong> Doctor
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    <button
                                        onClick={handleLogin}
                                        className="demo-button"
                                    >
                                        <span className="button-icon">🚀</span>
                                        Try Demo Now
                                    </button>

                                    {/* Development shortcut button */}
                                    {process.env.NODE_ENV === 'development' && (
                                        <button
                                            onClick={handleDevDashboard}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '1rem 2rem',
                                                background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '12px',
                                                fontWeight: '600',
                                                fontSize: '1.1rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)'
                                            }}
                                            onMouseOver={(e) => {
                                                e.target.style.transform = 'translateY(-2px)';
                                                e.target.style.boxShadow = '0 8px 30px rgba(139, 92, 246, 0.4)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.target.style.transform = 'translateY(0)';
                                                e.target.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.3)';
                                            }}
                                        >
                                            <span>⚡</span>
                                            Quick Access (Dev)
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="demo-visual">
                                <div className="demo-dashboard">
                                    <div className="dashboard-header">
                                        <div className="dashboard-title">TelenosHealth Dashboard</div>
                                        <div className="dashboard-time">
                                            {currentTime.toLocaleTimeString()}
                                        </div>
                                    </div>
                                    <div className="dashboard-stats">
                                        <div className="stat-card">
                                            <div className="stat-value">24</div>
                                            <div className="stat-label">Patients Today</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-value">8</div>
                                            <div className="stat-label">Appointments</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-value">12</div>
                                            <div className="stat-label">Active Sessions</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="footer-section">
                    <div className="container">
                        <div className="footer-content">
                            <div className="footer-logo">
                                <span>👩‍⚕️</span>
                                <span className="logo-text">TelenosHealth</span>
                            </div>

                            <div className="footer-links">
                                <a href="#" className="footer-link">Privacy Policy</a>
                                <a href="#" className="footer-link">Terms of Service</a>
                                <a href="#" className="footer-link">HIPAA Compliance</a>
                                <a href="#" className="footer-link">Support</a>
                                <a href="#" className="footer-link">Documentation</a>
                            </div>

                            <div className="footer-info">
                                <p>© 2024 TelenosHealth. All rights reserved.</p>
                                <p>Secure • Compliant • Reliable</p>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default LandingPage;