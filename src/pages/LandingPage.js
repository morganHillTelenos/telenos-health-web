// src/pages/LandingPage.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
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

        // Animate elements on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe all fade-in elements
        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });

        // Add event listeners
        document.addEventListener('click', handleSmoothScroll);

        // Add dynamic background animation
        const animationInterval = setInterval(() => {
            const neural = document.querySelector('.neural-network');
            if (neural) {
                neural.style.backgroundPosition = `${Math.random() * 100}px ${Math.random() * 100}px`;
            }
        }, 3000);

        // Cleanup
        return () => {
            document.removeEventListener('click', handleSmoothScroll);
            clearInterval(animationInterval);
            observer.disconnect();
        };
    }, []);

    const handleLogin = () => {
        navigate('/login');
    };

    const handleSignUp = () => {
        navigate('/signup');
    };

    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-background"></div>
                <div className="neural-network"></div>

                <div className="hero-content">
                    <div className="hero-logo">
                        <div className="logo-container">
                            <span className="logo-icon">🧠</span>
                        </div>
                    </div>

                    <h1 className="hero-title">
                        <span className="brand-gradient">Promind Precision Psychiatry:</span><br />
                        Engineering the Future of Mental Health
                    </h1>

                    <p className="tagline">Beyond the Snapshot. Continuous Optimization for the Human Mind.</p>

                    <p className="hero-subtitle">
                        Promind Precision Psychiatry is committed to elevating mental health care through a relentless pursuit of objective understanding and continuous innovation. We integrate a holistic view of the individual with persistent, evolving care, moving beyond episodic treatment.
                    </p>

                    <div className="hero-actions">
                        <a href="#philosophy" className="btn-primary">Explore Our Vision</a>
                        <a href="#beta" className="btn-secondary">Learn More About Beta</a>
                        <button onClick={handleLogin} className="btn-secondary">Login</button>
                        <button onClick={handleSignUp} className="btn-primary">Sign Up</button>
                    </div>

                    <div className="beta-tease">
                        🚀 Pioneering new frontiers. Ask about joining the Beta for an undisclosed mental health technology product.
                    </div>
                </div>
            </section>

            {/* Philosophy Section */}
            <section id="philosophy" className="section philosophy-section">
                <div className="section-container">
                    <h2 className="section-title">The Algorithmic Advantage</h2>
                    <p className="section-subtitle">Precision. Prediction. Progress.</p>

                    <div className="differentiators-grid">
                        <div className="differentiator-card fade-in">
                            <div className="card-icon">📊</div>
                            <h3 className="card-title">Objective Insights</h3>
                            <p className="card-description">
                                We rely on data and objective information to inform diagnosis and treatment, moving past subjective interpretations toward evidence-based precision.
                            </p>
                            <p className="card-tagline">"Deconstructing complexity to reveal truth."</p>
                        </div>

                        <div className="differentiator-card fade-in">
                            <div className="card-icon">🔄</div>
                            <h3 className="card-title">Holistic Integration</h3>
                            <p className="card-description">
                                Understanding the patient as a complex system, where problems are interconnected and require a comprehensive approach to achieve lasting wellness.
                            </p>
                            <p className="card-tagline">"The mind as a dynamic ecosystem. Engineered for equilibrium."</p>
                        </div>

                        <div className="differentiator-card fade-in">
                            <div className="card-icon">⚡</div>
                            <h3 className="card-title">Continuous Evolution</h3>
                            <p className="card-description">
                                Care is not confined to appointments but is an ongoing process of analysis, refinement, and adaptation that evolves with your needs.
                            </p>
                            <p className="card-tagline">"Beyond the confines of the clinic. Persistent optimization."</p>
                        </div>

                        <div className="differentiator-card fade-in">
                            <div className="card-icon">🤖</div>
                            <h3 className="card-title">Computational Psychiatry</h3>
                            <p className="card-description">
                                Pioneering the integration of computational psychiatry to achieve unparalleled outcomes through advanced algorithms and data science.
                            </p>
                            <p className="card-tagline">"Leveraging the power of computation to unlock state-of-the-art mental health."</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Promind Difference Section */}
            <section id="difference" className="section difference-section">
                <div className="section-container">
                    <h2 className="section-title">Unlocking Human Potential</h2>
                    <p className="section-subtitle">Accelerating Mental Wellness.</p>

                    <div className="offerings-grid">
                        <div className="offering-item">
                            <h3 className="offering-title">Personalized Mental Architecture</h3>
                            <p>Tailored frameworks designed for your unique cognitive landscape</p>
                        </div>

                        <div className="offering-item">
                            <h3 className="offering-title">Proactive Intervention Strategies</h3>
                            <p>Anticipating and preventing mental health challenges before they escalate</p>
                        </div>

                        <div className="offering-item">
                            <h3 className="offering-title">Optimized Treatment Trajectories</h3>
                            <p>Data-driven pathways that adapt and evolve with your progress</p>
                        </div>

                        <div className="offering-item">
                            <h3 className="offering-title">Sustainable Well-being Solutions</h3>
                            <p>Long-term strategies for maintaining optimal mental health</p>
                        </div>
                    </div>

                    <div className="why-choose">
                        <h3>Why Choose Promind</h3>
                        <div className="benefits-list">
                            <div className="benefit-item">Cutting-edge Approach</div>
                            <div className="benefit-item">Superior Outcomes</div>
                            <div className="benefit-item">Forward-thinking Methodology</div>
                            <div className="benefit-item">Continuous Innovation</div>
                        </div>
                        <p className="evolution-tagline">"Join the vanguard of mental evolution."</p>
                    </div>
                </div>
            </section>

            {/* Beta Program Section */}
            <section id="beta" className="section beta-section">
                <div className="section-container">
                    <h2 className="section-title">The Next Frontier</h2>
                    <p className="section-subtitle">Igniting Innovation. Participate in the Future.</p>

                    <p className="beta-description">
                        A unique opportunity to contribute to the advancement of mental health technology. Join an exclusive community shaping the future of psychiatric care through groundbreaking innovation.
                    </p>

                    <div className="beta-promise">
                        <p><strong>Be at the forefront of undisclosed innovation.</strong></p>
                        <p>Shape the future of mental health while experiencing cutting-edge treatments and technologies before they become widely available.</p>
                    </div>

                    <div className="hero-actions">
                        <a href="#beta" className="btn-primary">Learn More About Beta Program</a>
                        <a href="mailto:contact@promindpsychiatry.com" className="btn-secondary">Express Interest</a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="section-container">
                    <div className="footer-content">
                        <div className="footer-section">
                            <h4>Promind Precision Psychiatry</h4>
                            <p>Engineering the future of mental health through precision, innovation, and continuous optimization.</p>
                        </div>

                        <div className="footer-section">
                            <h4>Services</h4>
                            <ul className="footer-links">
                                <li><a href="#philosophy">Precision Psychiatry</a></li>
                                <li><a href="#beta">Beta Program</a></li>
                                <li><a href="#difference">Treatment Optimization</a></li>
                                <li><a href="mailto:contact@promindpsychiatry.com">Consultation</a></li>
                            </ul>
                        </div>

                        <div className="footer-section">
                            <h4>Innovation</h4>
                            <ul className="footer-links">
                                <li><a href="#beta">Beta Technology</a></li>
                                <li><a href="#philosophy">Computational Psychiatry</a></li>
                                <li><a href="#difference">Continuous Care</a></li>
                                <li><a href="mailto:contact@promindpsychiatry.com">Research Participation</a></li>
                            </ul>
                        </div>

                        <div className="footer-section">
                            <h4>Legal & Compliance</h4>
                            <ul className="footer-links">
                                <li><a href="#privacy">Privacy Policy</a></li>
                                <li><a href="#terms">Terms of Service</a></li>
                                <li><a href="#disclaimer">Medical Disclaimer</a></li>
                                <li><a href="#compliance">HIPAA Compliance</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p>&copy; 2025 Promind Precision Psychiatry. All rights reserved.</p>
                        <p>Promind Precision Psychiatry is a medical practice committed to advancing mental healthcare through innovation and precision.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;