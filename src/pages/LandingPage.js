// src/pages/LandingPage.js - Tempus-inspired design
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
            {/* Header */}
            <header className="tempus-header">
                <nav className="nav-container">
                    <div className="tempus-logo">TelenosHealth</div>
                    <ul className="nav-links">
                        <li><a href="#features" className="nav-link">Providers</a></li>
                        <li><a href="#partnerships" className="nav-link">Life Sciences</a></li>
                        <li><a href="#about" className="nav-link">Patients</a></li>
                        <li><a href="#resources" className="nav-link">Resources</a></li>
                    </ul>
                    <button className="cta-button" onClick={handleLogin}>
                        Get Started
                    </button>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="tempus-hero">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1 className="hero-title">
                        AI-enabled precision medicine
                    </h1>
                    <p className="hero-subtitle">
                        Advancing data-driven precision medicine with the practical application of AI in healthcare.
                        Unlock the power of intelligent diagnostics through multimodal data.
                    </p>

                    <div className="hero-actions">
                        <button className="primary-button" onClick={handleLogin}>
                            Enter Platform
                        </button>
                        <button className="secondary-button" onClick={handleLearnMore}>
                            Learn More
                        </button>
                    </div>

                    <div className="hero-stats">
                        <div className="stat">
                            <span className="stat-number">50%+</span>
                            <span className="stat-label">Oncologists Connected</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">95%</span>
                            <span className="stat-label">Top 20 Pharma Partners</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">2,000+</span>
                            <span className="stat-label">Healthcare Institutions</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section">
                <div className="section-container">
                    <h2 className="section-title">Intelligent Diagnostics Platform</h2>
                    <p className="section-subtitle">
                        Our AI-powered platform transforms healthcare data into actionable insights for precision medicine
                    </p>

                    <div className="features-grid">
                        <div className="feature-card">
                            <span className="feature-icon">🧬</span>
                            <h3 className="feature-title">Genomic Sequencing</h3>
                            <p className="feature-description">
                                Comprehensive DNA and RNA sequencing with tumor-normal matched profiling
                                to identify actionable oncologic targets and personalized treatment options.
                            </p>
                        </div>

                        <div className="feature-card">
                            <span className="feature-icon">🤖</span>
                            <h3 className="feature-title">AI-Powered Analytics</h3>
                            <p className="feature-description">
                                Advanced machine learning algorithms analyze multimodal clinical and molecular
                                data to provide real-time, data-driven treatment recommendations.
                            </p>
                        </div>

                        <div className="feature-card">
                            <span className="feature-icon">📊</span>
                            <h3 className="feature-title">Clinical Data Platform</h3>
                            <p className="feature-description">
                                World's largest library of clinical and molecular data with 450+ unique
                                data connections across healthcare institutions worldwide.
                            </p>
                        </div>

                        <div className="feature-card">
                            <span className="feature-icon">🔬</span>
                            <h3 className="feature-title">Liquid Biopsy</h3>
                            <p className="feature-description">
                                Non-invasive blood-based testing to detect circulating tumor DNA and
                                monitor treatment response in real-time for advanced solid tumors.
                            </p>
                        </div>

                        <div className="feature-card">
                            <span className="feature-icon">🏥</span>
                            <h3 className="feature-title">Clinical Trial Matching</h3>
                            <p className="feature-description">
                                AI-enabled matching platform connects patients with relevant clinical
                                trials based on molecular biomarkers and clinical characteristics.
                            </p>
                        </div>

                        <div className="feature-card">
                            <span className="feature-icon">⚡</span>
                            <h3 className="feature-title">Real-Time Insights</h3>
                            <p className="feature-description">
                                Instant access to patient information, test results, and treatment
                                recommendations through our AI-enabled assistant platform.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Partnerships Section */}
            <section id="partnerships" className="partnerships-section">
                <div className="section-container">
                    <h2 className="partnership-title">Trusted by Leading Organizations</h2>
                    <p className="partnership-subtitle">
                        Collaborating with top pharmaceutical companies and healthcare institutions
                        to advance precision medicine research and patient care
                    </p>

                    <div className="partner-logos">
                        <div className="partner-logo">BioNTech</div>
                        <div className="partner-logo">AstraZeneca</div>
                        <div className="partner-logo">Pfizer</div>
                        <div className="partner-logo">GSK</div>
                        <div className="partner-logo">Northwestern</div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer-section">
                <div className="section-container">
                    <div className="footer-content">
                        <div className="footer-section-item">
                            <h4 className="footer-title">Providers</h4>
                            <div className="footer-links">
                                <a href="#" className="footer-link">Oncology</a>
                                <a href="#" className="footer-link">Cardiology</a>
                                <a href="#" className="footer-link">Neurology</a>
                                <a href="#" className="footer-link">Radiology</a>
                            </div>
                        </div>

                        <div className="footer-section-item">
                            <h4 className="footer-title">Life Sciences</h4>
                            <div className="footer-links">
                                <a href="#" className="footer-link">Research</a>
                                <a href="#" className="footer-link">Clinical Development</a>
                                <a href="#" className="footer-link">Commercialization</a>
                                <a href="#" className="footer-link">Partnerships</a>
                            </div>
                        </div>

                        <div className="footer-section-item">
                            <h4 className="footer-title">Resources</h4>
                            <div className="footer-links">
                                <a href="#" className="footer-link">Research Publications</a>
                                <a href="#" className="footer-link">Webinars</a>
                                <a href="#" className="footer-link">Case Studies</a>
                                <a href="#" className="footer-link">Documentation</a>
                            </div>
                        </div>

                        <div className="footer-section-item">
                            <h4 className="footer-title">Company</h4>
                            <div className="footer-links">
                                <a href="#" className="footer-link">About Us</a>
                                <a href="#" className="footer-link">Careers</a>
                                <a href="#" className="footer-link">Investors</a>
                                <a href="#" className="footer-link">Contact</a>
                            </div>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p>&copy; 2025 TelenosHealth. All rights reserved. | AI-enabled precision medicine platform</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;