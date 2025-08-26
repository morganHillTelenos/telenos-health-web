// src/pages/NoteList.js - Clinical Notes Dashboard
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NoteList = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
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

    // Load notes
    const loadNotes = async () => {
        setLoading(true);
        try {
            const client = await ensureCorrectConfig();

            const result = await client.graphql({
                query: `
                    query ListNotes {
                        listNotes {
                            items {
                                id
                                title
                                content
                                category
                                priority
                                createdAt
                                updatedAt
                            }
                        }
                    }
                `,
                authMode: 'apiKey'
            });

            // Sort notes by creation date (newest first)
            const sortedNotes = (result.data.listNotes.items || []).sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );

            setNotes(sortedNotes);
        } catch (error) {
            console.error('Error loading notes:', error);
            showMessage('error', 'Failed to load notes');
        }
        setLoading(false);
    };

    // Load notes on component mount
    useEffect(() => {
        loadNotes();

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

    // Get time ago helper
    const getTimeAgo = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;

        return date.toLocaleDateString();
    };

    // Priority styling helper
    const getPriorityStyle = (priority) => {
        switch (priority) {
            case 'High':
                return { backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fecaca' };
            case 'Medium':
                return { backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#fde68a' };
            case 'Low':
                return { backgroundColor: '#d1fae5', color: '#065f46', borderColor: '#a7f3d0' };
            default:
                return { backgroundColor: '#f3f4f6', color: '#374151', borderColor: '#d1d5db' };
        }
    };

    // Truncate content helper
    const truncateContent = (content, maxLength = 150) => {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + '...';
    };

    // Filter notes
    const filteredNotes = notes.filter(note => {
        const matchesSearch =
            note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (note.category && note.category.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCategory = !filterCategory || note.category === filterCategory;
        const matchesPriority = !filterPriority || note.priority === filterPriority;

        return matchesSearch && matchesCategory && matchesPriority;
    });

    // Get unique categories and priorities for filters
    const categories = [...new Set(notes.map(n => n.category).filter(Boolean))].sort();
    const priorities = [...new Set(notes.map(n => n.priority).filter(Boolean))].sort();

    // Statistics
    const stats = {
        total: notes.length,
        high: notes.filter(n => n.priority === 'High').length,
        categories: categories.length,
        recent: notes.filter(n => {
            const dayAgo = new Date();
            dayAgo.setDate(dayAgo.getDate() - 1);
            return new Date(n.createdAt) > dayAgo;
        }).length
    };

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
                        📝 Clinical Notes
                    </h1>
                    <p style={{ color: '#6b7280', margin: 0, fontSize: '16px' }}>
                        Manage clinical documentation and patient notes
                    </p>
                </div>

                <button
                    onClick={() => navigate('/notes/new')}
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
                    📝 Add New Note
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
                        {stats.total}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>
                        Total Notes
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
                    <div style={{ fontSize: '36px', fontWeight: '700', color: '#ef4444', marginBottom: '8px' }}>
                        {stats.high}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>
                        High Priority
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
                        {stats.categories}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>
                        Categories
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
                        {stats.recent}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>
                        Last 24 Hours
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px 200px', gap: '20px', alignItems: 'end' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                            Search Notes
                        </label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by title, content, or category..."
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
                            Category
                        </label>
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
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
                            <option value="">All Categories</option>
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                            Priority
                        </label>
                        <select
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
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
                            <option value="">All Priorities</option>
                            {priorities.map(priority => (
                                <option key={priority} value={priority}>{priority}</option>
                            ))}
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
                    <p style={{ fontSize: '16px' }}>Loading notes...</p>
                </div>
            )}

            {/* Notes Grid */}
            {!loading && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: '24px'
                }}>
                    {filteredNotes.length === 0 ? (
                        <div style={{
                            gridColumn: '1 / -1',
                            textAlign: 'center',
                            padding: '80px 20px',
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            border: '2px dashed #e5e7eb'
                        }}>
                            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📝</div>
                            <h3 style={{ color: '#6b7280', margin: '0 0 12px 0', fontSize: '20px' }}>
                                {searchTerm || filterCategory || filterPriority ? 'No notes match your filters' : 'No clinical notes yet'}
                            </h3>
                            <p style={{ color: '#9ca3af', margin: '0 0 24px 0' }}>
                                {searchTerm || filterCategory || filterPriority
                                    ? 'Try adjusting your search criteria'
                                    : 'Start documenting patient care with your first clinical note'
                                }
                            </p>
                            {(!searchTerm && !filterCategory && !filterPriority) && (
                                <button
                                    onClick={() => navigate('/notes/new')}
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
                                    📝 Create First Note
                                </button>
                            )}
                        </div>
                    ) : (
                        filteredNotes.map(note => (
                            <div key={note.id} style={{
                                backgroundColor: 'white',
                                borderRadius: '16px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                border: '1px solid #e5e7eb',
                                overflow: 'hidden',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                cursor: 'pointer'
                            }}
                                onClick={() => navigate(`/notes/edit/${note.id}`)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 8px 16px -1px rgba(0, 0, 0, 0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                                }}>
                                {/* Card Header */}
                                <div style={{ padding: '24px' }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '16px'
                                    }}>
                                        <div style={{ flex: 1, marginRight: '16px' }}>
                                            <h3 style={{
                                                margin: '0 0 8px 0',
                                                fontSize: '18px',
                                                fontWeight: '600',
                                                color: '#1f2937',
                                                lineHeight: '1.4',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}>
                                                {note.title}
                                            </h3>

                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                {note.category && (
                                                    <span style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '16px',
                                                        fontSize: '11px',
                                                        fontWeight: '500',
                                                        backgroundColor: '#f3f4f6',
                                                        color: '#4b5563',
                                                        border: '1px solid #e5e7eb'
                                                    }}>
                                                        {note.category}
                                                    </span>
                                                )}

                                                {note.priority && (
                                                    <span style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '16px',
                                                        fontSize: '11px',
                                                        fontWeight: '600',
                                                        border: '1px solid',
                                                        ...getPriorityStyle(note.priority)
                                                    }}>
                                                        {note.priority}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{
                                        color: '#4b5563',
                                        fontSize: '14px',
                                        lineHeight: '1.6',
                                        marginBottom: '16px'
                                    }}>
                                        {truncateContent(note.content)}
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        paddingTop: '16px',
                                        borderTop: '1px solid #f3f4f6',
                                        fontSize: '12px',
                                        color: '#9ca3af'
                                    }}>
                                        <div>
                                            Created {getTimeAgo(note.createdAt)}
                                        </div>

                                        {note.updatedAt !== note.createdAt && (
                                            <div>
                                                Updated {getTimeAgo(note.updatedAt)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default NoteList;