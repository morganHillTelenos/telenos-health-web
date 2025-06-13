import React from 'react';
const { useState, useEffect } = React;

const EnhancedLandingPage = ({ onEnterDashboard }) => {
    const [fadeAnim, setFadeAnim] = useState(false);
    const [currentFeature, setCurrentFeature] = useState(0);

    useEffect(() => {
        setFadeAnim(true);
        const interval = setInterval(() => {
            setCurrentFeature(prev => (prev + 1) % 4);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const features = [
        {
            icon: '🛡️',
            title: 'HIPAA Compliant',
            description: 'Enterprise-grade security with end-to-end encryption for all patient data',
            color: '#3B82F6',
            gradient: 'from-blue-500 to-blue-600'
        },
        {
            icon: '🧠',
            title: 'AI-Powered Insights',
            description: 'Intelligent analytics provide actionable insights for better patient outcomes',
            color: '#8B5CF6',
            gradient: 'from-purple-500 to-purple-600'
        },
        {
            icon: '📊',
            title: 'Real-time Analytics',
            description: 'Comprehensive dashboards with live clinical and operational metrics',
            color: '#06B6D4',
            gradient: 'from-cyan-500 to-cyan-600'
        },
        {
            icon: '⚡',
            title: 'Lightning Performance',
            description: 'Sub-50ms response times optimized for critical healthcare workflows',
            color: '#10B981',
            gradient: 'from-emerald-500 to-emerald-600'
        }
    ];

    const stats = [
        { value: '99.9%', label: 'Uptime SLA', sublabel: 'Enterprise reliability', icon: '🔄' },
        { value: '< 50ms', label: 'Response Time', sublabel: 'Lightning fast', icon: '⚡' },
        { value: '256-bit', label: 'Encryption', sublabel: 'Military grade', icon: '🔐' },
        { value: '24/7', label: 'Support', sublabel: 'Always available', icon: '🛟' },
    ];

    const testimonials = [
        {
            name: "Dr. Sarah Chen",
            role: "Chief Medical Officer",
            text: "TelenosHealth has transformed how we deliver patient care. The AI insights are game-changing.",
            avatar: "👩‍⚕️"
        },
        {
            name: "Dr. Michael Rodriguez",
            role: "Emergency Medicine",
            text: "The speed and reliability during critical cases is unmatched. Saves lives every day.",
            avatar: "👨‍⚕️"
        },
        {
            name: "Dr. Lisa Thompson",
            role: "Telemedicine Director",
            text: "HIPAA compliance without sacrificing user experience. Exactly what healthcare needs.",
            avatar: "👩‍💼"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden relative">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-2000"></div>
            </div>

            {/* Navigation Header */}
            <nav className="relative z-10 px-6 pt-8 pb-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                            <span className="text-white text-xl">🏥</span>
                        </div>
                        <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                            TelenosHealth
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-4 py-2 border border-slate-600 rounded-lg text-slate-300 hover:text-white hover:border-slate-500 transition-all duration-200 hover:bg-slate-800">
                            Sign In
                        </button>
                        <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-blue-500/25 transform hover:scale-105">
                            Apply Now
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className={`relative px-6 py-20 transition-all duration-1000 ${fadeAnim ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-lg text-blue-400 px-6 py-3 rounded-full text-sm font-semibold mb-8 border border-slate-600/50 shadow-lg">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                            AI-Enabled Precision Medicine
                        </div>

                        <h1 className="text-7xl font-extrabold tracking-tight mb-8 leading-tight">
                            Healthcare Intelligence{' '}
                            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
                                Reimagined
                            </span>
                        </h1>

                        <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                            Empowering clinicians with AI-driven insights and secure, HIPAA-compliant tools
                            to deliver personalized patient care at unprecedented scale and speed.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
                            <button className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-10 py-5 rounded-xl font-semibold text-lg flex items-center gap-3 transition-all duration-300 hover:scale-105 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50">
                                <span>🚀</span>
                                Start Your Application
                                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                            </button>
                            <button className="group border-2 border-slate-600 hover:border-slate-400 bg-slate-800/50 backdrop-blur text-slate-300 hover:text-white px-10 py-5 rounded-xl font-semibold text-lg transition-all duration-300 hover:bg-slate-700/50">
                                <span className="mr-2">▶️</span>
                                Watch Demo
                            </button>
                        </div>
                    </div>

                    {/* Interactive Feature Showcase */}
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className={`group p-6 rounded-2xl border transition-all duration-500 cursor-pointer ${currentFeature === index
                                            ? 'bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-blue-500/50 shadow-lg shadow-blue-500/20 backdrop-blur-lg'
                                            : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800/50'
                                        }`}
                                    onClick={() => setCurrentFeature(index)}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl ${currentFeature === index ? 'bg-blue-500/20' : 'bg-slate-700/50'} transition-colors duration-300`}>
                                            <span className="text-2xl">{feature.icon}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${currentFeature === index ? 'text-blue-400' : 'text-white'
                                                }`}>
                                                {feature.title}
                                            </h3>
                                            <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                                        </div>
                                        <div className={`w-1 h-12 rounded-full transition-all duration-300 ${currentFeature === index ? 'bg-blue-500' : 'bg-slate-600'
                                            }`}></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="relative">
                            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-lg rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    </div>
                                    <span className="text-slate-400 text-sm font-mono">telenos://dashboard</span>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-300">Active Patients</span>
                                        <span className="text-2xl font-bold text-blue-400">1,247</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2">
                                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full w-3/4 animate-pulse"></div>
                                    </div>

                                    <div className="flex items-center justify-between mt-6">
                                        <span className="text-slate-300">AI Confidence</span>
                                        <span className="text-2xl font-bold text-green-400">98.7%</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2">
                                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full w-full animate-pulse"></div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                                            <div className="text-lg font-bold text-purple-400">47ms</div>
                                            <div className="text-xs text-slate-400">Response Time</div>
                                        </div>
                                        <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                                            <div className="text-lg font-bold text-cyan-400">100%</div>
                                            <div className="text-xs text-slate-400">Uptime</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="relative py-20 bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-lg border-y border-slate-700/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                            Trusted by Healthcare Leaders
                        </h2>
                        <p className="text-xl text-slate-400">
                            Performance metrics that matter in critical care
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="group text-center p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:transform hover:scale-105 backdrop-blur-lg">
                                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                    {stat.icon}
                                </div>
                                <div className="text-5xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-lg font-semibold text-white mb-1">{stat.label}</div>
                                <div className="text-sm text-slate-400">{stat.sublabel}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Testimonials Section */}
            <div className="relative py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">What Healthcare Professionals Say</h2>
                        <p className="text-xl text-slate-400">Real feedback from medical professionals using our platform</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="group bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:transform hover:scale-105">
                                <div className="flex items-center mb-6">
                                    <div className="text-4xl mr-4">{testimonial.avatar}</div>
                                    <div>
                                        <div className="font-semibold text-white">{testimonial.name}</div>
                                        <div className="text-sm text-slate-400">{testimonial.role}</div>
                                    </div>
                                </div>
                                <p className="text-slate-300 leading-relaxed italic">"{testimonial.text}"</p>
                                <div className="flex mt-4 text-yellow-500">
                                    {'★'.repeat(5)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="relative py-20 bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-lg">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                        Ready to Transform Healthcare?
                    </h2>
                    <p className="text-xl text-slate-300 mb-12">
                        Join the future of precision medicine with our AI-enabled platform
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
                        <button className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-10 py-5 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-xl shadow-blue-500/30">
                            Apply as Physician
                            <span className="ml-2 group-hover:translate-x-1 transition-transform inline-block">→</span>
                        </button>
                        <button className="group border-2 border-slate-600 hover:border-slate-400 bg-slate-800/50 backdrop-blur text-slate-300 hover:text-white px-10 py-5 rounded-xl font-semibold text-lg transition-all duration-300 hover:bg-slate-700/50">
                            Existing User Sign In
                        </button>
                    </div>

                    {/* Developer Access Section */}
                    <div className="pt-8 border-t border-slate-700/50 mt-8">
                        <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 backdrop-blur-lg rounded-xl p-6 border border-red-700/30">
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <span className="text-3xl">🚀</span>
                                <div>
                                    <h3 className="text-xl font-bold text-red-400">Developer Access</h3>
                                    <p className="text-sm text-slate-400">Skip authentication for development</p>
                                </div>
                            </div>
                            <button
                                onClick={onEnterDashboard}
                                className="group bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-4 rounded-lg font-semibold flex items-center gap-3 mx-auto transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-red-500/30"
                            >
                                <span>⚡</span>
                                Direct to Dashboard
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="relative bg-slate-900/80 backdrop-blur-lg border-t border-slate-700/50 py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center gap-3 mb-4 md:mb-0">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                                <span className="text-white text-lg">🏥</span>
                            </div>
                            <span className="text-xl font-bold">TelenosHealth</span>
                            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">DEMO</span>
                        </div>
                        <div className="text-slate-400 text-sm">
                            © 2024 TelenosHealth. Healthcare technology demonstration.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default EnhancedLandingPage;
