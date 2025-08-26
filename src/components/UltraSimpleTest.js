// src/services/api.js - ABSOLUTELY CLEAN: Zero owner field references anywhere
import { generateClient } from 'aws-amplify/api';

// ===== DOCTOR OPERATIONS (ZERO OWNER REFERENCES) =====
const createDoctorMutation = `
  mutation CreateDoctor($input: CreateDoctorInput!) {
    createDoctor(input: $input) {
      id
      firstName
      lastName
      email
      licenseNumber
      specialty
      experience
      phone
      bio
      qualifications
      consultationFee
      createdAt
      updatedAt
    }
  }
`;

const listDoctorsQuery = `
  query ListDoctors($limit: Int, $nextToken: String) {
    listDoctors(limit: $limit, nextToken: $nextToken) {
      items {
        id
        firstName
        lastName
        email
        licenseNumber
        specialty
        experience
        phone
        bio
        qualifications
        consultationFee
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

const getDoctorQuery = `
  query GetDoctor($id: ID!) {
    getDoctor(id: $id) {
      id
      firstName
      lastName
      email
      licenseNumber
      specialty
      experience
      phone
      bio
      qualifications
      consultationFee
      createdAt
      updatedAt
    }
  }
`;

// ===== PATIENT OPERATIONS (ZERO OWNER REFERENCES) =====
const createPatientMutation = `
  mutation CreatePatient($input: CreatePatientInput!) {
    createPatient(input: $input) {
      id
      firstName
      lastName
      email
      dateOfBirth
      createdAt
      updatedAt
    }
  }
