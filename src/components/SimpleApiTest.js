// src/components/SimpleApiTest.js - Test what actually works
import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';

const SimpleApiTest = () => {
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

    const clearResults = () => setResults([]);

    // Test 1: Basic authentication check
    const testAuth = async () => {
        try {
            const user = await getCurrentUser();
            addResult('success', `✅ Auth: ${user.username}`, user);
        } catch (error) {
            addResult('error', `❌ Auth failed: ${error.message}`);
        }
    };

    // Test 2: Test Patient API with Cognito auth
    const testPatients = async () => {
        setLoading(true);
        try {
            // Use Cognito User Pools authentication
            const client = generateClient({
                authMode: 'userPool'
            });

            // Test list patients (WITHOUT owner field in query, but requires Cognito auth)
            const listResult = await client.graphql({
                query: `
                    query ListPatients {
                        listPatients(limit: 5) {
                            items {
                                id
                                firstName
                                lastName
                                email
                                dateOfBirth
                            }
                            nextToken
                        }
                    }
                `
            });

            addResult('success', `✅ Found ${listResult.data.listPatients.items.length} patients`, listResult.data.listPatients);

            // Test create patient (owner field automatically set by AWS)
            const createResult = await client.graphql({
                query: `
                    mutation CreatePatient($input: CreatePatientInput!) {
                        createPatient(input: $input) {
                            id
                            firstName
                            lastName
                            email
                            dateOfBirth
                        }
                    }
                `,
                variables: {
                    input: {
                        firstName: 'Test',
                        lastName: 'Patient',
                        email: `test-${Date.now()}@example.com`,
                        dateOfBirth: '1990-01-01'
                        // AWS automatically sets owner field based on authenticated user
                    }
                }
            });

            addResult('success', '✅ Patient created successfully!', createResult.data.createPatient);

        } catch (error) {
            addResult('error', `❌ Patient test failed: ${error.message || 'Unknown error'}`, error);

            // Safe check for error message
            const errorMessage = error.message || error.toString() || '';
            if (errorMessage.includes && errorMessage.includes('Not Authorized')) {
                addResult('warning', '⚠️ You must be signed in with Cognito to access data');
            }
        }
        setLoading(false);
    };

    // Test 3: Test Doctor API (might fail if not deployed)
    const testDoctors = async () => {
        setLoading(true);
        try {
            const client = generateClient();

            // Test list doctors
            const listResult = await client.graphql({
                query: `
                    query ListDoctors {
                        listDoctors(limit: 5) {
                            items {
                                id
                                firstName
                                lastName
                                specialty
                                owner
                            }
                            nextToken
                        }
                    }
                `
            });

            addResult('success', `✅ Found ${listResult.data.listDoctors.items.length} doctors`, listResult.data.listDoctors);

        } catch (error) {
            addResult('error', `❌ Doctor test failed: ${error.message || 'Unknown error'}`, error);

            const errorMessage = error.message || error.toString() || '';
            if (errorMessage.includes && (errorMessage.includes('Cannot query field') || errorMessage.includes('Doctor'))) {
                addResult('warning', '⚠️ Doctor model not deployed. Run: npx amplify push');
            }
        }
        setLoading(false);
    };

    // Test 4: Test Notes API
    const testNotes = async () => {
        setLoading(true);
        try {
            const client = generateClient();
            const user = await getCurrentUser();

            // Test create note
            const createResult = await client.graphql({
                query: `
                    mutation CreateNote($input: CreateNoteInput!) {
                        createNote(input: $input) {
                            id
                            title
                            content
                            owner
                        }
                    }
                `,
                variables: {
                    input: {
                        title: 'Test Note',
                        content: 'This is a test note created via API',
                        owner: user.username
                    }
                }
            });

            addResult('success', '✅ Note created successfully!', createResult.data.createNote);

            // Test list notes
            const listResult = await client.graphql({
                query: `
                    query ListNotes {
                        listNotes(limit: 5) {
                            items {
                                id
                                title
                                content
                                owner
                            }
                            nextToken
                        }
                    }
                `
            });

            addResult('success', `✅ Found ${listResult.data.listNotes.items.length} notes`, listResult.data.listNotes);

        } catch (error) {
            addResult('error', `❌ Notes test failed: ${error.message || 'Unknown error'}`, error);
        }
        setLoading(false);
    };

    // Test 5: Test raw GraphQL introspection
    const testIntrospection = async () => {
        setLoading(true);
        try {
            const client = generateClient();

            const result = await client.graphql({
                query: `
                    query IntrospectionQuery {
                        __schema {
                            types {
                                name
                                kind
                            }
                        }
                    }
                `
            });

            const modelTypes = result.data.__schema.types.filter(type =>
                type.kind === 'OBJECT' &&
                !type.name.startsWith('__') &&
                ['Patient', 'Doctor', 'Note'].some(model => type.name.includes(model))
            );

            addResult('info', `📋 Available models: ${modelTypes.map(t => t.name).join(', ')}`, modelTypes);

        } catch (error) {
            addResult('error', `❌ Introspection failed: ${error.message || 'Unknown error'}`, error);
        }
        setLoading(false);
    };

    return (
        <div style={{
            padding: '20px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            margin: '20px',
            backgroundColor: '#f9fafb'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>🧪 Simple API Tests</h3>
                <button
                    onClick={clearResults}
                    style={{
                        padding: '6px 12px',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Clear Results
                </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <button onClick={testAuth} style={buttonStyle('#3b82f6')}>
                    1. Test Auth
                </button>
                <button onClick={testPatients} disabled={loading} style={buttonStyle('#10b981')}>
                    2. Test Patients
                </button>
                <button onClick={testDoctors} disabled={loading} style={buttonStyle('#f59e0b')}>
                    3. Test Doctors
                </button>
                <button onClick={testNotes} disabled={loading} style={buttonStyle('#8b5cf6')}>
                    4. Test Notes
                </button>
                <button onClick={testIntrospection} disabled={loading} style={buttonStyle('#ef4444')}>
                    5. Schema Info
                </button>
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {results.map(result => (
                    <div
                        key={result.id}
                        style={{
                            margin: '10px 0',
                            padding: '12px',
                            borderRadius: '6px',
                            backgroundColor: result.type === 'success' ? '#dcfce7' :
                                result.type === 'error' ? '#fef2f2' :
                                    result.type === 'warning' ? '#fef3c7' : '#f3f4f6',
                            color: result.type === 'success' ? '#166534' :
                                result.type === 'error' ? '#dc2626' :
                                    result.type === 'warning' ? '#d97706' : '#374151',
                            fontSize: '14px'
                        }}
                    >
                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                            [{result.timestamp}] {result.message}
                        </div>
                        {result.data && (
                            <details style={{ marginTop: '8px' }}>
                                <summary style={{ cursor: 'pointer', color: '#6b7280' }}>
                                    View Data
                                </summary>
                                <pre style={{
                                    marginTop: '8px',
                                    fontSize: '12px',
                                    backgroundColor: 'rgba(0,0,0,0.05)',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    overflow: 'auto',
                                    maxHeight: '200px'
                                }}>
                                    {JSON.stringify(result.data, null, 2)}
                                </pre>
                            </details>
                        )}
                    </div>
                ))}
            </div>

            {loading && (
                <div style={{ textAlign: 'center', color: '#6b7280', marginTop: '20px' }}>
                    ⏳ Running test...
                </div>
            )}
        </div>
    );
};

const buttonStyle = (bgColor) => ({
    padding: '8px 16px',
    backgroundColor: bgColor,
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
});

export default SimpleApiTest;