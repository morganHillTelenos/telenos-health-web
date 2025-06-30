// 4. Add Patient Link Generator Component
// Create src/components/PatientLinkGenerator.js

import React, { useState } from 'react';
import PatientLinkService from '../services/patientLinks';

const PatientLinkGenerator = ({ appointmentId, onClose }) => {
    const [links, setLinks] = useState(null);
    const [copied, setCopied] = useState(false);

    const generateLinks = () => {
        const patientLinks = PatientLinkService.generatePatientLink(appointmentId, {
            // Add patient info if available
        });
        setLinks(patientLinks);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '2rem',
                maxWidth: '500px',
                width: '90%',
                maxHeight: '80vh',
                overflow: 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ margin: 0, color: '#333' }}>Patient Join Link</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            color: '#666'
                        }}
                    >
                        ×
                    </button>
                </div>

                {!links ? (
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                            Generate a secure link for your patient to join this video appointment.
                        </p>
                        <button
                            onClick={generateLinks}
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '1rem 2rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            Generate Patient Link
                        </button>
                    </div>
                ) : (
                    <div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>
                                Simple Join Link:
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    value={links.simple}
                                    readOnly
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem'
                                    }}
                                />
                                <button
                                    onClick={() => copyToClipboard(links.simple)}
                                    style={{
                                        background: copied ? '#28a745' : '#6c757d',
                                        color: 'white',
                                        border: 'none',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '6px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {copied ? '✓' : 'Copy'}
                                </button>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>
                                QR Code for Mobile:
                            </label>
                            <div style={{ textAlign: 'center' }}>
                                <img
                                    src={links.qrCode}
                                    alt="QR Code for patient to join"
                                    style={{ border: '1px solid #ddd', borderRadius: '8px' }}
                                />
                                <p style={{ fontSize: '0.8rem', color: '#666', margin: '0.5rem 0 0 0' }}>
                                    Patient can scan this with their phone camera
                                </p>
                            </div>
                        </div>

                        <div style={{
                            background: '#f8f9fa',
                            padding: '1rem',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            color: '#666'
                        }}>
                            <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600' }}>Instructions for patient:</p>
                            <ol style={{ margin: 0, paddingLeft: '1.2rem' }}>
                                <li>Click the link or scan the QR code</li>
                                <li>Enter their full name</li>
                                <li>Click "Join Appointment"</li>
                                <li>Allow camera and microphone access</li>
                            </ol>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientLinkGenerator;