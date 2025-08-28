// src/components/DynamoDBTest.js - Test your existing DynamoDB setup
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const DynamoDBTest = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [healthStatus, setHealthStatus] = useState(null);

    useEffect(() => {
        runHealthCheck();
    }, []);

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

    const runHealthCheck = async () => {
        try {
            const health = await apiService.healthCheck();
            setHealthStatus(health);
            console.log('Health check:', health);
        } catch (error) {
            setHealthStatus({ status: 'error', error: error.message });
        }
    };

    const testExistingPatients = async () => {
        setLoading(true);
        addResult('info', '🔍 Testing existing Patient table...');

        try {
            const result = await apiService.getPatients({ limit: 10 });
            addResult('success', `✅ Found ${result.data.length} existing patients in DynamoDB`, {
                count: result.data.length,
                patients: result.data.slice(0, 3).map(p => `${p.firstName} ${p.lastName}`)
            });

            if (result.data.length > 0) {
                // Test getting a single patient
                const patient = result.data[0];
                const singleResult = await apiService.getPatient(patient.id);
                addResult('success', `✅ Successfully retrieved patient: ${singleResult.data.firstName} ${singleResult.data.lastName}`, singleResult.data);
            }
        } catch (error) {
            addResult('error', '❌ Failed to fetch existing patients', {
                message: error.message,
                details: 'Check if Patient table exists and has proper permissions'
            });
        }

        setLoading(false);
    };

    const testExistingDoctors = async () => {
        setLoading(true);
        addResult('info', '🔍 Testing existing Doctor tables...');

        try {
            const result = await apiService.getDoctors({ limit: 10 });
            addResult('success', `✅ Found ${result.data.length} existing doctors in DynamoDB`, {
                count: result.data.length,
                doctors: result.data.slice(0, 3).map(d => `Dr. ${d.firstName} ${d.lastName} (${d.specialty})`)
            });

            if (result.data.length > 0) {
                // Test getting a single doctor
                const doctor = result.data[0];
                const singleResult = await apiService.getDoctor(doctor.id);
                addResult('success', `✅ Successfully retrieved doctor: Dr. ${singleResult.data.firstName} ${singleResult.data.lastName}`, singleResult.data);
            }
        } catch (error) {
            addResult('error', '❌ Failed to fetch existing doctors', {
                message: error.message,
                details: 'Check if Doctor table exists and has proper permissions'
            });
        }

        setLoading(false);
    };

    const testExistingNotes = async () => {
        setLoading(true);
        addResult('info', '🔍 Testing existing Note tables...');

        try {
            const result = await apiService.getNotes({ limit: 10 });
            addResult('success', `✅ Found ${result.data.length} existing notes in DynamoDB`, {
                count: result.data.length,
                notes: result.data.slice(0, 3).map(n => n.title)
            });

            if (result.data.length > 0) {
                // Test getting a single note
                const note = result.data[0];
                const singleResult = await apiService.getNote(note.id);
                addResult('success', `✅ Successfully retrieved note: ${singleResult.data.title}`, singleResult.data);
            }
        } catch (error) {
            addResult('error', '❌ Failed to fetch existing notes', {
                message: error.message,
                details: 'Check if Note table exists and has proper permissions'
            });
        }

        setLoading(false);
    };

    const testCreateNewPatient = async () => {
        setLoading(true);
        addResult('info', '➕ Testing patient creation in DynamoDB...');

        try {
            const testPatient = {
                firstName: 'Test',
                lastName: 'Patient',
                email: `test-patient-${Date.now()}@example.com`,
                dateOfBirth: '1990-05-15',
                phone: '+1-555-0123',
                gender: 'PREFER_NOT_TO_SAY'
            };

            const result = await apiService.createPatient(testPatient);
            addResult('success', `✅ Successfully created new patient: ${result.data.firstName} ${result.data.lastName}`, result.data);

            // Clean up - delete the test patient
            setTimeout(async () => {
                try {
                    await apiService.deletePatient(result.data.id);
                    addResult('info', '🗑️ Test patient cleaned up successfully');
                } catch (error) {
                    addResult('warning', '⚠️ Could not clean up test patient', { error: error.message });
                }
            }, 2000);

        } catch (error) {
            addResult('error', '❌ Failed to create new patient', {
                message: error.message,
                details: 'Check permissions and schema configuration'
            });
        }

        setLoading(false);
    };

    const testCreateNewDoctor = async () => {
        setLoading(true);
        addResult('info', '➕ Testing doctor creation in DynamoDB...');

        try {
            const testDoctor = {
                firstName: 'Dr. Test',
                lastName: 'Physician',
                email: `test-doctor-${Date.now()}@example.com`,
                specialty: 'Psychiatry',
                licenseNumber: `LIC-${Date.now()}`,
                phone: '+1-555-0456',
                yearsOfExperience: 5,
                bio: 'Test physician for DynamoDB integration'
            };

            const result = await apiService.createDoctor(testDoctor);
            addResult('success', `✅ Successfully created new doctor: ${result.data.firstName} ${result.data.lastName}`, result.data);

        } catch (error) {
            addResult('error', '❌ Failed to create new doctor', {
                message: error.message,
                details: 'Check permissions and schema configuration'
            });
        }

        setLoading(false);
    };

    const runMigration = async () => {
        setLoading(true);
        addResult('info', '🚀 Starting localStorage to DynamoDB migration...');

        try {
            const result = await apiService.migrateLocalData();
            addResult('success', `🎉 Migration completed! ${result.migrated}/${result.total} records migrated`, result);
        } catch (error) {
            addResult('error', '❌ Migration failed', {
                message: error.message,
                details: 'Check your data format and permissions'
            });
        }

        setLoading(false);
    };

    const runAllTests = async () => {
        clearResults();
        await testExistingPatients();
        await testExistingDoctors();
        await testExistingNotes();
        await testCreateNewPatient();
    };

    const getStatusColor = (type) => {
        switch (type) {
            case 'success': return '#10B981';
            case 'error': return '#EF4444';
            case 'warning': return '#F59E0B';
            case 'info': return '#3B82F6';
            default: return '#6B7280';
        }
    };

    const getStatusIcon = (type) => {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            default: return '📋';
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h2>🗄️ DynamoDB Connection & Table Tests</h2>

            {/* Health Status */}
            <div style={{
                marginBottom: '20px',
                padding: '15px',
                backgroundColor: healthStatus?.status === 'healthy' ? '#F0FDF4' : '#FEF2F2',
                border: `1px solid ${healthStatus?.status === 'healthy' ? '#10B981' : '#EF4444'}`,
                borderRadius: '8px'
            }}>
                <h3 style={{ margin: '0 0 10px 0' }}>
                    {healthStatus?.status === 'healthy' ? '✅' : '❌'} System Health
                </h3>
                {healthStatus?.status === 'healthy' ? (
                    <div>
                        <p style={{ margin: '5px 0' }}>✅ DynamoDB Connection: Active</p>
                        <p style={{ margin: '5px 0' }}>👤 User: {healthStatus.user}</p>
                        <p style={{ margin: '5px 0' }}>📊 Patients Found: {healthStatus.patientsFound}</p>
                    </div>
                ) : (
                    <p style={{ margin: '5px 0', color: '#EF4444' }}>
                        Error: {healthStatus?.error}
                    </p>
                )}
            </div>

            {/* Test Controls */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                    onClick={testExistingPatients}
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
                    Test Patients
                </button>

                <button
                    onClick={testExistingDoctors}
                    disabled={loading}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: '#3B82F6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    Test Doctors
                </button>

                <button
                    onClick={testExistingNotes}
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
                    Test Notes
                </button>

                <button
                    onClick={testCreateNewPatient}
                    disabled={loading}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: '#F59E0B',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    Create Test Patient
                </button>

                <button
                    onClick={testCreateNewDoctor}
                    disabled={loading}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: '#EF4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    Create Test Doctor
                </button>

                <button
                    onClick={runAllTests}
                    disabled={loading}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: '#1F2937',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    Run All Tests
                </button>

                <button
                    onClick={runMigration}
                    disabled={loading}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: '#7C3AED',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    Migrate from localStorage
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
                    Clear Results
                </button>
            </div>

            {/* Loading Indicator */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{
                        display: 'inline-block',
                        width: '20px',
                        height: '20px',
                        border: '3px solid #f3f3f3',
                        borderTop: '3px solid #3B82F6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <p style={{ marginTop: '10px' }}>Running tests...</p>
                </div>
            )}

            {/* Results Display */}
            <div style={{ marginTop: '20px' }}>
                <h3>Test Results:</h3>
                {results.length === 0 ? (
                    <p style={{ color: '#6B7280', fontStyle: 'italic' }}>
                        No tests run yet. Click a test button above to start.
                    </p>
                ) : (
                    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                        {results.map((result) => (
                            <div
                                key={result.id}
                                style={{
                                    padding: '12px',
                                    marginBottom: '10px',
                                    border: `1px solid ${getStatusColor(result.type)}`,
                                    borderRadius: '6px',
                                    backgroundColor: `${getStatusColor(result.type)}15`
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '8px'
                                }}>
                                    <span style={{
                                        fontWeight: 'bold',
                                        color: getStatusColor(result.type)
                                    }}>
                                        {getStatusIcon(result.type)} {result.message}
                                    </span>
                                    <span style={{
                                        fontSize: '12px',
                                        color: '#6B7280'
                                    }}>
                                        {result.timestamp}
                                    </span>
                                </div>

                                {result.data && (
                                    <details style={{ marginTop: '8px' }}>
                                        <summary style={{ cursor: 'pointer', color: '#6B7280' }}>
                                            View Details
                                        </summary>
                                        <pre style={{
                                            background: '#F9FAFB',
                                            padding: '10px',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            marginTop: '8px',
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
                )}
            </div>

            {/* Instructions */}
            <div style={{
                marginTop: '30px',
                padding: '15px',
                backgroundColor: '#EFF6FF',
                borderRadius: '8px',
                border: '1px solid #DBEAFE'
            }}>
                <h4 style={{ color: '#1E40AF', margin: '0 0 10px 0' }}>
                    📋 Instructions:
                </h4>
                <ol style={{ color: '#1E40AF', margin: 0, paddingLeft: '20px' }}>
                    <li>First, check the System Health status above</li>
                    <li>Click "Test Patients" to verify your existing Patient table</li>
                    <li>Click "Test Doctors" to verify your existing Doctor tables</li>
                    <li>Click "Test Notes" to verify your existing Note tables</li>
                    <li>Try "Create Test Patient" to test write operations</li>
                    <li>Use "Migrate from localStorage" to move existing data to DynamoDB</li>
                    <li>Review any errors in the results section</li>
                </ol>

                <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#FEF3C7', borderRadius: '6px' }}>
                    <strong>💡 Tip:</strong> If you see schema errors, your GraphQL schema might need to be updated
                    to match your existing DynamoDB table structure.
                </div>
            </div>

            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default DynamoDBTest;