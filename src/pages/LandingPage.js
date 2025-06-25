// src/pages/LandingPage.js - Complete and Fixed
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every second
    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleLogin = () => {
        navigate('/login');
    };

    const handleLearnMore = () => {
        // Scroll to features section
        document.getElementById('features')?.scrollIntoView({
            behavior: 'smooth'
        });
    };

    return (
        <div className="landing-page">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-background">
                    <div className="hero-overlay"></div>
                </div>

                <div className="hero-content">
                    <div className="hero-logo">
                        <div className="logo-container">
                            <span className="logo-icon">🏥</span>
                            <div className="status-indicator"></div>
                        </div>
                    </div>

                    <h1 className="hero-title">
                        Welcome to{' '}
                        <span className="brand-gradient">TelenosHealth</span>
                    </h1>

                    <p className="hero-subtitle">
                        Modern healthcare management platform designed for healthcare providers.
                        Manage patients, schedule appointments, and conduct secure video consultations.
                    </p>

                    <div className="hero-actions">
                        <button
                            onClick={handleLogin}
                            className="cta-button primary"
                        >
                            <span className="button-icon">🔐</span>
                            Sign In to Dashboard
                        </button>

                        <button
                            onClick={handleLearnMore}
                            className="cta-button secondary"
                        >
                            <span className="button-icon">📋</span>
                            Learn More
                        </button>
                    </div>

                    <div className="hero-stats">
                        <div className="stat-item">
                            <span className="stat-number">24/7</span>
                            <span className="stat-label">Available</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">HIPAA</span>
                            <span className="stat-label">Compliant</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">Secure</span>
                            <span className="stat-label">Platform</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div id="features" className="features-section">
                <div className="section-container">
                    <div className="section-header">
                        <h2 className="section-title">
                            Everything you need for modern healthcare
                        </h2>
                        <p className="section-subtitle">
                            Streamline your practice with our comprehensive healthcare management platform
                        </p>
                    </div>

                    <div className="features-grid">
                        {/* Patient Management */}
                        <div className="feature-card">
                            <div className="feature-icon">👥</div>
                            <h3 className="feature-title">Patient Management</h3>
                            <p className="feature-description">
                                Comprehensive patient records with secure data storage,
                                medical history tracking, and HIPAA compliance.
                            </p>
                            <div className="feature-benefits">
                                <span className="benefit">✅ Secure Records</span>
                                <span className="benefit">✅ Medical History</span>
                                <span className="benefit">✅ Quick Search</span>
                            </div>
                        </div>

                        {/* Appointment Scheduling */}
                        <div className="feature-card">
                            <div className="feature-icon">📅</div>
                            <h3 className="feature-title">Smart Scheduling</h3>
                            <p className="feature-description">
                                Advanced calendar system with automated reminders,
                                conflict detection, and flexible booking options.
                            </p>
                            <div className="feature-benefits">
                                <span className="benefit">✅ Calendar Integration</span>
                                <span className="benefit">✅ Auto Reminders</span>
                                <span className="benefit">✅ Time Management</span>
                            </div>
                        </div>

                        {/* Video Consultations */}
                        <div className="feature-card">
                            <div className="feature-icon">🎥</div>
                            <h3 className="feature-title">Video Consultations</h3>
                            <p className="feature-description">
                                Secure video calling with screen sharing,
                                session recording, and high-quality audio/video.
                            </p>
                            <div className="feature-benefits">
                                <span className="benefit">✅ HD Video/Audio</span>
                                <span className="benefit">✅ Screen Share</span>
                                <span className="benefit">✅ Secure Connection</span>
                            </div>
                        </div>

                        {/* Analytics Dashboard */}
                        <div className="feature-card">
                            <div className="feature-icon">📊</div>
                            <h3 className="feature-title">Analytics Dashboard</h3>
                            <p className="feature-description">
                                Real-time insights and statistics to help you
                                make informed decisions about your practice.
                            </p>
                            <div className="feature-benefits">
                                <span className="benefit">✅ Real-time Data</span>
                                <span className="benefit">✅ Custom Reports</span>
                                <span className="benefit">✅ Performance Metrics</span>
                            </div>
                        </div>

                        {/* Security & Compliance */}
                        <div className="feature-card">
                            <div className="feature-icon">🔒</div>
                            <h3 className="feature-title">Security & Compliance</h3>
                            <p className="feature-description">
                                Enterprise-grade security with end-to-end encryption,
                                audit trails, and full HIPAA compliance.
                            </p>
                            <div className="feature-benefits">
                                <span className="benefit">✅ End-to-End Encryption</span>
                                <span className="benefit">✅ HIPAA Compliant</span>
                                <span className="benefit">✅ Audit Trails</span>
                            </div>
                        </div>

                        {/* Mobile Access */}
                        <div className="feature-card">
                            <div className="feature-icon">📱</div>
                            <h3 className="feature-title">Mobile Access</h3>
                            <p className="feature-description">
                                Responsive design that works perfectly on all devices -
                                desktop, tablet, and mobile.
                            </p>
                            <div className="feature-benefits">
                                <span className="benefit">✅ Responsive Design</span>
                                <span className="benefit">✅ Mobile Optimized</span>
                                <span className="benefit">✅ Cross-Platform</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Demo Section */}
            <div className="demo-section">
                <div className="section-container">
                    <div className="demo-content">
                        <div className="demo-text">
                            <h2 className="demo-title">Ready to get started?</h2>
                            <p className="demo-description">
                                Try our platform with the demo account and see how TelenosHealth
                                can transform your healthcare practice.
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

                            <button
                                onClick={handleLogin}
                                className="demo-button"
                            >
                                <span className="button-icon">🚀</span>
                                Try Demo Now
                            </button>
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
                                        <div className="stat-label">Completed</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="footer-section">
                <div className="section-container">
                    <div className="footer-content">
                        <div className="footer-logo">
                            <span className="logo-icon">🏥</span>
                            <span className="logo-text">TelenosHealth</span>
                        </div>

                        <div className="footer-links">
                            <a href="#features" className="footer-link">Features</a>
                            <a href="#security" className="footer-link">Security</a>
                            <a href="#support" className="footer-link">Support</a>
                            <a href="#contact" className="footer-link">Contact</a>
                        </div>

                        <div className="footer-info">
                            <p>&copy; 2025 TelenosHealth. All rights reserved.</p>
                            <p>HIPAA Compliant Healthcare Platform</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;