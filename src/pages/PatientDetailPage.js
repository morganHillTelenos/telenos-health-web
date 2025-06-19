import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Phone, Mail, Calendar, User, Heart, AlertTriangle, Pill, Shield, Clock, FileText, Save, X } from 'lucide-react';
import { apiService } from '../services/api';

const PatientDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (id) {
            loadPatientData();
        }
    }, [id]);

    const loadPatientData = async () => {
        setLoading(true);
        setError('');

        try {
            console.log('Loading patient data for ID:', id);
            const result = await apiService.getPatient(id);
            console.log('Patient data loaded:', result);

            if (result?.data) {
                setPatient(result.data);
                // Initialize edit form with current data
                setEditFormData({
                    firstName: result.data.firstName || '',
                    lastName: result.data.lastName || '',
                    email: result.data.email || '',
                    phone: result.data.phone || '',
                    dateOfBirth: result.data.dateOfBirth || '',
                    address: result.data.address || '',
                    city: result.data.city || '',
                    state: result.data.state || '',
                    zipCode: result.data.zipCode || '',
                    emergencyContact: result.data.emergencyContact || '',
                    emergencyPhone: result.data.emergencyPhone || '',
                    medicalHistory: result.data.medicalHistory || '',
                    allergies: result.data.allergies || '',
                    medications: result.data.medications || '',
                    insuranceProvider: result.data.insuranceProvider || '',
                    insuranceNumber: result.data.insuranceNumber || ''
                });
            } else {
                setError('Patient not found');
            }
        } catch (error) {
            console.error('Error loading patient:', error);
            setError('Failed to load patient data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        // Reset form data to original patient data
        setEditFormData({
            firstName: patient.firstName || '',
            lastName: patient.lastName || '',
            email: patient.email || '',
            phone: patient.phone || '',
            dateOfBirth: patient.dateOfBirth || '',
            address: patient.address || '',
            city: patient.city || '',
            state: patient.state || '',
            zipCode: patient.zipCode || '',
            emergencyContact: patient.emergencyContact || '',
            emergencyPhone: patient.emergencyPhone || '',
            medicalHistory: patient.medicalHistory || '',
            allergies: patient.allergies || '',
            medications: patient.medications || '',
            insuranceProvider: patient.insuranceProvider || '',
            insuranceNumber: patient.insuranceNumber || ''
        });
    };

    const handleSaveEdit = async () => {
        setSaving(true);
        try {
            console.log('Saving patient updates:', editFormData);
            const result = await apiService.updatePatient(id, editFormData);
            console.log('Patient updated:', result);

            if (result?.data) {
                setPatient(result.data);
                setIsEditing(false);
                alert('Patient information updated successfully!');
            } else {
                throw new Error('Failed to update patient');
            }
        } catch (error) {
            console.error('Error updating patient:', error);
            alert('Failed to update patient. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Helper function to format date
    const formatDate = (dateString) => {
        if (!dateString) return 'Not provided';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    // Helper function to get patient display name
    const getPatientDisplayName = (patientData) => {
        const firstName = patientData?.firstName || '';
        const lastName = patientData?.lastName || '';
        return `${firstName} ${lastName}`.trim() || 'Unknown Patient';
    };

    // Helper function to calculate age
    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return 'Unknown';
        try {
            const birth = new Date(dateOfBirth);
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                age--;
            }
            return age;
        } catch (error) {
            return 'Unknown';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <div className="text-lg font-semibold text-gray-900">Loading Patient...</div>
                    <div className="text-sm text-gray-500">Fetching data from AWS backend...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="container mx-auto px-6 py-8 pt-20">
                    <button
                        onClick={() => navigate('/patients')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Patients
                    </button>
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Error Loading Patient</h3>
                        <p>{error}</p>
                        <button
                            onClick={loadPatientData}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="container mx-auto px-6 py-8 pt-20">
                    <button
                        onClick={() => navigate('/patients')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Patients
                    </button>
                    <div className="text-center py-12">
                        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Patient Not Found</h3>
                        <p className="text-gray-600">The requested patient could not be found.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="container mx-auto px-6 py-8 pt-20">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/patients')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back to Patients
                        </button>
                    </div>

                    <div className="flex gap-3">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleCancelEdit}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    disabled={saving}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleEdit}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Edit className="w-4 h-4" />
                                Edit Patient
                            </button>
                        )}
                    </div>
                </div>

                {/* Patient Header Card */}
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-8 shadow-lg mb-8">
                    <div className="flex items-start gap-6">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-10 h-10 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {getPatientDisplayName(patient)}
                            </h1>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    {patient.email || 'No email provided'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    {patient.phone || 'No phone provided'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Age {calculateAge(patient.dateOfBirth)} • Born {formatDate(patient.dateOfBirth)}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500 mb-1">Patient ID</div>
                            <div className="font-mono text-sm">{patient.id?.slice(-8) || 'Unknown'}</div>
                            <div className="text-sm text-gray-500 mt-2">Added</div>
                            <div className="text-sm">{formatDate(patient.createdAt)}</div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {[
                                { id: 'overview', label: 'Overview', icon: User },
                                { id: 'medical', label: 'Medical Info', icon: Heart },
                                { id: 'insurance', label: 'Insurance', icon: Shield }
                            ].map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id)}
                                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Personal Information */}
                        <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                            <div className="space-y-4">
                                {isEditing ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={editFormData.firstName}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={editFormData.lastName}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={editFormData.email}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={editFormData.phone}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                            <input
                                                type="date"
                                                name="dateOfBirth"
                                                value={editFormData.dateOfBirth}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Name:</span>
                                            <span className="font-medium">{getPatientDisplayName(patient)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Email:</span>
                                            <span className="font-medium">{patient.email || 'Not provided'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Phone:</span>
                                            <span className="font-medium">{patient.phone || 'Not provided'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Date of Birth:</span>
                                            <span className="font-medium">{formatDate(patient.dateOfBirth)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Age:</span>
                                            <span className="font-medium">{calculateAge(patient.dateOfBirth)} years old</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Contact & Address */}
                        <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact & Address</h3>
                            <div className="space-y-4">
                                {isEditing ? (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={editFormData.address}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={editFormData.city}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                                <input
                                                    type="text"
                                                    name="state"
                                                    value={editFormData.state}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                                            <input
                                                type="text"
                                                name="zipCode"
                                                value={editFormData.zipCode}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                                            <input
                                                type="text"
                                                name="emergencyContact"
                                                value={editFormData.emergencyContact}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Phone</label>
                                            <input
                                                type="tel"
                                                name="emergencyPhone"
                                                value={editFormData.emergencyPhone}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Address:</span>
                                            <span className="font-medium text-right">{patient.address || 'Not provided'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">City:</span>
                                            <span className="font-medium">{patient.city || 'Not provided'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">State:</span>
                                            <span className="font-medium">{patient.state || 'Not provided'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">ZIP Code:</span>
                                            <span className="font-medium">{patient.zipCode || 'Not provided'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Emergency Contact:</span>
                                            <span className="font-medium">{patient.emergencyContact || 'Not provided'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Emergency Phone:</span>
                                            <span className="font-medium">{patient.emergencyPhone || 'Not provided'}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'medical' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
                            <div className="space-y-4">
                                {isEditing ? (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                                            <textarea
                                                name="allergies"
                                                value={editFormData.allergies}
                                                onChange={handleInputChange}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="List any known allergies..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Medications</label>
                                            <textarea
                                                name="medications"
                                                value={editFormData.medications}
                                                onChange={handleInputChange}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="List current medications..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Medical History</label>
                                            <textarea
                                                name="medicalHistory"
                                                value={editFormData.medicalHistory}
                                                onChange={handleInputChange}
                                                rows={4}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Describe medical history..."
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                                <span className="font-medium text-gray-900">Allergies</span>
                                            </div>
                                            <p className="text-gray-600 pl-6">{patient.allergies || 'No known allergies'}</p>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Pill className="w-4 h-4 text-blue-500" />
                                                <span className="font-medium text-gray-900">Current Medications</span>
                                            </div>
                                            <p className="text-gray-600 pl-6">{patient.medications || 'No current medications'}</p>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <FileText className="w-4 h-4 text-green-500" />
                                                <span className="font-medium text-gray-900">Medical History</span>
                                            </div>
                                            <p className="text-gray-600 pl-6">{patient.medicalHistory || 'No medical history recorded'}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                            <div className="space-y-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">{calculateAge(patient.dateOfBirth)}</div>
                                    <div className="text-sm text-gray-600">Years Old</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">0</div>
                                    <div className="text-sm text-gray-600">Appointments</div>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <Clock className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                                    <div className="text-sm text-gray-600">Last Visit</div>
                                    <div className="text-xs text-gray-500">No visits recorded</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'insurance' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Insurance Information</h3>
                            <div className="space-y-4">
                                {isEditing ? (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Provider</label>
                                            <input
                                                type="text"
                                                name="insuranceProvider"
                                                value={editFormData.insuranceProvider}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="e.g. Blue Cross Blue Shield"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Number</label>
                                            <input
                                                type="text"
                                                name="insuranceNumber"
                                                value={editFormData.insuranceNumber}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Policy/Member ID"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Provider:</span>
                                            <span className="font-medium">{patient.insuranceProvider || 'Not provided'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Policy Number:</span>
                                            <span className="font-medium font-mono">{patient.insuranceNumber || 'Not provided'}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Status:</span>
                                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                        Active
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Created:</span>
                                    <span className="font-medium">{formatDate(patient.createdAt)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Last Updated:</span>
                                    <span className="font-medium">{formatDate(patient.updatedAt)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Record ID:</span>
                                    <span className="font-mono text-xs">{patient.id}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Debug Info for Development */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                        <h4 className="font-semibold mb-2">Debug Info:</h4>
                        <pre className="text-xs overflow-x-auto">{JSON.stringify(patient, null, 2)}</pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientDetailPage;