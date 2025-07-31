// src/components/TokenDebugTest.js - Debug JWT Token Contents
import React, { useState } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';

const TokenDebugTest = () => {
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

    const debugToken = async () => {
        setLoading(true);
        clearResults();

        addResult('info', '🔍 Debugging JWT token contents...');

        try {
            const currentUser = await getCurrentUser();

            // Get the full user object
            addResult('success', '✅ Current user object:', currentUser);

            // Try to get the access token
            if (currentUser.signInUserSession) {
                const accessToken = currentUser.signInUserSession.accessToken;
                addResult('info', '🎫 Access token payload:', accessToken.payload);

                // Check for groups specifically
                const groups = accessToken.payload['cognito:groups'];
                addResult('info', '👥 Groups from token:', groups || 'None found');

                // Check all claims
                addResult('info', '📋 All token claims:', Object.keys(accessToken.payload));
            } else {
                addResult('warning', '⚠️ No signInUserSession found');
            }

            // Try alternative method to get groups
            try {
                const { fetchAuthSession } = await import('aws-amplify/auth');
                const session = await fetchAuthSession();
                addResult('info', '🔐 Full auth session:', session);

                if (session.tokens?.accessToken) {
                    const payload = session.tokens.accessToken.payload;
                    addResult('info', '🎫 Alternative token payload:', payload);
                    addResult('info', '👥 Groups (alternative method):', payload['cognito:groups'] || 'None');
                }
            } catch (sessionError) {
                addResult('error', '❌ Failed to get auth session:', sessionError.message);
            }

        } catch (error) {
            addResult('error', '❌ Token debug failed:', {
                message: error.message,
                stack: error.stack
            });
        }

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
            <h2>🔍 JWT Token Debug</h2>

            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={debugToken}
                    disabled={loading}
                    style={{
                        padding: '12px 20px',
                        backgroundColor: '#8B5CF6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        marginRight: '10px'
                    }}
                >
                    {loading ? '🔄 Debugging Token...' : '🔍 Debug JWT Token'}
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
                        Click "Debug JWT Token" to see the actual token contents and groups.
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

            {/* Next Steps */}
            <div style={{ marginTop: '20px', padding: '15px', background: '#FEF3C7', borderRadius: '8px' }}>
                <h4 style={{ color: '#92400E', margin: '0 0 10px 0' }}>🎯 What to Check:</h4>
                <ul style={{ color: '#92400E', margin: 0, paddingLeft: '20px' }}>
                    <li>Does the token contain a <code>cognito:groups</code> field?</li>
                    <li>What's the exact value of the groups field?</li>
                    <li>Are there any other relevant claims in the token?</li>
                    <li>Is the user session structure what we expect?</li>
                </ul>
            </div>
        </div>
    );
};

export default TokenDebugTest;
