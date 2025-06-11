// Date formatting utilities
export const formatDate = (dateString, options = {}) => {
    const date = new Date(dateString);

    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options
    };

    return date.toLocaleDateString('en-US', defaultOptions);
};

export const formatTime = (timeString) => {
    if (!timeString) return '';

    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${minutes} ${ampm}`;
};

export const formatDateTime = (dateString, timeString) => {
    const date = formatDate(dateString);
    const time = formatTime(timeString);
    return `${date} at ${time}`;
};

// Validation utilities
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePhone = (phone) => {
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return phoneRegex.test(phone);
};

export const validateRequired = (value) => {
    return value && value.toString().trim().length > 0;
};

// Form validation
export const validatePatientForm = (formData) => {
    const errors = {};

    if (!validateRequired(formData.name)) {
        errors.name = 'Name is required';
    }

    if (!validateRequired(formData.email)) {
        errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
        errors.email = 'Please enter a valid email address';
    }

    if (!validateRequired(formData.phone)) {
        errors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
        errors.phone = 'Please enter a valid phone number';
    }

    if (!validateRequired(formData.dob)) {
        errors.dob = 'Date of birth is required';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

export const validateAppointmentForm = (formData) => {
    const errors = {};

    if (!validateRequired(formData.patient)) {
        errors.patient = 'Patient name is required';
    }

    if (!validateRequired(formData.date)) {
        errors.date = 'Date is required';
    }

    if (!validateRequired(formData.time)) {
        errors.time = 'Time is required';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// Data transformation utilities
export const transformPatientData = (rawData) => {
    return {
        id: rawData.id || Date.now().toString(),
        name: rawData.name?.trim() || '',
        email: rawData.email?.trim().toLowerCase() || '',
        phone: rawData.phone?.trim() || '',
        dob: rawData.dob || '',
        address: rawData.address?.trim() || '',
        emergencyContact: rawData.emergencyContact?.trim() || '',
        emergencyPhone: rawData.emergencyPhone?.trim() || '',
        insurance: rawData.insurance?.trim() || '',
        allergies: rawData.allergies?.trim() || '',
        medications: rawData.medications?.trim() || '',
        reason: rawData.reason?.trim() || '',
        createdAt: rawData.createdAt || new Date().toISOString(),
    };
};

export const transformAppointmentData = (rawData) => {
    return {
        id: rawData.id || Date.now().toString(),
        patient: rawData.patient?.trim() || '',
        patientId: rawData.patientId || '',
        date: rawData.date || '',
        time: rawData.time || '',
        duration: parseInt(rawData.duration) || 30,
        reason: rawData.reason?.trim() || '',
        status: rawData.status || 'scheduled',
        videoCallEnabled: rawData.videoCallEnabled ?? true,
        hipaaCompliant: rawData.hipaaCompliant ?? true,
        createdAt: rawData.createdAt || new Date().toISOString(),
    };
};

// Statistics utilities
export const calculateStats = (patients, appointments) => {
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(apt => apt.date === today);
    const upcomingAppointments = appointments.filter(apt => new Date(apt.date) > new Date());
    const completedToday = todayAppointments.filter(apt => apt.status === 'completed');

    return {
        totalPatients: patients.length,
        todayAppointments: todayAppointments.length,
        upcomingAppointments: upcomingAppointments.length,
        completedToday: completedToday.length,
        recentPatients: patients.slice(-5).reverse(),
        recentAppointments: appointments.slice(-5).reverse(),
    };
};

// Error handling utilities
export const handleApiError = (error) => {
    console.error('API Error:', error);

    if (error.name === 'NetworkError' || !navigator.onLine) {
        return 'Network error. Please check your connection and try again.';
    }

    if (error.status === 401) {
        return 'Your session has expired. Please log in again.';
    }

    if (error.status === 403) {
        return 'You do not have permission to perform this action.';
    }

    if (error.status === 404) {
        return 'The requested resource was not found.';
    }

    if (error.status >= 500) {
        return 'Server error. Please try again later.';
    }

    return error.message || 'An unexpected error occurred.';
};

// Local storage utilities with error handling
export const safeLocalStorage = {
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error reading ${key} from localStorage:`, error);
            return defaultValue;
        }
    },

    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error saving ${key} to localStorage:`, error);
            return false;
        }
    },

    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing ${key} from localStorage:`, error);
            return false;
        }
    }
};

// Debounce utility for search/input
export const debounce = (func, wait) => {
    let timeout;

    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Generate unique IDs
export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Deep clone utility
export const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
};

// Format file size
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};