// src/services/api.js - Updated for API Key Authentication
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import outputs from '../amplify_outputs.json';

// Configure Amplify
Amplify.configure(outputs);

// GraphQL Operations - Matching your actual schema
const createPatientMutation = /* GraphQL */ `
  mutation CreatePatient($input: CreatePatientInput!) {
    createPatient(input: $input) {
      id
      firstName
      lastName
      email
      dateOfBirth
      phone
      isActive
      createdAt
      updatedAt
    }
  }
`;

const listPatientsQuery = /* GraphQL */ `
  query ListPatients($limit: Int, $nextToken: String, $filter: ModelPatientFilterInput) {
    listPatients(limit: $limit, nextToken: $nextToken, filter: $filter) {
      items {
        id
        firstName
        lastName
        email
        dateOfBirth
        phone
        isActive
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

const getPatientQuery = /* GraphQL */ `
  query GetPatient($id: ID!) {
    getPatient(id: $id) {
      id
      firstName
      lastName
      email
      dateOfBirth
      phone
      isActive
      createdAt
      updatedAt
    }
  }
`;

const updatePatientMutation = /* GraphQL */ `
  mutation UpdatePatient($input: UpdatePatientInput!) {
    updatePatient(input: $input) {
      id
      firstName
      lastName
      email
      dateOfBirth
      phone
      isActive
      updatedAt
    }
  }
`;

const deletePatientMutation = /* GraphQL */ `
  mutation DeletePatient($input: DeletePatientInput!) {
    deletePatient(input: $input) {
      id
    }
  }
`;

// Doctor Operations - Matching your schema
const createDoctorMutation = /* GraphQL */ `
  mutation CreateDoctor($input: CreateDoctorInput!) {
    createDoctor(input: $input) {
      id
      firstName
      lastName
      email
      specialty
      experience
      phone
      bio
      isActive
      createdAt
      updatedAt
    }
  }
