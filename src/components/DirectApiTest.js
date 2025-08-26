// src/components/DirectApiTest.js - Simple direct test without complex error handling
import React, { useState } from 'react';
import { apiService } from '../services/api';
import { getCurrentUser } from 'aws-amplify/auth';

const DirectApiTest = () => {
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const clearResult = () => setResult('');

    const testAuth = async () => {
        try {
            const user = await getCurrentUser();
            setResult(`✅ Authentication: SUCCESS\nUser: ${user.username}\nEmail: ${user.signInDetails?.loginId || 'N/A'}`);
        } catch (error) {
            setResult(`❌ Authentication: FAILED\nError: ${error}`);
        }
    };

    const testPatientList = async () => {
        setLoading(true);
        try {
            console.log('Testing patient list...');
            const result = await apiService.getPatients({ limit: 5 });
            setResult(`✅ Patient List: SUCCESS\nFound ${result.data.length} patients\nData: ${JSON.stringify(result.data, null, 2)}`);
        } catch (error) {
            console.error('Patient list error:', error);
            setResult(`❌ Patient List: FAILED\nError: ${error.toString()}\nType: ${typeof error}\nMessage: ${error.message || 'No message'}`);
        }
        setLoading(false);
    };

    const testPatientCreate = async () => {
        setLoading(true);
        try {
            console.log('Testing patient creation...');
            const testPatient = {
                firstName: 'Test',
                lastName: 'Patient',
                email: `test-${Date.now()}@example.com`,
                dateOfBirth: '1990-01-01'
            };

            const result = await apiService.createPatient(testPatient);
            setResult(`✅ Patient Create: SUCCESS\nCreated: ${result.data.firstName} ${result.data.lastName}\nID: ${result.data.id}`);
        } catch (error) {
            console.error('Patient create error:', error);
            setResult(`❌ Patient Create: FAILED\nError: ${error.toString()}\nMessage: ${error.message || 'No message'}`);
        }
        setLoading(false);
    };

    const testConnection = async () => {
        setLoading(true);
        try {
            console.log('Testing API connection...');
            const result = await apiService.testConnection();
            setResult(`✅ Connection Test: SUCCESS\nResult: ${JSON.stringify(result, null, 2)}`);
        } catch (error) {
            console.error('Connection test error:', error);
            setResult(`❌ Connection Test: FAILED\nError: ${error.toString()}\nMessage: ${error.message || 'No message'}`);
        }
        setLoading(false);
    };

    return (
        <div style={{
            padding: '20px',
            border: '2px solid #d1d5db',
            borderRadius: '8px',
            margin: '20px',
            backgroundColor: '#f9fafb',
            fontFamily: 'monospace'
        }}>
            <h3>🔧 Direct API Test (Simplified)</h3>

            <div style={{ marginBottom: '20px' }}>
                <button onClick={testAuth} style={buttonStyle('#3b82f6')}>
                    1. Test Auth
                </button>
                <button onClick={testConnection} disabled={loading} style={buttonStyle('#10b981')}>
                    2. Test Connection
                </button>
                <button onClick={testPatientList} disabled={loading} style={buttonStyle('#f59e0b')}>
                    3. List Patients
                </button>
                <button onClick={testPatientCreate} disabled={loading} style={buttonStyle('#8b5cf6')}>
                    4. Create Patient
                </button>
                <button onClick={clearResult} style={buttonStyle('#6b7280')}>
                    Clear
                </button>
            </div>

            {loading && <div style={{ color: '#ef4444', marginBottom: '10px' }}>⏳ Running test...</div>}

            <div style={{
                backgroundColor: '#1f2937',
                color: '#f9fafb',
                padding: '15px',
                borderRadius: '6px',
                fontSize: '14px',
                whiteSpace: 'pre-wrap',
                minHeight: '100px',
                maxHeight: '400px',
                overflowY: 'auto'
            }}>
                {result || 'Click a button to run a test...'}
            </div>

            <div style={{
                marginTop: '15px',
                padding: '10px',
                backgroundColor: '#eff6ff',
                borderRadius: '4px',
                fontSize: '12px'
            }}>
                <strong>💡 Debug Tips:</strong>
                <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                    <li>Make sure you're signed in through Amplify Authenticator</li>
                    <li>Test #1 should show your username if authenticated</li>
                    <li>If tests fail, check browser console for detailed errors</li>
                    <li>Your schema requires Cognito User Pools authentication</li>
                </ul>
            </div>
        </div>
    );
};

const buttonStyle = (bgColor) => ({
    padding: '8px 12px',
    margin: '0 5px 5px 0',
    backgroundColor: bgColor,
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
});

export default DirectApiTest;