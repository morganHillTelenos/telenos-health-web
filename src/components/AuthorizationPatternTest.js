// src/components/AuthorizationPatternTest.js - Discover the Authorization Pattern
import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';

const AuthorizationPatternTest = () => {
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

    const testAllAuthMethods = async () => {
        setLoading(true);
        clearResults();

        addResult('info', '🔍 Testing all possible authorization methods...');

        try {
            // Get current user info
            const currentUser = await getCurrentUser();
            addResult('success', `✅ Current user: ${currentUser.username}`, {
                username: currentUser.username,
                userId: currentUser.userId,
                groups: currentUser.signInUserSession?.accessToken?.payload?.['cognito:groups'] || 'None'
            });

            // Test 1: API Key (we know this returns null)
            addResult('info', '🔑 Testing API Key authorization...');
            await testWithApiKey();

            // Test 2: Cognito User Pools (we know this fails)
            addResult('info', '👤 Testing Cognito User Pools authorization...');
            await testWithCognito();

            // Test 3: IAM authorization
            addResult('info', '🛡️ Testing IAM authorization...');
            await testWithIAM();

            // Test 4: Check what operations ARE allowed
            addResult('info', '✅ Testing what operations are actually allowed...');
            await testAllowedOperations();

        } catch (error) {
            addResult('error', '❌ Authorization test failed:', {
                message: error.message,
                errors: error.errors
            });
        }

        addResult('info', '🏁 Authorization pattern test completed!');
        setLoading(false);
    };

    const testWithApiKey = async () => {
        try {
            const apiKeyClient = generateClient({ authMode: 'apiKey' });

            // Test doctor creation
            const result = await apiKeyClient.graphql({
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
                        lastName: 'Doctor',
                        email: `api-${Date.now()}@test.com`,
                        specialty: 'API Medicine',
                        licenseNumber: `API-${Date.now()}`
                    }
                },
                authMode: 'apiKey'
            });

            if (result.data?.createDoctor) {
                addResult('success', '✅ API Key: Doctor creation worked!', result.data.createDoctor);
            } else if (result.data?.createDoctor === null) {
                addResult('warning', '⚠️ API Key: Doctor creation returned null', result);
            } else {
                addResult('error', '❌ API Key: Unexpected response', result);
            }

        } catch (error) {
            addResult('error', '❌ API Key: Doctor creation failed', {
                message: error.message,
                errors: error.errors
            });
        }
    };

    const testWithCognito = async () => {
        try {
            const cognitoClient = generateClient({ authMode: 'userPool' });

            const result = await cognitoClient.graphql({
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
                        firstName: 'Cognito',
                        lastName: 'Doctor',
                        email: `cognito-${Date.now()}@test.com`,
                        specialty: 'Cognito Medicine',
                        licenseNumber: `COG-${Date.now()}`
                    }
                },
                authMode: 'userPool'
            });

            addResult('success', '✅ Cognito: Doctor creation worked!', result.data.createDoctor);

        } catch (error) {
            addResult('error', '❌ Cognito: Doctor creation failed (expected)', {
                message: error.message,
                errorType: error.errors?.[0]?.errorType
            });
        }
    };

    const testWithIAM = async () => {
        try {
            const iamClient = generateClient({ authMode: 'iam' });

            const result = await iamClient.graphql({
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
                        firstName: 'IAM',
                        lastName: 'Doctor',
                        email: `iam-${Date.now()}@test.com`,
                        specialty: 'IAM Medicine',
                        licenseNumber: `IAM-${Date.now()}`
                    }
                },
                authMode: 'iam'
            });

            addResult('success', '✅ IAM: Doctor creation worked!', result.data.createDoctor);

        } catch (error) {
            addResult('error', '❌ IAM: Doctor creation failed', {
                message: error.message,
                errorType: error.errors?.[0]?.errorType
            });
        }
    };

    const testAllowedOperations = async () => {
        const apiKeyClient = generateClient({ authMode: 'apiKey' });
        const cognitoClient = generateClient({ authMode: 'userPool' });

        // Test what operations actually work
        const tests = [
            {
                name: 'Patient Creation (API Key)',
                client: apiKeyClient,
                authMode: 'apiKey',
                operation: 'patient',
                type: 'create'
            },
            {
                name: 'Patient List (API Key)',
                client: apiKeyClient,
                authMode: 'apiKey',
                operation: 'patient',
                type: 'list'
            },
            {
                name: 'Note Creation (API Key)',
                client: apiKeyClient,
                authMode: 'apiKey',
                operation: 'note',
                type: 'create'
            },
            {
                name: 'Note List (API Key)',
                client: apiKeyClient,
                authMode: 'apiKey',
                operation: 'note',
                type: 'list'
            },
            {
                name: 'Note Creation (Cognito)',
                client: cognitoClient,
                authMode: 'userPool',
                operation: 'note',
                type: 'create'
            },
            {
                name: 'Note List (Cognito)',
                client: cognitoClient,
                authMode: 'userPool',
                operation: 'note',
                type: 'list'
            }
        ];

        for (const test of tests) {
            try {
                let result;

                if (test.operation === 'patient' && test.type === 'create') {
                    result = await test.client.graphql({
                        query: `
                            mutation CreatePatient($input: CreatePatientInput!) {
                                createPatient(input: $input) {
                                    id
                                    firstName
                                    lastName
                                }
                            }
                        `,
                        variables: {
                            input: {
                                firstName: 'Test',
                                lastName: 'Patient',
                                email: `test-${Date.now()}@test.com`,
                                dateOfBirth: '1990-01-01'
                            }
                        },
                        authMode: test.authMode
                    });
                } else if (test.operation === 'patient' && test.type === 'list') {
                    result = await test.client.graphql({
                        query: `
                            query ListPatients($limit: Int) {
                                listPatients(limit: $limit) {
                                    items {
                                        id
                                        firstName
                                        lastName
                                    }
                                }
                            }
                        `,
                        variables: { limit: 1 },
                        authMode: test.authMode
                    });
                } else if (test.operation === 'note' && test.type === 'create') {
                    result = await test.client.graphql({
                        query: `
                            mutation CreateNote($input: CreateNoteInput!) {
                                createNote(input: $input) {
                                    id
                                    title
                                    content
                                }
                            }
                        `,
                        variables: {
                            input: {
                                title: `${test.name} Note`,
                                content: `Created with ${test.authMode} at ${new Date().toISOString()}`
                            }
                        },
                        authMode: test.authMode
                    });
                } else if (test.operation === 'note' && test.type === 'list') {
                    result = await test.client.graphql({
                        query: `
                            query ListNotes($limit: Int) {
                                listNotes(limit: $limit) {
                                    items {
                                        id
                                        title
                                        content
                                    }
                                }
                            }
                        `,
                        variables: { limit: 1 },
                        authMode: test.authMode
                    });
                }

                if (result?.data) {
                    const success = Object.values(result.data)[0];
                    if (success === null) {
                        addResult('warning', `⚠️ ${test.name}: Returns null`, result);
                    } else if (Array.isArray(success?.items)) {
                        addResult('success', `✅ ${test.name}: Found ${success.items.length} items`, {
                            count: success.items.length
                        });
                    } else if (success?.id) {
                        addResult('success', `✅ ${test.name}: Success`, success);
                    } else {
                        addResult('info', `📋 ${test.name}: Response`, result);
                    }
                }

            } catch (error) {
                addResult('error', `❌ ${test.name}: Failed`, {
                    message: error.message,
                    errorType: error.errors?.[0]?.errorType
                });
            }
        }
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
            <h2>🔍 Authorization Pattern Discovery</h2>

            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={testAllAuthMethods}
                    disabled={loading}
                    style={{
                        padding: '12px 20px',
                        backgroundColor: '#DC2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        marginRight: '10px'
                    }}
                >
                    {loading ? '🔄 Testing All Auth Methods...' : '🔍 Discover Authorization Pattern'}
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
                        Click "Discover Authorization Pattern" to test all possible authorization methods.
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

            {/* Discovery Purpose */}
            <div style={{ marginTop: '20px', padding: '15px', background: '#FEE2E2', borderRadius: '8px' }}>
                <h4 style={{ color: '#DC2626', margin: '0 0 10px 0' }}>🎯 What We're Discovering:</h4>
                <ul style={{ color: '#DC2626', margin: 0, paddingLeft: '20px' }}>
                    <li><strong>Why Doctor operations are completely blocked</strong></li>
                    <li><strong>What authorization method actually works</strong></li>
                    <li><strong>Which operations are allowed vs blocked</strong></li>
                    <li><strong>Your schema's true authorization pattern</strong></li>
                    <li>This will give us the complete picture to fix everything!</li>
                </ul>
            </div>
        </div>
    );
};

export default AuthorizationPatternTest;