`;

const listPatientsQuery = `
  query ListPatients($limit: Int, $nextToken: String) {
    listPatients(limit: $limit, nextToken: $nextToken) {
      items {
        id
        firstName
        lastName
        email
        dateOfBirth
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

const getPatientQuery = `
  query GetPatient($id: ID!) {
    getPatient(id: $id) {
      id
      firstName
      lastName
      email
      dateOfBirth
      createdAt
      updatedAt
    }
  }
`;

// ===== NOTE OPERATIONS (ZERO OWNER REFERENCES) =====
const createNoteMutation = `
  mutation CreateNote($input: CreateNoteInput!) {
    createNote(input: $input) {
      id
      title
      content
      patientId
      category
      priority
      isPrivate
      tags
      createdAt
      updatedAt
    }
  }
`;

const listNotesQuery = `
  query ListNotes($limit: Int, $nextToken: String) {
    listNotes(limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        content
        patientId
        category
        priority
        isPrivate
        tags
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

const getNoteQuery = `
  query GetNote($id: ID!) {
    getNote(id: $id) {
      id
      title
      content
      patientId
      category
      priority
      isPrivate
      tags
      createdAt
      updatedAt
    }
  }
`;

class ApiService {
    constructor() {
        this.client = null;
        this.initialized = false;
    }

    // ===== INITIALIZATION =====
    async ensureInitialized() {
        if (!this.initialized) {
            try {
                // Use API Key auth exclusively
                this.client = generateClient({
                    authMode: 'apiKey'
                });
                this.initialized = true;
                console.log('✅ API Service initialized with API Key auth (no owner fields)');
            } catch (error) {
                console.error('❌ Failed to initialize API Service:', error);
                throw new Error('Failed to initialize API service');
            }
        }
        return this.client;
    }

    // ===== DOCTOR METHODS =====
    async createDoctor(doctorData) {
        try {
            await this.ensureInitialized();

            console.log('📝 Creating doctor (no owner field):', doctorData);

            // Validate required fields
            if (!doctorData.firstName || !doctorData.lastName || !doctorData.email ||
                !doctorData.licenseNumber || !doctorData.specialty) {
                throw new Error('Missing required fields: firstName, lastName, email, licenseNumber, specialty');
            }

            // CLEAN INPUT - NO OWNER FIELD ANYWHERE
            const input = {
                firstName: doctorData.firstName.trim(),
                lastName: doctorData.lastName.trim(),
                email: doctorData.email.trim().toLowerCase(),
                licenseNumber: doctorData.licenseNumber.trim(),
                specialty: doctorData.specialty.trim()
            };

            // Add optional fields only if they exist
            if (doctorData.phone) input.phone = doctorData.phone.trim();
            if (doctorData.qualifications) input.qualifications = doctorData.qualifications;
            if (doctorData.experience) input.experience = doctorData.experience.trim();
            if (doctorData.bio) input.bio = doctorData.bio.trim();
            if (doctorData.consultationFee !== undefined) input.consultationFee = parseFloat(doctorData.consultationFee);

            console.log('📤 Clean doctor input (no owner):', input);

            const result = await this.client.graphql({
                query: createDoctorMutation,
                variables: { input },
                authMode: 'apiKey'
            });

            console.log('✅ Doctor created successfully:', result.data.createDoctor);

            return {
                success: true,
                data: result.data.createDoctor
            };

        } catch (error) {
            console.error('❌ Failed to create doctor:', error);
            throw this.handleGraphQLError(error);
        }
    }

    async getDoctors(options = {}) {
        try {
            await this.ensureInitialized();

            console.log('📋 Fetching doctors (no owner field)...');

            const variables = {
                limit: options.limit || 100,
                nextToken: options.nextToken || null
            };

            const result = await this.client.graphql({
                query: listDoctorsQuery,
                variables,
                authMode: 'apiKey'
            });

            if (!result.data || !result.data.listDoctors) {
                throw new Error('No doctor data returned');
            }

            const items = result.data.listDoctors.items || [];
            const nextToken = result.data.listDoctors.nextToken || null;

            console.log('✅ Doctors fetched successfully:', items.length, 'doctors');

            return {
                success: true,
                data: items,
                nextToken: nextToken
            };

        } catch (error) {
            console.error('❌ Failed to fetch doctors:', error);
            throw this.handleGraphQLError(error);
        }
    }

    async getDoctor(doctorId) {
        try {
            await this.ensureInitialized();

            const result = await this.client.graphql({
                query: getDoctorQuery,
                variables: { id: doctorId },
                authMode: 'apiKey'
            });

            if (!result.data || !result.data.getDoctor) {
                throw new Error('Doctor not found');
            }

            return {
                success: true,
                data: result.data.getDoctor
            };

        } catch (error) {
            console.error('❌ Failed to fetch doctor:', error);
            throw this.handleGraphQLError(error);
        }
    }

    // ===== PATIENT METHODS =====
    async createPatient(patientData) {
        try {
            await this.ensureInitialized();

            console.log('📝 Creating patient (no owner field):', patientData);

            if (!patientData.firstName || !patientData.lastName || !patientData.email || !patientData.dateOfBirth) {
                throw new Error('Missing required fields: firstName, lastName, email, dateOfBirth');
            }

            // CLEAN INPUT - NO OWNER FIELD ANYWHERE
            const input = {
                firstName: patientData.firstName.trim(),
                lastName: patientData.lastName.trim(),
                email: patientData.email.trim().toLowerCase(),
                dateOfBirth: patientData.dateOfBirth
            };

            console.log('📤 Clean patient input (no owner):', input);

            const result = await this.client.graphql({
                query: createPatientMutation,
                variables: { input },
                authMode: 'apiKey'
            });

            console.log('✅ Patient created successfully:', result.data.createPatient);
            return {
                success: true,
                data: result.data.createPatient
            };

        } catch (error) {
            console.error('❌ Failed to create patient:', error);
            throw this.handleGraphQLError(error);
        }
    }

    async getPatients(options = {}) {
        try {
            await this.ensureInitialized();

            console.log('📋 Fetching patients (no owner field)...');

            const variables = {
                limit: options.limit || 100,
                nextToken: options.nextToken || null
            };

            const result = await this.client.graphql({
                query: listPatientsQuery,
                variables,
                authMode: 'apiKey'
            });

            if (!result.data || !result.data.listPatients) {
                throw new Error('No patient data returned');
            }

            const items = result.data.listPatients.items || [];
            const nextToken = result.data.listPatients.nextToken || null;

            console.log('✅ Patients fetched successfully:', items.length, 'patients');

            return {
                success: true,
                data: items,
                nextToken: nextToken
            };

        } catch (error) {
            console.error('❌ Failed to fetch patients:', error);
            throw this.handleGraphQLError(error);
        }
    }

    async getPatient(patientId) {
        try {
            await this.ensureInitialized();

            const result = await this.client.graphql({
                query: getPatientQuery,
                variables: { id: patientId },
                authMode: 'apiKey'
            });

            if (!result.data || !result.data.getPatient) {
                throw new Error('Patient not found');
            }

            return {
                success: true,
                data: result.data.getPatient
            };

        } catch (error) {
            console.error('❌ Failed to fetch patient:', error);
            throw this.handleGraphQLError(error);
        }
    }

    // ===== NOTE METHODS =====
    async createNote(noteData) {
        try {
            await this.ensureInitialized();

            console.log('📝 Creating note (no owner field):', noteData);

            if (!noteData.title || !noteData.content) {
                throw new Error('Missing required fields: title, content');
            }

            // CLEAN INPUT - NO OWNER FIELD ANYWHERE
            const input = {
                title: noteData.title.trim(),
                content: noteData.content.trim()
            };

            // Add optional fields only if they exist
            if (noteData.patientId) input.patientId = noteData.patientId;
            if (noteData.category) input.category = noteData.category;
            if (noteData.priority) input.priority = noteData.priority;
            if (noteData.isPrivate !== undefined) input.isPrivate = noteData.isPrivate;
            if (noteData.tags) input.tags = noteData.tags;

            console.log('📤 Clean note input (no owner):', input);

            const result = await this.client.graphql({
                query: createNoteMutation,
                variables: { input },
                authMode: 'apiKey'
            });

            console.log('✅ Note created successfully:', result.data.createNote);
            return {
                success: true,
                data: result.data.createNote
            };

        } catch (error) {
            console.error('❌ Failed to create note:', error);
            throw this.handleGraphQLError(error);
        }
    }

    async getNotes(options = {}) {
        try {
            await this.ensureInitialized();

            console.log('📋 Fetching notes (no owner field)...');

            const variables = {
                limit: options.limit || 100,
                nextToken: options.nextToken || null
            };

            const result = await this.client.graphql({
                query: listNotesQuery,
                variables,
                authMode: 'apiKey'
            });

            if (!result.data || !result.data.listNotes) {
                throw new Error('No note data returned');
            }

            const items = result.data.listNotes.items || [];
            const nextToken = result.data.listNotes.nextToken || null;

            console.log('✅ Notes fetched successfully:', items.length, 'notes');

            return {
                success: true,
                data: items,
                nextToken: nextToken
            };

        } catch (error) {
            console.error('❌ Failed to fetch notes:', error);
            throw this.handleGraphQLError(error);
        }
    }

    async getNote(noteId) {
        try {
            await this.ensureInitialized();

            const result = await this.client.graphql({
                query: getNoteQuery,
                variables: { id: noteId },
                authMode: 'apiKey'
            });

            if (!result.data || !result.data.getNote) {
                throw new Error('Note not found');
            }

            return {
                success: true,
                data: result.data.getNote
            };

        } catch (error) {
            console.error('❌ Failed to fetch note:', error);
            throw this.handleGraphQLError(error);
        }
    }

    // ===== UTILITY METHODS =====
    async testConnection() {
        try {
            await this.ensureInitialized();

            console.log('🧪 Testing GraphQL connection with API Key (no owner field)...');

            const result = await this.client.graphql({
                query: `
                    query TestConnection {
                        listDoctors(limit: 1) {
                            items {
                                id
                                firstName
                                lastName
                            }
                            nextToken
                        }
                    }
                `,
                authMode: 'apiKey'
            });

            console.log('✅ Connection test successful:', result);
            return { success: true, data: result };

        } catch (error) {
            console.error('❌ Connection test failed:', error);
            throw error;
        }
    }

    // ===== ERROR HANDLING =====
    handleGraphQLError(error) {
        console.error('🚨 GraphQL Error Details:', error);

        if (error.errors && error.errors.length > 0) {
            const graphqlError = error.errors[0];
            console.error('📋 GraphQL Error Details:', graphqlError);

            if (graphqlError.message.includes('FieldUndefined') && graphqlError.message.includes('owner')) {
                return new Error('Owner field issue detected - using clean schema without owner fields');
            } else if (graphqlError.message.includes('UnauthorizedException')) {
                return new Error('Authorization failed - check API Key configuration');
            } else if (graphqlError.message.includes('ValidationException')) {
                return new Error('Invalid data: ' + graphqlError.message);
            }
            return new Error(graphqlError.message);
        }

        if (error.name === 'NetworkError') {
            return new Error('Network error - please check your connection');
        }

        return new Error('Failed to perform operation: ' + (error.message || 'Unknown error'));
    }
}

// Create and export singleton instance
const apiService = new ApiService();
export { apiService };
export default apiService;