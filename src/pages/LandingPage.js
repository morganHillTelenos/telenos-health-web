import React from 'react';
const { useState, useEffect } = React;

const LandingPage = ({ onEnterDashboard }) => {
    const [fadeAnim, setFadeAnim] = useState(false);

    useEffect(() => {
        setFadeAnim(true);
    }, []);

    const features = [
        {
            icon: '🛡️',
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
        <div className="min-h-screen bg-slate-900 text-white overflow-hidden">
            {/* Navigation Header */}
            <nav className="relative z-10 px-6 pt-8 pb-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mr-3">
                            <span className="text-white text-xl">🏥</span>
                        </div>
                        <span className="text-2xl font-bold tracking-tight">TelenosHealth</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-4 py-2 border border-slate-600 rounded-lg text-slate-300 hover:text-white hover:border-slate-500 transition-colors">
                            Sign In
                        </button>
                        <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition-colors">
                            Apply Now
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className={`relative px-6 py-20 transition-all duration-1000 ${fadeAnim ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-block bg-slate-800 text-blue-400 px-4 py-2 rounded-full text-sm font-semibold mb-8 border border-slate-700">
                        AI-Enabled Precision Medicine
                    </div>

                    <h1 className="text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                        Healthcare Intelligence{' '}
                        <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Reimagined
                        </span>
                    </h1>

                    <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Empowering clinicians with AI-driven insights and secure,
                        HIPAA-compliant tools to deliver personalized patient care at scale.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center gap-2 transition-all duration-200 hover:scale-105 shadow-lg shadow-blue-500/25">
                            Start Your Application
                            <span>→</span>
                        </button>
                        <button className="border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors">
                            Watch Demo
                        </button>
                    </div>

                    {/* Floating Cards */}
                    <div className="relative">
                        <div className="absolute -top-16 -right-20 bg-slate-800 border border-slate-700 rounded-2xl p-4 w-48 shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                            <div className="flex items-center mb-2">
                                <div className="w-6 h-6 bg-slate-700 rounded mr-2 flex items-center justify-center">
                                    <span className="text-blue-400">📊</span>
                                </div>
                                <span className="text-sm font-semibold">Patient Insights</span>
                            </div>
                            <p className="text-xs text-slate-400">Real-time analytics</p>
                        </div>

                        <div className="absolute -top-8 -left-20 bg-slate-800 border border-slate-700 rounded-2xl p-4 w-48 shadow-xl transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                            <div className="flex items-center mb-2">
                                <div className="w-6 h-6 bg-slate-700 rounded mr-2 flex items-center justify-center">
                                    <span className="text-purple-400">🧬</span>
                                </div>
                                <span className="text-sm font-semibold">Genomic Data</span>
                            </div>
                            <p className="text-xs text-slate-400">Precision medicine</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-white text-slate-900 py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <div className="text-blue-500 text-sm font-semibold uppercase tracking-wide mb-4">Platform Capabilities</div>
                        <h2 className="text-4xl font-bold mb-4">Built for Modern Healthcare</h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Comprehensive tools designed to transform how you deliver care
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="relative bg-white rounded-2xl p-8 border border-slate-200 hover:shadow-lg transition-shadow group">
                                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ backgroundColor: feature.color }}></div>
                                <div className="p-4 rounded-2xl mb-6 inline-block" style={{ backgroundColor: `${feature.color}15` }}>
                                    <span className="text-3xl">{feature.icon}</span>
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="bg-slate-50 py-20">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-slate-900 mb-12">Trusted by Healthcare Leaders</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-4xl font-bold text-blue-500 mb-2">{stat.value}</div>
                                <div className="text-lg font-semibold text-slate-900 mb-1">{stat.label}</div>
                                <div className="text-sm text-slate-600">{stat.sublabel}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-slate-900 py-20">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold mb-4">Ready to Transform Healthcare?</h2>
                    <p className="text-xl text-slate-400 mb-12">
                        Join the future of precision medicine with our AI-enabled platform
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors">
                            Apply as Physician
                        </button>
                        <button className="border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors">
                            Existing User Sign In
                        </button>
                    </div>

                    {/* Developer Access Button */}
                    <div className="pt-8 border-t border-slate-800">
                        <button
                            onClick={onEnterDashboard}
                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto transition-all duration-200 hover:scale-105 shadow-lg"
                        >
                            <span>🚀</span>
                            Developer Access - Direct to Dashboard
                        </button>
                        <p className="text-slate-500 text-sm mt-2">
                            Skip authentication for development purposes
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
