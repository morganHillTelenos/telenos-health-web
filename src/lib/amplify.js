// src/lib/amplify.js - Explicit configuration that forces API Key auth
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';

// EXPLICIT configuration - manually setting everything
const explicitConfig = {
    Auth: {
        Cognito: {
            userPoolId: outputs.auth.user_pool_id,
            userPoolClientId: outputs.auth.user_pool_client_id,
            identityPoolId: outputs.auth.identity_pool_id,
            region: outputs.auth.aws_region
        }
    },
    API: {
        GraphQL: {
            endpoint: 'https://fpg4zax6sjhvtlbuti7sr4llxi.appsync-api.us-east-1.amazonaws.com/graphql',
            region: 'us-east-1',
            defaultAuthorizationType: 'API_KEY',
            authorizationTypes: ['API_KEY', 'AWS_IAM', 'AMAZON_COGNITO_USER_POOLS'],
            apiKey: outputs.data.api_key  // Use the key from outputs.json
        }
    },
    // Also set legacy format for compatibility
    aws_appsync_graphqlEndpoint: 'https://fpg4zax6sjhvtlbuti7sr4llxi.appsync-api.us-east-1.amazonaws.com/graphql',
    aws_appsync_region: 'us-east-1',
    aws_appsync_authenticationType: 'API_KEY',
    aws_appsync_apiKey: outputs.data.api_key
};

// Configure Amplify with explicit config
Amplify.configure(explicitConfig);

console.log('🚀 Amplify configured with EXPLICIT API Key settings');
console.log('🔧 Using API Key from outputs.json:', outputs.data.api_key ? 'Available' : 'Missing');

// Verify the configuration was set correctly
const verifyConfig = () => {
    const currentConfig = Amplify.getConfig();
    console.log('✅ Verification - Current config:', currentConfig);

    const authType = currentConfig.API?.GraphQL?.defaultAuthorizationType;
    const apiKey = currentConfig.API?.GraphQL?.apiKey;

    console.log('🔐 Auth Type Set To:', authType);
    console.log('🔑 API Key Set To:', apiKey ? 'Present' : 'Missing');

    if (authType === 'API_KEY' && apiKey) {
        console.log('✅ Configuration appears correct!');
    } else {
        console.error('❌ Configuration still incorrect!');
        console.error('Expected authType: API_KEY, got:', authType);
        console.error('Expected apiKey: present, got:', apiKey ? 'present' : 'missing');
    }
};

// Run verification after a brief delay
setTimeout(verifyConfig, 100);

export default Amplify;