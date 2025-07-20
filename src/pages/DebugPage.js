// src/pages/DebugPage.js - Debug and Test Page
import React, { useState } from 'react';
import { apiService } from '../services/api';

const DebugPage = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

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

    const testConnection = async () => {
        setLoading(true);
        addResult('info', 'Testing GraphQL connection...');

        try {
            const result = await apiService.testConnection();
            addResult('success', 'Connection test successful!', result);
        } catch (error) {
            addResult('error', 'Connection test failed', {
                message: error.message,
                errors: error.errors,
                stack: error.stack
            });
        }

        setLoading(false);
    };

    const testListPatients = async () => {
        setLoading(true);
        addResult('info', 'Testing listPatients query...');

        try {
            const result = await apiService.getPatients({ limit: 5 });
            addResult('success', `Found ${result.data.length} patients`, result);
        } catch (error) {
            addResult('error', 'listPatients failed', {
                message: error.message,
                errors: error.errors
            });
        }

        setLoading(false);
    };

    const testCreatePatient = async () => {
        setLoading(true);
        addResult('info', 'Testing createPatient mutation...');

        const testPatient = {
            firstName: 'Test',
            lastName: 'User',
            email: `test-${Date.now()}@example.com`,
            dateOfBirth: '1990-01-01'
        };

        try {
            const result = await apiService.createPatient(testPatient);
            addResult('success', 'Patient created successfully', result);
        } catch (error) {
            addResult('error', 'createPatient failed', {
                message: error.message,
                errors: error.errors
            });
        }

        setLoading(false);
    };

    const testListNotes = async () => {
        setLoading(true);
        addResult('info', 'Testing listNotes query...');

        try {
            const result = await apiService.getNotes({ limit: 5 });
            addResult('success', `Found ${result.data.length} notes`, result);
        } catch (error) {
            addResult('error', 'listNotes failed', {
                message: error.message,
                errors: error.errors
            });
        }

        setLoading(false);
    };

    const testCreateNote = async () => {
        setLoading(true);
        addResult('info', 'Testing createNote mutation...');

        const testNote = {
            title: 'Test Note',
            content: `Test note created at ${new Date().toLocaleString()}`,
            patientId: null, // No patient association for this test
            category: 'General',
            priority: 'Medium'
        };

        try {
            const result = await apiService.createNote(testNote);
            addResult('success', 'Note created successfully', result);
        } catch (error) {
            addResult('error', 'createNote failed', {
                message: error.message,
                errors: error.errors
            });
        }

        setLoading(false);
    };

    const testCreateNoteWithPatient = async () => {
        setLoading(true);
        addResult('info', 'Testing createNote with patient association...');

        // First, let's get the latest patient
        try {
            const patientsResult = await apiService.getPatients({ limit: 1 });

            if (patientsResult.data.length === 0) {
                addResult('error', 'No patients found. Create a patient first.');
                setLoading(false);
                return;
            }

            const latestPatient = patientsResult.data[0];

            const testNote = {
                title: 'Patient Note',
                content: `Note for patient ${latestPatient.firstName} ${latestPatient.lastName}`,
                patientId: latestPatient.id,
                category: 'Medical',
                priority: 'High'
            };

            const result = await apiService.createNote(testNote);
            addResult('success', `Note created for patient ${latestPatient.firstName} ${latestPatient.lastName}`, result);
        } catch (error) {
            addResult('error', 'createNote with patient failed', {
                message: error.message,
                errors: error.errors
            });
        }

        setLoading(false);
    };

    const testDirectNote = async () => {
        setLoading(true);
        addResult('info', 'Testing direct Note GraphQL...');

        try {
            const { generateClient } = await import('aws-amplify/api');
            const client = generateClient({ authMode: 'apiKey' });

            // Test create note directly
            const createResult = await client.graphql({
                query: `
                    mutation CreateNote($input: CreateNoteInput!) {
                        createNote(input: $input) {
                            id
                            title
                            content
                            createdAt
                        }
                    }
                `,
                variables: {
                    input: {
                        title: 'Direct Test Note',
                        content: 'This is a direct GraphQL test'
                    }
                },
                authMode: 'apiKey'
            });

            addResult('success', 'Direct Note creation successful', createResult);

            // Test list notes directly
            const listResult = await client.graphql({
                query: `
                    query ListNotes {
                        listNotes {
                            items {
                                id
                                title
                                content
                                createdAt
                            }
                        }
                    }
                `,
                authMode: 'apiKey'
            });

            addResult('success', 'Direct Note listing successful', listResult);

        } catch (error) {
            addResult('error', 'Direct Note GraphQL failed', {
                message: error.message,
                errors: error.errors,
                networkError: error.networkError
            });
        }

        setLoading(false);
    };

    const testAmplifyConfig = () => {
        addResult('info', 'Checking Amplify configuration...');

        try {
            // Import amplify config
            import('../amplify_outputs.json').then(config => {
                addResult('success', 'Amplify config loaded', {
                    data_url: config.data?.url,
                    data_region: config.data?.aws_region,
                    default_auth: config.data?.default_authorization_type,
                    auth_types: config.data?.authorization_types,
                    auth_user_pool: config.auth?.user_pool_id
                });
            }).catch(error => {
                addResult('error', 'Failed to load amplify config', error);
            });
        } catch (error) {
            addResult('error', 'Error checking config', error);
        }
    };

    const testDirectGraphQL = async () => {
        setLoading(true);
        addResult('info', 'Testing direct GraphQL call...');

        try {
            const { generateClient } = await import('aws-amplify/api');
            const client = generateClient({ authMode: 'apiKey' });

            const result = await client.graphql({
                query: `
                    query ListPatients {
                        listPatients(limit: 1) {
                            items {
                                id
                                firstName
                                lastName
                            }
                        }
                    }
                `,
                authMode: 'apiKey'
            });

            addResult('success', 'Direct GraphQL call successful', result);
        } catch (error) {
            addResult('error', 'Direct GraphQL call failed', {
                message: error.message,
                errors: error.errors,
                networkError: error.networkError
            });
        }

        setLoading(false);
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace' }}>
            <h1>🔧 Debug & Test Page</h1>

            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={testAmplifyConfig}
                    style={{ marginRight: '10px', padding: '8px 16px' }}
                >
                    1. Check Config
                </button>

                <button
                    onClick={testConnection}
                    disabled={loading}
                    style={{ marginRight: '10px', padding: '8px 16px' }}
                >
                    2. Test Connection
                </button>

                <button
                    onClick={testDirectGraphQL}
                    disabled={loading}
                    style={{ marginRight: '10px', padding: '8px 16px' }}
                >
                    3. Direct GraphQL
                </button>

                <button
                    onClick={testListPatients}
                    disabled={loading}
                    style={{ marginRight: '10px', padding: '8px 16px' }}
                >
                    4. List Patients
                </button>

                <button
                    onClick={testCreatePatient}
                    disabled={loading}
                    style={{ marginRight: '10px', padding: '8px 16px' }}
                >
                    5. Create Patient
                </button>

                <button
                    onClick={testListNotes}
                    disabled={loading}
                    style={{ marginRight: '10px', padding: '8px 16px' }}
                >
                    6. List Notes
                </button>

                <button
                    onClick={testCreateNote}
                    disabled={loading}
                    style={{ marginRight: '10px', padding: '8px 16px' }}
                >
                    7. Create Note
                </button>

                <button
                    onClick={testCreateNoteWithPatient}
                    disabled={loading}
                    style={{ marginRight: '10px', padding: '8px 16px' }}
                >
                    8. Note + Patient
                </button>

                <button
                    onClick={testDirectNote}
                    disabled={loading}
                    style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#10b981', color: 'white' }}
                >
                    9. Direct Note Test
                </button>

                <button
                    onClick={clearResults}
                    style={{ marginLeft: '20px', padding: '8px 16px', backgroundColor: '#f44336', color: 'white' }}
                >
                    Clear Results
                </button>
            </div>

            {loading && (
                <div style={{ padding: '10px', backgroundColor: '#e3f2fd', marginBottom: '10px' }}>
                    🔄 Loading...
                </div>
            )}

            <div style={{ maxHeight: '600px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
                {results.length === 0 ? (
                    <p style={{ color: '#666' }}>No test results yet. Click a button above to start testing.</p>
                ) : (
                    results.map(result => (
                        <div
                            key={result.id}
                            style={{
                                marginBottom: '15px',
                                padding: '10px',
                                backgroundColor: result.type === 'success' ? '#e8f5e8' :
                                    result.type === 'error' ? '#ffebee' : '#f0f0f0',
                                border: `1px solid ${result.type === 'success' ? '#4caf50' :
                                    result.type === 'error' ? '#f44336' : '#ccc'}`,
                                borderRadius: '4px'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '5px'
                            }}>
                                <strong style={{
                                    color: result.type === 'success' ? '#2e7d32' :
                                        result.type === 'error' ? '#c62828' : '#333'
                                }}>
                                    {result.type === 'success' ? '✅' :
                                        result.type === 'error' ? '❌' : 'ℹ️'} {result.message}
                                </strong>
                                <small style={{ color: '#666' }}>{result.timestamp}</small>
                            </div>

                            {result.data && (
                                <pre style={{
                                    backgroundColor: '#f5f5f5',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    overflow: 'auto',
                                    maxHeight: '200px',
                                    color: 'black'
                                }}>
                                    {JSON.stringify(result.data, null, 2)}
                                </pre>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DebugPage;