// src/components/DoctorForm.js - Professional Doctor Management Form
import React, { useState, useEffect } from 'react';

const DoctorForm = ({ doctorToEdit = null, onSave, onCancel, onDelete }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        specialty: '',
        experience: '',
        phone: '',
        bio: '',
        isActive: true
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Populate form if editing
    useEffect(() => {
        if (doctorToEdit) {
            setFormData({
                firstName: doctorToEdit.firstName || '',
                lastName: doctorToEdit.lastName || '',
                email: doctorToEdit.email || '',
                specialty: doctorToEdit.specialty || '',
                experience: doctorToEdit.experience || '',
                phone: doctorToEdit.phone || '',
                bio: doctorToEdit.bio || '',
                isActive: doctorToEdit.isActive !== undefined ? doctorToEdit.isActive : true
            });
        }
    }, [doctorToEdit]);

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

    // Form validation
    const validateForm = () => {
        const newErrors = {};

        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.specialty.trim()) newErrors.specialty = 'Specialty is required';

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Phone validation (if provided)
        if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
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

            if (doctorToEdit) {
                // Update existing doctor
                const result = await client.graphql({
                    query: `
                        mutation UpdateDoctor($input: UpdateDoctorInput!) {
                            updateDoctor(input: $input) {
                                id
                                firstName
                                lastName
                                email
                                specialty
                                experience
                                phone
                                bio
                                isActive
                                updatedAt
                            }
                        }
                    `,
                    variables: {
                        input: {
                            id: doctorToEdit.id,
                            ...formData
                        }
                    },
                    authMode: 'apiKey'
                });

                onSave && onSave(result.data.updateDoctor, 'updated');
            } else {
                // Create new doctor
                const result = await client.graphql({
                    query: `
                        mutation CreateDoctor($input: CreateDoctorInput!) {
                            createDoctor(input: $input) {
                                id
                                firstName
                                lastName
                                email
                                specialty
                                experience
                                phone
                                bio
                                isActive
                                createdAt
                            }
                        }
                    `,
                    variables: { input: formData },
                    authMode: 'apiKey'
                });

                onSave && onSave(result.data.createDoctor, 'created');
            }

            // Reset form if creating new
            if (!doctorToEdit) {
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    specialty: '',
                    experience: '',
                    phone: '',
                    bio: '',
                    isActive: true
                });
            }

        } catch (error) {
            console.error('Error saving doctor:', error);
            setErrors({ submit: 'Failed to save doctor. Please try again.' });
        }

        setLoading(false);
    };

    // Handle delete
    const handleDelete = async () => {
        if (!doctorToEdit || !window.confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) {
            return;
        }

        setLoading(true);

        try {
            const client = await ensureCorrectConfig();

            await client.graphql({
                query: `
                    mutation DeleteDoctor($input: DeleteDoctorInput!) {
                        deleteDoctor(input: $input) {
                            id
                        }
                    }
                `,
                variables: { input: { id: doctorToEdit.id } },
                authMode: 'apiKey'
            });

            onDelete && onDelete(doctorToEdit.id);

        } catch (error) {
            console.error('Error deleting doctor:', error);
            setErrors({ submit: 'Failed to delete doctor. Please try again.' });
        }

        setLoading(false);
    };

    const specialties = [
        'Cardiology', 'Dermatology', 'Emergency Medicine', 'Family Medicine',
        'Internal Medicine', 'Neurology', 'Oncology', 'Orthopedics',
        'Pediatrics', 'Psychiatry', 'Radiology', 'Surgery', 'Other'
    ];

    return (
        <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '24px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
        }}>
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 8px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    👨‍⚕️ {doctorToEdit ? 'Edit Doctor' : 'Add New Doctor'}
                </h2>
                <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
                    {doctorToEdit ? 'Update doctor information' : 'Enter doctor details to add to the system'}
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Name Fields */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
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
                                padding: '10px 12px',
                                border: errors.firstName ? '2px solid #ef4444' : '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                backgroundColor: errors.firstName ? '#fef2f2' : 'white'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = errors.firstName ? '#ef4444' : '#d1d5db'}
                        />
                        {errors.firstName && (
                            <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                                {errors.firstName}
                            </p>
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
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
                                padding: '10px 12px',
                                border: errors.lastName ? '2px solid #ef4444' : '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px',
                                outline: 'none',
                                backgroundColor: errors.lastName ? '#fef2f2' : 'white'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = errors.lastName ? '#ef4444' : '#d1d5db'}
                        />
                        {errors.lastName && (
                            <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                                {errors.lastName}
                            </p>
                        )}
                    </div>
                </div>

                {/* Email */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                        Email Address *
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="doctor@hospital.com"
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: errors.email ? '2px solid #ef4444' : '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px',
                            outline: 'none',
                            backgroundColor: errors.email ? '#fef2f2' : 'white'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                        onBlur={(e) => e.target.style.borderColor = errors.email ? '#ef4444' : '#d1d5db'}
                    />
                    {errors.email && (
                        <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                            {errors.email}
                        </p>
                    )}
                </div>

                {/* Specialty and Experience */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                            Medical Specialty *
                        </label>
                        <select
                            name="specialty"
                            value={formData.specialty}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: errors.specialty ? '2px solid #ef4444' : '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px',
                                outline: 'none',
                                backgroundColor: errors.specialty ? '#fef2f2' : 'white'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = errors.specialty ? '#ef4444' : '#d1d5db'}
                        >
                            <option value="">Select specialty</option>
                            {specialties.map(specialty => (
                                <option key={specialty} value={specialty}>{specialty}</option>
                            ))}
                        </select>
                        {errors.specialty && (
                            <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                                {errors.specialty}
                            </p>
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                            Years of Experience
                        </label>
                        <input
                            type="text"
                            name="experience"
                            value={formData.experience}
                            onChange={handleChange}
                            placeholder="e.g., 10 years"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px',
                                outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                    </div>
                </div>

                {/* Phone */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
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
                            padding: '10px 12px',
                            border: errors.phone ? '2px solid #ef4444' : '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px',
                            outline: 'none',
                            backgroundColor: errors.phone ? '#fef2f2' : 'white'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                        onBlur={(e) => e.target.style.borderColor = errors.phone ? '#ef4444' : '#d1d5db'}
                    />
                    {errors.phone && (
                        <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                            {errors.phone}
                        </p>
                    )}
                </div>

                {/* Bio */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                        Professional Bio
                    </label>
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Brief description of professional background, specializations, and approach to patient care..."
                        rows={4}
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px',
                            outline: 'none',
                            resize: 'vertical',
                            fontFamily: 'inherit'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                </div>

                {/* Active Status */}
                <div style={{ marginBottom: '24px' }}>
                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#374151'
                    }}>
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                            style={{
                                width: '16px',
                                height: '16px',
                                accentColor: '#3b82f6'
                            }}
                        />
                        <span style={{ fontWeight: '500' }}>Active Doctor</span>
                        <span style={{ color: '#6b7280', fontSize: '12px' }}>(Available for appointments)</span>
                    </label>
                </div>

                {/* Error Message */}
                {errors.submit && (
                    <div style={{
                        padding: '12px',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        marginBottom: '20px'
                    }}>
                        <p style={{ color: '#ef4444', margin: 0, fontSize: '14px' }}>
                            {errors.submit}
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    paddingTop: '20px',
                    borderTop: '1px solid #e5e7eb'
                }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={loading}
                                style={{
                                    padding: '10px 20px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
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
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '10px 20px',
                                border: 'none',
                                borderRadius: '6px',
                                backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {loading ? '⏳' : (doctorToEdit ? '✏️' : '➕')}
                            {loading ? 'Saving...' : (doctorToEdit ? 'Update Doctor' : 'Add Doctor')}
                        </button>
                    </div>

                    {doctorToEdit && onDelete && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={loading}
                            style={{
                                padding: '10px 16px',
                                border: 'none',
                                borderRadius: '6px',
                                backgroundColor: loading ? '#fca5a5' : '#ef4444',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            🗑️ Delete
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default DoctorForm;