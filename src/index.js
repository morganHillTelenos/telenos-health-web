// src/index.js - Final configuration
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import amplifyConfig from './amplify_outputs.json';
import App from './App';
import './index.css';

// 🔧 FINAL: Force API key as default auth mode
const correctedConfig = {
  ...amplifyConfig,
  API: {
    GraphQL: {
      endpoint: amplifyConfig.data.url, // Auto-use current endpoint
      region: amplifyConfig.data.aws_region,
      defaultAuthMode: 'apiKey',
      apiKey: amplifyConfig.data.api_key // Auto-use current API key
    }
  }
};

// Configure Amplify with corrected config
Amplify.configure(correctedConfig);

console.log('🚀 AWS Amplify configured with FINAL sandbox');
console.log('🌐 GraphQL API:', amplifyConfig.data.url);
console.log('🔑 API Key:', amplifyConfig.data.api_key);
console.log('📊 Available Models: Doctor, Patient, Note');

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);