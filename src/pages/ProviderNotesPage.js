import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit3, Save, X, FileText, Clock, User, Filter, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { notesService } from '../services/notes';
import Header from '../components/Header';
import { authService } from '../services/auth';

const ProviderNotesPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [patients, setPatients] = useState([]);
    const [notes, setNotes] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [activeNote, setActiveNote] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [newNote, setNewNote] = useState({
        type: 'progress',
        title: '',
        content: '',
        diagnosis: '',
        assessment: '',
        plan: '',
        vitals: {
            bloodPressure: '',
            heartRate: '',
            temperature: '',
            weight: '',
            height: ''
        },
        medications: '',
        followUp: ''
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setLoading(true);

            // Load user
            if (authService.isAuthenticated()) {
                const currentUser = await authService.getCurrentUser();
                setUser(currentUser);
            }

            // Load patients from your existing API
            const patientsResult = await apiService.getPatients();
            const patientsData = patientsResult?.data || [];
            setPatients(patientsData);

            // Load notes from localStorage/database
            const notesData = await notesService.getAllNotes();
            setNotes(notesData);

        } catch (error) {
            console.error('Error loading initial data:', error);
            setError('Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const handlePatientSelect = async (patient) => {
        setSelectedPatient(patient);
        setActiveNote(null);
        setIsEditing(false);

        // Load notes for this patient
        try {
            const patientNotes = await notesService.getPatientNotes(patient.id);
            // Update the notes state to include the loaded notes
            setNotes(prevNotes => {
                const otherNotes = prevNotes.filter(note => note.patientId !== patient.id);
                return [...otherNotes, ...patientNotes];
            });
        } catch (error) {
            console.error('Error loading patient notes:', error);
        }
    };

    const handleNewNote = () => {
        if (!selectedPatient) return;
        setActiveNote(null);
        setIsEditing(true);
        setNewNote({
            type: 'progress',
            title: '',
            content: '',
            diagnosis: '',
            assessment: '',
            plan: '',
            vitals: {
                bloodPressure: '',
                heartRate: '',
                temperature: '',
                weight: '',
                height: ''
            },
            medications: '',
            followUp: ''
        });
    };

    const handleSaveNote = async () => {
        if (!selectedPatient) return;

        try {
            setSaving(true);

            const noteToSave = {
                patientId: selectedPatient.id,
                patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
                ...newNote,
                provider: user?.name || 'Dr. Smith',
                date: new Date().toISOString(),
                lastModified: new Date().toISOString()
            };

            const savedNote = await notesService.createNote(noteToSave);

            // Add to local state
            setNotes(prev => [savedNote, ...prev]);
            setIsEditing(false);
            setActiveNote(savedNote);

        } catch (error) {
            console.error('Error saving note:', error);
            setError('Failed to save note. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleEditNote = (note) => {
        setActiveNote(note);
        setNewNote({ ...note });
        setIsEditing(true);
    };

    const handleUpdateNote = async () => {
        if (!activeNote) return;

        try {
            setSaving(true);

            const updatedNote = {
                ...newNote,
                id: activeNote.id,
                lastModified: new Date().toISOString()
            };

            await notesService.updateNote(activeNote.id, updatedNote);

            // Update local state
            setNotes(prev => prev.map(note =>
                note.id === activeNote.id ? updatedNote : note
            ));

            setIsEditing(false);
            setActiveNote(updatedNote);

        } catch (error) {
            console.error('Error updating note:', error);
            setError('Failed to update note. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const filteredPatients = patients.filter(patient => {
        const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        return fullName.includes(searchLower) ||
            (patient.email && patient.email.toLowerCase().includes(searchLower));
    });

    const getPatientNotes = (patientId) => {
        let patientNotes = notes.filter(note => note.patientId === patientId);

        if (filterType !== 'all') {
            patientNotes = patientNotes.filter(note => note.type === filterType);
        }

        return patientNotes.sort((a, b) => new Date(b.date) - new Date(a.date));
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

    const noteTypes = [
        { value: 'progress', label: 'Progress Note' },
        { value: 'consultation', label: 'Consultation' },
        { value: 'procedure', label: 'Procedure Note' },
        { value: 'discharge', label: 'Discharge Summary' },
        { value: 'operative', label: 'Operative Note' }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header user={user} onLogout={handleLogout} />

            <div className="pt-20 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-4 mb-2">
                                    <button
                                        onClick={() => navigate('/dashboard')}
                                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                        Back to Dashboard
                                    </button>
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">Provider Clinical Notes</h1>
                                <p className="text-gray-600">Document patient encounters and maintain clinical records</p>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-red-800">{error}</p>
                            <button
                                onClick={() => setError('')}
                                className="text-red-600 hover:text-red-800 mt-2"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Patient List */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900">Patients</h2>
                                </div>

                                <div className="relative mb-4">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search patients..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {filteredPatients.map(patient => (
                                        <div
                                            key={patient.id}
                                            onClick={() => handlePatientSelect(patient)}
                                            className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedPatient?.id === patient.id
                                                    ? 'bg-blue-50 border-blue-200'
                                                    : 'hover:bg-gray-50 border-gray-200'
                                                } border`}
                                        >
                                            <div className="font-medium text-gray-900">
                                                {patient.firstName} {patient.lastName}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {patient.email}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                DOB: {patient.dateOfBirth}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Notes List */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
                                    {selectedPatient && (
                                        <button
                                            onClick={handleNewNote}
                                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                            New Note
                                        </button>
                                    )}
                                </div>

                                {selectedPatient && (
                                    <div className="mb-4">
                                        <select
                                            value={filterType}
                                            onChange={(e) => setFilterType(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="all">All Notes</option>
                                            {noteTypes.map(type => (
                                                <option key={type.value} value={type.value}>{type.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {selectedPatient ? (
                                        getPatientNotes(selectedPatient.id).map(note => (
                                            <div
                                                key={note.id}
                                                onClick={() => setActiveNote(note)}
                                                className={`p-3 rounded-lg cursor-pointer transition-colors border ${activeNote?.id === note.id
                                                        ? 'bg-blue-50 border-blue-200'
                                                        : 'hover:bg-gray-50 border-gray-200'
                                                    }`}
                                            >
                                                <div className="font-medium text-gray-900">{note.title}</div>
                                                <div className="text-sm text-gray-500 capitalize">{note.type}</div>
                                                <div className="text-sm text-gray-500">{formatDate(note.date)}</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                            <p>Select a patient to view notes</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Note Editor/Viewer */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                {isEditing ? (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-xl font-semibold text-gray-900">
                                                {activeNote ? 'Edit Note' : 'New Note'} - {selectedPatient?.firstName} {selectedPatient?.lastName}
                                            </h2>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setIsEditing(false)}
                                                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                                    disabled={saving}
                                                >
                                                    <X className="w-4 h-4" />
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={activeNote ? handleUpdateNote : handleSaveNote}
                                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                                    disabled={saving}
                                                >
                                                    <Save className="w-4 h-4" />
                                                    {saving ? 'Saving...' : 'Save Note'}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Note Type</label>
                                                <select
                                                    value={newNote.type}
                                                    onChange={(e) => setNewNote(prev => ({ ...prev, type: e.target.value }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                >
                                                    {noteTypes.map(type => (
                                                        <option key={type.value} value={type.value}>{type.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                                <input
                                                    type="text"
                                                    value={newNote.title}
                                                    onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Note title..."
                                                />
                                            </div>
                                        </div>

                                        {/* Vitals Section */}
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h3 className="font-semibold text-gray-900 mb-3">Vital Signs</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1">BP</label>
                                                    <input
                                                        type="text"
                                                        value={newNote.vitals.bloodPressure}
                                                        onChange={(e) => setNewNote(prev => ({
                                                            ...prev,
                                                            vitals: { ...prev.vitals, bloodPressure: e.target.value }
                                                        }))}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                        placeholder="120/80"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1">HR</label>
                                                    <input
                                                        type="text"
                                                        value={newNote.vitals.heartRate}
                                                        onChange={(e) => setNewNote(prev => ({
                                                            ...prev,
                                                            vitals: { ...prev.vitals, heartRate: e.target.value }
                                                        }))}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                        placeholder="72"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1">Temp</label>
                                                    <input
                                                        type="text"
                                                        value={newNote.vitals.temperature}
                                                        onChange={(e) => setNewNote(prev => ({
                                                            ...prev,
                                                            vitals: { ...prev.vitals, temperature: e.target.value }
                                                        }))}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                        placeholder="98.6°F"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1">Weight</label>
                                                    <input
                                                        type="text"
                                                        value={newNote.vitals.weight}
                                                        onChange={(e) => setNewNote(prev => ({
                                                            ...prev,
                                                            vitals: { ...prev.vitals, weight: e.target.value }
                                                        }))}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                        placeholder="175 lbs"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1">Height</label>
                                                    <input
                                                        type="text"
                                                        value={newNote.vitals.height}
                                                        onChange={(e) => setNewNote(prev => ({
                                                            ...prev,
                                                            vitals: { ...prev.vitals, height: e.target.value }
                                                        }))}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                        placeholder="70 in"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Clinical Content */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Chief Complaint / Notes</label>
                                                <textarea
                                                    value={newNote.content}
                                                    onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    rows="4"
                                                    placeholder="Patient presentation, symptoms, examination findings..."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis / ICD-10</label>
                                                <input
                                                    type="text"
                                                    value={newNote.diagnosis}
                                                    onChange={(e) => setNewNote(prev => ({ ...prev, diagnosis: e.target.value }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Primary diagnosis with ICD-10 code..."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Assessment</label>
                                                <textarea
                                                    value={newNote.assessment}
                                                    onChange={(e) => setNewNote(prev => ({ ...prev, assessment: e.target.value }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    rows="3"
                                                    placeholder="Clinical assessment and impression..."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                                                <textarea
                                                    value={newNote.plan}
                                                    onChange={(e) => setNewNote(prev => ({ ...prev, plan: e.target.value }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    rows="3"
                                                    placeholder="Treatment plan, next steps..."
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Medications</label>
                                                    <textarea
                                                        value={newNote.medications}
                                                        onChange={(e) => setNewNote(prev => ({ ...prev, medications: e.target.value }))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                        rows="2"
                                                        placeholder="Current medications..."
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up</label>
                                                    <input
                                                        type="text"
                                                        value={newNote.followUp}
                                                        onChange={(e) => setNewNote(prev => ({ ...prev, followUp: e.target.value }))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Follow-up timeframe..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : activeNote ? (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-xl font-semibold text-gray-900">{activeNote.title}</h2>
                                                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-4 h-4" />
                                                        {activeNote.provider}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        {formatDate(activeNote.date)}
                                                    </span>
                                                    <span className="capitalize bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                        {activeNote.type}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleEditNote(activeNote)}
                                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                                Edit
                                            </button>
                                        </div>

                                        {/* Vitals Display */}
                                        {(activeNote.vitals?.bloodPressure || activeNote.vitals?.heartRate) && (
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <h3 className="font-semibold text-gray-900 mb-3">Vital Signs</h3>
                                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                                                    {activeNote.vitals.bloodPressure && (
                                                        <div>
                                                            <span className="text-gray-600">Blood Pressure:</span>
                                                            <div className="font-medium">{activeNote.vitals.bloodPressure}</div>
                                                        </div>
                                                    )}
                                                    {activeNote.vitals.heartRate && (
                                                        <div>
                                                            <span className="text-gray-600">Heart Rate:</span>
                                                            <div className="font-medium">{activeNote.vitals.heartRate} bpm</div>
                                                        </div>
                                                    )}
                                                    {activeNote.vitals.temperature && (
                                                        <div>
                                                            <span className="text-gray-600">Temperature:</span>
                                                            <div className="font-medium">{activeNote.vitals.temperature}</div>
                                                        </div>
                                                    )}
                                                    {activeNote.vitals.weight && (
                                                        <div>
                                                            <span className="text-gray-600">Weight:</span>
                                                            <div className="font-medium">{activeNote.vitals.weight}</div>
                                                        </div>
                                                    )}
                                                    {activeNote.vitals.height && (
                                                        <div>
                                                            <span className="text-gray-600">Height:</span>
                                                            <div className="font-medium">{activeNote.vitals.height}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-4">
                                            {activeNote.content && (
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 mb-2">Chief Complaint / Notes</h3>
                                                    <p className="text-gray-700 whitespace-pre-wrap">{activeNote.content}</p>
                                                </div>
                                            )}

                                            {activeNote.diagnosis && (
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 mb-2">Diagnosis</h3>
                                                    <p className="text-gray-700">{activeNote.diagnosis}</p>
                                                </div>
                                            )}

                                            {activeNote.assessment && (
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 mb-2">Assessment</h3>
                                                    <p className="text-gray-700 whitespace-pre-wrap">{activeNote.assessment}</p>
                                                </div>
                                            )}

                                            {activeNote.plan && (
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 mb-2">Plan</h3>
                                                    <p className="text-gray-700 whitespace-pre-wrap">{activeNote.plan}</p>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {activeNote.medications && (
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 mb-2">Medications</h3>
                                                        <p className="text-gray-700 whitespace-pre-wrap">{activeNote.medications}</p>
                                                    </div>
                                                )}
                                                {activeNote.followUp && (
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 mb-2">Follow-up</h3>
                                                        <p className="text-gray-700">{activeNote.followUp}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-16 text-gray-500">
                                        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Note Selected</h3>
                                        <p>Select a note to view details or create a new note</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderNotesPage;