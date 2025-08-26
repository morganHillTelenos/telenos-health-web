// src/pages/NoteForm.js - Clinical Note Management Form
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const NoteForm = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // For editing existing note
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: '',
        priority: 'Medium'
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [loadingNote, setLoadingNote] = useState(isEditing);
    const [availablePatients, setAvailablePatients] = useState([]);
    const [availableDoctors, setAvailableDoctors] = useState([]);
    const [loadingRelations, setLoadingRelations] = useState(false);

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

    // Load patients and doctors for reference
    const loadRelations = async () => {
        setLoadingRelations(true);
        try {
            const client = await ensureCorrectConfig();

            // Load patients and doctors in parallel
            const [patientsResult, doctorsResult] = await Promise.all([
                client.graphql({
                    query: `
                        query ListPatients {
                            listPatients {
                                items {
                                    id
                                    firstName
                                    lastName
                                    isActive
                                }
                            }
                        }
                    `,
                    authMode: 'apiKey'
                }),
                client.graphql({
                    query: `
                        query ListDoctors {
                            listDoctors {
                                items {
                                    id
                                    firstName
                                    lastName
                                    specialty
                                    isActive
                                }
                            }
                        }
                    `,
                    authMode: 'apiKey'
                })
            ]);

            setAvailablePatients(patientsResult.data.listPatients.items.filter(p => p.isActive));
            setAvailableDoctors(doctorsResult.data.listDoctors.items.filter(d => d.isActive));
        } catch (error) {
            console.error('Error loading relations:', error);
        }
        setLoadingRelations(false);
    };

    // Load note for editing
    const loadNote = async () => {
        try {
            const client = await ensureCorrectConfig();

            const result = await client.graphql({
                query: `
                    query GetNote($id: ID!) {
                        getNote(id: $id) {
                            id
                            title
                            content
                            category
                            priority
                        }
                    }
                `,
                variables: { id },
                authMode: 'apiKey'
            });

            if (result.data.getNote) {
                const note = result.data.getNote;
                setFormData({
                    title: note.title || '',
                    content: note.content || '',
                    category: note.category || '',
                    priority: note.priority || 'Medium'
                });
            }
        } catch (error) {
            console.error('Error loading note:', error);
            setErrors({ submit: 'Failed to load note details' });
        }
        setLoadingNote(false);
    };

    // Load data on component mount
    useEffect(() => {
        loadRelations();
        if (isEditing) {
            loadNote();
        }
    }, [id, isEditing]);

    // Form validation
    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.content.trim()) newErrors.content = 'Content is required';
        if (formData.title.length > 200) newErrors.title = 'Title must be less than 200 characters';
        if (formData.content.length < 10) newErrors.content = 'Content must be at least 10 characters';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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
                // Update existing note
                await client.graphql({
                    query: `
                        mutation UpdateNote($input: UpdateNoteInput!) {
                            updateNote(input: $input) {
                                id
                                title
                                content
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

                navigate('/notes', { state: { message: 'Note updated successfully!' } });
            } else {
                // Create new note
                await client.graphql({
                    query: `
                        mutation CreateNote($input: CreateNoteInput!) {
                            createNote(input: $input) {
                                id
                                title
                                content
                            }
                        }
                    `,
                    variables: { input: formData },
                    authMode: 'apiKey'
                });

                navigate('/notes', { state: { message: 'Note created successfully!' } });
            }

        } catch (error) {
            console.error('Error saving note:', error);
            setErrors({ submit: 'Failed to save note. Please try again.' });
        }

        setLoading(false);
    };

    // Handle delete
    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
            return;
        }

        setLoading(true);

        try {
            const client = await ensureCorrectConfig();

            await client.graphql({
                query: `
                    mutation DeleteNote($input: DeleteNoteInput!) {
                        deleteNote(input: $input) {
                            id
                        }
                    }
                `,
                variables: { input: { id: id } },
                authMode: 'apiKey'
            });

            navigate('/notes', { state: { message: 'Note deleted successfully!' } });

        } catch (error) {
            console.error('Error deleting note:', error);
            setErrors({ submit: 'Failed to delete note. Please try again.' });
        }

        setLoading(false);
    };

    const categories = [
        'Consultation', 'Treatment', 'Progress', 'Diagnosis', 'Follow-up',
        'Lab Results', 'Medication', 'Procedure', 'Discharge', 'General'
    ];

    const priorities = [
        { value: 'Low', color: '#10b981', bg: '#d1fae5' },
        { value: 'Medium', color: '#f59e0b', bg: '#fef3c7' },
        { value: 'High', color: '#ef4444', bg: '#fee2e2' }
    ];

    // Loading state for editing
    if (loadingNote) {
        return (
            <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: '24px',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
                <p>Loading note details...</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <button
                    onClick={() => navigate('/notes')}
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
                    ← Back to Notes
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
                        📝 {isEditing ? 'Edit Clinical Note' : 'Add New Clinical Note'}
                    </h1>
                    <p style={{ color: '#6b7280', margin: 0, fontSize: '16px' }}>
                        {isEditing ? 'Update clinical documentation' : 'Create clinical documentation for patient care'}
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
                    {/* Title */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                            Note Title *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., Patient Consultation - Follow-up Visit"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: errors.title ? '2px solid #ef4444' : '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                backgroundColor: errors.title ? '#fef2f2' : 'white'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = errors.title ? '#ef4444' : '#d1d5db'}
                        />
                        {errors.title && (
                            <p style={{ color: '#ef4444', fontSize: '12px', margin: '6px 0 0 0' }}>
                                {errors.title}
                            </p>
                        )}
                        <p style={{ color: '#9ca3af', fontSize: '12px', margin: '4px 0 0 0' }}>
                            {formData.title.length}/200 characters
                        </p>
                    </div>

                    {/* Category and Priority */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                                Category
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    backgroundColor: 'white'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            >
                                <option value="">Select category</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                                Priority Level
                            </label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    backgroundColor: 'white'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            >
                                {priorities.map(priority => (
                                    <option key={priority.value} value={priority.value}>
                                        {priority.value} Priority
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                            Note Content *
                        </label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            placeholder="Enter detailed clinical notes, observations, treatment plans, or documentation...

Examples:
• Patient presents with chief complaint of...
• Physical examination reveals...
• Assessment and plan:
  - Diagnosis: 
  - Treatment: 
  - Follow-up: 
• Patient education provided regarding..."
                            rows={12}
                            style={{
                                width: '100%',
                                padding: '16px',
                                border: errors.content ? '2px solid #ef4444' : '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                resize: 'vertical',
                                fontFamily: 'inherit',
                                lineHeight: '1.5',
                                backgroundColor: errors.content ? '#fef2f2' : 'white'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = errors.content ? '#ef4444' : '#d1d5db'}
                        />
                        {errors.content && (
                            <p style={{ color: '#ef4444', fontSize: '12px', margin: '6px 0 0 0' }}>
                                {errors.content}
                            </p>
                        )}
                        <p style={{ color: '#9ca3af', fontSize: '12px', margin: '4px 0 0 0' }}>
                            {formData.content.length} characters • Minimum 10 characters required
                        </p>
                    </div>

                    {/* Available Relations Info */}
                    {!loadingRelations && (availablePatients.length > 0 || availableDoctors.length > 0) && (
                        <div style={{
                            marginBottom: '24px',
                            padding: '16px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                        }}>
                            <h4 style={{ margin: '0 0 12px 0', color: '#475569', fontSize: '14px', fontWeight: '600' }}>
                                💡 Available for Future Enhancement
                            </h4>
                            <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                                <p style={{ margin: '0 0 8px 0' }}>
                                    <strong>Active Patients:</strong> {availablePatients.length} patients available
                                </p>
                                <p style={{ margin: '0' }}>
                                    <strong>Active Doctors:</strong> {availableDoctors.length} doctors available
                                </p>
                                <p style={{ margin: '8px 0 0 0', fontStyle: 'italic' }}>
                                    Future versions can link notes directly to specific patients and doctors
                                </p>
                            </div>
                        </div>
                    )}

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
                                onClick={() => navigate('/notes')}
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
                                {loading ? '⏳' : (isEditing ? '✏️' : '📝')}
                                {loading ? 'Saving...' : (isEditing ? 'Update Note' : 'Save Note')}
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
                                🗑️ Delete Note
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NoteForm;