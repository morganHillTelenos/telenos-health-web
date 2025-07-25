// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import amplifyConfig from './amplify_outputs.json';
import App from './App';
import '@aws-amplify/ui-react/styles.css';
import './index.css';

// Configure Amplify
Amplify.configure(amplifyConfig);

const root = ReactDOM.createRoot(document.getElementById('root'));

// Custom form fields for healthcare app
const formFields = {
  signUp: {
    email: {
      order: 1,
      placeholder: 'Enter your email address',
      label: 'Email *',
      inputProps: { required: true, type: 'email' }
    },
    password: {
      order: 2,
      placeholder: 'Enter a strong password',
      label: 'Password *'
    },
    confirm_password: {
      order: 3,
      placeholder: 'Confirm your password',
      label: 'Confirm Password *'
    }
  }
};

// Custom components for better UX
const components = {
  Header() {
    return (
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          width: '60px',
          height: '60px',
          background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
          fontSize: '24px',
          fontWeight: 'bold',
          color: 'white'
        }}>
          🏥
        </div>
        <h1 style={{ margin: 0, color: '#1F2937', fontSize: '1.5rem' }}>
          Promind Psychiatry
        </h1>
        <p style={{ margin: '0.5rem 0 0', color: '#6B7280', fontSize: '0.875rem' }}>
          Healthcare Provider Portal
        </p>
      </div>
    );
  }
};

root.render(
  <React.StrictMode>
    <Authenticator
      formFields={formFields}
      components={components}
      variation="modal"
      hideSignUp={false}
    >
      {({ signOut, user }) => (
        <App signOut={signOut} user={user} />
      )}
    </Authenticator>
  </React.StrictMode>
);