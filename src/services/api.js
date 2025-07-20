// src/services/api.js - Real AWS GraphQL Implementation with API Key Auth
import { generateClient } from 'aws-amplify/api';
import { authService } from './auth';

// GraphQL queries and mutations
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
  query ListPatients($filter: ModelPatientFilterInput, $limit: Int, $nextToken: String) {
    listPatients(filter: $filter, limit: $limit, nextToken: $nextToken) {
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

const updatePatientMutation = `
  mutation UpdatePatient($input: UpdatePatientInput!) {
    updatePatient(input: $input) {
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

const deletePatientMutation = `
  mutation DeletePatient($input: DeletePatientInput!) {
    deletePatient(input: $input) {
      id
    }
  }
`;

// Add this after your existing Patient operations
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
  query ListNotes($filter: ModelNoteFilterInput, $limit: Int, $nextToken: String) {
    listNotes(filter: $filter, limit: $limit, nextToken: $nextToken) {
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

const getNodeQuery = `
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

const updateNoteMutation = `
  mutation UpdateNote($input: UpdateNoteInput!) {
    updateNote(input: $input) {
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

const deleteNoteMutation = `
  mutation DeleteNote($input: DeleteNoteInput!) {
    deleteNote(input: $input) {
      id
    }
  }
`;

class ApiService {
    constructor() {
        this.client = null;
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            console.log('🔧 Initializing AWS GraphQL client...');

            // Create client with explicit API Key authentication
            this.client = generateClient({
                authMode: 'apiKey'
            });

            this.isInitialized = true;
            console.log('✅ AWS GraphQL client initialized with API Key auth');

            // Debug: log the current Amplify configuration
            const { Amplify } = await import('aws-amplify');
            const currentConfig = Amplify.getConfig();
            console.log('🔍 Current Amplify Config:', {
                data: currentConfig.API?.GraphQL,
                auth: currentConfig.Auth
            });

        } catch (error) {
            console.error('❌ Failed to initialize GraphQL client:', error);
            throw error;
        }
    }

    async ensureInitialized() {
        if (!this.isInitialized) {
            await this.initialize();
        }
    }

    async testConnection() {
        try {
            await this.ensureInitialized();

            console.log('🧪 Testing GraphQL connection...');

            // Simple test query
            const result = await this.client.graphql({
                query: listPatientsQuery,
                variables: { limit: 1 },
                authMode: 'apiKey'
            });

            console.log('✅ Connection test successful:', result);
            return { success: true, data: result };

        } catch (error) {
            console.error('❌ Connection test failed:', error);

            // Detailed error logging
            if (error.errors) {
                console.error('GraphQL Errors:', error.errors);
                error.errors.forEach((err, index) => {
                    console.error(`Error ${index + 1}:`, {
                        message: err.message,
                        locations: err.locations,
                        path: err.path,
                        extensions: err.extensions
                    });
                });
            }

            throw error;
        }
    }

    async createPatient(patientData) {
        try {
            await this.ensureInitialized();

            console.log('📝 Creating patient with AWS GraphQL:', patientData);

            // Validate required fields
            if (!patientData.firstName || !patientData.lastName || !patientData.email || !patientData.dateOfBirth) {
                throw new Error('Missing required fields: firstName, lastName, email, dateOfBirth');
            }

            const input = {
                firstName: patientData.firstName.trim(),
                lastName: patientData.lastName.trim(),
                email: patientData.email.trim().toLowerCase(),
                dateOfBirth: patientData.dateOfBirth
            };

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

            // Handle GraphQL errors
            if (error.errors && error.errors.length > 0) {
                const graphqlError = error.errors[0];
                if (graphqlError.message.includes('already exists')) {
                    throw new Error('A patient with this email already exists');
                } else if (graphqlError.message.includes('ValidationException')) {
                    throw new Error('Invalid patient data provided');
                } else if (graphqlError.message.includes('UnauthorizedException') || graphqlError.message.includes('Not Authorized')) {
                    throw new Error('Authorization failed - check API Key configuration');
                }
                throw new Error(graphqlError.message);
            }

            throw new Error('Failed to create patient: ' + error.message);
        }
    }

    async getPatients(options = {}) {
        try {
            await this.ensureInitialized();

            console.log('📋 Fetching patients from AWS GraphQL...');

            const variables = {
                limit: options.limit || 100,
                nextToken: options.nextToken || null,
                filter: options.filter || null
            };

            const result = await this.client.graphql({
                query: listPatientsQuery,
                variables,
                authMode: 'apiKey'
            });

            console.log('✅ Patients fetched successfully:', result.data.listPatients.items.length, 'patients');

            return {
                success: true,
                data: result.data.listPatients.items,
                nextToken: result.data.listPatients.nextToken
            };

        } catch (error) {
            console.error('❌ Failed to fetch patients:', error);

            if (error.errors && error.errors.length > 0) {
                const graphqlError = error.errors[0];
                if (graphqlError.message.includes('UnauthorizedException') || graphqlError.message.includes('Not Authorized')) {
                    throw new Error('Authorization failed - API Key not configured properly');
                }
                throw new Error(graphqlError.message);
            }

            throw new Error('Failed to fetch patients: ' + error.message);
        }
    }

    async getPatient(patientId) {
        try {
            await this.ensureInitialized();

            console.log('👤 Fetching patient from AWS GraphQL:', patientId);

            const result = await this.client.graphql({
                query: getPatientQuery,
                variables: { id: patientId },
                authMode: 'apiKey'
            });

            if (!result.data.getPatient) {
                throw new Error('Patient not found');
            }

            console.log('✅ Patient fetched successfully:', result.data.getPatient.id);

            return {
                success: true,
                data: result.data.getPatient
            };

        } catch (error) {
            console.error('❌ Failed to fetch patient:', error);

            if (error.errors && error.errors.length > 0) {
                throw new Error(error.errors[0].message);
            }

            throw new Error('Failed to fetch patient: ' + error.message);
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
                variables: { input },
                authMode: 'apiKey'
            });

            console.log('✅ Patient updated successfully:', result.data.updatePatient);

            return {
                success: true,
                data: result.data.updatePatient
            };

        } catch (error) {
            console.error('❌ Failed to update patient:', error);

            if (error.errors && error.errors.length > 0) {
                throw new Error(error.errors[0].message);
            }

            throw new Error('Failed to update patient: ' + error.message);
        }
    }

    async deletePatient(patientId) {
        try {
            await this.ensureInitialized();

            console.log('🗑️ Deleting patient:', patientId);

            const result = await this.client.graphql({
                query: deletePatientMutation,
                variables: { input: { id: patientId } },
                authMode: 'apiKey'
            });

            console.log('✅ Patient deleted successfully:', result.data.deletePatient);

            return {
                success: true,
                data: result.data.deletePatient
            };

        } catch (error) {
            console.error('❌ Failed to delete patient:', error);

            if (error.errors && error.errors.length > 0) {
                throw new Error(error.errors[0].message);
            }

            throw new Error('Failed to delete patient: ' + error.message);
        }
    }

    // Add these methods inside your existing ApiService class, after your Patient methods
    async createNote(noteData) {
        try {
            await this.ensureInitialized();
            console.log('📝 Creating note with AWS GraphQL:', noteData);

            const input = {
                title: noteData.title.trim(),
                content: noteData.content.trim(),
                patientId: noteData.patientId || null
            };

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
            if (error.errors && error.errors.length > 0) {
                throw new Error(error.errors[0].message);
            }
            throw new Error('Failed to create note: ' + error.message);
        }
    }

    async getNotes(options = {}) {
        try {
            await this.ensureInitialized();
            console.log('📋 Fetching notes from AWS GraphQL...');

            const variables = {
                limit: options.limit || 100,
                nextToken: options.nextToken || null,
                filter: options.filter || null
            };

            const result = await this.client.graphql({
                query: listNotesQuery,
                variables,
                authMode: 'apiKey'
            });

            console.log('✅ Notes fetched successfully:', result.data.listNotes.items.length, 'notes');
            return {
                success: true,
                data: result.data.listNotes.items,
                nextToken: result.data.listNotes.nextToken
            };
        } catch (error) {
            console.error('❌ Failed to fetch notes:', error);
            if (error.errors && error.errors.length > 0) {
                throw new Error(error.errors[0].message);
            }
            throw new Error('Failed to fetch notes: ' + error.message);
        }
    }
    }

// Create and export singleton instance
export const apiService = new ApiService();

// Also export the class for testing
export default ApiService;