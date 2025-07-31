// src/pages/LandingPage.js - Updated with proper navigation
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const heroRef = useRef();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        // Mouse movement parallax effect
        const handleMouseMove = (e) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 100,
                y: (e.clientY / window.innerHeight) * 100,
            });
        };

        // Scroll position tracking
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        // Smooth scrolling for navigation links
        const handleSmoothScroll = (e) => {
            if (e.target.getAttribute('href')?.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(e.target.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        };

        // Enhanced intersection observer with stagger animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('animate-in');
                    }, index * 100);
                }
            });
        }, observerOptions);

        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        animatedElements.forEach(el => observer.observe(el));

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('scroll', handleScroll);
        document.addEventListener('click', handleSmoothScroll);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('scroll', handleScroll);
            document.removeEventListener('click', handleSmoothScroll);
            observer.disconnect();
        };
    }, []);

    useEffect(() => {
        createFloatingParticles();
    }, []);

    const createFloatingParticles = () => {
        const particleContainer = document.querySelector('.particle-container');
        if (!particleContainer) return;

        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'floating-particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 20 + 's';
            particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
            particleContainer.appendChild(particle);
        }
    };

    const handleLogin = () => {
        navigate('/dashboard'); // This will trigger the authentication flow
    };

    const handleGetStarted = () => {
        navigate('/dashboard'); // This will trigger the authentication flow
    };

    return (
        <div className="landing-page">
            {/* Animated Background */}
            <div className="animated-background">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
                <div className="particle-container"></div>
            </div>

            {/* Modern Navigation */}
            <nav className="modern-nav">
                <div className="nav-container">
                    <div className="nav-logo">
                        <div className="logo-pulse">🧠</div>
                        <span>Promind</span>
                    </div>
                    <div className="nav-links">
                        <a href="#philosophy" className="nav-link">Vision</a>
                        <a href="#difference" className="nav-link">Innovation</a>
                        <a href="#beta" className="nav-link">Beta</a>
                        <a href="#contact" className="nav-link">Contact</a>
                    </div>
                    <button className="cta-button nav-cta" onClick={handleLogin}>
                        Provider Login
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section" ref={heroRef}>
                <div className="hero-container">
                    <div className="hero-content animate-on-scroll">
                        <div className="hero-badge">
                            <span className="badge-text">🚀 Beta Program Now Open</span>
                        </div>

                        <h1 className="hero-title">
                            <span className="gradient-text">Precision Psychiatry</span>
                            <br />
                            <span className="secondary-text">Engineered for Outcomes</span>
                        </h1>

                        <p className="hero-description">
                            Advanced computational psychiatry platform combining real-time physiological monitoring,
                            AI-driven treatment optimization, and continuous outcome measurement for unprecedented
                            precision in mental health care.
                        </p>

                        <div className="hero-cta">
                            <button className="cta-button primary" onClick={handleGetStarted}>
                                <span>Access Platform</span>
                                <svg className="cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </button>
                            <button className="cta-button secondary" onClick={() => document.getElementById('philosophy').scrollIntoView({ behavior: 'smooth' })}>
                                Learn More
                            </button>
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div className="floating-dashboard">
                            <div className="dashboard-header">
                                <div className="status-indicators">
                                    <div className="indicator active"></div>
                                    <div className="indicator active"></div>
                                    <div className="indicator warning"></div>
                                </div>
                                <div className="dashboard-title">Patient Monitoring</div>
                            </div>
                            <div className="dashboard-content">
                                <div className="metric-row">
                                    <div className="metric">
                                        <div className="metric-label">HRV Coherence</div>
                                        <div className="metric-value">87%</div>
                                    </div>
                                    <div className="metric">
                                        <div className="metric-label">Treatment Response</div>
                                        <div className="metric-value trending-up">+23%</div>
                                    </div>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Philosophy Section */}
            <section id="philosophy" className="content-section">
                <div className="container">
                    <div className="section-header animate-on-scroll">
                        <h2>Computational Precision</h2>
                        <p>Moving beyond traditional psychiatry toward measurable, optimized outcomes</p>
                    </div>

                    <div className="feature-grid">
                        <div className="feature-card animate-on-scroll">
                            <div className="feature-icon">🔬</div>
                            <h3>Evidence-Based Architecture</h3>
                            <p>Every intervention backed by real-time physiological data, validated through continuous measurement and algorithmic optimization.</p>
                        </div>

                        <div className="feature-card animate-on-scroll">
                            <div className="feature-icon">⚡</div>
                            <h3>Adaptive Treatment Protocols</h3>
                            <p>Dynamic treatment adjustments based on objective biomarkers, response patterns, and predictive modeling for optimal therapeutic outcomes.</p>
                        </div>

                        <div className="feature-card animate-on-scroll">
                            <div className="feature-icon">📊</div>
                            <h3>Quantified Mental Health</h3>
                            <p>Comprehensive tracking of treatment efficacy through validated assessment tools, physiological monitoring, and behavioral analytics.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* What Makes Us Different */}
            <section id="difference" className="difference-section">
                <div className="container">
                    <div className="difference-content">
                        <div className="difference-text animate-on-scroll">
                            <h2>Engineering Mental Health</h2>
                            <p className="difference-intro">
                                Traditional psychiatry relies on subjective assessments and trial-and-error approaches.
                                We engineer precision through objective measurement and continuous optimization.
                            </p>

                            <div className="comparison-list">
                                <div className="comparison-item">
                                    <div className="comparison-icon">❌</div>
                                    <div className="comparison-text">
                                        <strong>Traditional:</strong> Subjective symptom reporting, weeks between adjustments
                                    </div>
                                </div>
                                <div className="comparison-item">
                                    <div className="comparison-icon">✅</div>
                                    <div className="comparison-text">
                                        <strong>Promind:</strong> Real-time physiological monitoring, immediate optimization
                                    </div>
                                </div>
                                <div className="comparison-item">
                                    <div className="comparison-icon">❌</div>
                                    <div className="comparison-text">
                                        <strong>Traditional:</strong> One-size-fits-all treatment protocols
                                    </div>
                                </div>
                                <div className="comparison-item">
                                    <div className="comparison-icon">✅</div>
                                    <div className="comparison-text">
                                        <strong>Promind:</strong> Personalized, adaptive treatment algorithms
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="difference-visual animate-on-scroll">
                            <div className="tech-stack">
                                <div className="tech-layer">
                                    <div className="layer-label">AI Optimization Engine</div>
                                    <div className="layer-content">Treatment Protocol Adaptation</div>
                                </div>
                                <div className="tech-layer">
                                    <div className="layer-label">Real-time Monitoring</div>
                                    <div className="layer-content">Physiological Biomarkers</div>
                                </div>
                                <div className="tech-layer">
                                    <div className="layer-label">Outcome Measurement</div>
                                    <div className="layer-content">Validated Assessment Tools</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Beta Program */}
            <section id="beta" className="beta-section">
                <div className="container">
                    <div className="beta-container animate-on-scroll">
                        <div className="beta-badge">Limited Beta Access</div>
                        <h2>Join the Future of Psychiatry</h2>
                        <p>
                            We're selectively onboarding healthcare providers for our beta program.
                            Experience precision psychiatry with comprehensive platform access and dedicated support.
                        </p>

                        <div className="beta-features">
                            <div className="beta-feature">
                                <span className="feature-check">✓</span>
                                Full platform access with real-time monitoring
                            </div>
                            <div className="beta-feature">
                                <span className="feature-check">✓</span>
                                Dedicated implementation support team
                            </div>
                            <div className="beta-feature">
                                <span className="feature-check">✓</span>
                                Direct influence on product development
                            </div>
                        </div>

                        <button className="cta-button primary large" onClick={handleGetStarted}>
                            Request Beta Access
                        </button>
                    </div>
                </div>
            </section>

            {/* Contact */}
            <section id="contact" className="contact-section">
                <div className="container">
                    <div className="contact-content animate-on-scroll">
                        <h2>Ready to Transform Mental Health Care?</h2>
                        <p>Connect with our team to explore how precision psychiatry can enhance your practice.</p>

                        <div className="contact-options">
                            <a href="mailto:contact@promindpsychiatry.com" className="contact-method">
                                <div className="contact-icon">📧</div>
                                <div className="contact-text">
                                    <strong>Email</strong>
                                    <span>contact@promindpsychiatry.com</span>
                                </div>
                            </a>

                            <button className="contact-method" onClick={handleGetStarted}>
                                <div className="contact-icon">🚀</div>
                                <div className="contact-text">
                                    <strong>Platform Access</strong>
                                    <span>Request demonstration</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="modern-footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <div className="footer-logo">
                                <div className="logo-pulse">🧠</div>
                                <span>Promind Precision Psychiatry</span>
                            </div>
                            <p>Engineering the future of mental health through precision, innovation, and continuous optimization.</p>
                        </div>

                        <div className="footer-links">
                            <div className="footer-section">
                                <h4>Services</h4>
                                <ul>
                                    <li><a href="#philosophy">Precision Psychiatry</a></li>
                                    <li><a href="#beta">Beta Program</a></li>
                                    <li><a href="#difference">Treatment Optimization</a></li>
                                    <li><a href="mailto:contact@promindpsychiatry.com">Consultation</a></li>
                                </ul>
                            </div>

                            <div className="footer-section">
                                <h4>Innovation</h4>
                                <ul>
                                    <li><a href="#beta">Beta Technology</a></li>
                                    <li><a href="#philosophy">Computational Psychiatry</a></li>
                                    <li><a href="#difference">Continuous Care</a></li>
                                    <li><a href="mailto:contact@promindpsychiatry.com">Research</a></li>
                                </ul>
                            </div>

                            <div className="footer-section">
                                <h4>Legal</h4>
                                <ul>
                                    <li><a href="#privacy">Privacy Policy</a></li>
                                    <li><a href="#terms">Terms of Service</a></li>
                                    <li><a href="#disclaimer">Medical Disclaimer</a></li>
                                    <li><a href="#compliance">HIPAA Compliance</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p>&copy; 2025 Promind Precision Psychiatry. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;