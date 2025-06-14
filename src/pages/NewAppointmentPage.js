import React from 'react';
const { useState, useEffect } = React;

const NewAppointmentPage = () => {
    const [patients, setPatients] = useState([]);
    const [formData, setFormData] = useState({
        patient: '',
        patientId: '',
        date: '',
        time: '',
        duration: '30',
        reason: '',
        notes: '',
        appointmentType: 'in-person'
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        loadPatients();
        setDefaultDate();
    }, []);

    const loadPatients = () => {
        // Mock patient data
        const mockPatients = [
            { id: '1', name: 'John Smith', email: 'john@email.com' },
            { id: '2', name: 'Sarah Johnson', email: 'sarah@email.com' },
            { id: '3', name: 'Michael Brown', email: 'michael@email.com' },
            { id: '4', name: 'Emily Davis', email: 'emily@email.com' },
            { id: '5', name: 'Robert Wilson', email: 'robert@email.com' }
        ];
        setPatients(mockPatients);
    };

    const setDefaultDate = () => {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        setFormData(prev => ({ ...prev, date: formattedDate }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'patient') {
            const selectedPatient = patients.find(p => p.name === value);
            setFormData(prev => ({
                ...prev,
                patient: value,
                patientId: selectedPatient ? selectedPatient.id : ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // Clear field error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.patient) {
            newErrors.patient = 'Please select a patient';
        }

        if (!formData.date) {
            newErrors.date = 'Please select a date';
        }

        if (!formData.time) {
            newErrors.time = 'Please select a time';
        }

        if (!formData.reason.trim()) {
            newErrors.reason = 'Please provide a reason for the visit';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        setSubmitError('');

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock successful creation
            const appointmentData = {
                id: Date.now().toString(),
                ...formData,
                status: 'scheduled',
                videoCallEnabled: formData.appointmentType === 'video',
                hipaaCompliant: true,
                createdAt: new Date().toISOString(),
            };

            setShowSuccess(true);
            setTimeout(() => {
                // In a real app, you'd navigate to calendar here
                window.history.back();
            }, 2000);

        } catch (err) {
            setSubmitError('Failed to schedule appointment. Please try again.');
            console.error('Error saving appointment:', err);
        } finally {
            setLoading(false);
        }
    };

    const clearForm = () => {
        setFormData({
            patient: '',
            patientId: '',
            date: new Date().toISOString().split('T')[0],
            time: '',
            duration: '30',
            reason: '',
            notes: '',
            appointmentType: 'in-person'
        });
        setErrors({});
        setSubmitError('');
    };

    const getTimeSlots = () => {
        const slots = [];
        for (let hour = 8; hour < 18; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                slots.push(timeString);
            }
        }
        return slots;
    };

    const formatTimeSlot = (timeString) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    if (showSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-12 text-center shadow-2xl border border-gray-200/50 max-w-md w-full mx-4">
                    <div className="text-6xl mb-6">✅</div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Appointment Scheduled!</h2>
                    <p className="text-gray-600 mb-6">
                        Successfully scheduled appointment with {formData.patient} for {formData.date} at {formatTimeSlot(formData.time)}.
                    </p>
                    <div className="bg-green-100 text-green-700 p-4 rounded-xl">
                        <p className="text-sm font-semibold">Redirecting to calendar...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 px-6 py-6 sticky top-0 z-50 shadow-sm">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                            <span className="text-white text-xl">📅</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Schedule New Appointment</h1>
                            <p className="text-gray-600 text-sm font-medium">
                                Create a secure, HIPAA-compliant patient appointment
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => window.history.back()}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
                    >
                        ← Back to Calendar
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-6">
                {/* Form */}
                <div className="space-y-8">
                    {submitError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">⚠️</span>
                                <span className="font-semibold">{submitError}</span>
                            </div>
                        </div>
                    )}

                    {/* Appointment Details Section */}
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-8 shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-blue-600 text-lg">📋</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Appointment Details</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Patient Selection */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Patient *
                                </label>
                                <select
                                    name="patient"
                                    value={formData.patient}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${errors.patient
                                        ? 'border-red-300 bg-red-50'
                                        : 'border-gray-200 focus:border-blue-500 bg-white'
                                        }`}
                                    required
                                >
                                    <option value="">Select a patient</option>
                                    {patients.map(patient => (
                                        <option key={patient.id} value={patient.name}>
                                            {patient.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.patient && (
                                    <p className="text-red-600 text-sm font-medium">{errors.patient}</p>
                                )}
                            </div>

                            {/* Appointment Type */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Appointment Type *
                                </label>
                                <select
                                    name="appointmentType"
                                    value={formData.appointmentType}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                    required
                                >
                                    <option value="in-person">🏥 In-Person Visit</option>
                                    <option value="video">🎥 Video Consultation</option>
                                </select>
                            </div>

                            {/* Date */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    min={new Date().toISOString().split('T')[0]}
                                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${errors.date
                                        ? 'border-red-300 bg-red-50'
                                        : 'border-gray-200 focus:border-blue-500 bg-white'
                                        }`}
                                    required
                                />
                                {errors.date && (
                                    <p className="text-red-600 text-sm font-medium">{errors.date}</p>
                                )}
                            </div>

                            {/* Time */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Time *
                                </label>
                                <select
                                    name="time"
                                    value={formData.time}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${errors.time
                                        ? 'border-red-300 bg-red-50'
                                        : 'border-gray-200 focus:border-blue-500 bg-white'
                                        }`}
                                    required
                                >
                                    <option value="">Select time</option>
                                    {getTimeSlots().map(slot => (
                                        <option key={slot} value={slot}>
                                            {formatTimeSlot(slot)}
                                        </option>
                                    ))}
                                </select>
                                {errors.time && (
                                    <p className="text-red-600 text-sm font-medium">{errors.time}</p>
                                )}
                            </div>

                            {/* Duration */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Duration (minutes) *
                                </label>
                                <select
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    className="w-full md:w-1/3 px-4 py-3 border-2 border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                    required
                                >
                                    <option value="15">15 minutes</option>
                                    <option value="30">30 minutes</option>
                                    <option value="45">45 minutes</option>
                                    <option value="60">60 minutes</option>
                                    <option value="90">90 minutes</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Visit Information Section */}
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-8 shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <span className="text-purple-600 text-lg">📝</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Visit Information</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Reason for Visit */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Reason for Visit *
                                </label>
                                <textarea
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleInputChange}
                                    placeholder="Describe the reason for this appointment..."
                                    disabled={loading}
                                    rows="4"
                                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 resize-none ${errors.reason
                                        ? 'border-red-300 bg-red-50'
                                        : 'border-gray-200 focus:border-blue-500 bg-white'
                                        }`}
                                    required
                                />
                                {errors.reason && (
                                    <p className="text-red-600 text-sm font-medium">{errors.reason}</p>
                                )}
                            </div>

                            {/* Additional Notes */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Additional Notes
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    placeholder="Any additional notes or special instructions..."
                                    disabled={loading}
                                    rows="3"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Video Session Info */}
                    {formData.appointmentType === 'video' && (
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-2xl">🎥</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Video Consultation Included</h3>
                                    <p className="text-gray-700 mb-4 leading-relaxed">
                                        This appointment will include a secure, HIPAA-compliant video consultation.
                                        The patient will receive a join link automatically via email.
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        <span className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                                            🔒 HIPAA Compliant
                                        </span>
                                        <span className="bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                                            📱 No Download Required
                                        </span>
                                        <span className="bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                                            🔐 End-to-End Encrypted
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Form Actions */}
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-8 shadow-lg">
                        <div className="flex flex-col sm:flex-row gap-4 justify-end">
                            <button
                                type="button"
                                onClick={clearForm}
                                disabled={loading}
                                className="px-8 py-4 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Clear Form
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-blue-500/25"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Scheduling...
                                    </>
                                ) : (
                                    <>
                                        <span>📅</span>
                                        Schedule Appointment
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <button className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 hover:scale-105 shadow-lg">
                            <span className="text-2xl">👤</span>
                            <div className="text-left">
                                <div className="font-semibold">Add New Patient</div>
                                <div className="text-emerald-100 text-sm">Register a new patient first</div>
                            </div>
                        </button>
                        <button className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl transition-all duration-200 hover:scale-105 shadow-lg">
                            <span className="text-2xl">📋</span>
                            <div className="text-left">
                                <div className="font-semibold">View All Patients</div>
                                <div className="text-purple-100 text-sm">Browse patient records</div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewAppointmentPage;
//test