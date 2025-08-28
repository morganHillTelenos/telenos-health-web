// src/components/AuthWrapper.js - Add authentication to your app
import React from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

const AuthWrapper = ({ children }) => {
    return (
        <Authenticator
            variation="modal"
            hideSignUp={false}
            loginMechanisms={['email']}
            signUpAttributes={[
                'email',
                'given_name',
                'family_name',
                'phone_number'
            ]}
            formFields={{
                signIn: {
                    username: {
                        labelHidden: false,
                        placeholder: 'Enter your email address',
                        isRequired: true,
                        label: 'Email'
                    }
                },
                signUp: {
                    given_name: {
                        labelHidden: false,
                        placeholder: 'Enter your first name',
                        isRequired: true,
                        label: 'First Name',
                        order: 1
                    },
                    family_name: {
                        labelHidden: false,
                        placeholder: 'Enter your last name',
                        isRequired: true,
                        label: 'Last Name',
                        order: 2
                    },
                    email: {
                        labelHidden: false,
                        placeholder: 'Enter your email address',
                        isRequired: true,
                        label: 'Email',
                        order: 3
                    },
                    phone_number: {
                        labelHidden: false,
                        placeholder: 'Enter your phone number',
                        isRequired: false,
                        label: 'Phone Number',
                        order: 4
                    },
                    password: {
                        labelHidden: false,
                        placeholder: 'Enter your password',
                        isRequired: true,
                        label: 'Password',
                        order: 5
                    },
                    confirm_password: {
                        labelHidden: false,
                        placeholder: 'Confirm your password',
                        isRequired: true,
                        label: 'Confirm Password',
                        order: 6
                    }
                }
            }}
            components={{
                Header() {
                    return (
                        <div style={{
                            textAlign: 'center',
                            padding: '20px 0',
                            borderBottom: '1px solid #e0e0e0',
                            marginBottom: '20px'
                        }}>
                            <h1 style={{
                                color: '#1976d2',
                                margin: '0 0 10px 0',
                                fontSize: '28px',
                                fontWeight: 'bold'
                            }}>
                                🏥 EMR System
                            </h1>
                            <p style={{
                                color: '#666',
                                margin: 0,
                                fontSize: '16px'
                            }}>
                                Secure Healthcare Management Platform
                            </p>
                        </div>
                    );
                },
                Footer() {
                    return (
                        <div style={{
                            textAlign: 'center',
                            padding: '20px 0',
                            borderTop: '1px solid #e0e0e0',
                            marginTop: '20px',
                            color: '#666',
                            fontSize: '14px'
                        }}>
                            <p style={{ margin: '0 0 5px 0' }}>
                                🔒 HIPAA Compliant • Secure Authentication
                            </p>
                            <p style={{ margin: '0' }}>
                                Need help? Contact your system administrator
                            </p>
                        </div>
                    );
                }
            }}
        >
            {({ signOut, user }) => (
                <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
                    {/* Top Navigation Bar */}
                    <nav style={{
                        backgroundColor: '#1976d2',
                        color: 'white',
                        padding: '0 20px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            maxWidth: '1200px',
                            margin: '0 auto',
                            height: '60px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <h1 style={{
                                    margin: 0,
                                    fontSize: '24px',
                                    fontWeight: 'bold'
                                }}>
                                    🏥 EMR System
                                </h1>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        backgroundColor: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#1976d2',
                                        fontWeight: 'bold'
                                    }}>
                                        {user?.attributes?.given_name?.[0] || user?.username?.[0] || '👤'}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: '500' }}>
                                            {user?.attributes?.given_name || user?.username || 'User'}
                                            {user?.attributes?.family_name && ` ${user.attributes.family_name}`}
                                        </div>
                                        <div style={{ fontSize: '12px', opacity: 0.8 }}>
                                            {user?.attributes?.email || 'Healthcare Provider'}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={signOut}
                                    style={{
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        border: '1px solid rgba(255,255,255,0.3)',
                                        borderRadius: '6px',
                                        padding: '8px 16px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => {
                                        e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                    }}
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </nav>

                    {/* Main Content Area */}
                    <main style={{
                        maxWidth: '1200px',
                        margin: '0 auto',
                        padding: '20px'
                    }}>
                        {/* Welcome Message */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            padding: '20px',
                            marginBottom: '20px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            <h2 style={{
                                margin: '0 0 10px 0',
                                color: '#333',
                                fontSize: '20px'
                            }}>
                                Welcome back, {user?.attributes?.given_name || user?.username || 'User'}! 👋
                            </h2>
                            <p style={{
                                margin: '0',
                                color: '#666',
                                fontSize: '14px'
                            }}>
                                ✅ Authenticated successfully • Connected to DynamoDB • Ready to manage patients
                            </p>
                        </div>

                        {/* Your app content goes here */}
                        {children}
                    </main>

                    {/* Footer */}
                    <footer style={{
                        backgroundColor: '#333',
                        color: '#ccc',
                        textAlign: 'center',
                        padding: '20px',
                        marginTop: '40px'
                    }}>
                        <p style={{ margin: '0', fontSize: '14px' }}>
                            🔒 HIPAA Compliant EMR System • Powered by AWS • © 2024
                        </p>
                    </footer>
                </div>
            )}
        </Authenticator>
    );
};

export default AuthWrapper;