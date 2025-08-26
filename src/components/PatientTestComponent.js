// src/components/PatientTestComponent.js - Corrected for your actual schema
import React, { useState } from 'react';

const PatientTestComponent = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState('');

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

    // 🔧 FINAL WORKING CONFIG - Replace in ALL test components
    // (DoctorTestComponent.js, PatientTestComponent.js, NoteTestComponent.js)

    const ensureCorrectConfig = async () => {
        const { Amplify } = await import('aws-amplify');
        const correctConfig = {
            API: {
                GraphQL: {
                    endpoint: 'https://soa7zc2v7zbjlbgxe6fwzuxqeq.appsync-api.us-east-1.amazonaws.com/graphql', // CURRENT ENDPOINT
                    region: 'us-east-1',
                    defaultAuthMode: 'apiKey',
                    apiKey: 'da2-jw2kvaofe5bmhappt6l6zyalje' // CURRENT API KEY
                }
            }
        };
        Amplify.configure(correctConfig);

        const { generateClient } = await import('aws-amplify/api');
        return generateClient({ authMode: 'apiKey' });
    };

    // 📋 READ - List all patients
    const testListPatients = async () => {
        setLoading(true);
        addResult('info', '📋 Testing List Patients...');

        try {
            const client = await ensureCorrectConfig();

            const result = await client.graphql({
                query: `
                    query ListPatients {
                        listPatients {
                            items {
                                id
                                firstName
                                lastName
                                email
                                dateOfBirth
                                phone
                                isActive
                                createdAt
                                updatedAt
                            }
                        }
                    }
                `,
                authMode: 'apiKey'
            });

            const patients = result.data.listPatients.items;
            addResult('success', `📋 Found ${patients.length} patients`, patients);

            if (patients.length > 0) {
                setSelectedPatientId(patients[0].id);
                addResult('info', `Selected patient: ${patients[0].firstName} ${patients[0].lastName} (ID: ${patients[0].id})`);
            }

        } catch (error) {
            addResult('error', 'List patients failed', error);
        }

        setLoading(false);
    };

    // ➕ CREATE - Create new patient (with only available fields)
    const testCreatePatient = async () => {
        setLoading(true);
        addResult('info', '➕ Testing Create Patient...');

        try {
            const client = await ensureCorrectConfig();

            const newPatient = {
                firstName: 'John',
                lastName: 'Smith',
                email: `patient-${Date.now()}@telenoshealthweb.com`,
                dateOfBirth: '1985-03-15',
                phone: '555-0123',
                isActive: true
            };

            addResult('info', `Creating patient: ${newPatient.firstName} ${newPatient.lastName}`);

            const result = await client.graphql({
                query: `
                    mutation CreatePatient($input: CreatePatientInput!) {
                        createPatient(input: $input) {
                            id
                            firstName
                            lastName
                            email
                            dateOfBirth
                            phone
                            isActive
                            createdAt
                        }
                    }
                `,
                variables: { input: newPatient },
                authMode: 'apiKey'
            });

            addResult('success', '➕ Patient created successfully!', result.data.createPatient);
            setSelectedPatientId(result.data.createPatient.id);

        } catch (error) {
            addResult('error', 'Create patient failed', error);
        }

        setLoading(false);
    };

    // ✏️ UPDATE - Update existing patient
    const testUpdatePatient = async () => {
        if (!selectedPatientId) {
            addResult('warning', 'No patient selected. List patients first.');
            return;
        }

        setLoading(true);
        addResult('info', `✏️ Testing Update Patient: ${selectedPatientId}`);

        try {
            const client = await ensureCorrectConfig();

            const updateData = {
                id: selectedPatientId,
                phone: '555-UPDATED'
            };

            addResult('info', 'Updating patient phone number...');

            const result = await client.graphql({
                query: `
                    mutation UpdatePatient($input: UpdatePatientInput!) {
                        updatePatient(input: $input) {
                            id
                            firstName
                            lastName
                            email
                            dateOfBirth
                            phone
                            isActive
                            createdAt
                            updatedAt
                        }
                    }
                `,
                variables: { input: updateData },
                authMode: 'apiKey'
            });

            addResult('success', '✏️ Patient updated successfully!', result.data.updatePatient);

        } catch (error) {
            addResult('error', 'Update patient failed', error);
        }

        setLoading(false);
    };

    // 🗑️ DELETE - Delete patient
    const testDeletePatient = async () => {
        if (!selectedPatientId) {
            addResult('warning', 'No patient selected. List patients first.');
            return;
        }

        setLoading(true);
        addResult('info', `🗑️ Testing Delete Patient: ${selectedPatientId}`);

        try {
            const client = await ensureCorrectConfig();

            const result = await client.graphql({
                query: `
                    mutation DeletePatient($input: DeletePatientInput!) {
                        deletePatient(input: $input) {
                            id
                            firstName
                            lastName
                            email
                        }
                    }
                `,
                variables: { input: { id: selectedPatientId } },
                authMode: 'apiKey'
            });

            addResult('success', '🗑️ Patient deleted successfully!', result.data.deletePatient);
            setSelectedPatientId('');

            setTimeout(() => {
                testListPatients();
            }, 1000);

        } catch (error) {
            addResult('error', 'Delete patient failed', error);
        }

        setLoading(false);
    };

    // 🔄 COMPLETE CRUD TEST
    const testCompleteCrud = async () => {
        setLoading(true);
        addResult('info', '🔄 Testing Complete Patient CRUD Operations...');

        try {
            const client = await ensureCorrectConfig();

            // Step 1: Create
            addResult('info', 'Step 1: Creating test patient...');
            const newPatient = {
                firstName: 'Complete',
                lastName: 'CrudTest',
                email: `crud-patient-${Date.now()}@test.com`,
                dateOfBirth: '1990-05-20',
                phone: '555-CRUD',
                isActive: true
            };

            const createResult = await client.graphql({
                query: `
                    mutation CreatePatient($input: CreatePatientInput!) {
                        createPatient(input: $input) {
                            id
                            firstName
                            lastName
                            email
                            phone
                            createdAt
                        }
                    }
                `,
                variables: { input: newPatient },
                authMode: 'apiKey'
            });

            const patientId = createResult.data.createPatient.id;
            addResult('success', '➕ Step 1: Patient created!', createResult.data.createPatient);

            // Step 2: Read
            addResult('info', 'Step 2: Reading patient...');
            const getResult = await client.graphql({
                query: `
                    query GetPatient($id: ID!) {
                        getPatient(id: $id) {
                            id
                            firstName
                            lastName
                            phone
                            email
                        }
                    }
                `,
                variables: { id: patientId },
                authMode: 'apiKey'
            });
            addResult('success', '🔍 Step 2: Patient retrieved!', getResult.data.getPatient);

            // Step 3: Update
            addResult('info', 'Step 3: Updating patient...');
            const updateResult = await client.graphql({
                query: `
                    mutation UpdatePatient($input: UpdatePatientInput!) {
                        updatePatient(input: $input) {
                            id
                            firstName
                            lastName
                            phone
                            updatedAt
                        }
                    }
                `,
                variables: {
                    input: {
                        id: patientId,
                        phone: '555-UPDATED'
                    }
                },
                authMode: 'apiKey'
            });
            addResult('success', '✏️ Step 3: Patient updated!', updateResult.data.updatePatient);

            // Step 4: Delete
            addResult('info', 'Step 4: Deleting patient...');
            const deleteResult = await client.graphql({
                query: `
                    mutation DeletePatient($input: DeletePatientInput!) {
                        deletePatient(input: $input) {
                            id
                            firstName
                            lastName
                        }
                    }
                `,
                variables: { input: { id: patientId } },
                authMode: 'apiKey'
            });
            addResult('success', '🗑️ Step 4: Patient deleted!', deleteResult.data.deletePatient);

            addResult('success', '🎉 COMPLETE PATIENT CRUD TEST PASSED!');

        } catch (error) {
            addResult('error', 'Complete Patient CRUD test failed', error);
        }

        setLoading(false);
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace' }}>
            <h2>👥 Patient API - Complete CRUD Testing</h2>

            {selectedPatientId && (
                <div style={{
                    padding: '10px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '4px',
                    marginBottom: '20px',
                    fontSize: '14px'
                }}>
                    <strong>Selected Patient ID:</strong> {selectedPatientId}
                </div>
            )}

            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={testListPatients}
                    disabled={loading}
                    style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                    📋 List All Patients
                </button>

                <button
                    onClick={testCreatePatient}
                    disabled={loading}
                    style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                    ➕ Create New Patient
                </button>

                <button
                    onClick={testUpdatePatient}
                    disabled={loading || !selectedPatientId}
                    style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#d97706', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                    ✏️ Update Selected Patient
                </button>

                <button
                    onClick={testDeletePatient}
                    disabled={loading || !selectedPatientId}
                    style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                    🗑️ Delete Selected Patient
                </button>
            </div>

            <div style={{ marginBottom: '20px', paddingTop: '20px', borderTop: '2px solid #e5e7eb' }}>
                <button
                    onClick={testCompleteCrud}
                    disabled={loading}
                    style={{ marginRight: '10px', padding: '12px 20px', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
                >
                    🔄 Run Complete Patient CRUD Test
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

export default PatientTestComponent;