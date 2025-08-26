// src/components/FinalAuthDebug.js - Final debugging and AWS Console guidance
import React, { useState } from 'react';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

const FinalAuthDebug = () => {
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const generateDiagnosticReport = async () => {
        setLoading(true);
        let report = 'FINAL AUTHORIZATION DIAGNOSTIC REPORT\n';
        report += '=====================================\n\n';

        try {
            const user = await getCurrentUser();
            const session = await fetchAuthSession();

            report += `AUTHENTICATION STATUS: ✅ SUCCESSFUL\n`;
            report += `Username: ${user.username}\n`;
            report += `Email: ${user.signInDetails?.loginId || user.attributes?.email}\n`;
            report += `Groups: ${session.tokens?.idToken?.payload['cognito:groups'] || 'None'}\n`;
            report += `User Pool: us-east-1_tPl89yG7S\n`;
            report += `App Client: 3dl0avl2cq3hffrepamtj400co\n\n`;

            // Detailed token analysis
            if (session.tokens?.idToken) {
                const payload = session.tokens.idToken.payload;
                report += `ID TOKEN CLAIMS:\n`;
                Object.keys(payload).forEach(key => {
                    if (key.startsWith('cognito:') || ['sub', 'email', 'email_verified', 'aud', 'token_use'].includes(key)) {
                        report += `  ${key}: ${payload[key]}\n`;
                    }
                });
                report += '\n';
            }

            report += `AUTHORIZATION TEST RESULTS:\n`;
            report += `❌ Cognito User Pools: FAILED\n`;
            report += `❌ API Key: FAILED\n`;
            report += `❌ IAM: FAILED\n`;
            report += `❌ Direct HTTP calls: FAILED\n\n`;

            report += `POSSIBLE CAUSES:\n`;
            report += `\n`;
            report += `1. GROUP-BASED RESTRICTION:\n`;
            report += `   - Your AppSync might require specific groups beyond 'admin'\n`;
            report += `   - Check if queries require groups like: 'doctors', 'staff', 'healthcare-providers'\n`;
            report += `\n`;
            report += `2. CUSTOM RESOLVER AUTHORIZATION:\n`;
            report += `   - Your resolvers might have custom authorization logic\n`;
            report += `   - VTL templates might check for specific conditions\n`;
            report += `\n`;
            report += `3. IAM ROLE REQUIREMENTS:\n`;
            report += `   - Your user might need additional IAM roles attached\n`;
            report += `   - Cognito Identity Pool might not have proper role mapping\n`;
            report += `\n`;
            report += `4. FIELD-LEVEL AUTHORIZATION:\n`;
            report += `   - Individual fields might have @auth directives\n`;
            report += `   - Some fields might be restricted even if query succeeds\n`;
            report += `\n`;
            report += `5. BUSINESS LOGIC RESTRICTIONS:\n`;
            report += `   - Custom authorization in Lambda resolvers\n`;
            report += `   - Database-level permissions\n`;
            report += `\n`;

            report += `IMMEDIATE ACTION PLAN:\n`;
            report += `========================\n`;
            report += `\n`;
            report += `STEP 1: CHECK AWS APPSYNC CONSOLE\n`;
            report += `- Go to: https://console.aws.amazon.com/appsync/\n`;
            report += `- Find API: fpg4zax6sjhvtlbuti7sr4llxi\n`;
            report += `- Check 'Settings' > 'Authorization'\n`;
            report += `- Note: Default auth mode and additional auth modes\n`;
            report += `\n`;
            report += `STEP 2: CHECK SCHEMA AUTHORIZATION\n`;
            report += `- In AppSync Console, go to 'Schema' tab\n`;
            report += `- Look for @auth directives on:\n`;
            report += `  - type Patient @auth(...)\n`;
            report += `  - type Query @auth(...)\n`;
            report += `  - listPatients: [Patient] @auth(...)\n`;
            report += `\n`;
            report += `STEP 3: CHECK RESOLVERS\n`;
            report += `- Go to 'Schema' tab\n`;
            report += `- Click on 'listPatients' resolver\n`;
            report += `- Check 'Request mapping template' for authorization logic\n`;
            report += `- Look for: #if statements, $ctx.identity checks\n`;
            report += `\n`;
            report += `STEP 4: CHECK COGNITO GROUPS\n`;
            report += `- Go to: https://console.aws.amazon.com/cognito/\n`;
            report += `- Find User Pool: us-east-1_tPl89yG7S\n`;
            report += `- Go to 'Users and groups' > 'Groups'\n`;
            report += `- Check what groups exist and their roles\n`;
            report += `- Verify your user is in the right groups\n`;
            report += `\n`;
            report += `STEP 5: CHECK IAM ROLES\n`;
            report += `- In Cognito User Pool, check 'App integration' > 'Identity providers'\n`;
            report += `- Check if groups have IAM roles attached\n`;
            report += `- Verify role permissions in IAM console\n`;
            report += `\n`;

            report += `LIKELY SOLUTIONS:\n`;
            report += `================\n`;
            report += `\n`;
            report += `Solution 1: Add Required Groups\n`;
            report += `- Add your user to groups like: 'doctors', 'staff', 'healthcare'\n`;
            report += `- Your schema might require specific group names\n`;
            report += `\n`;
            report += `Solution 2: Modify Schema Authorization\n`;
            report += `- Change @auth rules to allow 'admin' group\n`;
            report += `- Or temporarily use: @auth(rules: [{ allow: public }])\n`;
            report += `\n`;
            report += `Solution 3: Update Resolver Logic\n`;
            report += `- Modify request mapping templates to allow admin group\n`;
            report += `- Remove restrictive authorization logic\n`;
            report += `\n`;
            report += `Solution 4: Create Public Operations\n`;
            report += `- Add separate public queries/mutations for testing\n`;
            report += `- Use API key authentication for basic operations\n`;
            report += `\n`;

            report += `EMERGENCY WORKAROUND:\n`;
            report += `====================\n`;
            report += `If you need immediate access, temporarily modify your schema to:\n`;
            report += `\n`;
            report += `type Query {\n`;
            report += `  listPatients: [Patient] @auth(rules: [{ allow: public }])\n`;
            report += `  # ... other queries\n`;
            report += `}\n`;
            report += `\n`;
            report += `type Patient @auth(rules: [{ allow: public }]) {\n`;
            report += `  # ... fields\n`;
            report += `}\n`;
            report += `\n`;
            report += `This will allow API key access for testing.\n`;

        } catch (error) {
            report += `❌ DIAGNOSTIC FAILED: ${error.message}\n`;
        }

        setResult(report);
        setLoading(false);
    };

    const generateQuickFixes = () => {
        setLoading(true);
        let report = 'QUICK FIXES TO TRY\n';
        report += '==================\n\n';

        report += `Based on your results, here are the most likely quick fixes:\n\n`;

        report += `FIX 1: ADD USER TO REQUIRED GROUPS\n`;
        report += `----------------------------------\n`;
        report += `1. Go to AWS Cognito Console\n`;
        report += `2. Find User Pool: us-east-1_tPl89yG7S\n`;
        report += `3. Go to 'Users and groups' > 'Groups'\n`;
        report += `4. Check existing groups (might be: doctors, staff, healthcare-providers)\n`;
        report += `5. Add your user (morgan.mischo.hill@promindpsychiatry.com) to required groups\n\n`;

        report += `FIX 2: MODIFY APPSYNC AUTHORIZATION\n`;
        report += `----------------------------------\n`;
        report += `1. Go to AWS AppSync Console\n`;
        report += `2. Find your API: fpg4zax6sjhvtlbuti7sr4llxi\n`;
        report += `3. Go to Settings > Authorization\n`;
        report += `4. Try changing default auth to 'API Key'\n`;
        report += `5. Or add 'API Key' as additional authorization mode\n\n`;

        report += `FIX 3: CREATE TEST USER WITH PROPER GROUPS\n`;
        report += `------------------------------------------\n`;
        report += `1. In Cognito User Pool, create a new test user\n`;
        report += `2. Add them to all available groups\n`;
        report += `3. Test with that user account\n\n`;

        report += `FIX 4: EMERGENCY PUBLIC ACCESS\n`;
        report += `------------------------------\n`;
        report += `1. In AppSync Schema, temporarily add:\n`;
        report += `   @auth(rules: [{ allow: public }])\n`;
        report += `2. This will allow API key access for testing\n`;
        report += `3. Remember to revert this later for security\n\n`;

        report += `FIX 5: CHECK EXISTING WORKING OPERATIONS\n`;
        report += `---------------------------------------\n`;
        report += `Some operations might work while others don't.\n`;
        report += `Try testing individual mutations/queries to find working ones.\n\n`;

        report += `MOST LIKELY: Your user needs to be in additional groups\n`;
        report += `beyond 'admin'. Check Cognito Groups and add your user\n`;
        report += `to all healthcare-related groups.\n`;

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
            <h3>🔍 Final Authorization Debug</h3>

            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={generateDiagnosticReport}
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '10px'
                    }}
                >
                    {loading ? '📋 Generating...' : '📋 Full Diagnostic Report'}
                </button>

                <button
                    onClick={generateQuickFixes}
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    {loading ? '🔧 Loading...' : '🔧 Quick Fixes'}
                </button>
            </div>

            <div style={{
                backgroundColor: '#1f2937',
                color: '#f9fafb',
                padding: '15px',
                borderRadius: '6px',
                fontSize: '12px',
                whiteSpace: 'pre-wrap',
                minHeight: '200px',
                maxHeight: '600px',
                overflowY: 'auto'
            }}>
                {result || 'Click "Full Diagnostic Report" for complete analysis and AWS Console steps...'}
            </div>

            <div style={{
                marginTop: '15px',
                padding: '10px',
                backgroundColor: '#fee2e2',
                borderRadius: '4px',
                fontSize: '12px'
            }}>
                <strong>🎯 Current Status:</strong>
                <p style={{ margin: '5px 0' }}>
                    You're authenticated with Cognito (admin group), but ALL authorization methods fail.
                    This indicates your AWS AppSync API has specific authorization requirements.
                </p>
                <p style={{ margin: '5px 0' }}>
                    <strong>Most Likely Fix:</strong> Add your user to additional groups in Cognito (beyond 'admin').
                    Check the AWS Console for required group names.
                </p>
            </div>
        </div>
    );
};

export default FinalAuthDebug;