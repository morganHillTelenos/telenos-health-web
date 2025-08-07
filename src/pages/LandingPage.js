// src/pages/LandingPage.js
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const heroRef = useRef(null);

    const handleLogin = () => {
        navigate('/dashboard');
    };

    const handleScheduleConsultation = () => {
        // You can link this to your scheduling system
        window.location.href = 'mailto:contact@promindpsychiatry.com?subject=Schedule Consultation';
    };

    useEffect(() => {
        // Animate elements on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        const animateElements = document.querySelectorAll('.animate-on-scroll');
        animateElements.forEach(el => observer.observe(el));

        // Create floating particles
        const createParticles = () => {
            const container = document.querySelector('.particle-container');
            if (!container) return;

            for (let i = 0; i < 20; i++) {
                const particle = document.createElement('div');
                particle.className = 'floating-particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
                particle.style.animationDelay = Math.random() * 5 + 's';
                container.appendChild(particle);
            }
        };

        createParticles();

        return () => {
            observer.disconnect();
        };
    }, []);

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
                        <span>Promind Psychiatry</span>
                    </div>
                    <div className="nav-links">
                        <a href="#about" className="nav-link">About</a>
                        <a href="#services" className="nav-link">Services</a>
                        <a href="#philosophy" className="nav-link">Approach</a>
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
                        <h1 className="hero-title">
                            <span className="gradient-text">Transform Your Mental Health Journey</span>
                            <br />
                            <span className="secondary-text">with Precision Psychiatry</span>
                        </h1>

                        <p className="hero-description">
                            Schedule a headache-free telehealth appointment at your convenience with compassionate,
                            evidence-based care tailored to your unique needs.
                        </p>

                        <div className="hero-actions">
                            <button className="cta-button primary large" onClick={handleScheduleConsultation}>
                                Schedule Your Consultation Today
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="section">
                <div className="container">
                    <div className="content-grid">
                        <div className="content-text animate-on-scroll">
                            <h2>Your Partner in Mental Wellness</h2>
                            <p>
                                I am passionate about helping all people reach their potential, whether their challenges are severe or mundane.
                                My approach combines the latest advances in precision psychiatry with compassionate, collaborative care to ensure
                                you experience lasting improvements—not just symptom management.
                            </p>
                            <p>
                                As a psychiatrist, I am extensively trained to identify and treat mental health conditions using a comprehensive
                                approach that considers biological, social/environmental, and psychological factors.
                            </p>
                            <p>
                                Together, we'll develop a personalized treatment plan that works for your specific needs and goals, whether that
                                involves lifestyle changes, therapy, medication, or (most commonly) a thoughtfully combined approach.
                            </p>
                        </div>
                        <div className="content-visual animate-on-scroll">
                            <div className="feature-grid">
                                <div className="feature-card">
                                    <div className="feature-icon">🧬</div>
                                    <h4>Biological Factors</h4>
                                    <p>Understanding your unique physiology</p>
                                </div>
                                <div className="feature-card">
                                    <div className="feature-icon">🌍</div>
                                    <h4>Environmental</h4>
                                    <p>Recognizing surrounding impacts</p>
                                </div>
                                <div className="feature-card">
                                    <div className="feature-icon">🧠</div>
                                    <h4>Psychological</h4>
                                    <p>Addressing thought patterns</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Section */}
            <section className="section dark-section">
                <div className="container">
                    <div className="section-header animate-on-scroll">
                        <h2>Why Choose Promind Psychiatry?</h2>
                    </div>
                    <div className="benefits-grid animate-on-scroll">
                        <div className="benefit-card">
                            <div className="benefit-icon">⚡</div>
                            <h3>Precision-Driven Care</h3>
                            <p>Unlike traditional one-size-fits-all treatment protocols, we use advanced computational psychiatry and real-time monitoring to create truly personalized treatment plans.</p>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon">💻</div>
                            <h3>Convenient Telehealth</h3>
                            <p>Access expert psychiatric care from the comfort of your home with our secure, HIPAA-compliant telehealth platform.</p>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon">🤝</div>
                            <h3>Collaborative Approach</h3>
                            <p>Your voice matters in your treatment journey. We work together as partners to identify root causes and develop strategies that align with your lifestyle.</p>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon">🔍</div>
                            <h3>Comprehensive Assessment</h3>
                            <p>We look at the whole picture—not just symptoms—to understand what's really driving your mental health challenges.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="section">
                <div className="container">
                    <div className="section-header animate-on-scroll">
                        <h2>Services We Provide</h2>
                    </div>
                    <div className="services-grid animate-on-scroll">
                        <div className="service-card">
                            <div className="service-icon">💙</div>
                            <h3>Depression & Mood Disorders</h3>
                            <p>Evidence-based treatment for major depression, bipolar disorder, and mood regulation challenges</p>
                        </div>
                        <div className="service-card">
                            <div className="service-icon">😰</div>
                            <h3>Anxiety Disorders</h3>
                            <p>Comprehensive care for generalized anxiety, panic disorder, social anxiety, and phobias</p>
                        </div>
                        <div className="service-card">
                            <div className="service-icon">🎯</div>
                            <h3>ADHD & Focus Issues</h3>
                            <p>Adult ADHD assessment and management with both medication and behavioral strategies</p>
                        </div>
                        <div className="service-card">
                            <div className="service-icon">🛡️</div>
                            <h3>Trauma & PTSD</h3>
                            <p>Trauma-informed care using proven therapeutic approaches and medication when appropriate</p>
                        </div>
                        <div className="service-card">
                            <div className="service-icon">🌱</div>
                            <h3>Stress & Life Transitions</h3>
                            <p>Support during major life changes, work stress, relationship challenges, and adjustment difficulties</p>
                        </div>
                        <div className="service-card">
                            <div className="service-icon">💊</div>
                            <h3>Medication Management</h3>
                            <p>Expert psychiatric medication consultation, monitoring, and optimization</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Philosophy Section */}
            <section id="philosophy" className="section dark-section">
                <div className="container">
                    <div className="content-grid">
                        <div className="content-text animate-on-scroll">
                            <h2>A Safe Space for Healing</h2>
                            <p>
                                It can be overwhelming to struggle with your mental health. I'm here to offer a guiding hand and a safe space
                                for healing and growth. My goal is to see you not just survive, but truly thrive.
                            </p>
                            <div className="philosophy-points">
                                <div className="philosophy-point">
                                    <div className="point-icon">🎯</div>
                                    <div>
                                        <h4>Root Cause Focus</h4>
                                        <p>Rather than simply treating symptoms, we work together to identify and address underlying factors.</p>
                                    </div>
                                </div>
                                <div className="philosophy-point">
                                    <div className="point-icon">🌟</div>
                                    <div>
                                        <h4>Lasting Improvement</h4>
                                        <p>Our approach is designed for long-term success, helping you develop tools for sustained wellness.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="content-visual animate-on-scroll">
                            <div className="process-steps">
                                <div className="process-step">
                                    <div className="step-number">1</div>
                                    <h4>Initial Consultation</h4>
                                    <p>Comprehensive assessment of your mental health needs and goals</p>
                                </div>
                                <div className="process-step">
                                    <div className="step-number">2</div>
                                    <h4>Personalized Plan</h4>
                                    <p>Development of a treatment strategy tailored specifically to you</p>
                                </div>
                                <div className="process-step">
                                    <div className="step-number">3</div>
                                    <h4>Ongoing Support</h4>
                                    <p>Regular check-ins and plan adjustments as you progress</p>
                                </div>
                                <div className="process-step">
                                    <div className="step-number">4</div>
                                    <h4>Collaborative Care</h4>
                                    <p>Working together every step of the way</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content animate-on-scroll">
                        <h2>Ready to Take the First Step?</h2>
                        <p>
                            If you're ready to explore a path towards improvement, I encourage you to take that first step.
                            Your journey to better mental health starts with a single conversation.
                        </p>
                        <button className="cta-button primary large" onClick={handleScheduleConsultation}>
                            Schedule Your Appointment
                        </button>
                        <p className="cta-subtext">
                            Book your confidential telehealth consultation today and begin your journey toward lasting mental wellness.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="contact-section">
                <div className="container">
                    <div className="contact-content animate-on-scroll">
                        <h2>Get in Touch</h2>

                        <div className="contact-options">
                            <a href="mailto:contact@promindpsychiatry.com" className="contact-method">
                                <div className="contact-icon">📧</div>
                                <div className="contact-text">
                                    <strong>Email</strong>
                                    <span>contact@promindpsychiatry.com</span>
                                </div>
                            </a>

                            <a href="tel:+1-555-123-4567" className="contact-method">
                                <div className="contact-icon">📞</div>
                                <div className="contact-text">
                                    <strong>Phone</strong>
                                    <span>(555) 123-4567</span>
                                </div>
                            </a>

                            <button className="contact-method" onClick={handleScheduleConsultation}>
                                <div className="contact-icon">🚀</div>
                                <div className="contact-text">
                                    <strong>Schedule Online</strong>
                                    <span>Book your consultation</span>
                                </div>
                            </button>
                        </div>

                        <div className="important-notes">
                            <div className="note-card">
                                <h4>🔒 Privacy & Security</h4>
                                <p>All appointments are conducted through our secure, HIPAA-compliant telehealth platform.</p>
                            </div>
                            <div className="note-card">
                                <h4>🆘 Crisis Support</h4>
                                <p>If you're experiencing a mental health emergency, please call 988 (Suicide & Crisis Lifeline) or go to your nearest emergency room.</p>
                            </div>
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
                                <span>Promind Psychiatry</span>
                            </div>
                            <p>Transforming mental health through precision, compassion, and personalized care.</p>
                        </div>

                        <div className="footer-links">
                            <div className="footer-section">
                                <h4>Services</h4>
                                <ul>
                                    <li><a href="#services">Depression & Anxiety</a></li>
                                    <li><a href="#services">ADHD Treatment</a></li>
                                    <li><a href="#services">Trauma & PTSD</a></li>
                                    <li><a href="#services">Medication Management</a></li>
                                </ul>
                            </div>

                            <div className="footer-section">
                                <h4>About</h4>
                                <ul>
                                    <li><a href="#about">Our Approach</a></li>
                                    <li><a href="#philosophy">Treatment Philosophy</a></li>
                                    <li><a href="#contact">Contact Us</a></li>
                                    <li><a href="mailto:contact@promindpsychiatry.com">Get Started</a></li>
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
                        <p>&copy; 2025 Promind Psychiatry. All rights reserved.</p>
                        <p className="footer-disclaimer">
                            Ready to transform your mental health with precision, compassionate care?
                            Schedule your consultation today and take the first step toward a better tomorrow.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;