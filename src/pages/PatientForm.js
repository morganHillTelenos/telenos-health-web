// src/pages/PatientForm.js - Professional Patient Management Form
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const PatientForm = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // For editing existing patient
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        dateOfBirth: '',
        phone: '',
        isActive: true
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [loadingPatient, setLoadingPatient] = useState(isEditing);

    // Helper function for API config
    const ensureCorrectConfig = async () => {
        const { Amplify } = await import('aws-amplify');
        const correctConfig = {
            API: {
                GraphQL: {
                    endpoint: 'https://soa7zc2v7zbjlbgxe6fwzuxqeq.appsync-api.us-east-1.amazonaws.com/graphql',
                    region: 'us-east-1',
                    defaultAuthMode: 'apiKey',
                    apiKey: 'da2-jw2kvaofe5bmhappt6l6zyalje'
                }
            }
        };
        Amplify.configure(correctConfig);

        const { generateClient } = await import('aws-amplify/api');
        return generateClient({ authMode: 'apiKey' });
    };

    // Load patient for editing
    useEffect(() => {
        if (isEditing) {
            loadPatient();
        }
    }, [id, isEditing]);

    const loadPatient = async () => {
        try {
            const client = await ensureCorrectConfig();

            const result = await client.graphql({
                query: `
                    query GetPatient($id: ID!) {
                        getPatient(id: $id) {
                            id
                            firstName
                            lastName
                            email
                            dateOfBirth
                            phone
                            isActive
                        }
                    }
                `,
                variables: { id },
                authMode: 'apiKey'
            });

            if (result.data.getPatient) {
                const patient = result.data.getPatient;
                setFormData({
                    firstName: patient.firstName || '',
                    lastName: patient.lastName || '',
                    email: patient.email || '',
                    dateOfBirth: patient.dateOfBirth || '',
                    phone: patient.phone || '',
                    isActive: patient.isActive !== undefined ? patient.isActive : true
                });
            }
        } catch (error) {
            console.error('Error loading patient:', error);
            setErrors({ submit: 'Failed to load patient details' });
        }
        setLoadingPatient(false);
    };

    // Form validation
    const validateForm = () => {
        const newErrors = {};

        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.dateOfBirth.trim()) newErrors.dateOfBirth = 'Date of birth is required';

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Phone validation (if provided)
        if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        // Date validation
        if (formData.dateOfBirth) {
            const birthDate = new Date(formData.dateOfBirth);
            const today = new Date();
            if (birthDate >= today) {
                newErrors.dateOfBirth = 'Date of birth must be in the past';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            const client = await ensureCorrectConfig();

            if (isEditing) {
                // Update existing patient
                await client.graphql({
                    query: `
                        mutation UpdatePatient($input: UpdatePatientInput!) {
                            updatePatient(input: $input) {
                                id
                                firstName
                                lastName
                            }
                        }
                    `,
                    variables: {
                        input: {
                            id: id,
                            ...formData
                        }
                    },
                    authMode: 'apiKey'
                });

                navigate('/patients', { state: { message: 'Patient updated successfully!' } });
            } else {
                // Create new patient
                await client.graphql({
                    query: `
                        mutation CreatePatient($input: CreatePatientInput!) {
                            createPatient(input: $input) {
                                id
                                firstName
                                lastName
                            }
                        }
                    `,
                    variables: { input: formData },
                    authMode: 'apiKey'
                });

                navigate('/patients', { state: { message: 'Patient created successfully!' } });
            }

        } catch (error) {
            console.error('Error saving patient:', error);
            setErrors({ submit: 'Failed to save patient. Please try again.' });
        }

        setLoading(false);
    };

    // Handle delete
    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
            return;
        }

        setLoading(true);

        try {
            const client = await ensureCorrectConfig();

            await client.graphql({
                query: `
                    mutation DeletePatient($input: DeletePatientInput!) {
                        deletePatient(input: $input) {
                            id
                        }
                    }
                `,
                variables: { input: { id: id } },
                authMode: 'apiKey'
            });

            navigate('/patients', { state: { message: 'Patient deleted successfully!' } });

        } catch (error) {
            console.error('Error deleting patient:', error);
            setErrors({ submit: 'Failed to delete patient. Please try again.' });
        }

        setLoading(false);
    };

    // Loading state for editing
    if (loadingPatient) {
        return (
            <div style={{
                maxWidth: '600px',
                margin: '0 auto',
                padding: '24px',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
                <p>Loading patient details...</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <button
                    onClick={() => navigate('/patients')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        backgroundColor: '#f3f4f6',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        color: '#374151',
                        fontSize: '14px',
                        cursor: 'pointer',
                        marginBottom: '20px'
                    }}
                >
                    ← Back to Patients
                </button>

                <div style={{
                    backgroundColor: 'white',
                    padding: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e5e7eb'
                }}>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: '700',
                        color: '#1f2937',
                        margin: '0 0 8px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        👥 {isEditing ? 'Edit Patient' : 'Add New Patient'}
                    </h1>
                    <p style={{ color: '#6b7280', margin: 0, fontSize: '16px' }}>
                        {isEditing ? 'Update patient information in your healthcare system' : 'Add a new patient to your healthcare system'}
                    </p>
                </div>
            </div>

            {/* Form */}
            <div style={{
                backgroundColor: 'white',
                padding: '32px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb'
            }}>
                <form onSubmit={handleSubmit}>
                    {/* Name Fields */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                                First Name *
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="Enter first name"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: errors.firstName ? '2px solid #ef4444' : '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    backgroundColor: errors.firstName ? '#fef2f2' : 'white'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = errors.firstName ? '#ef4444' : '#d1d5db'}
                            />
                            {errors.firstName && (
                                <p style={{ color: '#ef4444', fontSize: '12px', margin: '6px 0 0 0' }}>
                                    {errors.firstName}
                                </p>
                            )}
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                                Last Name *
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Enter last name"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: errors.lastName ? '2px solid #ef4444' : '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    backgroundColor: errors.lastName ? '#fef2f2' : 'white'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = errors.lastName ? '#ef4444' : '#d1d5db'}
                            />
                            {errors.lastName && (
                                <p style={{ color: '#ef4444', fontSize: '12px', margin: '6px 0 0 0' }}>
                                    {errors.lastName}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Email */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                            Email Address *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="patient@email.com"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: errors.email ? '2px solid #ef4444' : '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                backgroundColor: errors.email ? '#fef2f2' : 'white'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = errors.email ? '#ef4444' : '#d1d5db'}
                        />
                        {errors.email && (
                            <p style={{ color: '#ef4444', fontSize: '12px', margin: '6px 0 0 0' }}>
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Date of Birth and Phone */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                                Date of Birth *
                            </label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: errors.dateOfBirth ? '2px solid #ef4444' : '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    backgroundColor: errors.dateOfBirth ? '#fef2f2' : 'white'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = errors.dateOfBirth ? '#ef4444' : '#d1d5db'}
                            />
                            {errors.dateOfBirth && (
                                <p style={{ color: '#ef4444', fontSize: '12px', margin: '6px 0 0 0' }}>
                                    {errors.dateOfBirth}
                                </p>
                            )}
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="(555) 123-4567"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: errors.phone ? '2px solid #ef4444' : '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    backgroundColor: errors.phone ? '#fef2f2' : 'white'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = errors.phone ? '#ef4444' : '#d1d5db'}
                            />
                            {errors.phone && (
                                <p style={{ color: '#ef4444', fontSize: '12px', margin: '6px 0 0 0' }}>
                                    {errors.phone}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Active Status */}
                    <div style={{ marginBottom: '32px' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: '#374151',
                            padding: '16px',
                            backgroundColor: '#f9fafb',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb'
                        }}>
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                style={{
                                    width: '18px',
                                    height: '18px',
                                    accentColor: '#3b82f6'
                                }}
                            />
                            <div>
                                <span style={{ fontWeight: '600' }}>Active Patient</span>
                                <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px' }}>
                                    Patient can be assigned to appointments and receive care
                                </div>
                            </div>
                        </label>
                    </div>

                    {/* Error Message */}
                    {errors.submit && (
                        <div style={{
                            padding: '16px',
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            marginBottom: '24px'
                        }}>
                            <p style={{ color: '#ef4444', margin: 0, fontSize: '14px', fontWeight: '500' }}>
                                {errors.submit}
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '16px',
                        paddingTop: '24px',
                        borderTop: '1px solid #e5e7eb'
                    }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                type="button"
                                onClick={() => navigate('/patients')}
                                disabled={loading}
                                style={{
                                    padding: '12px 24px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    backgroundColor: 'white',
                                    color: '#374151',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.6 : 1
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    padding: '12px 24px',
                                    border: 'none',
                                    borderRadius: '8px',
                                    backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                {loading ? '⏳' : (isEditing ? '✏️' : '➕')}
                                {loading ? 'Saving...' : (isEditing ? 'Update Patient' : 'Add Patient')}
                            </button>
                        </div>

                        {isEditing && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={loading}
                                style={{
                                    padding: '12px 20px',
                                    border: 'none',
                                    borderRadius: '8px',
                                    backgroundColor: loading ? '#fca5a5' : '#ef4444',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: loading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                🗑️ Delete Patient
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PatientForm;