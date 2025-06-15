import React, { useState } from 'react';
import NewPatientForm from './NewPatientForm'; // You'll need to create this file

const LandingPage = ({ onEnterDashboard }) => {
    const [showPatientForm, setShowPatientForm] = useState(false);

    const handlePatientSaved = (patientData) => {
        console.log('New patient saved:', patientData);
        // You can add logic here to save to your API or local storage
        // For now, we'll just log it and close the form
        setShowPatientForm(false);

        // Optionally redirect to dashboard after registration
        // onEnterDashboard();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 mix-blend-multiply"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <div className="flex justify-center mb-8">
                            <div className="relative">
                                <div className="w-20 h-20 bg-white rounded-2xl shadow-2xl flex items-center justify-center">
                                    <span className="text-3xl">🏥</span>
                                </div>
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                            Welcome to{' '}
                            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                                TelenosHealth
                            </span>
                        </h1>

                        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                            Modern healthcare management platform designed for healthcare providers.
                            Manage patients, schedule appointments, and conduct secure video consultations.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={onEnterDashboard}
                                className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                🚀 Enter Dashboard
                            </button>

                            <button
                                onClick={() => setShowPatientForm(true)}
                                className="px-8 py-4 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-white/20"
                            >
                                👤 Register New Patient
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Everything you need for modern healthcare
                        </h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Streamline your practice with our comprehensive healthcare management platform
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Patient Management */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                                <span className="text-2xl">👥</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Patient Management</h3>
                            <p className="text-gray-600 mb-6">
                                Comprehensive patient records, medical history tracking, and secure data management
                            </p>
                            <button
                                onClick={() => setShowPatientForm(true)}
                                className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
                            >
                                Add New Patient →
                            </button>
                        </div>

                        {/* Appointment Scheduling */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                                <span className="text-2xl">📅</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Scheduling</h3>
                            <p className="text-gray-600 mb-6">
                                Advanced calendar management with automated reminders and flexible booking options
                            </p>
                            <button
                                onClick={onEnterDashboard}
                                className="text-green-600 font-medium hover:text-green-700 transition-colors"
                            >
                                View Calendar →
                            </button>
                        </div>

                        {/* Video Consultations */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                                <span className="text-2xl">🎥</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Video Consultations</h3>
                            <p className="text-gray-600 mb-6">
                                HIPAA-compliant video calls with integrated patient records and secure messaging
                            </p>
                            <button
                                onClick={onEnterDashboard}
                                className="text-purple-600 font-medium hover:text-purple-700 transition-colors"
                            >
                                Start Session →
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Section */}
            <div className="bg-gray-50 py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">
                        Get Started Today
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl p-6 shadow-lg">
                            <div className="text-4xl mb-4">🏥</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">For Healthcare Providers</h3>
                            <p className="text-gray-600 mb-4">
                                Access your complete healthcare management dashboard
                            </p>
                            <button
                                onClick={onEnterDashboard}
                                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Enter Dashboard
                            </button>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-lg">
                            <div className="text-4xl mb-4">👤</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">New Patient Registration</h3>
                            <p className="text-gray-600 mb-4">
                                Quick and easy patient onboarding process
                            </p>
                            <button
                                onClick={() => setShowPatientForm(true)}
                                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                                Register Patient
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white">🏥</span>
                                </div>
                                <span className="text-xl font-bold">TelenosHealth</span>
                            </div>
                            <p className="text-gray-400 mb-4">
                                Empowering healthcare providers with modern, secure, and efficient practice management tools.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Features</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>Patient Management</li>
                                <li>Appointment Scheduling</li>
                                <li>Video Consultations</li>
                                <li>Medical Records</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Security</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>HIPAA Compliant</li>
                                <li>End-to-End Encryption</li>
                                <li>Secure Data Storage</li>
                                <li>Access Controls</li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2024 TelenosHealth. All rights reserved. HIPAA Compliant Healthcare Platform.</p>
                    </div>
                </div>
            </div>

            {/* New Patient Form Modal */}
            {showPatientForm && (
                <NewPatientForm
                    onClose={() => setShowPatientForm(false)}
                    onSave={handlePatientSaved}
                    showCloseButton={true}
                />
            )}
        </div>
    );
};

export default LandingPage;