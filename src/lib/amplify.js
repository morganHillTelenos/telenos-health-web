// src/lib/amplify.js - Amplify Configuration
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';

// Configure Amplify with your backend resources
Amplify.configure(outputs);

console.log('🚀 AWS Amplify configured with real backend');
console.log('📍 Region:', outputs.auth.aws_region);
console.log('🔐 User Pool:', outputs.auth.user_pool_id);
console.log('🌐 GraphQL API:', outputs.data.url);

export default Amplify;