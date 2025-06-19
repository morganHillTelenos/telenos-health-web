import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import outputs from './amplify_outputs.json'; // Changed from '../amplify_outputs.json'
import App from './App';
import './index.css';

// Configure Amplify with your backend
Amplify.configure(outputs);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);