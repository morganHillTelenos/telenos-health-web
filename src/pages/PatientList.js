// src/pages/PatientList.js - Patient Management Dashboard
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PatientList = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterActive, setFilterActive] = useState('all');
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

    // Load patients
    const loadPatients = async () => {
        setLoading(true);
        try {
            const client = await ensureCorrectConfig();

            const result = await client.graphql({
                query: `
                    query ListPatients {
                        listPatients {
                            items {
                                id
                                firstName
                                lastName
                                email
                                dateOfBirth
                                phone
                                isActive
                                createdAt
                                updatedAt
                            }
                        }
                    }
                `,
                authMode: 'apiKey'
            });

            setPatients(result.data.listPatients.items || []);
        } catch (error) {
            console.error('Error loading patients:', error);
            showMessage('error', 'Failed to load patients');
        }
        setLoading(false);
    };

    // Load patients on component mount
    useEffect(() => {
        loadPatients();

        // Show success message if redirected from form
        if (location.state?.message) {
            showMessage('success', location.state.message);
            // Clear the message from location state
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    // Show message
    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    // Calculate age from date of birth
    const calculateAge = (dateOfBirth) => {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    };

    // Filter patients
    const filteredPatients = patients.filter(patient => {
        const matchesSearch =
            patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesActive =
            filterActive === 'all' ||
            (filterActive === 'active' && patient.isActive) ||
            (filterActive === 'inactive' && !patient.isActive);

        return matchesSearch && matchesActive;
    });

    // Age groups for statistics
    const getAgeGroup = (dateOfBirth) => {
        const age = calculateAge(dateOfBirth);
        if (age < 18) return 'pediatric';
        if (age < 65) return 'adult';
        return 'senior';
    };

    const ageGroups = patients.reduce((acc, patient) => {
        const group = getAgeGroup(patient.dateOfBirth);
        acc[group] = (acc[group] || 0) + 1;
        return acc;
    }, {});

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '32px',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                <div>
                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: '700',
                        color: '#1f2937',
                        margin: '0 0 8px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        👥 Patient Management
                    </h1>
                    <p style={{ color: '#6b7280', margin: 0, fontSize: '16px' }}>
                        Manage patient records and information in your healthcare system
                    </p>
                </div>

                <button
                    onClick={() => navigate('/patients/new')}
                    style={{
                        padding: '14px 28px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.25)'
                    }}
                >
                    ➕ Add New Patient
                </button>
            </div>

            {/* Message */}
            {message.text && (
                <div style={{
                    padding: '16px 20px',
                    borderRadius: '10px',
                    marginBottom: '24px',
                    backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
                    border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`,
                    color: message.type === 'success' ? '#065f46' : '#991b1b',
                    fontWeight: '500'
                }}>
                    {message.text}
                </div>
            )}

            {/* Statistics Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '32px'
            }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '24px',
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '36px', fontWeight: '700', color: '#3b82f6', marginBottom: '8px' }}>
                        {patients.length}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>
                        Total Patients
                    </div>
                </div>

                <div style={{
                    backgroundColor: 'white',
                    padding: '24px',
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '36px', fontWeight: '700', color: '#10b981', marginBottom: '8px' }}>
                        {patients.filter(p => p.isActive).length}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>
                        Active Patients
                    </div>
                </div>

                <div style={{
                    backgroundColor: 'white',
                    padding: '24px',
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '36px', fontWeight: '700', color: '#f59e0b', marginBottom: '8px' }}>
                        {ageGroups.pediatric || 0}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>
                        Pediatric (&lt;18)
                    </div>
                </div>

                <div style={{
                    backgroundColor: 'white',
                    padding: '24px',
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '36px', fontWeight: '700', color: '#8b5cf6', marginBottom: '8px' }}>
                        {ageGroups.senior || 0}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>
                        Senior (65+)
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '16px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                marginBottom: '24px'
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '20px', alignItems: 'end' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                            Search Patients
                        </label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name or email..."
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                            Filter by Status
                        </label>
                        <select
                            value={filterActive}
                            onChange={(e) => setFilterActive(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        >
                            <option value="all">All Patients</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div style={{
                    textAlign: 'center',
                    padding: '60px',
                    color: '#6b7280'
                }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
                    <p style={{ fontSize: '16px' }}>Loading patients...</p>
                </div>
            )}

            {/* Patient Table */}
            {!loading && (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden'
                }}>
                    {filteredPatients.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '80px 20px',
                        }}>
                            <div style={{ fontSize: '64px', marginBottom: '20px' }}>👥</div>
                            <h3 style={{ color: '#6b7280', margin: '0 0 12px 0', fontSize: '20px' }}>
                                {searchTerm || filterActive !== 'all' ? 'No patients match your filters' : 'No patients added yet'}
                            </h3>
                            <p style={{ color: '#9ca3af', margin: '0 0 24px 0' }}>
                                {searchTerm || filterActive !== 'all'
                                    ? 'Try adjusting your search criteria'
                                    : 'Add your first patient to get started'
                                }
                            </p>
                            {(!searchTerm && filterActive === 'all') && (
                                <button
                                    onClick={() => navigate('/patients/new')}
                                    style={{
                                        padding: '12px 24px',
                                        backgroundColor: '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ➕ Add First Patient
                                </button>
                            )}
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                        <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                                            Patient
                                        </th>
                                        <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                                            Contact
                                        </th>
                                        <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                                            Age
                                        </th>
                                        <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                                            Status
                                        </th>
                                        <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                                            Added
                                        </th>
                                        <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPatients.map(patient => (
                                        <tr key={patient.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td style={{ padding: '20px 24px' }}>
                                                <div>
                                                    <div style={{
                                                        fontWeight: '600',
                                                        color: '#1f2937',
                                                        fontSize: '16px',
                                                        marginBottom: '2px'
                                                    }}>
                                                        {patient.firstName} {patient.lastName}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '12px',
                                                        color: '#6b7280'
                                                    }}>
                                                        ID: {patient.id.slice(0, 8)}...
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <div>
                                                    <div style={{
                                                        fontSize: '14px',
                                                        color: '#374151',
                                                        marginBottom: '2px'
                                                    }}>
                                                        {patient.email}
                                                    </div>
                                                    {patient.phone && (
                                                        <div style={{
                                                            fontSize: '12px',
                                                            color: '#6b7280'
                                                        }}>
                                                            {patient.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <div style={{
                                                    fontSize: '14px',
                                                    color: '#374151',
                                                    fontWeight: '500'
                                                }}>
                                                    {calculateAge(patient.dateOfBirth)} years
                                                </div>
                                                <div style={{
                                                    fontSize: '11px',
                                                    color: '#9ca3af'
                                                }}>
                                                    Born {new Date(patient.dateOfBirth).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <span style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    backgroundColor: patient.isActive ? '#d1fae5' : '#fee2e2',
                                                    color: patient.isActive ? '#065f46' : '#991b1b'
                                                }}>
                                                    {patient.isActive ? '● Active' : '● Inactive'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <div style={{
                                                    fontSize: '14px',
                                                    color: '#6b7280'
                                                }}>
                                                    {new Date(patient.createdAt).toLocaleDateString()}
                                                </div>
                                                <div style={{
                                                    fontSize: '11px',
                                                    color: '#9ca3af'
                                                }}>
                                                    {new Date(patient.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <button
                                                    onClick={() => navigate(`/patients/edit/${patient.id}`)}
                                                    style={{
                                                        padding: '8px 16px',
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
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PatientList;