// src/components/DoctorTestComponent.js - Quick test component for Doctor APIs
import React, { useState } from 'react';
import { apiService } from '../services/api';

const DoctorTestComponent = () => {
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

    // Replace your testCreateDoctor function with this debug version:

    const debugCognitoAuth = async () => {
        setLoading(true);
        addResult('info', 'Debugging Cognito authentication...');

        try {
            // Test 1: Check current user
            const { getCurrentUser } = await import('aws-amplify/auth');
            const user = await getCurrentUser();
            addResult('success', `✅ Cognito user authenticated: ${user.username}`, {
                username: user.username,
                userId: user.userId,
                email: user.signInDetails?.loginId || user.attributes?.email
            });

            // Test 2: Test Patient API (should work)
            addResult('info', 'Testing Patient API with Cognito...');
            const newPatient = {
                firstName: 'Test',
                lastName: 'Patient',
                email: `test-${Date.now()}@example.com`,
                dateOfBirth: '1990-01-01'
            };

            const patientResult = await apiService.createPatient(newPatient);
            addResult('success', `✅ Patient created with Cognito!`, patientResult);

            // Test 3: List Patients
            const listResult = await apiService.getPatients();
            addResult('success', `✅ Found ${listResult.data.length} patients`, listResult);

            // Test 4: Test Note API (should work)
            if (listResult.data.length > 0) {
                const patient = listResult.data[0];
                const newNote = {
                    title: 'Cognito Test Note',
                    content: 'Testing note creation with Cognito auth',
                    patientId: patient.id
                };

                const noteResult = await apiService.createNote(newNote);
                addResult('success', `✅ Note created with Cognito!`, noteResult);
            }

            addResult('success', '🎉 Cognito authentication working with existing models!');
            addResult('warning', 'Doctor model may not be deployed yet. Check AppSync schema.');

        } catch (error) {
            addResult('error', 'Cognito authentication test failed', {
                message: error.message,
                errors: error.errors
            });
        }

        setLoading(false);
    };

    // Update the button to use this function:
  // onClick={debugCognitoAuth}

    const testListDoctors = async () => {
        setLoading(true);
        addResult('info', 'Testing getDoctors...');

        try {
            const result = await apiService.getDoctors({ limit: 10 });
            addResult('success', `Found ${result.data.length} doctors`, result);
        } catch (error) {
            addResult('error', 'getDoctors failed', {
                message: error.message,
                errors: error.errors
            });
        }

        setLoading(false);
    };

    const testCreatePatientWithDoctor = async () => {
        setLoading(true);
        addResult('info', 'Testing createPatient with doctor assignment...');

        try {
            // First get available doctors
            const doctorsResult = await apiService.getDoctors({ limit: 1 });

            if (!doctorsResult.data || doctorsResult.data.length === 0) {
                addResult('warning', 'No doctors available. Create a doctor first.');
                setLoading(false);
                return;
            }

            const doctor = doctorsResult.data[0];

            const testPatient = {
                firstName: 'John',
                lastName: 'Doe',
                email: `patient-${Date.now()}@example.com`,
                dateOfBirth: '1985-03-15',
                doctorId: doctor.id
            };

            const result = await apiService.createPatient(testPatient);
            addResult('success', `Patient created and assigned to Dr. ${doctor.firstName} ${doctor.lastName}`, result);
        } catch (error) {
            addResult('error', 'createPatient with doctor failed', {
                message: error.message,
                errors: error.errors
            });
        }

        setLoading(false);
    };

    // Add this simple Doctor test to your DoctorTestComponent:

    // Update your testSimpleDoctor function to handle the response better:

    const testSimpleDoctor = async () => {
        setLoading(true);
        addResult('info', 'Testing simple Doctor creation...');

        try {
            const { generateClient } = await import('aws-amplify/api');
            const client = generateClient();

            // Simple doctor creation with basic fields only
            const result = await client.graphql({
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
                variables: {
                    input: {
                        firstName: 'Dr. Sarah',
                        lastName: 'Johnson',
                        email: `dr.johnson-${Date.now()}@example.com`,
                        specialty: 'Psychiatry',
                        licenseNumber: `PSY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
                    }
                }
            });

            addResult('success', '🎉 Doctor created successfully!', result);

            // Test list doctors with better error handling
            try {
                const listResult = await client.graphql({
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
                }
                nextToken
              }
            }
          `
                });

                console.log('List doctors raw response:', listResult);

                // Handle different response structures
                const doctors = listResult?.data?.listDoctors?.items || [];
                addResult('success', `✅ Found ${doctors.length} doctors`, {
                    count: doctors.length,
                    doctors: doctors.slice(0, 3), // Show first 3 doctors
                    fullResponse: listResult
                });

            } catch (listError) {
                addResult('warning', 'List doctors failed, but create worked', {
                    listError: listError.message,
                    createWorked: true
                });
            }

        } catch (error) {
            addResult('error', 'Doctor test failed', {
                message: error.message,
                errors: error.errors
            });

            if (error.message.includes('FieldUndefined') || error.message.includes('Doctor')) {
                addResult('warning', 'Doctor schema may not be deployed yet. Check AppSync schema for Doctor type.');
            }
        }

        setLoading(false);
  };

    const testCreateNoteWithDoctor = async () => {
        setLoading(true);
        addResult('info', 'Testing createNote with doctor and patient...');

        try {
            // Get available doctors and patients
            const [doctorsResult, patientsResult] = await Promise.all([
                apiService.getDoctors({ limit: 1 }),
                apiService.getPatients({ limit: 1 })
            ]);

            if (!doctorsResult.data || doctorsResult.data.length === 0) {
                addResult('warning', 'No doctors available. Create a doctor first.');
                setLoading(false);
                return;
            }

            if (!patientsResult.data || patientsResult.data.length === 0) {
                addResult('warning', 'No patients available. Create a patient first.');
                setLoading(false);
                return;
            }

            const doctor = doctorsResult.data[0];
            const patient = patientsResult.data[0];

            const testNote = {
                title: 'Initial Psychiatric Evaluation',
                content: `Patient ${patient.firstName} ${patient.lastName} presented for initial evaluation. Initial assessment shows signs of anxiety. Recommended follow-up in 2 weeks.`,
                patientId: patient.id,
                doctorId: doctor.id,
                noteType: 'evaluation',
                isPrivate: false
            };

            const result = await apiService.createNote(testNote);
            addResult('success', `Note created by Dr. ${doctor.firstName} ${doctor.lastName} for patient ${patient.firstName} ${patient.lastName}`, result);
        } catch (error) {
            addResult('error', 'createNote with doctor failed', {
                message: error.message,
                errors: error.errors
            });
        }

        setLoading(false);
    };

    const runAllDoctorTests = async () => {
        clearResults();
        //await testCreateDoctor();
        await testListDoctors();
        await testCreatePatientWithDoctor();
        await testCreateNoteWithDoctor();
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h2>🧪 Doctor/Provider API Tests</h2>

            {/* Test Controls */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                    onClick={debugCognitoAuth}
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
                    Test Create Doctor
                </button>

                <button
                    onClick={testListDoctors}
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
                    Test List Doctors
                </button>

                <button
                    onClick={testCreatePatientWithDoctor}
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
                    Test Patient + Doctor
                </button>

                <button
                    onClick={testCreateNoteWithDoctor}
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
                    Test Note + Doctor
                </button>

                <button
                    onClick={runAllDoctorTests}
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
                    Run All Tests
                </button>

                <button
                    onClick={testSimpleDoctor}
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
                    Test Simple Doctor
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
            {loading && <p style={{ color: '#3B82F6' }}>Running tests...</p>}

            {/* Results Display */}
            <div style={{ background: '#F3F4F6', padding: '20px', borderRadius: '8px', minHeight: '200px' }}>
                <h3>Test Results:</h3>
                {results.length === 0 ? (
                    <p style={{ color: '#6B7280' }}>No test results yet. Run some tests above!</p>
                ) : (
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {results.map((result) => (
                            <div
                                key={result.id}
                                style={{
                                    marginBottom: '10px',
                                    padding: '10px',
                                    borderRadius: '4px',
                                    background:
                                        result.type === 'success' ? '#D1FAE5' :
                                            result.type === 'error' ? '#FEE2E2' :
                                                result.type === 'warning' ? '#FEF3C7' : '#DBEAFE',
                                    color:
                                        result.type === 'success' ? '#065F46' :
                                            result.type === 'error' ? '#991B1B' :
                                                result.type === 'warning' ? '#92400E' : '#1E40AF'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div>
                                        <strong>[{result.timestamp}]</strong> {result.message}
                                    </div>
                                    <span style={{
                                        padding: '2px 6px',
                                        borderRadius: '2px',
                                        fontSize: '12px',
                                        backgroundColor: 'rgba(0,0,0,0.1)'
                                    }}>
                                        {result.type.toUpperCase()}
                                    </span>
                                </div>
                                {result.data && (
                                    <details style={{ marginTop: '5px' }}>
                                        <summary style={{ cursor: 'pointer', fontSize: '12px' }}>
                                            View Details
                                        </summary>
                                        <pre style={{
                                            marginTop: '5px',
                                            fontSize: '11px',
                                            background: 'rgba(0,0,0,0.05)',
                                            padding: '8px',
                                            borderRadius: '3px',
                                            overflow: 'auto',
                                            maxHeight: '150px'
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

            {/* Usage Instructions */}
            <div style={{ marginTop: '20px', padding: '15px', background: '#EFF6FF', borderRadius: '8px' }}>
                <h4 style={{ color: '#1E40AF', margin: '0 0 10px 0' }}>How to Use:</h4>
                <ol style={{ color: '#1E40AF', margin: 0, paddingLeft: '20px' }}>
                    <li>First run "Test Create Doctor" to create a sample psychiatric provider</li>
                    <li>Run "Test List Doctors" to verify the doctor was created</li>
                    <li>Run "Test Patient + Doctor" to create a patient assigned to the doctor</li>
                    <li>Run "Test Note + Doctor" to create a note linked to both patient and doctor</li>
                    <li>Or just click "Run All Tests" to execute everything in sequence</li>
                </ol>
            </div>
        </div>
    );
};

export default DoctorTestComponent;