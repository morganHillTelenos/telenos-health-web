import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: '🔒',
            title: 'HIPAA Compliant',
            description: 'Enterprise-grade security with end-to-end encryption',
            color: '#3B82F6'
        },
        {
            icon: '🧠',
            title: 'AI-Powered',
            description: 'Intelligent insights for better patient outcomes',
            color: '#8B5CF6'
        },
        {
            icon: '📊',
            title: 'Data Analytics',
            description: 'Real-time clinical and operational insights',
            color: '#06B6D4'
        },
        {
            icon: '⚡',
            title: 'Lightning Fast',
            description: 'Optimized performance for busy healthcare workflows',
            color: '#10B981'
        }
    ];

    const stats = [
        { value: '99.9%', label: 'Uptime SLA', sublabel: 'Enterprise reliability' },
        { value: '< 50ms', label: 'Response Time', sublabel: 'Lightning fast' },
        { value: '256-bit', label: 'Encryption', sublabel: 'Military grade' },
        { value: '24/7', label: 'Support', sublabel: 'Always available' },
    ];

    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <div className="hero-badge">AI-Enabled Precision Medicine</div>
                    <h1 className="hero-title">
                        Healthcare Intelligence<br />
                        <span className="hero-title-gradient">Reimagined</span>
                    </h1>
                    <p className="hero-subtitle">
                        Empowering clinicians with AI-driven insights and secure,
                        HIPAA-compliant tools to deliver personalized patient care at scale.
                    </p>

                    <div className="hero-actions">
                        <button
                            className="btn btn-primary hero-cta"
                            onClick={() => navigate('/login')}
                        >
                            Start Your Application
                            <span className="cta-subtitle">Join 1000+ physicians</span>
                        </button>
                        <button className="btn btn-secondary">
                            Watch Demo
                        </button>
                    </div>
                </div>

                {/* Floating Cards */}
                <div className="floating-cards">
                    <div className="floating-card card-1">
                        <div className="card-header">
                            <div className="card-icon">📊</div>
                            <span className="card-title">Patient Insights</span>
                        </div>
                        <p className="card-subtitle">Real-time analytics</p>
                    </div>

                    <div className="floating-card card-2">
                        <div className="card-header">
                            <div className="card-icon">🧬</div>
                            <span className="card-title">Genomic Data</span>
                        </div>
                        <p className="card-subtitle">Precision medicine</p>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <div className="section-header">
                        <span className="section-tag">Platform Capabilities</span>
                        <h2 className="section-title">Built for Modern Healthcare</h2>
                        <p className="section-subtitle">
                            Comprehensive tools designed to transform how you deliver care
                        </p>
                    </div>

                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card">
                                <div
                                    className="feature-icon"
                                    style={{ backgroundColor: `${feature.color}15` }}
                                >
                                    <span className="feature-icon-text">{feature.icon}</span>
                                </div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                                <div
                                    className="feature-accent"
                                    style={{ backgroundColor: feature.color }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="container">
                    <h2 className="stats-title">Trusted by Healthcare Leaders</h2>
                    <div className="stats-grid">
                        {stats.map((stat, index) => (
                            <div key={index} className="stat-card">
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-label">{stat.label}</div>
                                <div className="stat-sublabel">{stat.sublabel}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="final-cta">
                <div className="container">
                    <div className="cta-content">
                        <h2 className="cta-title">Ready to Transform Healthcare?</h2>
                        <p className="cta-subtitle">
                            Join the future of precision medicine with our AI-enabled platform
                        </p>

                        <div className="cta-actions">
                            <button
                                className="btn btn-primary cta-primary"
                                onClick={() => navigate('/login')}
                            >
                                Get Started Today
                            </button>
                            <button
                                className="btn btn-secondary cta-secondary"
                                onClick={() => navigate('/login')}
                            >
                                Sign In
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;