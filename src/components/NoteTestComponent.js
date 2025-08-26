// src/components/NoteTestComponent.js - Corrected for your actual schema
import React, { useState } from 'react';

const NoteTestComponent = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedNoteId, setSelectedNoteId] = useState('');

    const addResult = (type, message, data = null) => {
        const timestamp = new Date().toLocaleTimeString();
        setResults(prev => [...prev, {
            type,
            message,
            data,
            timestamp,
            id: Date.now() + Math.random()
        }]);
    };

    const clearResults = () => {
        setResults([]);
    };

    // 🔧 CORRECT CONFIG HELPER
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

    // 📋 READ - List all notes
    const testListNotes = async () => {
        setLoading(true);
        addResult('info', '📋 Testing List Notes...');

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

            const notes = result.data.listNotes.items;
            addResult('success', `📋 Found ${notes.length} notes`, notes);

            if (notes.length > 0) {
                setSelectedNoteId(notes[0].id);
                addResult('info', `Selected note: "${notes[0].title}" (ID: ${notes[0].id})`);
            }

        } catch (error) {
            addResult('error', 'List notes failed', error);
        }

        setLoading(false);
    };

    // ➕ CREATE - Create new note (only with available fields)
    const testCreateNote = async () => {
        setLoading(true);
        addResult('info', '➕ Testing Create Note...');

        try {
            const client = await ensureCorrectConfig();

            const newNote = {
                title: 'Patient Consultation Note',
                content: `Comprehensive patient consultation conducted on ${new Date().toLocaleDateString()}. Patient presented with chief complaint and discussed treatment options.`,
                category: 'Consultation',
                priority: 'Medium'
            };

            addResult('info', `Creating note: "${newNote.title}"`);

            const result = await client.graphql({
                query: `
                    mutation CreateNote($input: CreateNoteInput!) {
                        createNote(input: $input) {
                            id
                            title
                            content
                            category
                            priority
                            createdAt
                        }
                    }
                `,
                variables: { input: newNote },
                authMode: 'apiKey'
            });

            addResult('success', '➕ Note created successfully!', result.data.createNote);
            setSelectedNoteId(result.data.createNote.id);

        } catch (error) {
            addResult('error', 'Create note failed', error);
        }

        setLoading(false);
    };

    // ✏️ UPDATE - Update existing note
    const testUpdateNote = async () => {
        if (!selectedNoteId) {
            addResult('warning', 'No note selected. List notes first.');
            return;
        }

        setLoading(true);
        addResult('info', `✏️ Testing Update Note: ${selectedNoteId}`);

        try {
            const client = await ensureCorrectConfig();

            const updateData = {
                id: selectedNoteId,
                content: `UPDATED: ${new Date().toLocaleString()} - Note has been updated with additional observations and recommendations.`,
                priority: 'High'
            };

            addResult('info', 'Updating note content and priority...');

            const result = await client.graphql({
                query: `
                    mutation UpdateNote($input: UpdateNoteInput!) {
                        updateNote(input: $input) {
                            id
                            title
                            content
                            category
                            priority
                            createdAt
                            updatedAt
                        }
                    }
                `,
                variables: { input: updateData },
                authMode: 'apiKey'
            });

            addResult('success', '✏️ Note updated successfully!', result.data.updateNote);

        } catch (error) {
            addResult('error', 'Update note failed', error);
        }

        setLoading(false);
    };

    // 🗑️ DELETE - Delete note
    const testDeleteNote = async () => {
        if (!selectedNoteId) {
            addResult('warning', 'No note selected. List notes first.');
            return;
        }

        setLoading(true);
        addResult('info', `🗑️ Testing Delete Note: ${selectedNoteId}`);

        try {
            const client = await ensureCorrectConfig();

            const result = await client.graphql({
                query: `
                    mutation DeleteNote($input: DeleteNoteInput!) {
                        deleteNote(input: $input) {
                            id
                            title
                            category
                        }
                    }
                `,
                variables: { input: { id: selectedNoteId } },
                authMode: 'apiKey'
            });

            addResult('success', '🗑️ Note deleted successfully!', result.data.deleteNote);
            setSelectedNoteId('');

            setTimeout(() => {
                testListNotes();
            }, 1000);

        } catch (error) {
            addResult('error', 'Delete note failed', error);
        }

        setLoading(false);
    };

    // 🔄 COMPLETE CRUD TEST
    const testCompleteCrud = async () => {
        setLoading(true);
        addResult('info', '🔄 Testing Complete Note CRUD Operations...');

        try {
            const client = await ensureCorrectConfig();

            // Step 1: Create
            addResult('info', 'Step 1: Creating test note...');
            const newNote = {
                title: 'Complete CRUD Test Note',
                content: 'This is a test note for complete CRUD operations testing.',
                category: 'Test',
                priority: 'Medium'
            };

            const createResult = await client.graphql({
                query: `
                    mutation CreateNote($input: CreateNoteInput!) {
                        createNote(input: $input) {
                            id
                            title
                            content
                            category
                            priority
                            createdAt
                        }
                    }
                `,
                variables: { input: newNote },
                authMode: 'apiKey'
            });

            const noteId = createResult.data.createNote.id;
            addResult('success', '➕ Step 1: Note created!', createResult.data.createNote);

            // Step 2: Read
            addResult('info', 'Step 2: Reading note...');
            const getResult = await client.graphql({
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
                variables: { id: noteId },
                authMode: 'apiKey'
            });
            addResult('success', '🔍 Step 2: Note retrieved!', getResult.data.getNote);

            // Step 3: Update
            addResult('info', 'Step 3: Updating note...');
            const updateResult = await client.graphql({
                query: `
                    mutation UpdateNote($input: UpdateNoteInput!) {
                        updateNote(input: $input) {
                            id
                            title
                            content
                            priority
                            updatedAt
                        }
                    }
                `,
                variables: {
                    input: {
                        id: noteId,
                        content: 'UPDATED: This note has been updated during CRUD testing.',
                        priority: 'High'
                    }
                },
                authMode: 'apiKey'
            });
            addResult('success', '✏️ Step 3: Note updated!', updateResult.data.updateNote);

            // Step 4: Delete
            addResult('info', 'Step 4: Deleting note...');
            const deleteResult = await client.graphql({
                query: `
                    mutation DeleteNote($input: DeleteNoteInput!) {
                        deleteNote(input: $input) {
                            id
                            title
                            category
                        }
                    }
                `,
                variables: { input: { id: noteId } },
                authMode: 'apiKey'
            });
            addResult('success', '🗑️ Step 4: Note deleted!', deleteResult.data.deleteNote);

            addResult('success', '🎉 COMPLETE NOTE CRUD TEST PASSED!');

        } catch (error) {
            addResult('error', 'Complete Note CRUD test failed', error);
        }

        setLoading(false);
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace' }}>
            <h2>📝 Note API - Complete CRUD Testing</h2>

            {selectedNoteId && (
                <div style={{
                    padding: '10px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '4px',
                    marginBottom: '20px',
                    fontSize: '14px'
                }}>
                    <strong>Selected Note ID:</strong> {selectedNoteId}
                </div>
            )}

            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={testListNotes}
                    disabled={loading}
                    style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                    📋 List All Notes
                </button>

                <button
                    onClick={testCreateNote}
                    disabled={loading}
                    style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                    ➕ Create New Note
                </button>

                <button
                    onClick={testUpdateNote}
                    disabled={loading || !selectedNoteId}
                    style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#d97706', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                    ✏️ Update Selected Note
                </button>

                <button
                    onClick={testDeleteNote}
                    disabled={loading || !selectedNoteId}
                    style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                    🗑️ Delete Selected Note
                </button>
            </div>

            <div style={{ marginBottom: '20px', paddingTop: '20px', borderTop: '2px solid #e5e7eb' }}>
                <button
                    onClick={testCompleteCrud}
                    disabled={loading}
                    style={{ marginRight: '10px', padding: '12px 20px', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
                >
                    🔄 Run Complete Note CRUD Test
                </button>

                <button
                    onClick={clearResults}
                    style={{ padding: '8px 16px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                    Clear Results
                </button>
            </div>

            {loading && <div style={{ color: '#3b82f6', marginBottom: '10px' }}>🔄 Testing...</div>}

            <div style={{ marginTop: '20px' }}>
                {results.map(result => (
                    <div
                        key={result.id}
                        style={{
                            margin: '10px 0',
                            padding: '10px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            backgroundColor: result.type === 'success' ? '#d1fae5' :
                                result.type === 'error' ? '#fee2e2' :
                                    result.type === 'warning' ? '#fef3c7' : '#f3f4f6'
                        }}
                    >
                        <div style={{ fontWeight: 'bold' }}>
                            {result.timestamp} - {result.message}
                        </div>
                        {result.data && (
                            <pre style={{ margin: '5px 0', fontSize: '12px', overflow: 'auto' }}>
                                {JSON.stringify(result.data, null, 2)}
                            </pre>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NoteTestComponent;