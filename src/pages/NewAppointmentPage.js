// pages/NewAppointmentPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NewAppointmentPage = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [formData, setFormData] = useState({
        patient: '',
        patientId: '',
        date: '',
        time: '',
        duration: '30',
        reason: '',
        notes: '',
        appointmentType: 'in-person' // or 'video'
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        loadPatients();
        setDefaultDate();
    }, []);

    const loadPatients = () => {
        try {
            // Load patients from localStorage (mock data)
            const storedPatients = localStorage.getItem('patients');
            if (storedPatients) {
                setPatients(JSON.parse(storedPatients));
            } else {
                // Default patients if none exist
                const defaultPatients = [
                    { id: '1', name: 'John Smith', email: 'john@email.com' },
                    { id: '2', name: 'Sarah Johnson', email: 'sarah@email.com' },
                    { id: '3', name: 'Michael Brown', email: 'michael@email.com' }
                ];
                setPatients(defaultPatients);
                localStorage.setItem('patients', JSON.stringify(defaultPatients));
            }
        } catch (error) {
            console.error('Error loading patients:', error);
        }
    };

    const setDefaultDate = () => {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        setFormData(prev => ({ ...prev, date: formattedDate }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Special handling for patient selection
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

        // Clear specific field error when user starts typing
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

        // Validate form
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        setSubmitError('');

        try {
            // Create appointment object
            const appointmentData = {
                id: Date.now().toString(),
                ...formData,
                status: 'scheduled',
                videoCallEnabled: formData.appointmentType === 'video',
                hipaaCompliant: true,
                createdAt: new Date().toISOString(),
            };

            // Save to localStorage (mock database)
            const existingAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
            existingAppointments.push(appointmentData);
            localStorage.setItem('appointments', JSON.stringify(existingAppointments));

            // Show success and navigate
            alert(`Appointment scheduled successfully for ${appointmentData.patient}!`);
            navigate('/calendar');

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

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Schedule New Appointment</h1>
                    <p style={styles.subtitle}>
                        Create a new patient appointment with secure video consultation
                    </p>
                </div>
                <button
                    style={styles.backButton}
                    onClick={() => navigate('/calendar')}
                >
                    ← Back to Calendar
                </button>
            </div>

            {/* Form */}
            <form style={styles.form} onSubmit={handleSubmit}>
                {submitError && (
                    <div style={styles.errorMessage}>
                        {submitError}
                    </div>
                )}

                <div style={styles.formSection}>
                    <h2 style={styles.sectionTitle}>Appointment Details</h2>

                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="patient">
                                Patient *
                            </label>
                            <select
                                id="patient"
                                name="patient"
                                style={{
                                    ...styles.input,
                                    ...(errors.patient ? styles.inputError : {})
                                }}
                                value={formData.patient}
                                onChange={handleInputChange}
                                disabled={loading}
                                required
                            >
                                <option value="">Select a patient</option>
                                {patients.map(patient => (
                                    <option key={patient.id} value={patient.name}>
                                        {patient.name}
                                    </option>
                                ))}
                            </select>
                            {errors.patient && <div style={styles.fieldError}>{errors.patient}</div>}
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="appointmentType">
                                Appointment Type *
                            </label>
                            <select
                                id="appointmentType"
                                name="appointmentType"
                                style={styles.input}
                                value={formData.appointmentType}
                                onChange={handleInputChange}
                                disabled={loading}
                                required
                            >
                                <option value="in-person">In-Person Visit</option>
                                <option value="video">Video Consultation</option>
                            </select>
                        </div>
                    </div>

                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="date">
                                Date *
                            </label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                style={{
                                    ...styles.input,
                                    ...(errors.date ? styles.inputError : {})
                                }}
                                value={formData.date}
                                onChange={handleInputChange}
                                disabled={loading}
                                min={new Date().toISOString().split('T')[0]}
                                required
                            />
                            {errors.date && <div style={styles.fieldError}>{errors.date}</div>}
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="time">
                                Time *
                            </label>
                            <select
                                id="time"
                                name="time"
                                style={{
                                    ...styles.input,
                                    ...(errors.time ? styles.inputError : {})
                                }}
                                value={formData.time}
                                onChange={handleInputChange}
                                disabled={loading}
                                required
                            >
                                <option value="">Select time</option>
                                {getTimeSlots().map(slot => (
                                    <option key={slot} value={slot}>
                                        {formatTimeSlot(slot)}
                                    </option>
                                ))}
                            </select>
                            {errors.time && <div style={styles.fieldError}>{errors.time}</div>}
                        </div>
                    </div>

                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="duration">
                                Duration (minutes) *
                            </label>
                            <select
                                id="duration"
                                name="duration"
                                style={styles.input}
                                value={formData.duration}
                                onChange={handleInputChange}
                                disabled={loading}
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

                    <div style={styles.formGroup}>
                        <label style={styles.label} htmlFor="reason">
                            Reason for Visit *
                        </label>
                        <textarea
                            id="reason"
                            name="reason"
                            style={{
                                ...styles.textarea,
                                ...(errors.reason ? styles.inputError : {})
                            }}
                            value={formData.reason}
                            onChange={handleInputChange}
                            placeholder="Describe the reason for this appointment"
                            disabled={loading}
                            rows="3"
                            required
                        />
                        {errors.reason && <div style={styles.fieldError}>{errors.reason}</div>}
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label} htmlFor="notes">
                            Additional Notes
                        </label>
                        <textarea
                            id="notes"
                            name="notes"
                            style={styles.textarea}
                            value={formData.notes}
                            onChange={handleInputChange}
                            placeholder="Any additional notes or special instructions"
                            disabled={loading}
                            rows="3"
                        />
                    </div>
                </div>

                {/* Video Session Info */}
                {formData.appointmentType === 'video' && (
                    <div style={styles.videoSessionInfo}>
                        <div style={styles.videoInfoIcon}>🎥</div>
                        <div>
                            <h3 style={styles.videoInfoTitle}>Video Session Included</h3>
                            <p style={styles.videoInfoText}>
                                This appointment will include a secure, HIPAA-compliant video consultation.
                                The patient will receive a join link automatically.
                            </p>
                            <div style={styles.videoFeatures}>
                                <span style={styles.featureBadge}>🔒 HIPAA Compliant</span>
                                <span style={styles.featureBadge}>📱 No Download Required</span>
                                <span style={styles.featureBadge}>🔐 End-to-End Encrypted</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form Actions */}
                <div style={styles.formActions}>
                    <button
                        type="button"
                        style={styles.secondaryButton}
                        onClick={clearForm}
                        disabled={loading}
                    >
                        Clear Form
                    </button>
                    <button
                        type="submit"
                        style={{
                            ...styles.primaryButton,
                            ...(loading ? styles.disabledButton : {})
                        }}
                        disabled={loading}
                    >
                        {loading ? 'Scheduling...' : 'Schedule Appointment'}
                    </button>
                </div>
            </form>

            {/* Quick Actions */}
            <div style={styles.quickActions}>
                <h3 style={styles.quickActionsTitle}>Quick Actions</h3>
                <div style={styles.quickActionsGrid}>
                    <button
                        style={styles.quickActionBtn}
                        onClick={() => navigate('/patients/new')}
                    >
                        <span style={styles.quickActionIcon}>👤</span>
                        <span style={styles.quickActionText}>Add New Patient</span>
                    </button>
                    <button
                        style={styles.quickActionBtn}
                        onClick={() => navigate('/patients')}
                    >
                        <span style={styles.quickActionIcon}>📋</span>
                        <span style={styles.quickActionText}>View All Patients</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// Styles object
const styles = {
    container: {
        minHeight: '100vh',
        background: '#F8FAFC',
        padding: '2rem 0',
    },

    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '800px',
        margin: '0 auto 2rem',
        padding: '0 2rem',
        flexWrap: 'wrap',
        gap: '1rem',
    },

    title: {
        fontSize: '2rem',
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: '0.5rem',
    },

    subtitle: {
        color: '#64748B',
        fontSize: '1rem',
    },

    backButton: {
        background: 'white',
        color: '#64748B',
        border: '1px solid #E2E8F0',
        padding: '0.75rem 1.5rem',
        borderRadius: '0.5rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },

    form: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '0 2rem',
    },

    formSection: {
        background: 'white',
        padding: '2rem',
        borderRadius: '0.75rem',
        border: '1px solid #F1F5F9',
        marginBottom: '2rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    },

    sectionTitle: {
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: '1.5rem',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid #F1F5F9',
    },

    formRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.5rem',
        marginBottom: '1.5rem',
    },

    formGroup: {
        marginBottom: '1.5rem',
    },

    label: {
        display: 'block',
        fontWeight: '500',
        color: '#374151',
        marginBottom: '0.5rem',
    },

    input: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #D1D5DB',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box',
    },

    textarea: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #D1D5DB',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        transition: 'border-color 0.2s',
        resize: 'vertical',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
    },

    inputError: {
        borderColor: '#EF4444',
        boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)',
    },

    fieldError: {
        color: '#EF4444',
        fontSize: '0.875rem',
        marginTop: '0.25rem',
    },

    errorMessage: {
        background: '#FEE2E2',
        color: '#DC2626',
        padding: '0.75rem',
        borderRadius: '0.5rem',
        border: '1px solid #FECACA',
        fontSize: '0.875rem',
        textAlign: 'center',
        marginBottom: '1.5rem',
    },

    videoSessionInfo: {
        background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
        border: '1px solid #BAE6FD',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        marginBottom: '2rem',
    },

    videoInfoIcon: {
        fontSize: '2rem',
        marginTop: '0.25rem',
    },

    videoInfoTitle: {
        fontSize: '1.125rem',
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: '0.5rem',
    },

    videoInfoText: {
        color: '#64748B',
        lineHeight: '1.6',
        marginBottom: '1rem',
    },

    videoFeatures: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
    },

    featureBadge: {
        background: '#DBEAFE',
        color: '#1E40AF',
        padding: '0.25rem 0.75rem',
        borderRadius: '0.375rem',
        fontSize: '0.75rem',
        fontWeight: '500',
    },

    formActions: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'flex-end',
        padding: '2rem',
        background: 'white',
        borderRadius: '0.75rem',
        border: '1px solid #F1F5F9',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem',
    },

    primaryButton: {
        background: '#3B82F6',
        color: 'white',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '0.5rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },

    secondaryButton: {
        background: 'white',
        color: '#64748B',
        border: '1px solid #E2E8F0',
        padding: '0.75rem 1.5rem',
        borderRadius: '0.5rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },

    disabledButton: {
        opacity: '0.6',
        cursor: 'not-allowed',
    },

    quickActions: {
        maxWidth: '800px',
        margin: '2rem auto 0',
        padding: '2rem',
        background: 'white',
        borderRadius: '0.75rem',
        border: '1px solid #F1F5F9',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    },

    quickActionsTitle: {
        fontSize: '1.125rem',
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: '1rem',
    },

    quickActionsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
    },

    quickActionBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '1rem',
        background: '#F8FAFC',
        border: '1px solid #E2E8F0',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },

    quickActionIcon: {
        fontSize: '1.25rem',
    },

    quickActionText: {
        fontWeight: '500',
        color: '#374151',
    },
};

export default NewAppointmentPage;