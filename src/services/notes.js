// src/services/notes.js
import { storageService } from './storage';

class NotesService {
    constructor() {
        this.storageKey = 'clinical_notes';
        this.initializeStorage();
    }

    initializeStorage() {
        // Initialize with some sample data if no notes exist
        const existingNotes = this.getAllNotes();
        if (existingNotes.length === 0) {
            const sampleNotes = [
                {
                    id: 'note_' + Date.now(),
                    patientId: '1', // This should match patient IDs from your existing data
                    patientName: 'John Smith',
                    type: 'progress',
                    title: 'Annual Checkup',
                    content: 'Patient presents for routine annual examination. No acute complaints. Patient reports feeling well overall.',
                    diagnosis: 'Z00.00 - Encounter for general adult medical examination without abnormal findings',
                    assessment: 'Patient appears to be in good health. Vital signs stable. No concerning findings on examination.',
                    plan: 'Continue current lifestyle modifications. Return in 1 year for next annual examination. Labs ordered for routine screening.',
                    vitals: {
                        bloodPressure: '120/80',
                        heartRate: '72',
                        temperature: '98.6',
                        weight: '175',
                        height: '70'
                    },
                    medications: 'Lisinopril 10mg daily, Multivitamin',
                    followUp: '1 year for annual exam',
                    provider: 'Dr. Smith',
                    date: new Date().toISOString(),
                    lastModified: new Date().toISOString()
                }
            ];
            this.saveNotes(sampleNotes);
        }
    }

    // Get all notes from storage
    getAllNotes() {
        try {
            return storageService.getItem(this.storageKey, []);
        } catch (error) {
            console.error('Error getting notes from storage:', error);
            return [];
        }
    }

    // Save notes to storage
    saveNotes(notes) {
        try {
            return storageService.setItem(this.storageKey, notes);
        } catch (error) {
            console.error('Error saving notes to storage:', error);
            return false;
        }
    }

