
import { useNavigate } from 'react-router-dom';

// Navigation helper functions
export const navigationFlows = {
    afterLogin: (navigate) => {
        navigate('/dashboard');
    },

    afterLogout: (navigate) => {
        navigate('/');
    },

    toPatientFile: (navigate, patientId) => {
        navigate(`/patients/${patientId}`);
    },

    toAppointment: (navigate, appointmentId) => {
        navigate(`/appointment/${appointmentId}`);
    },

    toVideoCall: (navigate, appointmentId) => {
        navigate(`/video-call/${appointmentId}`);
    },
};

// Safe navigation with fallback
export const goBackSafely = (navigate, fallbackRoute = '/dashboard') => {
    if (window.history.length > 1) {
        navigate(-1);
    } else {
        navigate(fallbackRoute);
    }
};

// Route validation
export const validateRoute = (path, user) => {
    const publicRoutes = ['/', '/login'];
    const protectedRoutes = ['/dashboard', '/patients', '/calendar'];

    if (protectedRoutes.some(route => path.startsWith(route))) {
        return !!user;
    }

    return true;
};
