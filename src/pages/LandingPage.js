// src/pages/LandingPage.js
import React, { useEffect } from 'react';
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

    const handleScheduleConsultation = () => {
        window.open('https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ1TQd70RLRe-P2ldmz7nCeb9qJa0RQst1-9CJScUzPbAyCsG9wGpmD2xuhyKwT_JH5WXlK0smpf', '_blank');
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

        return () => {
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
                        <a href="#about" className="nav-link">About</a>
                        <a href="#specialties" className="nav-link">Specialties</a>
                        <a href="#philosophy" className="nav-link">Approach</a>
                        <a href="#contact" className="nav-link">Contact</a>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-container">
                    <div className="animate-on-scroll">
                        <h1 className="hero-title">
                            <span className="gradient-text">Transform Your Mental Health Journey</span>
                            <br />
                            with Promind Psychiatry
                        </h1>

                        <p className="hero-description">
                            Schedule a headache-free telehealth appointment at your convenience with compassionate,
                            evidence-based care tailored to your unique needs.
                        </p>

                        <div className="hero-actions">
                            <button className="btn btn-primary btn-large" onClick={handleScheduleConsultation}>
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
                            <h2>About Anthony Privratsky, MD, PHD</h2>
                            <p>
                                I am passionate about helping all people reach their potential, whether their challenges are severe or mundane.
                                My approach combines the latest advances in precision psychiatry with compassionate, collaborative care to ensure
                                you experience lasting improvements—not just symptom management.
                            </p>
                            <p>
                                I completed Residency Training in Psychiatry at the University of Utah and medical school and my PhD
                                (psychiatric neuroimaging and PTSD) at the University of Arkansas for Medical Sciences.
                            </p>
                            <p>
                                As a psychiatrist, I am extensively trained to identify and treat mental health conditions using a comprehensive
                                approach that considers biological, social/environmental, and psychological factors. Together, we'll develop a
                                personalized treatment plan that works for your specific needs and goals.
                            </p>
                        </div>
                        <div className="animate-on-scroll">
                            <div className="doctor-profile">
                                <div className="doctor-image">
                                    <img src="/images/doctor-image.png" alt="Dr. Privratsky" />
                                </div>
                                <div className="credentials">
                                    <h4>Education & Training</h4>
                                    <ul>
                                        <li>PhD in Psychiatric Neuroimaging and PTSD</li>
                                        <li>University of Arkansas for Medical Sciences</li>
                                        <li>Psychiatry Residency - University of Utah</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Specialties Section */}
            <section id="specialties" className="section section-alt">
                <div className="container">
                    <div className="section-header animate-on-scroll">
                        <h2 className="section-title">Specialties & Expertise</h2>
                    </div>

                    <div className="animate-on-scroll">
                        <h3 style={{ textAlign: 'center', marginBottom: 'var(--space-lg)', fontSize: '1.5rem', fontWeight: '600' }}>Primary Specialties</h3>
                        <div className="specialty-grid">
                            <div className="specialty-card">
                                <div className="specialty-icon">
                                    <Brain size={32} color="#EE6352" />
                                </div>
                                <h4>Anxiety</h4>
                            </div>
                            <div className="specialty-card">
                                <div className="specialty-icon">
                                    <HeartBreak size={32} color="#EE6352" />
                                </div>
                                <h4>Depression</h4>
                            </div>
                            <div className="specialty-card">
                                <div className="specialty-icon">
                                    <Shield size={32} color="#EE6352" />
                                </div>
                                <h4>Trauma and PTSD</h4>
                            </div>
                        </div>
                    </div>

                    <div className="animate-on-scroll" style={{ marginTop: 'var(--space-3xl)' }}>
                        <h3 style={{ textAlign: 'center', marginBottom: 'var(--space-lg)', fontSize: '1.5rem', fontWeight: '600' }}>Areas of Expertise</h3>
                        <div className="expertise-grid">
                            <div className="expertise-item">Addiction</div>
                            <div className="expertise-item">ADHD</div>
                            <div className="expertise-item">Alcohol Use</div>
                            <div className="expertise-item">Autism</div>
                            <div className="expertise-item">Bipolar Disorder</div>
                            <div className="expertise-item">Eating Disorders</div>
                            <div className="expertise-item">LGBTQ+</div>
                            <div className="expertise-item">Medication Management</div>
                            <div className="expertise-item">Personality Disorders</div>
                            <div className="expertise-item">Pregnancy, Prenatal, Postpartum</div>
                            <div className="expertise-item">Psychosis</div>
                            <div className="expertise-item">Psychotherapy (DBT, Exposure, etc)</div>
                            <div className="expertise-item">School Issues</div>
                            <div className="expertise-item">Scientific Approach to Mental Health</div>
                            <div className="expertise-item">Self-Harming</div>
                            <div className="expertise-item">Sleep or Insomnia</div>
                            <div className="expertise-item">Substance Use</div>
                            <div className="expertise-item">Suicidal Ideation</div>
                            <div className="expertise-item">Testing and Evaluation</div>
                            <div className="expertise-item">Traumatic Brain Injury (TBI)</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="section">
                <div className="container">
                    <div className="section-header animate-on-scroll">
                        <h2 className="section-title">Services We Provide</h2>
                    </div>
                    <div className="card-grid animate-on-scroll">
                        <div className="card">
                            <div className="card-icon">
                                <HeartBreak size={32} color="#EE6352" />
                            </div>
                            <h3>Depression & Mood Disorders</h3>
                            <p>Evidence-based treatment for major depression, bipolar disorder, and mood regulation challenges</p>
                        </div>
                        <div className="card">
                            <div className="card-icon">
                                <Brain size={32} color="#EE6352" />
                            </div>
                            <h3>Anxiety Disorders</h3>
                            <p>Comprehensive care for generalized anxiety, panic disorder, social anxiety, and phobias</p>
                        </div>
                        <div className="card">
                            <div className="card-icon">
                                <Target size={32} color="#EE6352" />
                            </div>
                            <h3>ADHD & Focus Issues</h3>
                            <p>Adult ADHD assessment and management with both medication and behavioral strategies</p>
                        </div>
                        <div className="card">
                            <div className="card-icon">
                                <Shield size={32} color="#EE6352" />
                            </div>
                            <h3>Trauma & PTSD</h3>
                            <p>Trauma-informed care using proven therapeutic approaches and medication when appropriate</p>
                        </div>
                        <div className="card">
                            <div className="card-icon">
                                <Waves size={32} color="#EE6352" />
                            </div>
                            <h3>Stress & Life Transitions</h3>
                            <p>Support during major life changes, work stress, relationship challenges, and adjustment difficulties</p>
                        </div>
                        <div className="card">
                            <div className="card-icon">
                                <Pill size={32} color="#EE6352" />
                            </div>
                            <h3>Medication Management</h3>
                            <p>Expert psychiatric medication consultation, monitoring, and optimization</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Philosophy Section */}
            <section id="philosophy" className="section section-alt">
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
                                    <div className="point-icon">
                                        <Target size={32} color="#EE6352" />
                                    </div>
                                    <div>
                                        <h4>Root Cause Focus</h4>
                                        <p>Rather than simply treating symptoms, we work together to identify and address underlying factors.</p>
                                    </div>
                                </div>
                                <div className="philosophy-point">
                                    <div className="point-icon">
                                        <Star size={32} color="#EE6352" />
                                    </div>
                                    <div>
                                        <h4>Lasting Improvement</h4>
                                        <p>Our approach is designed for long-term success, helping you develop tools for sustained wellness.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="animate-on-scroll">
                            <div className="process-steps">
                                <div className="process-step">
                                    <div className="step-number">1</div>
                                    <div className="step-content">
                                        <h4>Initial Consultation</h4>
                                        <p>Comprehensive assessment of your mental health needs and goals</p>
                                    </div>
                                </div>
                                <div className="process-step">
                                    <div className="step-number">2</div>
                                    <div className="step-content">
                                        <h4>Personalized Plan</h4>
                                        <p>Development of a treatment strategy tailored specifically to you</p>
                                    </div>
                                </div>
                                <div className="process-step">
                                    <div className="step-number">3</div>
                                    <div className="step-content">
                                        <h4>Ongoing Support</h4>
                                        <p>Regular check-ins and plan adjustments as you progress</p>
                                    </div>
                                </div>
                                <div className="process-step">
                                    <div className="step-number">4</div>
                                    <div className="step-content">
                                        <h4>Collaborative Care</h4>
                                        <p>Working together every step of the way</p>
                                    </div>
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
                        <h2>Take the First Step</h2>
                        <p>
                            Your journey to better mental health starts with a single conversation.
                        </p>
                        <button className="btn btn-primary btn-large" onClick={handleScheduleConsultation}>
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
                            <a href="mailto:Anthony.Privratsky@promindpsychiatry.com" className="contact-method">
                                <div className="contact-icon">
                                    <Envelope size={32} color="#EE6352" />
                                </div>
                                <div className="contact-text">
                                    <strong>Email</strong>
                                    <span>Anthony.Privratsky@promindpsychiatry.com</span>
                                </div>
                            </a>

                            <a href="tel:+1-385-455-4671" className="contact-method">
                                <div className="contact-icon">
                                    <Phone size={32} color="#EE6352" />
                                </div>
                                <div className="contact-text">
                                    <strong>Phone</strong>
                                    <span>(385) 455-4671</span>
                                </div>
                            </a>

                            <button className="contact-method" onClick={handleScheduleConsultation}>
                                <div className="contact-icon">
                                    <RocketLaunch size={32} color="#EE6352" />
                                </div>
                                <div className="contact-text">
                                    <strong>Schedule Online</strong>
                                    <span>Book your consultation</span>
                                </div>
                            </button>
                        </div>

                        <div className="important-notes">
                            <div className="note-card">
                                <div className="bottom-icon">
                                    <CreditCard size={24} color="#EE6352" />
                                <h4>Fee Information</h4>
                                </div>
                                <p><strong>Currently accepting Fee-for-Service only</strong><br />
                                    Initial Session Fee: $300 • Standard Visit: $150</p>
                            </div>
                            <div className="note-card">
                                <div className="bottom-icon">
                                    <Lock size={24} color="#EE6352" />
                                <h4>Privacy & Security</h4>
                                </div>
                                <p>All appointments are conducted through our secure, HIPAA-compliant telehealth platform.</p>
                            </div>
                            <div className="note-card">
                                <div className="bottom-icon">
                                    <Fire size={24} color="#EE6352" />
                                <h4>Crisis Support</h4>
                                </div>
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
                                <img src="/images/pm-logo.png" alt="Promind Psychiatry" className="footer-logo-image" />
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
                                    <li><a href="mailto:Anthony.Privratsky@promindpsychiatry.com">Get Started</a></li>
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