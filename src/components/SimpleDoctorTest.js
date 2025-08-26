// src/components/SimpleDoctorTest.js - Simple debug test for doctors
import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/api';

const SimpleDoctorTest = () => {
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const testDoctorOperations = async () => {
        setLoading(true);
        let report = 'SIMPLE DOCTOR TEST RESULTS\n';
        report += '===========================\n\n';

        try {
            const client = generateClient({ authMode: 'apiKey' });

            // Test 1: Very simple list doctors
            report += '1. TESTING SIMPLE LIST DOCTORS:\n';
            try {
                const listResult = await client.graphql({
                    query: `
                        query ListDoctorsSimple {
                            listDoctors {
                                items {
                                    id
                                    firstName
                                    lastName
                                }
                                nextToken
                            }
                        }
                    `
                });

                report += `✅ Query executed successfully!\n`;
                report += `Full response:\n${JSON.stringify(listResult, null, 2)}\n\n`;

                // Check response structure
                if (listResult.data) {
                    report += `✅ Has data field\n`;
                    if (listResult.data.listDoctors) {
                        report += `✅ Has listDoctors field\n`;
                        if (listResult.data.listDoctors.items) {
                            report += `✅ Has items field with ${listResult.data.listDoctors.items.length} items\n`;
                        } else {
                            report += `❌ No items field in listDoctors\n`;
                        }
                    } else {
                        report += `❌ No listDoctors field in data\n`;
                    }
                } else {
                    report += `❌ No data field in response\n`;
                }

            } catch (error) {
                report += `❌ List doctors failed: ${error.message}\n`;
                if (error.errors) {
                    report += `   GraphQL Errors: ${JSON.stringify(error.errors, null, 2)}\n`;
                }
            }

            // Test 2: Create a doctor and then list
            report += '\n2. TESTING CREATE THEN LIST:\n';
            try {
                // Create first
                const createResult = await client.graphql({
                    query: `
                        mutation CreateDoctorSimple($input: CreateDoctorInput!) {
                            createDoctor(input: $input) {
                                id
                                firstName
                                lastName
                                email
                                specialty
                            }
                        }
                    `,
                    variables: {
                        input: {
                            firstName: 'Simple',
                            lastName: 'Test',
                            email: `simple-${Date.now()}@example.com`,
                            specialty: 'Test Medicine',
                            licenseNumber: `TEST-${Math.random().toString(36).substr(2, 6)}`
                        }
                    }
                });

                report += `✅ Create successful!\n`;
                report += `Create response:\n${JSON.stringify(createResult, null, 2)}\n\n`;

                // Now list again
                const listAfterCreate = await client.graphql({
                    query: `
                        query ListAfterCreate {
                            listDoctors {
                                items {
                                    id
                                    firstName
                                    lastName
                                    specialty
                                }
                                nextToken
                            }
                        }
                    `
                });

                report += `✅ List after create successful!\n`;
                report += `List response:\n${JSON.stringify(listAfterCreate, null, 2)}\n\n`;

            } catch (error) {
                report += `❌ Create/List failed: ${error.message}\n`;
                if (error.errors) {
                    report += `   GraphQL Errors: ${JSON.stringify(error.errors, null, 2)}\n`;
                }
            }

            // Test 3: Check DynamoDB directly
            report += '\n3. CHECKING DYNAMODB SCAN:\n';
            try {
                const scanResult = await client.graphql({
                    query: `
                        query ScanDoctors {
                            listDoctors(limit: 100) {
                                items {
                                    id
                                    firstName
                                    lastName
                                    email
                                    specialty
                                    licenseNumber
                                    createdAt
                                    updatedAt
                                }
                                nextToken
                            }
                        }
                    `
                });

                report += `✅ Scan successful!\n`;
                report += `Scan response:\n${JSON.stringify(scanResult, null, 2)}\n\n`;

            } catch (error) {
                report += `❌ Scan failed: ${error.message}\n`;
            }

        } catch (error) {
            report += `❌ Overall test failed: ${error.message}\n`;
        }

        setResult(report);
        setLoading(false);
    };

    return (
        <div style={{
            padding: '20px',
            border: '2px solid #dc2626',
            borderRadius: '8px',
            margin: '20px',
            backgroundColor: '#fef2f2',
            fontFamily: 'monospace'
        }}>
            <h3>🔧 Simple Doctor Debug Test</h3>

            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={testDoctorOperations}
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    {loading ? '🔍 Testing...' : '🔍 Run Simple Doctor Test'}
                </button>
            </div>

            <div style={{
                backgroundColor: '#1f2937',
                color: '#f9fafb',
                padding: '15px',
                borderRadius: '6px',
                fontSize: '11px',
                whiteSpace: 'pre-wrap',
                minHeight: '200px',
                maxHeight: '600px',
                overflowY: 'auto',
                wordBreak: 'break-word'
            }}>
                {result || 'Click "Run Simple Doctor Test" to see the exact GraphQL responses...'}
            </div>

            <div style={{
                marginTop: '15px',
                padding: '10px',
                backgroundColor: '#fee2e2',
                borderRadius: '4px',
                fontSize: '12px'
            }}>
                <strong>🎯 This will show us:</strong>
                <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                    <li>Exact JSON response structure from GraphQL</li>
                    <li>Whether the resolver is working correctly</li>
                    <li>If data is being created and stored</li>
                    <li>What the actual response format is</li>
                </ul>
                <strong>This will tell us exactly how to fix the parsing logic!</strong>
            </div>
        </div>
    );
};

export default SimpleDoctorTest;