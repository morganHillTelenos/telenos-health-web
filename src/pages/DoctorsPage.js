// src/pages/DoctorsPage.js - Fixed version with Cognito authentication
import React, { useState, useEffect } from 'react';
import { Plus, Search, User, Phone, Award, Clock, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';

const DoctorsPage = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        specialty: '',
        licenseNumber: '',
        phone: '',
        credentials: [],
        yearsOfExperience: '',
        bio: '',
        isActive: true
    });

    // Auth check on component mount
    useEffect(() => {
        checkAuthentication();
        loadDoctors();
    }, []);

    const checkAuthentication = async () => {
        try {
            const { getCurrentUser } = await import('aws-amplify/auth');
            const user = await getCurrentUser();
            setCurrentUser(user);
            console.log('👤 Current user:', user);
        } catch (error) {
            console.error('❌ Authentication check failed:', error);
            setError('Please sign in to access the doctors page');
        }
    };

    const loadDoctors = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('📋 Loading doctors...');
            const result = await apiService.getDoctors({ limit: 50 });

            console.log('✅ Doctors loaded:', result.data);
            setDoctors(result.data || []);

        } catch (error) {
            console.error('❌ Error loading doctors:', error);
            setError(error.message || 'Failed to load doctors');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCredentialsChange = (e) => {
        const credentials = e.target.value.split(',').map(cred => cred.trim()).filter(cred => cred);
        setFormData(prev => ({ ...prev, credentials }));
    };

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            specialty: '',
            licenseNumber: '',
            phone: '',
            credentials: [],
            yearsOfExperience: '',
            bio: '',
            isActive: true
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError(null);

            // Prepare data for submission
            const doctorData = {
                ...formData,
                yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : undefined
            };

            console.log('📝 Creating doctor:', doctorData);

            const result = await apiService.createDoctor(doctorData);

            if (result.success) {
                console.log('✅ Doctor created successfully:', result.data);
                setDoctors(prev => [...prev, result.data]);
                setShowAddForm(false);
                resetForm();
            }

        } catch (error) {
            console.error('❌ Error creating doctor:', error);
            setError(error.message || 'Failed to create doctor');
        } finally {
            setLoading(false);
        }
    };

    // Filter doctors based on search term
    const filteredDoctors = doctors.filter(doctor =>
        doctor?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor?.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Debug section
    const handleTestConnection = async () => {
        try {
            setError(null);
            console.log('🧪 Testing connection...');
            await apiService.testConnection();
            alert('✅ Connection test successful!');
        } catch (error) {
            console.error('❌ Connection test failed:', error);
            setError('Connection test failed: ' + error.message);
        }
    };

    const handleTestCreateDoctor = async () => {
        try {
            setError(null);
            const testDoctor = {
                firstName: 'Test',
                lastName: 'Doctor',
                email: `test.doctor.${Date.now()}@example.com`,
                specialty: 'General Psychiatry',
                licenseNumber: `TEST${Date.now()}`,
                phone: '+1234567890',
                credentials: ['MD', 'Board Certified'],
                yearsOfExperience: 5,
                bio: 'Test doctor created for debugging',
                isActive: true
            };

            console.log('🧪 Creating test doctor:', testDoctor);
            const result = await apiService.createDoctor(testDoctor);

            if (result.success) {
                console.log('✅ Test doctor created:', result.data);
                setDoctors(prev => [...prev, result.data]);
                alert('✅ Test doctor created successfully!');
            }
        } catch (error) {
            console.error('❌ Test doctor creation failed:', error);
            setError('Test doctor creation failed: ' + error.message);
        }
    };

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
                <div className="max-w-md mx-auto mt-20 bg-white rounded-2xl border border-gray-200/50 p-8 shadow-lg">
                    <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Required</h2>
                        <p className="text-gray-600 mb-4">Please sign in to access the doctors page.</p>
                        <button
                            onClick={() => window.location.href = '/login'}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Doctors & Providers</h1>
                            <p className="text-sm text-gray-600">
                                Manage healthcare providers and their information
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowAddForm(!showAddForm)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Doctor
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            <span>{error}</span>
                            <button
                                onClick={loadDoctors}
                                className="ml-auto text-red-600 hover:text-red-800 underline"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {/* Debug Section */}
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-800 mb-2">🔧 Debug Tools</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={handleTestConnection}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                        >
                            Test Connection
                        </button>
                        <button
                            onClick={handleTestCreateDoctor}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                        >
                            Create Test Doctor
                        </button>
                        <button
                            onClick={loadDoctors}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                        >
                            Reload Doctors
                        </button>
                    </div>
                    <p className="text-yellow-700 text-sm mt-2">
                        Current user: {currentUser?.username || 'Not authenticated'} |
                        Doctors loaded: {doctors.length}
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-sm font-medium text-gray-600">Total Doctors</div>
                            <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{doctors.length}</div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-sm font-medium text-gray-600">Active Doctors</div>
                            <Award className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900">
                            {doctors.filter(d => d.isActive).length}
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-sm font-medium text-gray-600">Specialties</div>
                            <Clock className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900">
                            {new Set(doctors.map(d => d.specialty)).size}
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-sm font-medium text-gray-600">Avg Experience</div>
                            <Clock className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900">
                            {doctors.length > 0
                                ? Math.round(doctors.reduce((sum, d) => sum + (d.yearsOfExperience || 0), 0) / doctors.length)
                                : 0}y
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search doctors by name, specialty, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Add Doctor Form */}
                {showAddForm && (
                    <div className="mb-8 bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Doctor</h3>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Specialty *
                                </label>
                                <select
                                    name="specialty"
                                    value={formData.specialty}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select Specialty</option>
                                    <option value="General Psychiatry">General Psychiatry</option>
                                    <option value="Child & Adolescent Psychiatry">Child & Adolescent Psychiatry</option>
                                    <option value="Addiction Psychiatry">Addiction Psychiatry</option>
                                    <option value="Geriatric Psychiatry">Geriatric Psychiatry</option>
                                    <option value="Forensic Psychiatry">Forensic Psychiatry</option>
                                    <option value="Consultation-Liaison Psychiatry">Consultation-Liaison Psychiatry</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    License Number *
                                </label>
                                <input
                                    type="text"
                                    name="licenseNumber"
                                    value={formData.licenseNumber}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="+1234567890"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Years of Experience
                                </label>
                                <input
                                    type="number"
                                    name="yearsOfExperience"
                                    value={formData.yearsOfExperience}
                                    onChange={handleInputChange}
                                    min="0"
                                    max="50"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Credentials (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={formData.credentials.join(', ')}
                                    onChange={handleCredentialsChange}
                                    placeholder="MD, Board Certified, PhD"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bio
                                </label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Brief professional biography..."
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                        className="mr-2"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Active Doctor</span>
                                </label>
                            </div>

                            <div className="md:col-span-2 flex gap-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                >
                                    {loading ? 'Creating...' : 'Create Doctor'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddForm(false);
                                        resetForm();
                                    }}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Doctors List */}
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Doctors ({filteredDoctors.length})
                        </h3>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600">Loading doctors...</span>
                        </div>
                    ) : filteredDoctors.length === 0 ? (
                        <div className="text-center py-12">
                            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
                            <p className="text-gray-600 mb-4">
                                {searchTerm ? 'No doctors match your search criteria.' : 'Get started by adding your first doctor.'}
                            </p>
                            {!searchTerm && (
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Add First Doctor
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredDoctors.map((doctor) => (
                                <div key={doctor.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="text-lg font-semibold text-gray-900">
                                                    Dr. {doctor.firstName} {doctor.lastName}
                                                </h4>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${doctor.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {doctor.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Award className="w-4 h-4" />
                                                    <span>{doctor.specialty}</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4" />
                                                    <span>{doctor.phone || 'No phone'}</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{doctor.yearsOfExperience || 0} years experience</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4" />
                                                    <span>License: {doctor.licenseNumber}</span>
                                                </div>
                                            </div>

                                            {doctor.credentials && doctor.credentials.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {doctor.credentials.map((cred, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                                        >
                                                            {cred}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {doctor.bio && (
                                                <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                                                    {doctor.bio}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorsPage;