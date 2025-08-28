// src/pages/ComingSoonPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/globals.css';

const ComingSoonPage = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/');
    };

    const handleContactUs = () => {
        window.open('mailto:connect@promindpsychiatry.com', '_blank');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
            <div className="max-w-2xl mx-auto px-6 text-center">
                <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-6">
                        <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Coming Soon
                    </h1>

                    <p className="text-xl text-gray-600 mb-8">
                        We're working hard to bring you something amazing. This feature will be available soon.
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                        Stay Updated
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Interested in learning more about our upcoming features?
                        Get in touch with our team for updates and early access opportunities.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={handleContactUs}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
                        >
                            Contact Us
                        </button>
                        <button
                            onClick={handleGoHome}
                            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition duration-300"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>

                <div className="text-sm text-gray-500">
                    <p>Questions? Email us at <a href="mailto:connect@promindpsychiatry.com" className="text-blue-600 hover:underline">connect@promindpsychiatry.com</a></p>
                </div>
            </div>
        </div>
    );
};

export default ComingSoonPage;