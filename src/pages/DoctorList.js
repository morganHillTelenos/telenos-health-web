// src/components/DoctorList.js - Doctor Management Interface
import React, { useState, useEffect } from 'react';
import DoctorForm from './DoctorForm';

const DoctorList = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSpecialty, setFilterSpecialty] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

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

    // Load doctors
    const loadDoctors = async () => {
        setLoading(true);
        try {
            const client = await ensureCorrectConfig();

            const result = await client.graphql({
                query: `
                    query ListDoctors {
                        listDoctors {
                            items {
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
                                updatedAt
                            }
                        }
                    }
                `,
                authMode: 'apiKey'
            });

            setDoctors(result.data.listDoctors.items || []);
        } catch (error) {
            console.error('Error loading doctors:', error);
            showMessage('error', 'Failed to load doctors');
        }
        setLoading(false);
    };

    // Load doctors on component mount
    useEffect(() => {
        loadDoctors();
    }, []);

    // Show message
    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    // Handle form save
    const handleFormSave = (doctor, action) => {
        if (action === 'created') {
            setDoctors(prev => [doctor, ...prev]);
            showMessage('success', `Dr. ${doctor.firstName} ${doctor.lastName} has been added successfully!`);
        } else if (action === 'updated') {
            setDoctors(prev => prev.map(d => d.id === doctor.id ? doctor : d));
            showMessage('success', `Dr. ${doctor.firstName} ${doctor.lastName} has been updated successfully!`);
        }

        setShowForm(false);
        setEditingDoctor(null);
    };

    // Handle delete
    const handleDelete = (doctorId) => {
        setDoctors(prev => prev.filter(d => d.id !== doctorId));
        showMessage('success', 'Doctor has been deleted successfully!');
        setShowForm(false);
        setEditingDoctor(null);
    };

    // Handle edit
    const handleEdit = (doctor) => {
        setEditingDoctor(doctor);
        setShowForm(true);
    };

    // Handle cancel
    const handleCancel = () => {
        setShowForm(false);
        setEditingDoctor(null);
    };

    // Filter doctors
    const filteredDoctors = doctors.filter(doctor => {
        const matchesSearch =
            doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesSpecialty = !filterSpecialty || doctor.specialty === filterSpecialty;

        return matchesSearch && matchesSpecialty;
    });

    // Get unique specialties for filter
    const specialties = [...new Set(doctors.map(d => d.specialty))].sort();

    if (showForm) {
        return (
            <DoctorForm
                doctorToEdit={editingDoctor}
                onSave={handleFormSave}
                onCancel={handleCancel}
                onDelete={handleDelete}
            />
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                <div>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: '700',
                        color: '#1f2937',
                        margin: '0 0 8px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        👨‍⚕️ Doctor Management
                    </h1>
                    <p style={{ color: '#6b7280', margin: 0 }}>
                        Manage medical professionals in your healthcare system
                    </p>
                </div>

                <button
                    onClick={() => setShowForm(true)}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)'
                    }}
                >
                    ➕ Add New Doctor
                </button>
            </div>

            {/* Message */}
            {message.text && (
                <div style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
                    border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`,
                    color: message.type === 'success' ? '#065f46' : '#991b1b'
                }}>
                    {message.text}
                </div>
            )}

            {/* Filters */}
            <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                marginBottom: '24px'
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '16px', alignItems: 'end' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                            Search Doctors
                        </label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name, specialty, or email..."
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

                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                            Filter by Specialty
                        </label>
                        <select
                            value={filterSpecialty}
                            onChange={(e) => setFilterSpecialty(e.target.value)}
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
                        >
                            <option value="">All Specialties</option>
                            {specialties.map(specialty => (
                                <option key={specialty} value={specialty}>{specialty}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
            }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6' }}>
                        {doctors.length}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                        Total Doctors
                    </div>
                </div>

                <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>
                        {doctors.filter(d => d.isActive).length}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                        Active Doctors
                    </div>
                </div>

                <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#8b5cf6' }}>
                        {specialties.length}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                        Specialties
                    </div>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#6b7280'
                }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
                    Loading doctors...
                </div>
            )}

            {/* Doctor Cards */}
            {!loading && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '20px'
                }}>
                    {filteredDoctors.length === 0 ? (
                        <div style={{
                            gridColumn: '1 / -1',
                            textAlign: 'center',
                            padding: '60px 20px',
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            border: '2px dashed #e5e7eb'
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👨‍⚕️</div>
                            <h3 style={{ color: '#6b7280', margin: '0 0 8px 0' }}>
                                {searchTerm || filterSpecialty ? 'No doctors match your filters' : 'No doctors added yet'}
                            </h3>
                            <p style={{ color: '#9ca3af', margin: 0 }}>
                                {searchTerm || filterSpecialty
                                    ? 'Try adjusting your search criteria'
                                    : 'Add your first doctor to get started'
                                }
                            </p>
                        </div>
                    ) : (
                        filteredDoctors.map(doctor => (
                            <div key={doctor.id} style={{
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                border: '1px solid #e5e7eb',
                                overflow: 'hidden',
                                transition: 'transform 0.2s, box-shadow 0.2s'
                            }}>
                                {/* Card Header */}
                                <div style={{
                                    padding: '20px',
                                    borderBottom: '1px solid #f3f4f6'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '12px'
                                    }}>
                                        <div>
                                            <h3 style={{
                                                margin: '0 0 4px 0',
                                                fontSize: '18px',
                                                fontWeight: '600',
                                                color: '#1f2937'
                                            }}>
                                                Dr. {doctor.firstName} {doctor.lastName}
                                            </h3>
                                            <p style={{
                                                margin: 0,
                                                color: '#3b82f6',
                                                fontWeight: '500',
                                                fontSize: '14px'
                                            }}>
                                                {doctor.specialty}
                                            </p>
                                        </div>

                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            backgroundColor: doctor.isActive ? '#d1fae5' : '#fee2e2',
                                            color: doctor.isActive ? '#065f46' : '#991b1b'
                                        }}>
                                            {doctor.isActive ? '● Active' : '● Inactive'}
                                        </span>
                                    </div>

                                    <div style={{
                                        color: '#6b7280',
                                        fontSize: '14px',
                                        lineHeight: '1.4'
                                    }}>
                                        <div style={{ marginBottom: '4px' }}>
                                            📧 {doctor.email}
                                        </div>
                                        {doctor.phone && (
                                            <div style={{ marginBottom: '4px' }}>
                                                📞 {doctor.phone}
                                            </div>
                                        )}
                                        {doctor.experience && (
                                            <div>
                                                🎓 {doctor.experience}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Bio */}
                                {doctor.bio && (
                                    <div style={{ padding: '16px 20px' }}>
                                        <p style={{
                                            margin: 0,
                                            color: '#4b5563',
                                            fontSize: '14px',
                                            lineHeight: '1.5',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {doctor.bio}
                                        </p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div style={{
                                    padding: '16px 20px',
                                    backgroundColor: '#f9fafb',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{
                                        fontSize: '12px',
                                        color: '#9ca3af'
                                    }}>
                                        Added {new Date(doctor.createdAt).toLocaleDateString()}
                                    </div>

                                    <button
                                        onClick={() => handleEdit(doctor)}
                                        style={{
                                            padding: '6px 12px',
                                            backgroundColor: '#f3f4f6',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            color: '#374151',
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        ✏️ Edit
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default DoctorList;