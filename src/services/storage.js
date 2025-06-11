class StorageService {
    // Generic storage methods
    setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    }

    removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }

    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }

    // Specific methods for app data
    getPatients() {
        return this.getItem('patients', []);
    }

    savePatients(patients) {
        return this.setItem('patients', patients);
    }

    getAppointments() {
        return this.getItem('appointments', []);
    }

    saveAppointments(appointments) {
        return this.setItem('appointments', appointments);
    }

    getUserPreferences() {
        return this.getItem('userPreferences', {
            theme: 'light',
            notifications: true,
            autoSave: true,
        });
    }

    saveUserPreferences(preferences) {
        return this.setItem('userPreferences', preferences);
    }
}

export const storageService = new StorageService();