`;

const listDoctorsQuery = /* GraphQL */ `
  query ListDoctors($limit: Int, $nextToken: String, $filter: ModelDoctorFilterInput) {
    listDoctors(limit: $limit, nextToken: $nextToken, filter: $filter) {
      items {
        id
        firstName
        lastName
        email
        specialty
        experience
        phone
        bio
        isActive
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

const getDoctorQuery = /* GraphQL */ `
  query GetDoctor($id: ID!) {
    getDoctor(id: $id) {
      id
      firstName
      lastName
      email
      specialty
      experience
      phone
      bio
      isActive
      createdAt
      updatedAt
    }
  }
`;

// Note Operations - Matching your schema  
const createNoteMutation = /* GraphQL */ `
  mutation CreateNote($input: CreateNoteInput!) {
    createNote(input: $input) {
      id
      title
      content
      category
      priority
      createdAt
      updatedAt
    }
  }
`;

const listNotesQuery = /* GraphQL */ `
  query ListNotes($limit: Int, $nextToken: String, $filter: ModelNoteFilterInput) {
    listNotes(limit: $limit, nextToken: $nextToken, filter: $filter) {
      items {
        id
        title
        content
        category
        priority
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

const getNoteQuery = /* GraphQL */ `
  query GetNote($id: ID!) {
    getNote(id: $id) {
      id
      title
      content
      category
      priority
      createdAt
      updatedAt
    }
  }
`;

// Main API Service Class
class ApiService {
    constructor() {
        this.client = null;
        this.initialized = false;
    }

    async ensureInitialized() {
        if (!this.initialized) {
            // Create client with API Key authentication (matching your backend)
            this.client = generateClient({
                authMode: 'apiKey'
            });
            this.initialized = true;
            console.log('🚀 AWS Amplify API Client initialized with API Key authentication');
            console.log('🔗 GraphQL Endpoint:', outputs.data.url);
            console.log('🔑 Using API Key authentication');
        }
    }

    // ===== PATIENT METHODS =====
    async createPatient(patientData) {
        try {
            await this.ensureInitialized();

            console.log('📝 Creating patient with API Key authentication:', patientData);

            // Validate required fields based on your schema
            const requiredFields = ['firstName', 'lastName', 'email', 'dateOfBirth'];
            const missingFields = requiredFields.filter(field => !patientData[field]);

            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }

            // Prepare input matching your exact schema
            const input = {
                firstName: patientData.firstName.trim(),
                lastName: patientData.lastName.trim(),
                email: patientData.email.trim().toLowerCase(),
                dateOfBirth: patientData.dateOfBirth,

                // Optional fields - only include if provided
                ...(patientData.phone && { phone: patientData.phone.trim() }),
                ...(patientData.isActive !== undefined && { isActive: patientData.isActive })
            };

            const result = await this.client.graphql({
                query: createPatientMutation,
                variables: { input }
            });

            console.log('✅ Patient created successfully:', result.data.createPatient);

            return {
                success: true,
                data: result.data.createPatient
            };

        } catch (error) {
            console.error('❌ Failed to create patient:', error);
            this.handleGraphQLError(error);
        }
    }

    async getPatients(options = {}) {
        try {
            await this.ensureInitialized();

            console.log('📋 Fetching patients with API Key authentication...');

            const variables = {
                limit: options.limit || 50,
                nextToken: options.nextToken || null,
                filter: options.filter || null
            };

            const result = await this.client.graphql({
                query: listPatientsQuery,
                variables
            });

            if (!result.data || !result.data.listPatients) {
                throw new Error('No patient data returned from API');
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
            this.handleGraphQLError(error);
        }
    }

    async getPatient(patientId) {
        try {
            await this.ensureInitialized();

            console.log('👤 Fetching patient:', patientId);

            const result = await this.client.graphql({
                query: getPatientQuery,
                variables: { id: patientId }
            });

            if (!result.data || !result.data.getPatient) {
                throw new Error('Patient not found');
            }

            console.log('✅ Patient fetched successfully');

            return {
                success: true,
                data: result.data.getPatient
            };

        } catch (error) {
            console.error('❌ Failed to fetch patient:', error);
            this.handleGraphQLError(error);
        }
    }

    async updatePatient(patientId, updateData) {
        try {
            await this.ensureInitialized();

            console.log('📝 Updating patient:', patientId, updateData);

            const input = {
                id: patientId,
                ...updateData
            };

            const result = await this.client.graphql({
                query: updatePatientMutation,
                variables: { input }
            });

            console.log('✅ Patient updated successfully');

            return {
                success: true,
                data: result.data.updatePatient
            };

        } catch (error) {
            console.error('❌ Failed to update patient:', error);
            this.handleGraphQLError(error);
        }
    }

    async deletePatient(patientId) {
        try {
            await this.ensureInitialized();

            console.log('🗑️ Deleting patient:', patientId);

            const result = await this.client.graphql({
                query: deletePatientMutation,
                variables: { input: { id: patientId } }
            });

            console.log('✅ Patient deleted successfully');

            return {
                success: true,
                data: result.data.deletePatient
            };

        } catch (error) {
            console.error('❌ Failed to delete patient:', error);
            this.handleGraphQLError(error);
        }
    }

    // ===== DOCTOR METHODS =====
    async createDoctor(doctorData) {
        try {
            await this.ensureInitialized();

            console.log('👨‍⚕️ Creating doctor:', doctorData);

            // Validate required fields based on your schema
            const requiredFields = ['firstName', 'lastName', 'email', 'specialty'];
            const missingFields = requiredFields.filter(field => !doctorData[field]);

            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }

            const input = {
                firstName: doctorData.firstName.trim(),
                lastName: doctorData.lastName.trim(),
                email: doctorData.email.trim().toLowerCase(),
                specialty: doctorData.specialty.trim(),

                // Optional fields - only include if provided
                ...(doctorData.experience && { experience: doctorData.experience.trim() }),
                ...(doctorData.phone && { phone: doctorData.phone.trim() }),
                ...(doctorData.bio && { bio: doctorData.bio.trim() }),
                ...(doctorData.isActive !== undefined && { isActive: doctorData.isActive })
            };

            const result = await this.client.graphql({
                query: createDoctorMutation,
                variables: { input }
            });

            console.log('✅ Doctor created successfully');

            return {
                success: true,
                data: result.data.createDoctor
            };

        } catch (error) {
            console.error('❌ Failed to create doctor:', error);
            this.handleGraphQLError(error);
        }
    }

    async getDoctors(options = {}) {
        try {
            await this.ensureInitialized();

            console.log('👨‍⚕️ Fetching doctors...');

            const variables = {
                limit: options.limit || 50,
                nextToken: options.nextToken || null,
                filter: options.filter || null
            };

            const result = await this.client.graphql({
                query: listDoctorsQuery,
                variables
            });

            if (!result.data || !result.data.listDoctors) {
                throw new Error('No doctor data returned from API');
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
            this.handleGraphQLError(error);
        }
    }

    async getDoctor(doctorId) {
        try {
            await this.ensureInitialized();

            console.log('👤 Fetching doctor:', doctorId);

            const result = await this.client.graphql({
                query: getDoctorQuery,
                variables: { id: doctorId }
            });

            if (!result.data || !result.data.getDoctor) {
                throw new Error('Doctor not found');
            }

            console.log('✅ Doctor fetched successfully');

            return {
                success: true,
                data: result.data.getDoctor
            };

        } catch (error) {
            console.error('❌ Failed to fetch doctor:', error);
            this.handleGraphQLError(error);
        }
    }

    // ===== NOTE METHODS =====
    async createNote(noteData) {
        try {
            await this.ensureInitialized();

            console.log('📝 Creating note:', noteData);

            // Validate required fields
            const requiredFields = ['title', 'content'];
            const missingFields = requiredFields.filter(field => !noteData[field]);

            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }

            const input = {
                title: noteData.title.trim(),
                content: noteData.content.trim(),

                // Optional fields
                ...(noteData.category && { category: noteData.category.trim() }),
                ...(noteData.priority && { priority: noteData.priority.trim() })
            };

            const result = await this.client.graphql({
                query: createNoteMutation,
                variables: { input }
            });

            console.log('✅ Note created successfully');

            return {
                success: true,
                data: result.data.createNote
            };

        } catch (error) {
            console.error('❌ Failed to create note:', error);
            this.handleGraphQLError(error);
        }
    }

    async getNotes(options = {}) {
        try {
            await this.ensureInitialized();

            console.log('📋 Fetching notes...');

            const variables = {
                limit: options.limit || 50,
                nextToken: options.nextToken || null,
                filter: options.filter || null
            };

            const result = await this.client.graphql({
                query: listNotesQuery,
                variables
            });

            if (!result.data || !result.data.listNotes) {
                throw new Error('No note data returned from API');
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
            this.handleGraphQLError(error);
        }
    }

    async getNote(noteId) {
        try {
            await this.ensureInitialized();

            console.log('📄 Fetching note:', noteId);

            const result = await this.client.graphql({
                query: getNoteQuery,
                variables: { id: noteId }
            });

            if (!result.data || !result.data.getNote) {
                throw new Error('Note not found');
            }

            console.log('✅ Note fetched successfully');

            return {
                success: true,
                data: result.data.getNote
            };

        } catch (error) {
            console.error('❌ Failed to fetch note:', error);
            this.handleGraphQLError(error);
        }
    }

    // ===== UTILITY METHODS =====
    async healthCheck() {
        try {
            await this.ensureInitialized();

            // Test connection by fetching one patient
            const testResult = await this.client.graphql({
                query: listPatientsQuery,
                variables: { limit: 1 }
            });

            return {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                apiConnected: true,
                authMode: 'apiKey',
                patientsFound: testResult.data?.listPatients?.items?.length || 0,
                graphqlEndpoint: outputs.data.url
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString(),
                apiConnected: false,
                authMode: 'apiKey'
            };
        }
    }

    // Enhanced error handling
    handleGraphQLError(error) {
        console.log('🔍 Full error object:', JSON.stringify(error, null, 2));

        if (error.errors && error.errors.length > 0) {
            const graphqlError = error.errors[0];
            console.error('📋 GraphQL Error Details:', graphqlError);

            if (graphqlError.message.includes('Unauthorized') ||
                graphqlError.message.includes('UnauthorizedException')) {
                throw new Error('API Key authorization failed');
            } else if (graphqlError.message.includes('ValidationException')) {
                throw new Error('Invalid data: ' + graphqlError.message);
            } else if (graphqlError.message.includes('Cannot query field')) {
                throw new Error('Schema mismatch - field not available: ' + graphqlError.message);
            }
            throw new Error(graphqlError.message);
        }

        // Handle network errors
        if (error.networkError) {
            console.error('🌐 Network Error:', error.networkError);
            throw new Error('Network error - please check connection and try again');
        }

        throw new Error('API operation failed: ' + (error.message || 'Unknown error'));
    }
}

// Create and export singleton instance
const apiService = new ApiService();
export { apiService };
export default apiService;