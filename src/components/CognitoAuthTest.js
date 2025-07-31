// src/components/CognitoAuthTest.js - Test with Cognito Authentication
import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';

const CognitoAuthTest = () => {
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

    // Test with proper Cognito authentication
    const testCognitoOperations = async () => {
        setLoading(true);
        clearResults();

        addResult('info', '🔐 Testing operations with Cognito authentication...');

        try {
            // Check current user
            const currentUser = await getCurrentUser();
            addResult('success', `✅ Cognito user authenticated: ${currentUser.username}`, {
                username: currentUser.username,
                userId: currentUser.userId
            });

            const cognitoClient = generateClient({ authMode: 'userPool' });

            // Test 1: Create doctor with Cognito
            addResult('info', '👨‍⚕️ Creating doctor with Cognito authentication...');

            const doctorInput = {
                firstName: 'Dr. Cognito',
                lastName: 'Test',
                email: `cognito-doctor-${Date.now()}@test.com`,
                specialty: 'Cognito Medicine',
                licenseNumber: `COG-${Date.now()}`
            };

            const doctorResult = await cognitoClient.graphql({
                query: `
                    mutation CreateDoctor($input: CreateDoctorInput!) {
                        createDoctor(input: $input) {
                            id
                            firstName
                            lastName
                            email
                            specialty
                            licenseNumber
                            owner
                            createdAt
                            updatedAt
                        }
                    }
                `,
                variables: { input: doctorInput },
                authMode: 'userPool'
            });

            if (doctorResult.data?.createDoctor) {
                addResult('success', '✅ Doctor created successfully with Cognito!', doctorResult.data.createDoctor);
            } else {
                addResult('error', '❌ Doctor creation returned null with Cognito', doctorResult);
            }

            // Test 2: List doctors with Cognito
            addResult('info', '📋 Listing doctors with Cognito authentication...');

            const listDoctorsResult = await cognitoClient.graphql({
                query: `
                    query ListDoctors {
                        listDoctors {
                            items {
                                id
                                firstName
                                lastName
                                email
                                specialty
                                licenseNumber
                                owner
                                createdAt
                            }
                            nextToken
                        }
                    }
                `,
                authMode: 'userPool'
            });

            if (listDoctorsResult.data?.listDoctors?.items) {
                const doctors = listDoctorsResult.data.listDoctors.items;
                addResult('success', `✅ Found ${doctors.length} doctors with Cognito!`, {
                    count: doctors.length,
                    doctors: doctors.slice(0, 3) // Show first 3
                });
            } else {
                addResult('warning', '⚠️ listDoctors returned null/empty with Cognito', listDoctorsResult);
            }

            // Test 3: Create note with Cognito
            addResult('info', '📝 Creating note with Cognito authentication...');

            const noteInput = {
                title: 'Cognito Test Note',
                content: `Created with Cognito auth at ${new Date().toISOString()}`
            };

            const noteResult = await cognitoClient.graphql({
                query: `
                    mutation CreateNote($input: CreateNoteInput!) {
                        createNote(input: $input) {
                            id
                            title
                            content
                            owner
                            createdAt
                            updatedAt
                        }
                    }
                `,
                variables: { input: noteInput },
                authMode: 'userPool'
            });

            if (noteResult.data?.createNote) {
                addResult('success', '✅ Note created successfully with Cognito!', noteResult.data.createNote);
            } else {
                addResult('error', '❌ Note creation failed with Cognito', noteResult);
            }

            // Test 4: List notes with Cognito
            addResult('info', '📋 Listing notes with Cognito authentication...');

            const listNotesResult = await cognitoClient.graphql({
                query: `
                    query ListNotes {
                        listNotes {
                            items {
                                id
                                title
                                content
                                owner
                                createdAt
                            }
                            nextToken
                        }
                    }
                `,
                authMode: 'userPool'
            });

            if (listNotesResult.data?.listNotes?.items) {
                const notes = listNotesResult.data.listNotes.items;
                addResult('success', `✅ Found ${notes.length} notes with Cognito!`, {
                    count: notes.length,
                    notes: notes.slice(0, 3) // Show first 3
                });
            } else {
                addResult('warning', '⚠️ listNotes returned empty with Cognito', listNotesResult);
            }

            // Test 5: Compare with API Key for patients (should still work)
            addResult('info', '👤 Testing patients with API Key for comparison...');

            const apiKeyClient = generateClient({ authMode: 'apiKey' });

            const patientsResult = await apiKeyClient.graphql({
                query: `
                    query ListPatients($limit: Int) {
                        listPatients(limit: $limit) {
                            items {
                                id
                                firstName
                                lastName
                                email
                                createdAt
                            }
                            nextToken
                        }
                    }
                `,
                variables: { limit: 3 },
                authMode: 'apiKey'
            });

            if (patientsResult.data?.listPatients?.items) {
                const patients = patientsResult.data.listPatients.items;
                addResult('success', `✅ Found ${patients.length} patients with API Key (for comparison)`, {
                    count: patients.length
                });
            }

        } catch (error) {
            addResult('error', '❌ Cognito test failed:', {
                message: error.message,
                errors: error.errors
            });
        }

        addResult('info', '🏁 Cognito authentication test completed!');
        setLoading(false);
    };

    const getResultIcon = (type) => {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            default: return '•';
        }
    };

    const getResultColor = (type) => {
        switch (type) {
            case 'success': return '#10B981';
            case 'error': return '#EF4444';
            case 'warning': return '#F59E0B';
            case 'info': return '#3B82F6';
            default: return '#6B7280';
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h2>🔐 Cognito Authentication Test</h2>

            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={testCognitoOperations}
                    disabled={loading}
                    style={{
                        padding: '12px 20px',
                        backgroundColor: '#10B981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        marginRight: '10px'
                    }}
                >
                    {loading ? '🔄 Testing Cognito...' : '🔐 Test Cognito Operations'}
                </button>

                <button
                    onClick={clearResults}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: '#6B7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    🗑️ Clear
                </button>
            </div>

            {/* Results Display */}
            <div style={{
                backgroundColor: '#1F2937',
                color: '#F9FAFB',
                padding: '20px',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '14px',
                maxHeight: '700px',
                overflowY: 'auto'
            }}>
                {results.length === 0 ? (
                    <div style={{ color: '#9CA3AF' }}>
                        Click "Test Cognito Operations" to test with proper Cognito authentication.
                    </div>
                ) : (
                    results.map((result) => (
                        <div key={result.id} style={{ marginBottom: '15px' }}>
                            <div style={{
                                color: getResultColor(result.type),
                                fontWeight: 'bold',
                                fontSize: '14px'
                            }}>
                                [{result.timestamp}] {getResultIcon(result.type)} {result.message}
                            </div>
                            {result.data && (
                                <pre style={{
                                    marginTop: '6px',
                                    marginLeft: '20px',
                                    color: '#D1D5DB',
                                    fontSize: '11px',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    maxHeight: '300px',
                                    overflowY: 'auto',
                                    backgroundColor: '#374151',
                                    padding: '8px',
                                    borderRadius: '4px'
                                }}>
                                    {typeof result.data === 'string'
                                        ? result.data
                                        : JSON.stringify(result.data, null, 2)
                                    }
                                </pre>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Explanation */}
            <div style={{ marginTop: '20px', padding: '15px', background: '#EFF6FF', borderRadius: '8px' }}>
                <h4 style={{ color: '#1E40AF', margin: '0 0 10px 0' }}>🎯 What This Test Does:</h4>
                <ul style={{ color: '#1E40AF', margin: 0, paddingLeft: '20px' }}>
                    <li>Tests Doctor and Note operations with <strong>proper Cognito User Pool authentication</strong></li>
                    <li>Uses the <code>authMode: 'userPool'</code> instead of <code>authMode: 'apiKey'</code></li>
                    <li>Should show that Doctor and Note operations work when using the correct auth method</li>
                    <li>Compares with Patient operations using API Key to confirm the difference</li>
                    <li>This will prove our theory about the authorization requirements</li>
                </ul>
            </div>
        </div>
    );
};

export default CognitoAuthTest;