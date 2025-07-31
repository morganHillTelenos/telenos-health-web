// src/index.js - Fixed to allow public landing page
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import amplifyConfig from './amplify_outputs.json';
import App from './App';
import LandingPage from './pages/LandingPage';
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

// Component to conditionally render authentication
const ConditionalAuth = () => {
  const location = useLocation();

  // Define public routes that don't need authentication
  const publicRoutes = ['/', '/landing'];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  // If it's a public route, render the landing page directly
  if (isPublicRoute) {
    return <LandingPage />;
  }

  // For all other routes, require authentication
  return (
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
  );
};

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        {/* Public landing page route */}
        <Route path="/" element={<LandingPage />} />

        {/* All other routes require authentication */}
        <Route path="/*" element={
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
        } />
      </Routes>
    </Router>
  </React.StrictMode>
);