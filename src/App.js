// src/App.js - Updated with Role-Based Route Protection
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './styles/globals.css';
// In your main app or a test page
import PatientTestComponent from './components/PatientTestComponent';
import NoteTestComponent from './components/NoteTestComponent';
import DoctorList from './pages/DoctorList';
import DoctorForm from './pages/DoctorForm';
import PatientList from './pages/PatientList';
import PatientForm from './pages/PatientForm';
import NoteList from './pages/NoteList';
import NoteForm from './pages/NoteForm';
import RoleTestComponent from './components/RoleTestComponent';

// Import the enhanced dashboard
import HealthcareDashboard from './pages/HealthcareDashboard';

// Import auth service for role checking
import { authService } from './services/auth';

// Admin-only route protection component
const AdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const role = await authService.getUserRole();
        setIsAdmin(role === 'admin');
      } catch (error) {
        setIsAdmin(false);
      }
      setLoading(false);
    };

    checkAdminAccess();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: '#FEF2F2',
        border: '1px solid #FECACA',
        borderRadius: '0.5rem',
        margin: '2rem'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</div>
        <h2 style={{ color: '#DC2626', marginBottom: '1rem' }}>Access Denied</h2>
        <p style={{ color: '#7F1D1D', marginBottom: '1rem' }}>
          Administrator access required to manage doctors and healthcare providers.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link
            to="/dashboard"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3B82F6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '0.25rem'
            }}
          >
            Go to Dashboard
          </Link>
          <button
            onClick={async () => {
              await authService.setDemoRole('admin');
              window.location.reload();
            }}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#8B5CF6',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            Switch to Admin Role
          </button>
        </div>
      </div>
    );
  }

  return children;
};

// Simple navigation component
const SimpleNav = () => (
  <nav style={{
    backgroundColor: '#007bff',
    padding: '1rem',
    marginBottom: '2rem'
  }}>
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <h1 style={{ color: 'white', margin: 0 }}>🏥 Promind Psychiatry</h1>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link
          to="/test"
          style={{
            color: 'white',
            textDecoration: 'none',
            padding: '0.5rem 1rem',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '5px'
          }}
        >
          🧪 API Test
        </Link>
        <Link
          to="/dashboard"
          style={{
            color: 'white',
            textDecoration: 'none',
            padding: '0.5rem 1rem',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '5px'
          }}
        >
          📊 Dashboard
        </Link>
      </div>
    </div>
  </nav>
);

// Simple home page
const HomePage = () => (
  <div style={{ textAlign: 'center', padding: '2rem' }}>
    <h1>🏥 Healthcare App</h1>
    <p>Welcome! Authentication has been temporarily disabled for testing.</p>
    <div style={{ marginTop: '2rem' }}>
      <Link
        to="/dashboard"
        style={{
          display: 'inline-block',
          padding: '1rem 2rem',
          backgroundColor: '#28a745',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px',
          fontSize: '1.2rem'
        }}
      >
        🚀 Go to Dashboard
      </Link>
    </div>
  </div>
);

// API Test page - combining your existing test components
const APITestPage = () => (
  <div style={{ padding: '2rem' }}>
    <h1>🧪 API Testing</h1>
    <div style={{ display: 'grid', gap: '2rem' }}>
      <PatientTestComponent />
      <NoteTestComponent />
      <div style={{ marginTop: '2rem' }}>
        <Link to="/dashboard" style={{ color: '#007bff', textDecoration: 'none' }}>
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <div className="App">
      <SimpleNav />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />

          {/* Use the full HealthcareDashboard instead of simple DashboardPage */}
          <Route path="/dashboard" element={
            <HealthcareDashboard
              user={{ email: 'demo@telenos.com', name: 'Demo User' }}
            />
          } />

          {/* API Testing page */}
          <Route path="/test" element={<APITestPage />} />

          <Route path="/patient" element={<PatientTestComponent />} />
          <Route path="/note" element={<NoteTestComponent />} />
          <Route path="/test-roles" element={<RoleTestComponent />} />

          {/* PROTECTED: Doctor Management Routes - Admin Only */}
          <Route path="/doctors" element={
            <AdminRoute>
              <DoctorList />
            </AdminRoute>
          } />
          <Route path="/doctor-form" element={
            <AdminRoute>
              <DoctorForm />
            </AdminRoute>
          } />

          {/* Patient Management Routes - Available to Providers and Admins */}
          <Route path="/patients" element={<PatientList />} />
          <Route path="/patients/new" element={<PatientForm />} />
          <Route path="/patients/edit/:id" element={<PatientForm />} />

          {/* Note Management Routes - Available to Providers and Admins */}
          <Route path="/notes" element={<NoteList />} />
          <Route path="/notes/new" element={<NoteForm />} />
          <Route path="/notes/edit/:id" element={<NoteForm />} />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;