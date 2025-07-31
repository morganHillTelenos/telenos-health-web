// src/components/SchemaMatchedTest.js - Matches Your Actual Schema
import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';

const SchemaMatchedTest = () => {
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

    // Test with queries that match your actual schema
    const testActualSchema = async () => {
        setLoading(true);
        clearResults();

        addResult('info', '🔐 Testing with schema-matched queries...');

        try {
            // Check current user
            const currentUser = await getCurrentUser();
            addResult('success', `✅ Cognito user authenticated: ${currentUser.username}`);

            const cognitoClient = generateClient({ authMode: 'userPool' });

            // Test 1: Create doctor with Cognito (without owner field in response)
            addResult('info', '👨‍⚕️ Creating doctor with Cognito (schema-matched)...');

            const doctorInput = {
                firstName: 'Dr. Schema',
                lastName: 'Match',
                email: `schema-doctor-${Date.now()}@test.com`,
                specialty: 'Schema Medicine',
                licenseNumber: `SCH-${Date.now()}`
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

            // Test 2: List doctors with Cognito (without owner field)
            addResult('info', '📋 Listing doctors with Cognito (schema-matched)...');

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
                                createdAt
                                updatedAt
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
                    doctors: doctors.slice(0, 3)
                });
            } else if (listDoctorsResult.data?.listDoctors === null) {
                addResult('warning', '⚠️ listDoctors returned null - may need different permissions', listDoctorsResult);
            } else {
                addResult('info', '📋 listDoctors response:', listDoctorsResult);
            }

            // Test 3: Create note with Cognito (without owner field)
            addResult('info', '📝 Creating note with Cognito (schema-matched)...');

            const noteInput = {
                title: 'Schema Test Note',
                content: `Created with Cognito auth at ${new Date().toISOString()}`
            };

            const noteResult = await cognitoClient.graphql({
                query: `
                    mutation CreateNote($input: CreateNoteInput!) {
                        createNote(input: $input) {
                            id
                            title
                            content
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

            // Test 4: List notes with Cognito (without owner field)
            addResult('info', '📋 Listing notes with Cognito (schema-matched)...');

            const listNotesResult = await cognitoClient.graphql({
                query: `
                    query ListNotes {
                        listNotes {
                            items {
                                id
                                title
                                content
                                createdAt
                                updatedAt
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
                    notes: notes.slice(0, 3)
                });
            } else if (listNotesResult.data?.listNotes === null) {
                addResult('warning', '⚠️ listNotes returned null - may need different permissions', listNotesResult);
            } else {
                addResult('info', '📋 listNotes response:', listNotesResult);
            }

            // Test 5: Try to get the doctor we just created (if we have an ID)
            if (doctorResult.data?.createDoctor?.id) {
                addResult('info', '🔍 Testing getDoctor by ID...');

                try {
                    const getDoctorResult = await cognitoClient.graphql({
                        query: `
                            query GetDoctor($id: ID!) {
                                getDoctor(id: $id) {
                                    id
                                    firstName
                                    lastName
                                    email
                                    specialty
                                    licenseNumber
                                    createdAt
                                }
                            }
                        `,
                        variables: { id: doctorResult.data.createDoctor.id },
                        authMode: 'userPool'
                    });

                    if (getDoctorResult.data?.getDoctor) {
                        addResult('success', '✅ getDoctor successful!', getDoctorResult.data.getDoctor);
                    } else {
                        addResult('warning', '⚠️ getDoctor returned null', getDoctorResult);
                    }
                } catch (getError) {
                    addResult('error', '❌ getDoctor failed', {
                        message: getError.message,
                        errors: getError.errors
                    });
                }
            }

            // Test 6: Compare with API Key for reference
            addResult('info', '📊 Comparing with API Key operations...');

            const apiKeyClient = generateClient({ authMode: 'apiKey' });

            // Try doctor creation with API Key (should fail/return null)
            try {
                const apiDoctorResult = await apiKeyClient.graphql({
                    query: `
                        mutation CreateDoctor($input: CreateDoctorInput!) {
                            createDoctor(input: $input) {
                                id
                                firstName
                                lastName
                            }
                        }
                    `,
                    variables: {
                        input: {
                            firstName: 'API',
                            lastName: 'Test',
                            email: `api-doctor-${Date.now()}@test.com`,
                            specialty: 'API Medicine',
                            licenseNumber: `API-${Date.now()}`
                        }
                    },
                    authMode: 'apiKey'
                });

                addResult('info', '📊 Doctor creation with API Key:', apiDoctorResult);
            } catch (apiError) {
                addResult('info', '📊 Doctor creation with API Key failed (expected):', {
                    message: apiError.message
                });
            }

        } catch (error) {
            addResult('error', '❌ Schema test failed:', {
                message: error.message,
                errors: error.errors
            });
        }

        addResult('info', '🏁 Schema-matched test completed!');
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
            <h2>🔬 Schema-Matched Test</h2>

            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={testActualSchema}
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
                    {loading ? '🔄 Testing Schema...' : '🔬 Test Actual Schema'}
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
                        Click "Test Actual Schema" to test with your exact schema fields.
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

            {/* Key Finding */}
            <div style={{ marginTop: '20px', padding: '15px', background: '#FEF3C7', borderRadius: '8px' }}>
                <h4 style={{ color: '#92400E', margin: '0 0 10px 0' }}>🔍 Key Discovery:</h4>
                <ul style={{ color: '#92400E', margin: 0, paddingLeft: '20px' }}>
                    <li><strong>Your Doctor schema doesn't have an 'owner' field</strong></li>
                    <li>This means the authorization might be different than expected</li>
                    <li>Testing without the 'owner' field should reveal the true behavior</li>
                    <li>Will compare Cognito vs API Key to understand permissions</li>
                </ul>
            </div>
        </div>
    );
};

export default SchemaMatchedTest;