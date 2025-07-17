// src/pages/LandingPage.js
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

        // Observe all animated elements
        document.querySelectorAll('.fade-in, .slide-in, .scale-in').forEach(el => {
            observer.observe(el);
        });

        // Dynamic gradient animation
        const animateGradients = () => {
            const gradientElements = document.querySelectorAll('.dynamic-gradient');
            gradientElements.forEach(el => {
                const hue = (Date.now() / 50) % 360;
                el.style.background = `linear-gradient(135deg, 
                    hsl(${hue}, 70%, 50%) 0%, 
                    hsl(${(hue + 60) % 360}, 70%, 60%) 100%)`;
            });
        };

        const gradientInterval = setInterval(animateGradients, 100);

        // Event listeners
        document.addEventListener('click', handleSmoothScroll);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('scroll', handleScroll);

        // Initialize floating particles
        createFloatingParticles();

        // Cleanup
        return () => {
            document.removeEventListener('click', handleSmoothScroll);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
            clearInterval(gradientInterval);
            observer.disconnect();
        };
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
        navigate('/login');
    };

    const handleSignUp = () => {
        navigate('/signup');
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
                        <button onClick={handleLogin} className="nav-btn secondary">Login</button>
                        <button onClick={handleSignUp} className="nav-btn primary">Join</button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section ref={heroRef} className="hero-section">
                <div
                    className="hero-parallax"
                    style={{
                        transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
                    }}
                >
                    <div className="hero-content">
                        <div className="hero-badge scale-in">
                            <span className="badge-icon">⚡</span>
                            <span>Next-Gen Mental Health</span>
                        </div>

                        <h1 className="hero-title fade-in">
                            <span className="title-line">
                                <span className="brand-gradient">Promind</span>
                                <span className="title-decoration"></span>
                            </span>
                            <span className="title-line">Precision Psychiatry</span>
                            <span className="subtitle-line">Engineering the Future of Mental Health</span>
                        </h1>

                        <p className="hero-description fade-in">
                            Beyond the Snapshot. Continuous Optimization for the Human Mind.
                            <br />
                            <span className="highlight-text">Integrating computational psychiatry with holistic care.</span>
                        </p>

                        <div className="hero-actions fade-in">
                            <a href="#philosophy" className="btn-modern primary">
                                <span>Explore Our Vision</span>
                                <div className="btn-glow"></div>
                            </a>
                            <a href="#beta" className="btn-modern secondary">
                                <span>Join Beta Program</span>
                                <div className="btn-shine"></div>
                            </a>
                        </div>

                        <div className="hero-stats fade-in">
                            <div className="stat-item">
                                <div className="stat-number">99.9%</div>
                                <div className="stat-label">Precision Rate</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">24/7</div>
                                <div className="stat-label">Monitoring</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">AI-Powered</div>
                                <div className="stat-label">Insights</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="scroll-indicator">
                    <div className="scroll-arrow"></div>
                </div>
            </section>

            {/* Philosophy Section */}
            <section id="philosophy" className="section philosophy-section">
                <div className="section-container">
                    <div className="section-header fade-in">
                        <span className="section-badge">Innovation</span>
                        <h2 className="section-title">The Algorithmic Advantage</h2>
                        <p className="section-subtitle">Precision. Prediction. Progress.</p>
                    </div>

                    <div className="features-grid">
                        {[
                            {
                                icon: "📊",
                                title: "Objective Insights",
                                description: "Data-driven diagnosis and treatment, moving past subjective interpretations toward evidence-based precision.",
                                tagline: "Deconstructing complexity to reveal truth."
                            },
                            {
                                icon: "🔄",
                                title: "Holistic Integration",
                                description: "Understanding the patient as a complex system, where problems are interconnected and require comprehensive solutions.",
                                tagline: "The mind as a dynamic ecosystem. Engineered for equilibrium."
                            },
                            {
                                icon: "⚡",
                                title: "Continuous Evolution",
                                description: "Ongoing analysis, refinement, and adaptation that evolves with your needs beyond traditional appointments.",
                                tagline: "Beyond the confines of the clinic. Persistent optimization."
                            },
                            {
                                icon: "🤖",
                                title: "Computational Psychiatry",
                                description: "Advanced algorithms and data science integration to achieve unparalleled mental health outcomes.",
                                tagline: "Leveraging computation for state-of-the-art mental health."
                            }
                        ].map((feature, index) => (
                            <div key={index} className="feature-card slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className="card-glow"></div>
                                <div className="card-icon">{feature.icon}</div>
                                <h3 className="card-title">{feature.title}</h3>
                                <p className="card-description">{feature.description}</p>
                                <p className="card-tagline">"{feature.tagline}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Difference Section */}
            <section id="difference" className="section difference-section">
                <div className="section-container">
                    <div className="section-header fade-in">
                        <span className="section-badge light">Excellence</span>
                        <h2 className="section-title">Unlocking Human Potential</h2>
                        <p className="section-subtitle">Accelerating Mental Wellness Through Innovation.</p>
                    </div>

                    <div className="offerings-showcase">
                        {[
                            "Personalized Mental Architecture",
                            "Proactive Intervention Strategies",
                            "Optimized Treatment Trajectories",
                            "Sustainable Well-being Solutions"
                        ].map((offering, index) => (
                            <div key={index} className="offering-item fade-in" style={{ animationDelay: `${index * 0.15}s` }}>
                                <div className="offering-number">{String(index + 1).padStart(2, '0')}</div>
                                <h3 className="offering-title">{offering}</h3>
                                <div className="offering-bar"></div>
                            </div>
                        ))}
                    </div>

                    <div className="evolution-cta fade-in">
                        <h3 className="cta-title">Join the Vanguard of Mental Evolution</h3>
                        <div className="benefit-tags">
                            {["Cutting-edge Approach", "Superior Outcomes", "Forward-thinking Methodology", "Continuous Innovation"].map((benefit, index) => (
                                <span key={index} className="benefit-tag">{benefit}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Beta Program Section */}
            <section id="beta" className="section beta-section">
                <div className="section-container">
                    <div className="beta-content">
                        <div className="beta-header fade-in">
                            <span className="section-badge premium">Exclusive</span>
                            <h2 className="section-title">The Next Frontier</h2>
                            <p className="section-subtitle">Shape the Future of Mental Health Technology</p>
                        </div>

                        <div className="beta-features fade-in">
                            <div className="beta-promise">
                                <h3>Be at the Forefront of Innovation</h3>
                                <p>Experience cutting-edge treatments and technologies before they become widely available. Join an exclusive community shaping the future of psychiatric care.</p>
                            </div>

                            <div className="beta-actions">
                                <a href="mailto:contact@promindpsychiatry.com" className="btn-modern primary large">
                                    <span>Express Interest</span>
                                    <div className="btn-glow"></div>
                                </a>
                                <a href="#beta" className="btn-modern secondary">
                                    <span>Learn More</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="section-container">
                    <div className="footer-content">
                        <div className="footer-main">
                            <div className="footer-brand">
                                <div className="footer-logo">
                                    <span className="logo-pulse">🧠</span>
                                    <span>Promind Precision Psychiatry</span>
                                </div>
                                <p>Engineering the future of mental health through precision, innovation, and continuous optimization.</p>
                            </div>
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