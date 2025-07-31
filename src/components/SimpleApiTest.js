// src/components/SimpleApiTest.js - Complete Direct API testing component
import React, { useState } from 'react';

const SimpleApiTest = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const addResult = (type, message, data = null) => {
        const timestamp = new Date().toLocaleTimeString();
        setResults(prev => [...prev, { type, message, data, timestamp, id: Date.now() }]);
    };

    const clearResults = () => setResults([]);

    // Add this test to your SimpleApiTest component to verify schema

    const testSchemaQueries = async () => {
        setLoading(true);
        addResult('info', '🔍 Testing individual schema queries...');

        const endpoint = 'https://fpg4zax6sjhvtlbuti7sr4llxi.appsync-api.us-east-1.amazonaws.com/graphql';
        const apiKey = 'your-working-api-key-here';

        const queries = [
            {
                name: 'listPatients',
                query: `query { listPatients(limit: 1) { items { id firstName } } }`
            },
            {
                name: 'listDoctors',
                query: `query { listDoctors(limit: 1) { items { id firstName } } }`
            },
            {
                name: 'listNotes',
                query: `query { listNotes(limit: 1) { items { id title } } }`
            }
        ];

        for (const { name, query } of queries) {
            try {
                addResult('info', `Testing ${name}...`);

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': apiKey
                    },
                    body: JSON.stringify({ query })
                });

                const result = await response.json();

                if (response.ok && !result.errors) {
                    addResult('success', `✅ ${name} works`, result.data);
                } else {
                    addResult('error', `❌ ${name} failed`, {
                        status: response.status,
                        errors: result.errors
                    });
                }

            } catch (error) {
                addResult('error', `❌ ${name} threw error`, error);
            }
        }

        setLoading(false);
    };

    // Test 1: Check Amplify configuration
    const testAmplifyConfig = async () => {
        setLoading(true);
        addResult('info', '⚙️ Checking Amplify configuration...');

        try {
            const { Amplify } = await import('aws-amplify');
            const config = Amplify.getConfig();

            addResult('info', 'Raw Amplify config:', config);

            // Check different ways the config might be structured
            const graphqlConfig = config.API?.GraphQL || config.aws_appsync_graphqlEndpoint;
            const apiKey = config.API?.GraphQL?.apiKey || config.aws_appsync_apiKey;
            const authType = config.API?.GraphQL?.defaultAuthorizationType || config.aws_appsync_authenticationType;

            addResult('info', `GraphQL Config: ${JSON.stringify(graphqlConfig)}`);
            addResult('info', `API Key: ${apiKey ? 'Present' : 'Missing'}`);
            addResult('info', `Auth Type: ${authType}`);

            if (apiKey && graphqlConfig) {
                addResult('success', '✅ Amplify configuration looks good');
            } else {
                addResult('error', '❌ Amplify configuration incomplete');
            }

        } catch (error) {
            addResult('error', '❌ Config check failed', error);
        }

        setLoading(false);
    };

    // Test 2: Basic query test
    const testBasicQuery = async () => {
        setLoading(true);
        addResult('info', '🔍 Testing most basic possible query...');

        try {
            const endpoint = 'https://fpg4zax6sjhvtlbuti7sr4llxi.appsync-api.us-east-1.amazonaws.com/graphql';
            const apiKey = 'da2-r3ddpxsmfbbcfoajbnq5gwnr6a';

            // Try the absolute simplest query possible
            const basicQuery = {
                query: `
                    query {
                        __typename
                    }
                `
            };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey
                },
                body: JSON.stringify(basicQuery)
            });

            const result = await response.json();

            if (response.ok && !result.errors) {
                addResult('success', '✅ Basic query successful - API Key auth working!', result);

                // Now try introspection
                const introspectionQuery = {
                    query: `
                        query {
                            __schema {
                                queryType {
                                    name
                                }
                            }
                        }
                    `
                };

                const introspectionResponse = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': apiKey
                    },
                    body: JSON.stringify(introspectionQuery)
                });

                const introspectionResult = await introspectionResponse.json();

                if (introspectionResponse.ok && !introspectionResult.errors) {
                    addResult('success', '✅ Introspection also works!', introspectionResult);
                } else {
                    addResult('warning', '⚠️ Basic query works but introspection fails', {
                        status: introspectionResponse.status,
                        result: introspectionResult
                    });
                }

            } else {
                addResult('error', '❌ Even basic query failed', {
                    status: response.status,
                    statusText: response.statusText,
                    result: result
                });
            }

        } catch (error) {
            addResult('error', '❌ Basic query threw error', error);
        }

        setLoading(false);
    };

    // Test 3: Direct fetch to AppSync endpoint
    const testDirectFetch = async () => {
        setLoading(true);
        addResult('info', '🌐 Testing direct fetch to AppSync...');

        try {
            const endpoint = 'https://fpg4zax6sjhvtlbuti7sr4llxi.appsync-api.us-east-1.amazonaws.com/graphql';
            const apiKey = 'da2-r3ddpxsmfbbcfoajbnq5gwnr6a';

            // Simple introspection query
            const introspectionQuery = {
                query: `
                    query IntrospectionQuery {
                        __schema {
                            queryType {
                                name
                            }
                            mutationType {
                                name
                            }
                            types {
                                name
                                kind
                            }
                        }
                    }
                `
            };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(introspectionQuery)
            });

            const result = await response.json();

            if (response.ok && !result.errors) {
                addResult('success', '✅ Direct fetch successful!');

                // Check for our types
                const types = result.data.__schema.types.map(t => t.name);
                const hasDoctor = types.includes('Doctor');
                const hasPatient = types.includes('Patient');
                const hasNote = types.includes('Note');

                addResult('info', `📋 Available types: ${types.filter(t => ['Doctor', 'Patient', 'Note'].includes(t)).join(', ')}`);
                addResult(hasDoctor ? 'success' : 'error', `Doctor type: ${hasDoctor ? 'Found' : 'Missing'}`);
                addResult(hasPatient ? 'success' : 'error', `Patient type: ${hasPatient ? 'Found' : 'Missing'}`);
                addResult(hasNote ? 'success' : 'error', `Note type: ${hasNote ? 'Found' : 'Missing'}`);

                addResult('info', 'Full schema result:', result.data);
            } else {
                addResult('error', '❌ Direct fetch failed', {
                    status: response.status,
                    statusText: response.statusText,
                    errors: result.errors,
                    data: result
                });
            }

        } catch (error) {
            addResult('error', '❌ Direct fetch threw error', {
                message: error.message,
                stack: error.stack
            });
        }

        setLoading(false);
    };

    // Test 4: Simple list query
    const testSimpleList = async () => {
        setLoading(true);
        addResult('info', '📋 Testing simple list query...');

        try {
            const endpoint = 'https://fpg4zax6sjhvtlbuti7sr4llxi.appsync-api.us-east-1.amazonaws.com/graphql';
            const apiKey = 'da2-r3ddpxsmfbbcfoajbnq5gwnr6a';

            // Try the simplest possible query
            const simpleQuery = {
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
                `
            };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey
                },
                body: JSON.stringify(simpleQuery)
            });

            const result = await response.json();

            if (response.ok && !result.errors) {
                addResult('success', '✅ Simple list query successful!', result.data);
            } else {
                addResult('error', '❌ Simple list query failed', {
                    status: response.status,
                    errors: result.errors,
                    data: result
                });
            }

        } catch (error) {
            addResult('error', '❌ Simple query threw error', error);
        }

        setLoading(false);
    };

    // Add this test to your SimpleApiTest component
    // This avoids introspection entirely

    const testNonIntrospection = async () => {
        setLoading(true);
        addResult('info', '🧪 Testing without introspection...');

        try {
            const endpoint = 'https://fpg4zax6sjhvtlbuti7sr4llxi.appsync-api.us-east-1.amazonaws.com/graphql';
            const apiKey = 'da2-r3ddpxsmfbbcfoajbnq5gwnr6a'; // Use your current key first

            // Try a simple mutation that should exist
            const testQuery = {
                query: `
                query TestBasic {
                    listPatients(limit: 1) {
                        items {
                            id
                        }
                    }
                }
            `
            };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey
                },
                body: JSON.stringify(testQuery)
            });

            const result = await response.json();

            if (response.ok) {
                addResult('success', '✅ Non-introspection query worked!', result);
            } else {
                addResult('error', '❌ Non-introspection query also failed', {
                    status: response.status,
                    result: result
                });
            }

        } catch (error) {
            addResult('error', '❌ Non-introspection test threw error', error);
        }

        setLoading(false);
    };

    // Test 5: Try creating with minimal fields
    const testMinimalCreate = async () => {
        setLoading(true);
        addResult('info', '📝 Testing minimal doctor creation...');

        try {
            const endpoint = 'https://fpg4zax6sjhvtlbuti7sr4llxi.appsync-api.us-east-1.amazonaws.com/graphql';
            const apiKey = 'da2-r3ddpxsmfbbcfoajbnq5gwnr6a';

            const createMutation = {
                query: `
                    mutation CreateDoctor($input: CreateDoctorInput!) {
                        createDoctor(input: $input) {
                            id
                            firstName
                            lastName
                            email
                            specialty
                            licenseNumber
                        }
                    }
                `,
                variables: {
                    input: {
                        firstName: 'Test',
                        lastName: 'Doctor',
                        email: `test-${Date.now()}@example.com`,
                        specialty: 'General Medicine',
                        licenseNumber: `TEST${Date.now()}`
                    }
                }
            };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey
                },
                body: JSON.stringify(createMutation)
            });

            const result = await response.json();

            if (response.ok && !result.errors) {
                addResult('success', '✅ Minimal doctor creation successful!', result.data);
            } else {
                addResult('error', '❌ Minimal doctor creation failed', {
                    status: response.status,
                    errors: result.errors,
                    data: result
                });
            }

        } catch (error) {
            addResult('error', '❌ Minimal create threw error', error);
        }

        setLoading(false);
    };

    const getResultStyle = (type) => {
        const baseStyle = { padding: '10px', margin: '5px 0', borderRadius: '4px', fontSize: '14px' };
        switch (type) {
            case 'success': return { ...baseStyle, backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' };
            case 'error': return { ...baseStyle, backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' };
            case 'warning': return { ...baseStyle, backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeaa7' };
            default: return { ...baseStyle, backgroundColor: '#d1ecf1', color: '#0c5460', border: '1px solid #bee5eb' };
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1>🔍 Direct AppSync API Testing</h1>
            <p>Testing AppSync directly without Amplify client abstraction.</p>

            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                    onClick={testAmplifyConfig}
                    disabled={loading}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    Check Config
                </button>
                <button
                    onClick={testBasicQuery}
                    disabled={loading}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: '#17a2b8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    Test Basic Query
                </button>
                <button
                    onClick={testDirectFetch}
                    disabled={loading}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    Test Direct Fetch
                </button>
                <button
                    onClick={testSimpleList}
                    disabled={loading}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    Test Simple List
                </button>
                <button
                    onClick={testMinimalCreate}
                    disabled={loading}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: '#ffc107',
                        color: 'black',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    Test Minimal Create
                </button>
                <button
                    onClick={clearResults}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Clear Results
                </button>
            </div>

            <div style={{
                maxHeight: '600px',
                overflowY: 'auto',
                border: '1px solid #ddd',
                borderRadius: '6px',
                padding: '10px',
                backgroundColor: '#f8f9fa'
            }}>
                {results.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                        No test results yet. Click a test button to start.
                    </p>
                ) : (
                    results.map(result => (
                        <div key={result.id} style={getResultStyle(result.type)}>
                            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                                [{result.timestamp}] {result.message}
                            </div>
                            {result.data && (
                                <pre style={{
                                    fontSize: '12px',
                                    backgroundColor: 'rgba(0,0,0,0.05)',
                                    padding: '8px',
                                    borderRadius: '3px',
                                    overflow: 'auto',
                                    maxHeight: '200px'
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

export default SimpleApiTest;