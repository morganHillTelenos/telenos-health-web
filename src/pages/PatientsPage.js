// pages/PatientsPage.js - Simple version for testing
import React from 'react';

const PatientsPage = () => {
    return (
        <div style={{ padding: '2rem' }}>
            <h1>Patients Page</h1>
            <p>This is a simple patients page to test if routing works.</p>
            <button onClick={() => window.history.back()}>
                ← Back to Dashboard
            </button>
        </div>
    );
};

export default PatientsPage;