class ApiService {
    constructor() {
        this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    }

    async request(endpoint, options = {}) {
        const token = localStorage.getItem('auth_token');

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, config);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Patient methods
    async getPatients() {
        try {
            return await this.request('/patients');
        } catch (error) {
            // Return mock data if API fails
            return this.getMockPatients();
        }
    }

    async getPatient(id) {
        try {
            return await this.request(`/patients/${id}`);
        } catch (error) {
            const patients = this.getMockPatients();
            return patients.find(p => p.id === id);
        }
    }

    async savePatient(patientData) {
        try {
            return await this.request('/patients', {
                method: 'POST',
                body: JSON.stringify(patientData),
            });
        } catch (error) {
            // Mock save for development
            const newPatient = {
                id: Date.now().toString(),
                ...patientData,
                createdAt: new Date().toISOString(),
            };

            const patients = this.getMockPatients();
            patients.push(newPatient);
            localStorage.setItem('patients', JSON.stringify(patients));

            return { success: true, patient: newPatient };
        }
    }

    // Appointment methods
    async getAppointments() {
        try {
            return await this.request('/appointments');
        } catch (error) {
            return this.getMockAppointments();
        }
    }

    async getAppointment(id) {
        try {
            return await this.request(`/appointments/${id}`);
        } catch (error) {
            const appointments = this.getMockAppointments();
            return appointments.find(a => a.id === id);
        }
    }

    async saveAppointment(appointmentData) {
        try {
            return await this.request('/appointments', {
                method: 'POST',
                body: JSON.stringify(appointmentData),
            });
        } catch (error) {
            const newAppointment = {
                id: Date.now().toString(),
                ...appointmentData,
                createdAt: new Date().toISOString(),
                status: 'scheduled',
            };

            const appointments = this.getMockAppointments();
            appointments.push(newAppointment);
            localStorage.setItem('appointments', JSON.stringify(appointments));

            return { success: true, appointment: newAppointment };
        }
    }

    async updateAppointment(id, updates) {
        try {
            return await this.request(`/appointments/${id}`, {
                method: 'PUT',
                body: JSON.stringify(updates),
            });
        } catch (error) {
            const appointments = this.getMockAppointments();
            const index = appointments.findIndex(a => a.id === id);

            if (index !== -1) {
                appointments[index] = { ...appointments[index], ...updates };
                localStorage.setItem('appointments', JSON.stringify(appointments));
                return { success: true, appointment: appointments[index] };
            }

            throw new Error('Appointment not found');
        }
    }

    // Mock data methods
    getMockPatients() {
        const stored = localStorage.getItem('patients');
        if (stored) {
            return JSON.parse(stored);
        }

        const defaultPatients = [
            {
                id: '1',
                name: 'John Smith',
                email: 'john.smith@email.com',
                phone: '(555) 123-4567',
                dob: '1985-06-15',
                address: '123 Main St, Anytown, ST 12345',
                emergencyContact: 'Jane Smith',
                emergencyPhone: '(555) 987-6543',
                insurance: 'Blue Cross Blue Shield',
                allergies: 'None known',
                medications: 'Lisinopril 10mg daily',
                createdAt: '2024-12-01T10:00:00Z',
            },
            {
                id: '2',
                name: 'Sarah Johnson',
                email: 'sarah.johnson@email.com',
                phone: '(555) 234-5678',
                dob: '1990-03-22',
                address: '456 Oak Ave, Somewhere, ST 67890',
                emergencyContact: 'Mike Johnson',
                emergencyPhone: '(555) 876-5432',
                insurance: 'Aetna',
                allergies: 'Penicillin',
                medications: 'Birth control',
                createdAt: '2024-12-02T14:30:00Z',
            },
            {
                id: '3',
                name: 'Michael Brown',
                email: 'michael.brown@email.com',
                phone: '(555) 345-6789',
                dob: '1978-11-08',
                address: '789 Pine Dr, Elsewhere, ST 13579',
                emergencyContact: 'Lisa Brown',
                emergencyPhone: '(555) 765-4321',
                insurance: 'UnitedHealth',
                allergies: 'Shellfish',
                medications: 'Metformin 500mg twice daily',
                createdAt: '2024-12-03T09:15:00Z',
            },
        ];

        localStorage.setItem('patients', JSON.stringify(defaultPatients));
        return defaultPatients;
    }

    getMockAppointments() {
        const stored = localStorage.getItem('appointments');
        if (stored) {
            return JSON.parse(stored);
        }

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const defaultAppointments = [
            {
                id: '1',
                patient: 'John Smith',
                patientId: '1',
                date: today.toISOString().split('T')[0],
                time: '10:00',
                duration: 30,
                reason: 'Annual checkup',
                status: 'scheduled',
                videoCallEnabled: true,
                hipaaCompliant: true,
                createdAt: new Date().toISOString(),
            },
            {
                id: '2',
                patient: 'Sarah Johnson',
                patientId: '2',
                date: today.toISOString().split('T')[0],
                time: '14:30',
                duration: 45,
                reason: 'Follow-up consultation',
                status: 'scheduled',
                videoCallEnabled: true,
                hipaaCompliant: true,
                createdAt: new Date().toISOString(),
            },
            {
                id: '3',
                patient: 'Michael Brown',
                patientId: '3',
                date: tomorrow.toISOString().split('T')[0],
                time: '09:00',
                duration: 30,
                reason: 'Diabetes management',
                status: 'scheduled',
                videoCallEnabled: true,
                hipaaCompliant: true,
                createdAt: new Date().toISOString(),
            },
        ];

        localStorage.setItem('appointments', JSON.stringify(defaultAppointments));
        return defaultAppointments;
    }
}

export const apiService = new ApiService();