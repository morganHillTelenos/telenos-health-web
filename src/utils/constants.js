export const ROUTES = {
    LANDING: '/',
    LOGIN: '/login',
    DASHBOARD: '/dashboard',
    PATIENTS: '/patients',
    NEW_PATIENT: '/patients/new',
    PATIENT_DETAIL: '/patients/:id',
    CALENDAR: '/calendar',
    NEW_APPOINTMENT: '/appointments/new',
    APPOINTMENT_DETAIL: '/appointment/:id',
    VIDEO_CALL: '/video-call/:appointmentId',
};

export const COLORS = {
    primary: '#3B82F6',
    primaryDark: '#2563EB',
    secondary: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    gray: {
        50: '#F8FAFC',
        100: '#F1F5F9',
        200: '#E2E8F0',
        300: '#CBD5E1',
        400: '#94A3B8',
        500: '#64748B',
        600: '#475569',
        700: '#334155',
        800: '#1E293B',
        900: '#0F172A',
    },
};

export const APPOINTMENT_STATUSES = {
    SCHEDULED: 'scheduled',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    NO_SHOW: 'no_show',
};

export const PATIENT_FORM_FIELDS = {
    REQUIRED: ['name', 'email', 'phone', 'dob'],
    OPTIONAL: ['address', 'emergencyContact', 'emergencyPhone', 'insurance', 'allergies', 'medications', 'reason'],
};

export const API_ENDPOINTS = {
    AUTH: {
        SIGNIN: '/auth/signin',
        SIGNOUT: '/auth/signout',
        REFRESH: '/auth/refresh',
    },
    PATIENTS: {
        LIST: '/patients',
        CREATE: '/patients',
        GET: '/patients/:id',
        UPDATE: '/patients/:id',
        DELETE: '/patients/:id',
    },
    APPOINTMENTS: {
        LIST: '/appointments',
        CREATE: '/appointments',
        GET: '/appointments/:id',
        UPDATE: '/appointments/:id',
        DELETE: '/appointments/:id',
    },
};

export const ERROR_MESSAGES = {
    NETWORK: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'Please log in to continue.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    SERVER_ERROR: 'Server error. Please try again later.',
    VALIDATION: 'Please check your input and try again.',
    UNKNOWN: 'An unexpected error occurred.',
};

export const SUCCESS_MESSAGES = {
    PATIENT_SAVED: 'Patient information saved successfully!',
    APPOINTMENT_CREATED: 'Appointment scheduled successfully!',
    APPOINTMENT_UPDATED: 'Appointment updated successfully!',
    LOGIN_SUCCESS: 'Welcome back!',
    LOGOUT_SUCCESS: 'You have been logged out.',
  };