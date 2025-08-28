// src/pages/LandingPage.js
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingTest.css';
import {
    Brain,
    HeartBreak,
    Shield,
    Target,
    Waves,
    Pill,
    Star,
    Envelope,
    Phone,
    RocketLaunch,
    CreditCard,
    Lock,
    Fire
} from 'phosphor-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const heroRef = useRef(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const handleGetStarted = () => {
        navigate('/dashboard');
    };

    const handleLogin = () => {
        navigate('/dashboard');
    };

    const handleSignUp = () => {
        navigate('/dashboard');
    };

    const handlePatientPortal = () => {
        navigate('/home');
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({
                x: (e.clientX - window.innerWidth / 2) / 20,
                y: (e.clientY - window.innerHeight / 2) / 20
            });
        };

        window.addEventListener('mousemove', handleMouseMove);

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

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            observer.disconnect();
        };
    }, []);

    

    return (
        <div className="landing-page">
            {/* Modern Navigation */}
            <nav className="modern-nav">
                <div className="nav-container">
                    <a href="#" className="nav-logo">
                        <img src="/images/pm-logo.png" alt="Promind Psychiatry" className="logo-image" />
                        <span>Promind Psychiatry</span>
                    </a>
                    <div className="nav-links">
                        <button onClick={handlePatientPortal} className="nav-link">
                            Patient Portal
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section" ref={heroRef}>
                <div className="hero-container">
                    <div className="hero-content animate-on-scroll">
                        <div className="hero-badge" style={{
                            background: 'var(--primary-blue-light)',
                            padding: 'var(--space-xs) var(--space-md)',
                            borderRadius: 'var(--radius-xl)',
                            display: 'inline-block',
                            marginBottom: 'var(--space-lg)',
                            fontSize: '0.9rem',
                            fontWeight: '500'
                        }}>
                            <span>⚡ Next-Gen Mental Health</span>
                        </div>

                        <h1 className="hero-title">
                            <span className="gradient-text">Promind Psychiatry</span>
                            <br />
                            <span style={{
                                fontSize: '0.8em',
                                fontWeight: '600',
                                color: 'var(--primary-gray)'
                            }}>
                                Engineering the Future of Mental Health
                            </span>
                        </h1>

                        <p className="hero-description">
                            Beyond the Snapshot. Continuous Optimization for the Human Mind.
                            <br />
                            <span style={{
                                color: 'var(--primary-blue)',
                                fontWeight: '600'
                            }}>
                                Integrating computational psychiatry with holistic care.
                            </span>
                        </p>

                        <div className="hero-actions">
                            <button
                                className="btn btn-primary btn-large"
                                onClick={() => document.getElementById('philosophy').scrollIntoView({ behavior: 'smooth' })}
                            >
                                Explore Our Vision
                            </button>
                            <button
                                className="btn btn-secondary btn-large"
                                onClick={() => document.getElementById('beta').scrollIntoView({ behavior: 'smooth' })}
                            >
                                Join Beta Program
                            </button>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: 'var(--space-xl)',
                            marginTop: 'var(--space-xl)',
                            flexWrap: 'wrap'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    color: 'var(--primary-blue)'
                                }}>Precision</div>
                                <div style={{
                                    fontSize: '0.9rem',
                                    color: 'var(--primary-gray)'
                                }}>Driven Care</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    color: 'var(--primary-blue)'
                                }}>Continuous</div>
                                <div style={{
                                    fontSize: '0.9rem',
                                    color: 'var(--primary-gray)'
                                }}>Monitoring</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    color: 'var(--primary-blue)'
                                }}>AI-Powered</div>
                                <div style={{
                                    fontSize: '0.9rem',
                                    color: 'var(--primary-gray)'
                                }}>Insights</div>
                            </div>
                        </div>
                    </div>

                    <div className="animate-on-scroll" style={{ marginTop: 'var(--space-xl)' }}>
                        <div style={{
                            background: 'white',
                            border: '1px solid var(--border-light)',
                            borderRadius: 'var(--radius-xl)',
                            padding: 'var(--space-lg)',
                            boxShadow: 'var(--shadow-lg)',
                            maxWidth: '400px',
                            margin: '0 auto'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 'var(--space-md)',
                                paddingBottom: 'var(--space-sm)',
                                borderBottom: '1px solid var(--border-light)'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    gap: 'var(--space-xs)'
                                }}>
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        background: '#10b981',
                                        borderRadius: '50%'
                                    }}></div>
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        background: '#10b981',
                                        borderRadius: '50%'
                                    }}></div>
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        background: '#f59e0b',
                                        borderRadius: '50%'
                                    }}></div>
                                </div>
                                <div style={{
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    color: 'var(--primary-gray)'
                                }}>Patient Monitoring</div>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: 'var(--space-md)'
                            }}>
                                <div>
                                    <div style={{
                                        fontSize: '0.8rem',
                                        color: 'var(--primary-gray)'
                                    }}>Treatment Coherence</div>
                                    <div style={{
                                        fontSize: '1.5rem',
                                        fontWeight: '600',
                                        color: 'var(--primary-blue)'
                                    }}>Optimal</div>
                                </div>
                                <div>
                                    <div style={{
                                        fontSize: '0.8rem',
                                        color: 'var(--primary-gray)'
                                    }}>Patient Response</div>
                                    <div style={{
                                        fontSize: '1.5rem',
                                        fontWeight: '600',
                                        color: '#10b981'
                                    }}>Improving</div>
                                </div>
                            </div>
                            <div style={{
                                width: '100%',
                                height: '8px',
                                background: 'var(--border-light)',
                                borderRadius: '4px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    background: 'linear-gradient(90deg, var(--primary-blue), var(--secondary-purple))',
                                    borderRadius: '4px'
                                }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Philosophy Section */}
            <section id="philosophy" className="section section-alt">
                <div className="container">
                    <div className="section-header animate-on-scroll">
                        <div style={{
                            background: 'var(--primary-blue-light)',
                            color: 'var(--primary-blue)',
                            padding: 'var(--space-xs) var(--space-md)',
                            borderRadius: 'var(--radius-xl)',
                            display: 'inline-block',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            marginBottom: 'var(--space-md)'
                        }}>Innovation</div>
                        <h2 className="section-title">The Algorithmic Advantage</h2>
                        <p className="section-subtitle">Precision. Prediction. Progress.</p>
                    </div>

                    <div className="card-grid">
                        {[
                            {
                                icon: <Brain size={48} color="#2563eb" />,
                                title: "Objective Insights",
                                description: "Data-driven diagnosis and treatment, moving past subjective interpretations toward evidence-based precision.",
                                tagline: "Deconstructing complexity to reveal truth."
                            },
                            {
                                icon: <Target size={48} color="#2563eb" />,
                                title: "Holistic Integration",
                                description: "Understanding the patient as a complex system, where problems are interconnected and require comprehensive solutions.",
                                tagline: "The mind as a dynamic ecosystem. Engineered for equilibrium."
                            },
                            {
                                icon: <Waves size={48} color="#2563eb" />,
                                title: "Continuous Evolution",
                                description: "Ongoing analysis, refinement, and adaptation that evolves with your needs beyond traditional appointments.",
                                tagline: "Beyond the confines of the clinic. Persistent optimization."
                            },
                            {
                                icon: <Shield size={48} color="#2563eb" />,
                                title: "Computational Psychiatry",
                                description: "Advanced algorithms and data science integration to achieve unparalleled mental health outcomes.",
                                tagline: "Leveraging computation for state-of-the-art mental health."
                            }
                        ].map((feature, index) => (
                            <div key={index} className="card animate-on-scroll">
                                <div className="card-icon">{feature.icon}</div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                                <p style={{
                                    fontStyle: 'italic',
                                    color: 'var(--primary-blue)',
                                    marginTop: 'var(--space-sm)',
                                    fontSize: '0.9rem'
                                }}>
                                    "{feature.tagline}"
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What Makes Us Different */}
            <section id="difference" className="section">
                <div className="container">
                    <div className="section-header animate-on-scroll">
                        <div style={{
                            background: 'var(--secondary-purple-light)',
                            color: 'var(--secondary-purple)',
                            padding: 'var(--space-xs) var(--space-md)',
                            borderRadius: 'var(--radius-xl)',
                            display: 'inline-block',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            marginBottom: 'var(--space-md)'
                        }}>Excellence</div>
                        <h2 className="section-title">Unlocking Human Potential</h2>
                        <p className="section-subtitle">Accelerating Mental Wellness Through Innovation.</p>
                    </div>

                    <div className="animate-on-scroll" style={{ textAlign: 'center' }}>
                        {[
                            "Personalized Mental Architecture",
                            "Proactive Intervention Strategies",
                            "Optimized Treatment Trajectories",
                            "Sustainable Well-being Solutions"
                        ].map((offering, index) => (
                            <div key={index} style={{
                                background: 'white',
                                border: '1px solid var(--border-light)',
                                borderRadius: 'var(--radius-xl)',
                                padding: 'var(--space-lg)',
                                margin: 'var(--space-md) 0',
                                boxShadow: 'var(--shadow-sm)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-md)'
                            }}>
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    background: 'var(--primary-blue)',
                                    color: 'white',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '700',
                                    fontSize: '1.25rem'
                                }}>
                                    {String(index + 1).padStart(2, '0')}
                                </div>
                                <h3 style={{
                                    fontSize: '1.25rem',
                                    fontWeight: '600',
                                    color: 'var(--secondary-purple)',
                                    margin: 0
                                }}>{offering}</h3>
                            </div>
                        ))}

                        <div style={{
                            marginTop: 'var(--space-xl)',
                            padding: 'var(--space-xl)',
                            background: 'white',
                            borderRadius: 'var(--radius-xl)',
                            border: '1px solid var(--border-light)'
                        }}>
                            <h3 style={{
                                fontSize: '1.5rem',
                                fontWeight: '600',
                                marginBottom: 'var(--space-md)',
                                color: 'var(--primary-blue)'
                            }}>
                                Join the Vanguard of Mental Evolution
                            </h3>
                            <div style={{
                                display: 'flex',
                                gap: 'var(--space-sm)',
                                justifyContent: 'center',
                                flexWrap: 'wrap'
                            }}>
                                {["Cutting-edge Approach", "Superior Outcomes", "Forward-thinking Methodology", "Continuous Innovation"].map((benefit, index) => (
                                    <span key={index} style={{
                                        background: 'var(--primary-blue-light)',
                                        color: 'var(--primary-blue)',
                                        padding: 'var(--space-xs) var(--space-md)',
                                        borderRadius: 'var(--radius-lg)',
                                        fontSize: '0.9rem',
                                        fontWeight: '500'
                                    }}>{benefit}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Beta Program */}
            <section id="beta" className="section section-alt">
                <div className="container">
                    <div className="section-header animate-on-scroll">
                        <div style={{
                            background: 'linear-gradient(135deg, var(--primary-blue), var(--secondary-purple))',
                            color: 'white',
                            padding: 'var(--space-xs) var(--space-md)',
                            borderRadius: 'var(--radius-xl)',
                            display: 'inline-block',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            marginBottom: 'var(--space-md)'
                        }}>Exclusive</div>
                        <h2 className="section-title">The Next Frontier</h2>
                        <p className="section-subtitle">Shape the Future of Mental Health Technology</p>
                    </div>

                    <div className="animate-on-scroll" style={{
                        textAlign: 'center',
                        maxWidth: '800px',
                        margin: '0 auto'
                    }}>
                        <div style={{
                            background: 'white',
                            border: '1px solid var(--border-light)',
                            borderRadius: 'var(--radius-2xl)',
                            padding: 'var(--space-3xl)',
                            boxShadow: 'var(--shadow-xl)'
                        }}>
                            <h3 style={{
                                fontSize: '1.75rem',
                                fontWeight: '600',
                                marginBottom: 'var(--space-md)',
                                color: 'var(--primary-blue)'
                            }}>
                                Be at the Forefront of Innovation
                            </h3>
                            <p style={{
                                fontSize: '1.125rem',
                                color: 'var(--primary-gray)',
                                marginBottom: 'var(--space-xl)',
                                lineHeight: '1.7'
                            }}>
                                Experience cutting-edge treatments and technologies before they become widely available.
                                Join an exclusive community shaping the future of psychiatric care.
                            </p>

                            <div className="hero-actions">
                                <a
                                    href="mailto:anthony.privratsky@promindpsychiatry.com"
                                    className="btn btn-primary btn-large"
                                >
                                    Express Interest
                                </a>
                                <button
                                    className="btn btn-secondary btn-large"
                                    onClick={() => document.getElementById('beta').scrollIntoView({ behavior: 'smooth' })}
                                >
                                    Learn More
                                </button>
                            </div>
                        </div>
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
                            <a href="mailto:anthony.privratsky@promindpsychiatry.com" className="contact-method">
                                <div className="contact-icon">
                                    <Envelope size={32} color="#2563eb" />
                                </div>
                                <div className="contact-text">
                                    <strong>Email</strong>
                                    <span>anthony.privratsky@promindpsychiatry.com</span>
                                </div>
                            </a>

                            <button className="contact-method" onClick={handleGetStarted}>
                                <div className="contact-icon">
                                    <RocketLaunch size={32} color="#2563eb" />
                                </div>
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
                                <img src="/images/pm-logo.png" alt="Promind Psychiatry" className="footer-logo-image" />
                                <span>Promind Precision Psychiatry</span>
                            </div>
                            <p>Engineering the future of mental health through precision, innovation, and continuous optimization.</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;