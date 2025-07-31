import React, { useState } from 'react';

const RecordingDebugComponent = () => {
    const [testResults, setTestResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Inline recording service for testing
    const baseURL = process.env.REACT_APP_RECORDING_API_URL || 'https://h70cqz8rn9.execute-api.us-east-1.amazonaws.com/prod';

    const testEndpoint = async () => {
        try {
            console.log('🧪 Testing recording endpoint...');

            const response = await fetch(`${baseURL}/recording/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    test: true,
                    roomSid: 'TEST_ROOM_SID'
                })
            });

            console.log('🧪 Test response status:', response.status);
            const responseText = await response.text();
            console.log('🧪 Test response body:', responseText);

            return {
                status: response.status,
                response: responseText
            };

        } catch (error) {
            console.error('🧪 Test failed:', error);
            return {
                error: error.message
            };
        }
    };

    const testRecordingFormats = async ({ roomSid, identity, appointmentId }) => {
        console.log('🎬 === RECORDING START DEBUG ===');
        console.log('🏠 Room SID:', roomSid);
        console.log('🆔 Identity:', identity);
        console.log('📅 Appointment ID:', appointmentId);
        console.log('🌐 Base URL:', baseURL);

        // Try multiple different parameter combinations
        const attempts = [
            // Attempt 1: Original format
            {
                name: 'Original Format',
                body: {
                    roomSid: roomSid,
                    identity: identity || 'unknown-user',
                    appointmentId: appointmentId || 'unknown-appointment'
                }
            },
            // Attempt 2: Add Status parameter
            {
                name: 'With Status Parameter',
                body: {
                    roomSid: roomSid,
                    identity: identity || 'unknown-user',
                    appointmentId: appointmentId || 'unknown-appointment',
                    Status: 'in-progress'
                }
            },
            // Attempt 3: Different Status format
            {
                name: 'Lowercase status',
                body: {
                    roomSid: roomSid,
                    identity: identity || 'unknown-user',
                    appointmentId: appointmentId || 'unknown-appointment',
                    status: 'in-progress'
                }
            },
            // Attempt 4: Minimal Twilio format
            {
                name: 'Minimal Twilio Format',
                body: {
                    roomSid: roomSid,
                    Status: 'in-progress'
                }
            },
            // Attempt 5: Direct Twilio API format
            {
                name: 'Direct Twilio API Format',
                body: {
                    RoomSid: roomSid,
                    Status: 'in-progress',
                    RecordingRules: JSON.stringify([{
                        type: 'include',
                        all: true
                    }])
                }
            }
        ];

        const results = [];

        for (let i = 0; i < attempts.length; i++) {
            const attempt = attempts[i];
            console.log(`\n🔄 Attempt ${i + 1}: ${attempt.name}`);
            console.log('📤 Request body:', JSON.stringify(attempt.body, null, 2));

            try {
                const response = await fetch(`${baseURL}/recording/start`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(attempt.body)
                });

                console.log(`📨 Response status: ${response.status}`);
                console.log(`📨 Response headers:`, Object.fromEntries(response.headers.entries()));

                const responseText = await response.text();

                results.push({
                    attempt: attempt.name,
                    status: response.status,
                    success: response.ok,
                    requestBody: attempt.body,
                    responseText: responseText,
                    responseHeaders: Object.fromEntries(response.headers.entries())
                });

                if (response.ok) {
                    console.log(`✅ SUCCESS with ${attempt.name}:`, responseText);
                    break; // Stop on first success
                } else {
                    console.log(`❌ Failed with ${attempt.name}:`, responseText);
                }

            } catch (error) {
                console.log(`💥 Exception in ${attempt.name}:`, error.message);
                results.push({
                    attempt: attempt.name,
                    status: 'ERROR',
                    success: false,
                    requestBody: attempt.body,
                    error: error.message
                });
            }
        }

        return results;
    };

    const runEndpointTest = async () => {
        setIsLoading(true);
        setTestResults([]);

        try {
            console.log('🧪 Running endpoint test...');
            const result = await testEndpoint();

            setTestResults(prev => [...prev, {
                type: 'endpoint-test',
                result,
                timestamp: new Date().toISOString()
            }]);

        } catch (error) {
            setTestResults(prev => [...prev, {
                type: 'error',
                result: { error: error.message },
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const runRecordingTest = async () => {
        setIsLoading(true);

        try {
            console.log('🎬 Running recording test...');

            // Use a test room SID
            const testRoomSid = 'RM1234567890abcdef1234567890abcdef';

            const results = await testRecordingFormats({
                roomSid: testRoomSid,
                identity: 'test-user',
                appointmentId: 'test-appointment-001'
            });

            setTestResults(prev => [...prev, {
                type: 'recording-test',
                result: { attempts: results },
                timestamp: new Date().toISOString()
            }]);

        } catch (error) {
            setTestResults(prev => [...prev, {
                type: 'error',
                result: { error: error.message },
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearResults = () => {
        setTestResults([]);
    };

    return (
        <div style={{
            padding: '20px',
            background: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: '8px',
            margin: '20px 0',
            fontFamily: 'monospace'
        }}>
            <h3>🔧 Recording Debug Panel</h3>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '15px' }}>
                Endpoint: {baseURL}/recording/start
            </p>

            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={runEndpointTest}
                    disabled={isLoading}
                    style={{
                        padding: '10px 15px',
                        marginRight: '10px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isLoading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isLoading ? 'Testing...' : '🧪 Test Endpoint'}
                </button>

                <button
                    onClick={runRecordingTest}
                    disabled={isLoading}
                    style={{
                        padding: '10px 15px',
                        marginRight: '10px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isLoading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isLoading ? 'Testing...' : '🎬 Test Recording Formats'}
                </button>

                <button
                    onClick={clearResults}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    🗑️ Clear Results
                </button>
            </div>

            <div style={{
                maxHeight: '500px',
                overflowY: 'auto',
                background: 'white',
                padding: '15px',
                borderRadius: '4px',
                border: '1px solid #ccc'
            }}>
                <h4>Test Results:</h4>
                {testResults.length === 0 ? (
                    <p style={{ color: '#666' }}>No tests run yet. Click a button above to start testing.</p>
                ) : (
                    testResults.map((test, index) => (
                        <div key={index} style={{
                            marginBottom: '15px',
                            padding: '10px',
                            background: test.type === 'error' ? '#ffe6e6' : '#e6f3ff',
                            borderRadius: '4px',
                            fontSize: '12px'
                        }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                                {test.type === 'error' ? '❌' : '📋'} {test.type.toUpperCase()} - {new Date(test.timestamp).toLocaleTimeString()}
                            </div>

                            {test.type === 'recording-test' && test.result.attempts && (
                                <div>
                                    {test.result.attempts.map((attempt, idx) => (
                                        <div key={idx} style={{
                                            marginBottom: '10px',
                                            padding: '8px',
                                            background: attempt.success ? '#d4edda' : '#f8d7da',
                                            borderRadius: '3px'
                                        }}>
                                            <div style={{ fontWeight: 'bold' }}>
                                                {attempt.success ? '✅' : '❌'} {attempt.attempt} (Status: {attempt.status})
                                            </div>
                                            <div style={{ fontSize: '10px', marginTop: '5px' }}>
                                                <strong>Request:</strong>
                                                <pre style={{ background: '#f8f9fa', padding: '4px', borderRadius: '2px', margin: '2px 0' }}>
                                                    {JSON.stringify(attempt.requestBody, null, 2)}
                                                </pre>
                                                <strong>Response:</strong>
                                                <pre style={{ background: '#f8f9fa', padding: '4px', borderRadius: '2px', margin: '2px 0' }}>
                                                    {attempt.responseText || attempt.error}
                                                </pre>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {test.type !== 'recording-test' && (
                                <pre style={{
                                    background: '#f8f9fa',
                                    padding: '8px',
                                    borderRadius: '3px',
                                    overflow: 'auto',
                                    fontSize: '11px'
                                }}>
                                    {JSON.stringify(test.result, null, 2)}
                                </pre>
                            )}
                        </div>
                    ))
                )}
            </div>

            <div style={{
                marginTop: '15px',
                padding: '10px',
                background: '#fff3cd',
                borderRadius: '4px',
                fontSize: '12px'
            }}>
                <strong>💡 Debug Tips:</strong>
                <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                    <li>Check the browser console for detailed logs</li>
                    <li>The endpoint test shows if your Lambda function is reachable</li>
                    <li>The recording test tries 5 different parameter formats automatically</li>
                    <li>Green results = success, Red results = failure</li>
                    <li>Look for successful attempts to see the correct format</li>
                </ul>
            </div>
        </div>
    );
};

export default RecordingDebugComponent;