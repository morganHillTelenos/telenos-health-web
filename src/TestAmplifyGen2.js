import React, { useState, useEffect } from 'react';
import { authService } from './services/auth';
import { apiService } from './services/api';

const TestAmplifyGen2 = () => {
    const [status, setStatus] = useState({});
    const [loading, setLoading] = useState(false);
    const [testEmail] = useState('morgan.mischo.hill@telenos.net');
    const [testPassword] = useState('TempPassword123!');

    const testConnection = async () => {
        setLoading(true);
        const results = {};

        try {
            // Test authentication status
            const isAuth = await authService.isAuthenticated();
            results.auth = { success: true, authenticated: isAuth };

            if (isAuth) {
                const currentUser = await authService.getCurrentUser();
                results.currentUser = { success: true, user: currentUser };
            }
        } catch (error) {
            results.auth = { success: false, error: error.message };
        }

        try {
            // Test creating a test patient (requires authentication)
            if (results.auth.authenticated) {
                const testPatient = {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    dateOfBirth: '1990-01-01',
                    phone: '+1234567890'
                };

                const createResult = await apiService.createPatient(testPatient);
                results.createPatient = { success: true, data: createResult };

                // Test fetching patients
                const patientsResult = await apiService.getPatients();
                results.getPatients = { success: true, data: patientsResult };
            } else {
                results.patients = { success: false, error: 'Not authenticated' };
            }
        } catch (error) {
            results.patients = { success: false, error: error.message };
        }

        setStatus(results);
        setLoading(false);
    };

    const testSignUp = async () => {
        try {
            const result = await authService.register({
                email: testEmail,
                password: testPassword,
                firstName: 'Test',
                lastName: 'User'
            });

            console.log('Sign up result:', result);
            alert('Account created! Check your email for confirmation.');
        } catch (error) {
            console.error('Sign up error:', error);
            alert(`Sign up failed: ${error.message}`);
        }
    };

    const testSignIn = async () => {
        try {
            const result = await authService.login(testEmail, testPassword);
            console.log('Sign in result:', result);
            alert('Successfully signed in!');
            testConnection(); // Refresh the status
        } catch (error) {
            console.error('Sign in error:', error);
            alert(`Sign in failed: ${error.message}`);
        }
    };

    const testSignOut = async () => {
        try {
            await authService.logout();
            alert('Successfully signed out!');
            testConnection(); // Refresh the status
        } catch (error) {
            console.error('Sign out error:', error);
            alert(`Sign out failed: ${error.message}`);
        }
    };

    const [confirmationCode, setConfirmationCode] = useState('');

    const testConfirmSignUp = async () => {
        try {
            const result = await authService.confirmSignUp(testEmail, confirmationCode);
            console.log('Confirmation result:', result);
            alert('Email confirmed successfully! You can now sign in.');
        } catch (error) {
            console.error('Confirmation error:', error);
            alert(`Confirmation failed: ${error.message}`);
        }
    };

    useEffect(() => {
        testConnection();
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2>🚀 Amplify Gen 2 Healthcare Backend Test</h2>

            <div style={{ marginBottom: '20px' }}>
                <button onClick={testConnection} disabled={loading}>
                    {loading ? 'Testing...' : '🔄 Test Connection'}
                </button>

                <button onClick={testSignUp} style={{ marginLeft: '10px' }}>
                    📝 Test Sign Up
                </button>

                <button onClick={testSignIn} style={{ marginLeft: '10px' }}>
                    🔐 Test Sign In
                </button>

                <button onClick={testSignOut} style={{ marginLeft: '10px' }}>
                    🚪 Test Sign Out
                </button>
                <button onClick={() => authService.confirmSignUp(testEmail, '938372').then(() => alert('Confirmed!')).catch(e => alert('Error: ' + e.message))} style={{ marginLeft: '10px' }}>
                    🚀 Confirm with 938372
                </button>
            </div>

            <div style={{ marginTop: '20px' }}>
                <h4>Backend Status:</h4>
                <pre style={{
                    background: '#f5f5f5',
                    padding: '15px',
                    borderRadius: '5px',
                    fontSize: '12px',
                    overflow: 'auto'
                }}>
                    {JSON.stringify(status, null, 2)}
                </pre>
            </div>

            <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
                <p><strong>Test Email:</strong> {testEmail}</p>
                <p><strong>Test Password:</strong> {testPassword}</p>
                <p><em>Use these credentials to test authentication</em></p>
            </div>
        </div>
    );
};

export default TestAmplifyGen2;