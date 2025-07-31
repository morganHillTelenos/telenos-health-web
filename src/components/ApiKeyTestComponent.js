// src/components/SimpleApiTestComponent.js - Simplified Error-Free Version
import React, { useState } from 'react';
import { apiService } from '../services/api';

const SimpleApiTestComponent = () => {
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

    // Basic configuration check
    const checkConfiguration = async () => {
        addResult('info', '🔍 Checking configuration...');

        try {
            const config = await import('../amplify_outputs.json');
            const hasApiKey = !!config.data?.api_key;
            const defaultAuth = config.data?.default_authorization_type;

            addResult('success', `Configuration OK - API Key: ${hasApiKey ? 'Yes' : 'No'}`, {
                defaultAuth,
                hasApiKey
            });
        } catch (error) {
            addResult('error', 'Configuration check failed', { message: error.message });
        }
    };

    // Test basic connection
    const testConnection = async () => {
        setLoading(true);
        addResult('info', '🌐 Testing basic connection...');

        try {
            await apiService.initialize();
            addResult('success', 'API service initialized successfully');

            const result = await apiService.testConnection();
            addResult('success', 'Connection test successful', {
                patientsFound: result.data?.data?.listPatients?.items?.length || 0
            });

        } catch (error) {
            addResult('error', 'Connection test failed', { message: error.message });
        }

        setLoading(false);
    };

    // Test patient operations only
    const testPatients = async () => {
        setLoading(true);
        addResult('info', '👤 Testing patient operations...');

        try {
            // Test create
            const testPatient = {
                firstName: 'Test',
                lastName: 'Patient',
                email: `test-${Date.now()}@example.com`,
                dateOfBirth: '1990-01-01'
            };

            const createResult = await apiService.createPatient(testPatient);
            addResult('success', '✅ Patient created', {
                id: createResult.data.id,
                name: `${createResult.data.firstName} ${createResult.data.lastName}`
            });

            // Test list
            const listResult = await apiService.getPatients({ limit: 5 });
            addResult('success', `✅ Found ${listResult.data.length} patients`, {
                count: listResult.data.length
            });

        } catch (error) {
            addResult('error', 'Patient test failed', { message: error.message });
        }

        setLoading(false);
    };

    // Test doctor operations only
    const testDoctors = async () => {
        setLoading(true);
        addResult('info', '👨‍⚕️ Testing doctor operations...');

        try {
            // Test create
            const testDoctor = {
                firstName: 'Dr. Test',
                lastName: 'Doctor',
                email: `doctor-${Date.now()}@example.com`,
                specialty: 'General Medicine',
                licenseNumber: `LIC-${Date.now()}`
            };

            const createResult = await apiService.createDoctor(testDoctor);

            if (createResult && createResult.success) {
                addResult('success', '✅ Doctor created', createResult.data);
            } else {
                addResult('warning', '⚠️ Doctor creation response unclear', createResult);
            }

            // Test list
            const listResult = await apiService.getDoctors({ limit: 5 });
            addResult('success', `✅ Found ${listResult.data.length} doctors`, {
                count: listResult.data.length
            });

        } catch (error) {
            addResult('error', 'Doctor test failed', { message: error.message });
        }

        setLoading(false);
    };

    // Test notes operations only
    const testNotes = async () => {
        setLoading(true);
        addResult('info', '📝 Testing note operations...');

        try {
            // Test create
            const testNote = {
                title: 'Test Note',
                content: `Test note created at ${new Date().toLocaleString()}`
            };

            const createResult = await apiService.createNote(testNote);
            addResult('success', '✅ Note created', {
                id: createResult.data.id,
                title: createResult.data.title
            });

            // Test list
            const listResult = await apiService.getNotes({ limit: 5 });
            addResult('success', `✅ Found ${listResult.data.length} notes`, {
                count: listResult.data.length
            });

        } catch (error) {
            addResult('error', 'Note test failed', { message: error.message });
        }

        setLoading(false);
    };

    // Run basic tests only
    const runBasicTests = async () => {
        setLoading(true);
        clearResults();

        addResult('info', '🚀 Running basic API tests...');

        await checkConfiguration();
        await testConnection();
        await testPatients();
        await testDoctors();
        await testNotes();

        addResult('info', '🏁 Basic tests completed!');
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
            <h2>🧪 Simple API Tests</h2>

            {/* Test Controls */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                    onClick={runBasicTests}
                    disabled={loading}
                    style={{
                        padding: '12px 20px',
                        backgroundColor: '#3B82F6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    {loading ? '🔄 Running...' : '🚀 Run Basic Tests'}
                </button>

                <button
                    onClick={testConnection}
                    disabled={loading}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: '#10B981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    🌐 Test Connection
                </button>

                <button
                    onClick={testPatients}
                    disabled={loading}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: '#8B5CF6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    👤 Test Patients
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
                maxHeight: '600px',
                overflowY: 'auto'
            }}>
                {results.length === 0 ? (
                    <div style={{ color: '#9CA3AF' }}>
                        No test results yet. Click "Run Basic Tests" to start.
                    </div>
                ) : (
                    results.map((result) => (
                        <div key={result.id} style={{ marginBottom: '12px' }}>
                            <div style={{
                                color: getResultColor(result.type),
                                fontWeight: 'bold'
                            }}>
                                [{result.timestamp}] {getResultIcon(result.type)} {result.message}
                            </div>
                            {result.data && (
                                <pre style={{
                                    marginTop: '4px',
                                    marginLeft: '20px',
                                    color: '#D1D5DB',
                                    fontSize: '12px',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word'
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

            {/* Status Summary */}
            {results.length > 0 && (
                <div style={{ marginTop: '20px', padding: '15px', background: '#F3F4F6', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#374151' }}>Test Summary:</h4>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        <span style={{ color: '#10B981' }}>
                            ✅ Success: {results.filter(r => r.type === 'success').length}
                        </span>
                        <span style={{ color: '#EF4444' }}>
                            ❌ Errors: {results.filter(r => r.type === 'error').length}
                        </span>
                        <span style={{ color: '#F59E0B' }}>
                            ⚠️ Warnings: {results.filter(r => r.type === 'warning').length}
                        </span>
                        <span style={{ color: '#3B82F6' }}>
                            ℹ️ Info: {results.filter(r => r.type === 'info').length}
                        </span>
                    </div>
                </div>
            )}

            {/* Troubleshooting */}
            <div style={{ marginTop: '20px', padding: '15px', background: '#FEF3C7', borderRadius: '8px' }}>
                <h4 style={{ color: '#92400E', margin: '0 0 10px 0' }}>🔧 Troubleshooting:</h4>
                <ul style={{ color: '#92400E', margin: 0, paddingLeft: '20px' }}>
                    <li>This simplified version removes complex authentication flows</li>
                    <li>Tests only basic CRUD operations without advanced authorization</li>
                    <li>If this works, we can add back complexity gradually</li>
                    <li>Check browser console for any additional error details</li>
                </ul>
            </div>
        </div>
    );
};

export default SimpleApiTestComponent;