import { generateClient } from 'aws-amplify/data';

// Generate the client with auto-generated types from your backend
const client = generateClient();

export class ApiService {
    // Patient operations
    async createPatient(patientData) {
        try {
            const result = await client.models.Patient.create({
                ...patientData,
            });
            return result;
        } catch (error) {
            console.error('Error creating patient:', error);
            throw error;
        }
    }

    async getPatients() {
        try {
            const result = await client.models.Patient.list();
            return result;
        } catch (error) {
            console.error('Error fetching patients:', error);
            throw error;
        }
    }

    async getPatient(id) {
        try {
            const result = await client.models.Patient.get({ id });
            return result;
        } catch (error) {
            console.error('Error fetching patient:', error);
            throw error;
        }
    }

    async updatePatient(id, patientData) {
        try {
            const result = await client.models.Patient.update({
                id,
                ...patientData,
            });
            return result;
        } catch (error) {
            console.error('Error updating patient:', error);
            throw error;
        }
    }

    async deletePatient(id) {
        try {
            const result = await client.models.Patient.delete({ id });
            return result;
        } catch (error) {
            console.error('Error deleting patient:', error);
            throw error;
        }
    }

    // Appointment operations
    async createAppointment(appointmentData) {
        try {
            const result = await client.models.Appointment.create({
                ...appointmentData,
                status: appointmentData.status || 'scheduled',
            });
            return result;
        } catch (error) {
            console.error('Error creating appointment:', error);
            throw error;
        }
    }

    async getAppointments() {
        try {
            const result = await client.models.Appointment.list();
            return result;
        } catch (error) {
            console.error('Error fetching appointments:', error);
            throw error;
        }
    }

    async getAppointmentsByPatient(patientId) {
        try {
            const result = await client.models.Appointment.list({
                filter: {
                    patientId: { eq: patientId }
                }
            });
            return result;
        } catch (error) {
            console.error('Error fetching patient appointments:', error);
            throw error;
        }
    }

    // Medical Records operations
    async createMedicalRecord(recordData) {
        try {
            const result = await client.models.MedicalRecord.create({
                ...recordData,
            });
            return result;
        } catch (error) {
            console.error('Error creating medical record:', error);
            throw error;
        }
    }

    async getMedicalRecordsByPatient(patientId) {
        try {
            const result = await client.models.MedicalRecord.list({
                filter: {
                    patientId: { eq: patientId }
                }
            });
            return result;
        } catch (error) {
            console.error('Error fetching medical records:', error);
            throw error;
        }
    }
}

export const apiService = new ApiService();
export default apiService;