    // Get notes for a specific patient
    async getPatientNotes(patientId) {
        try {
            const allNotes = this.getAllNotes();
            const patientNotes = allNotes.filter(note => note.patientId === patientId);
            return patientNotes.sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (error) {
            console.error('Error getting patient notes:', error);
            throw new Error('Failed to load patient notes');
        }
    }

    // Create a new note
    async createNote(noteData) {
        try {
            const allNotes = this.getAllNotes();

            const newNote = {
                id: 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                ...noteData,
                date: noteData.date || new Date().toISOString(),
                lastModified: new Date().toISOString()
            };

            const updatedNotes = [newNote, ...allNotes];

            if (this.saveNotes(updatedNotes)) {
                return newNote;
            } else {
                throw new Error('Failed to save note');
            }
        } catch (error) {
            console.error('Error creating note:', error);
            throw new Error('Failed to create note: ' + error.message);
        }
    }

    // Update an existing note
    async updateNote(noteId, updatedData) {
        try {
            const allNotes = this.getAllNotes();
            const noteIndex = allNotes.findIndex(note => note.id === noteId);

            if (noteIndex === -1) {
                throw new Error('Note not found');
            }

            const updatedNote = {
                ...allNotes[noteIndex],
                ...updatedData,
                lastModified: new Date().toISOString()
            };

            allNotes[noteIndex] = updatedNote;

            if (this.saveNotes(allNotes)) {
                return updatedNote;
            } else {
                throw new Error('Failed to save updated note');
            }
        } catch (error) {
            console.error('Error updating note:', error);
            throw new Error('Failed to update note: ' + error.message);
        }
    }

    // Delete a note
    async deleteNote(noteId) {
        try {
            const allNotes = this.getAllNotes();
            const updatedNotes = allNotes.filter(note => note.id !== noteId);

            if (this.saveNotes(updatedNotes)) {
                return true;
            } else {
                throw new Error('Failed to delete note');
            }
        } catch (error) {
            console.error('Error deleting note:', error);
            throw new Error('Failed to delete note: ' + error.message);
        }
    }

    // Get a specific note by ID
    async getNote(noteId) {
        try {
            const allNotes = this.getAllNotes();
            const note = allNotes.find(note => note.id === noteId);

            if (!note) {
                throw new Error('Note not found');
            }

            return note;
        } catch (error) {
            console.error('Error getting note:', error);
            throw new Error('Failed to get note: ' + error.message);
        }
    }

    // Search notes by content, diagnosis, or title
    async searchNotes(searchTerm, patientId = null) {
        try {
            let allNotes = this.getAllNotes();

            // Filter by patient if specified
            if (patientId) {
                allNotes = allNotes.filter(note => note.patientId === patientId);
            }

            // Search in multiple fields
            const searchResults = allNotes.filter(note => {
                const searchLower = searchTerm.toLowerCase();
                return (
                    note.title.toLowerCase().includes(searchLower) ||
                    note.content.toLowerCase().includes(searchLower) ||
                    note.diagnosis.toLowerCase().includes(searchLower) ||
                    note.assessment.toLowerCase().includes(searchLower) ||
                    note.plan.toLowerCase().includes(searchLower)
                );
            });

            return searchResults.sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (error) {
            console.error('Error searching notes:', error);
            throw new Error('Failed to search notes: ' + error.message);
        }
    }

    // Get notes by type
    async getNotesByType(type, patientId = null) {
        try {
            let allNotes = this.getAllNotes();

            if (patientId) {
                allNotes = allNotes.filter(note => note.patientId === patientId);
            }

            const filteredNotes = allNotes.filter(note => note.type === type);
            return filteredNotes.sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (error) {
            console.error('Error getting notes by type:', error);
            throw new Error('Failed to get notes by type: ' + error.message);
        }
    }

    // Get recent notes (last N notes)
    async getRecentNotes(limit = 10, patientId = null) {
        try {
            let allNotes = this.getAllNotes();

            if (patientId) {
                allNotes = allNotes.filter(note => note.patientId === patientId);
            }

            const sortedNotes = allNotes.sort((a, b) => new Date(b.date) - new Date(a.date));
            return sortedNotes.slice(0, limit);
        } catch (error) {
            console.error('Error getting recent notes:', error);
            throw new Error('Failed to get recent notes: ' + error.message);
        }
    }

    // Get notes within a date range
    async getNotesInDateRange(startDate, endDate, patientId = null) {
        try {
            let allNotes = this.getAllNotes();

            if (patientId) {
                allNotes = allNotes.filter(note => note.patientId === patientId);
            }

            const start = new Date(startDate);
            const end = new Date(endDate);

            const filteredNotes = allNotes.filter(note => {
                const noteDate = new Date(note.date);
                return noteDate >= start && noteDate <= end;
            });

            return filteredNotes.sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (error) {
            console.error('Error getting notes in date range:', error);
            throw new Error('Failed to get notes in date range: ' + error.message);
        }
    }

    // Export notes as JSON
    exportNotes(patientId = null) {
        try {
            let notesToExport = this.getAllNotes();

            if (patientId) {
                notesToExport = notesToExport.filter(note => note.patientId === patientId);
            }

            const exportData = {
                exportDate: new Date().toISOString(),
                totalNotes: notesToExport.length,
                notes: notesToExport
            };

            return JSON.stringify(exportData, null, 2);
        } catch (error) {
            console.error('Error exporting notes:', error);
            throw new Error('Failed to export notes: ' + error.message);
        }
    }

    // Get statistics about notes
    getNotesStatistics(patientId = null) {
        try {
            let allNotes = this.getAllNotes();

            if (patientId) {
                allNotes = allNotes.filter(note => note.patientId === patientId);
            }

            const stats = {
                totalNotes: allNotes.length,
                notesByType: {},
                notesThisMonth: 0,
                notesThisWeek: 0,
                averageNotesPerMonth: 0
            };

            const now = new Date();
            const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            allNotes.forEach(note => {
                // Count by type
                stats.notesByType[note.type] = (stats.notesByType[note.type] || 0) + 1;

                const noteDate = new Date(note.date);

                // Count this month
                if (noteDate >= oneMonthAgo) {
                    stats.notesThisMonth++;
                }

                // Count this week
                if (noteDate >= oneWeekAgo) {
                    stats.notesThisWeek++;
                }
            });

            // Calculate average (rough estimate)
            if (allNotes.length > 0) {
                const oldestNote = new Date(Math.min(...allNotes.map(note => new Date(note.date))));
                const monthsDiff = Math.max(1, (now - oldestNote) / (1000 * 60 * 60 * 24 * 30));
                stats.averageNotesPerMonth = Math.round(allNotes.length / monthsDiff);
            }

            return stats;
        } catch (error) {
            console.error('Error getting notes statistics:', error);
            return {
                totalNotes: 0,
                notesByType: {},
                notesThisMonth: 0,
                notesThisWeek: 0,
                averageNotesPerMonth: 0
            };
        }
    }
}

// Create and export singleton instance
export const notesService = new NotesService();
export default notesService;