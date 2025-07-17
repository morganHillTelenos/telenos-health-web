// src/pages/NotesPage.js
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Clock, User, Calendar, Tag } from 'lucide-react';
import { apiService } from '../services/api';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';

const NotesPage = () => {
    const [notes, setNotes] = useState([]);
    const [filteredNotes, setFilteredNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedPriority, setSelectedPriority] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [error, setError] = useState('');

    const categories = ['general', 'medical', 'appointment', 'patient', 'administrative', 'research'];
    const priorities = ['low', 'medium', 'high', 'urgent'];

    // Load notes on component mount
    useEffect(() => {
        loadNotes();
    }, []);

    // Filter notes based on search and filters
    useEffect(() => {
        let filtered = notes;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(note =>
                note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
            );
        }

        // Category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(note => note.category === selectedCategory);
        }

        // Priority filter
        if (selectedPriority !== 'all') {
            filtered = filtered.filter(note => note.priority === selectedPriority);
        }

        setFilteredNotes(filtered);
    }, [notes, searchTerm, selectedCategory, selectedPriority]);

    const loadNotes = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await apiService.getNotes();
            if (response.success) {
                setNotes(response.data);
            }
        } catch (error) {
            console.error('Error loading notes:', error);
            setError('Failed to load notes. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteNote = async (noteId) => {
        if (!window.confirm('Are you sure you want to delete this note?')) {
            return;
        }

        try {
            await apiService.deleteNote(noteId);
            setNotes(notes.filter(note => note.id !== noteId));
        } catch (error) {
            console.error('Error deleting note:', error);
            setError('Failed to delete note. Please try again.');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPriorityColor = (priority) => {
        const colors = {
            low: 'bg-gray-100 text-gray-700',
            medium: 'bg-blue-100 text-blue-700',
            high: 'bg-orange-100 text-orange-700',
            urgent: 'bg-red-100 text-red-700'
        };
        return colors[priority] || colors.medium;
    };

    const getCategoryIcon = (category) => {
        const icons = {
            medical: '🏥',
            appointment: '📅',
            patient: '👤',
            administrative: '📋',
            research: '🔬',
            general: '📝'
        };
        return icons[category] || icons.general;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
                            <p className="text-gray-600 mt-1">Manage your clinical notes and documentation</p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            New Note
                        </button>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search notes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>

                        {/* Category Filter */}
                        <div>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Priority Filter */}
                        <div>
                            <select
                                value={selectedPriority}
                                onChange={(e) => setSelectedPriority(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500"
                            >
                                <option value="all">All Priorities</option>
                                {priorities.map(priority => (
                                    <option key={priority} value={priority}>
                                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                        <p className="text-red-600 font-medium">{error}</p>
                    </div>
                )}

                {/* Notes Grid */}
                {filteredNotes.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-4xl">📝</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Notes Found</h3>
                        <p className="text-gray-600 mb-6">
                            {searchTerm || selectedCategory !== 'all' || selectedPriority !== 'all'
                                ? 'Try adjusting your search or filters.'
                                : 'Create your first note to get started.'}
                        </p>
                        {!searchTerm && selectedCategory === 'all' && selectedPriority === 'all' && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                            >
                                Create First Note
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredNotes.map((note) => (
                            <div key={note.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{getCategoryIcon(note.category)}</span>
                                            <div>
                                                <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${getPriorityColor(note.priority)}`}>
                                                    {note.priority}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setEditingNote(note)}
                                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit Note"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteNote(note.id)}
                                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete Note"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                        {note.title}
                                    </h3>

                                    {/* Content Preview */}
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                        {note.content}
                                    </p>

                                    {/* Tags */}
                                    {note.tags && note.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {note.tags.slice(0, 3).map((tag, index) => (
                                                <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg">
                                                    <Tag className="w-3 h-3" />
                                                    {tag}
                                                </span>
                                            ))}
                                            {note.tags.length > 3 && (
                                                <span className="text-xs text-gray-500">+{note.tags.length - 3} more</span>
                                            )}
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatDate(note.updatedAt)}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {note.patientId && (
                                                <div className="flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    <span>Patient</span>
                                                </div>
                                            )}
                                            {note.appointmentId && (
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>Appointment</span>
                                                </div>
                                            )}
                                            {note.isPrivate && (
                                                <div className="flex items-center gap-1 text-orange-600">
                                                    <Eye className="w-3 h-3" />
                                                    <span>Private</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Statistics */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm border">
                        <div className="text-2xl font-bold text-blue-600">{notes.length}</div>
                        <div className="text-sm text-gray-600">Total Notes</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border">
                        <div className="text-2xl font-bold text-green-600">
                            {notes.filter(n => n.category === 'medical').length}
                        </div>
                        <div className="text-sm text-gray-600">Medical Notes</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border">
                        <div className="text-2xl font-bold text-orange-600">
                            {notes.filter(n => n.priority === 'high' || n.priority === 'urgent').length}
                        </div>
                        <div className="text-sm text-gray-600">High Priority</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border">
                        <div className="text-2xl font-bold text-purple-600">
                            {notes.filter(n => n.isPrivate).length}
                        </div>
                        <div className="text-sm text-gray-600">Private Notes</div>
                    </div>
                </div>
            </div>

            {/* Create/Edit Note Modal */}
            {(showCreateModal || editingNote) && (
                <NoteModal
                    note={editingNote}
                    onClose={() => {
                        setShowCreateModal(false);
                        setEditingNote(null);
                    }}
                    onSave={(note) => {
                        if (editingNote) {
                            setNotes(notes.map(n => n.id === note.id ? note : n));
                        } else {
                            setNotes([note, ...notes]);
                        }
                        setShowCreateModal(false);
                        setEditingNote(null);
                    }}
                />
            )}
        </div>
    );
};

// Note Modal Component
const NoteModal = ({ note, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: note?.title || '',
        content: note?.content || '',
        category: note?.category || 'general',
        priority: note?.priority || 'medium',
        isPrivate: note?.isPrivate || false,
        tags: note?.tags || [],
        patientId: note?.patientId || '',
        appointmentId: note?.appointmentId || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [tagInput, setTagInput] = useState('');

    const categories = ['general', 'medical', 'appointment', 'patient', 'administrative', 'research'];
    const priorities = ['low', 'medium', 'high', 'urgent'];

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.content.trim()) {
            setError('Title and content are required');
            return;
        }

        try {
            setLoading(true);
            setError('');

            let response;
            if (note) {
                response = await apiService.updateNote(note.id, formData);
            } else {
                response = await apiService.createNote(formData);
            }

            if (response.success) {
                onSave(response.data);
            }
        } catch (error) {
            console.error('Error saving note:', error);
            setError(error.message || 'Failed to save note');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {note ? 'Edit Note' : 'Create New Note'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                            <p className="text-red-600 font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500"
                                placeholder="Enter note title..."
                                required
                            />
                        </div>

                        {/* Content */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Content *
                            </label>
                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={handleInputChange}
                                rows="8"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                                placeholder="Enter note content..."
                                required
                            />
                        </div>

                        {/* Category and Priority */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Category
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500"
                                >
                                    {categories.map(category => (
                                        <option key={category} value={category}>
                                            {category.charAt(0).toUpperCase() + category.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Priority
                                </label>
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500"
                                >
                                    {priorities.map(priority => (
                                        <option key={priority} value={priority}>
                                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Patient ID and Appointment ID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Patient ID (Optional)
                                </label>
                                <input
                                    type="text"
                                    name="patientId"
                                    value={formData.patientId}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500"
                                    placeholder="Link to patient..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Appointment ID (Optional)
                                </label>
                                <input
                                    type="text"
                                    name="appointmentId"
                                    value={formData.appointmentId}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500"
                                    placeholder="Link to appointment..."
                                />
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Tags
                            </label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                    className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500"
                                    placeholder="Add a tag..."
                                />
                                <button
                                    type="button"
                                    onClick={handleAddTag}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                            {formData.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {formData.tags.map((tag, index) => (
                                        <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                className="text-blue-500 hover:text-blue-700"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Private checkbox */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="isPrivate"
                                checked={formData.isPrivate}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label className="ml-2 text-sm font-medium text-gray-700">
                                Mark as private note
                            </label>
                        </div>

                        {/* Submit buttons */}
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : (note ? 'Update Note' : 'Create Note')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NotesPage;