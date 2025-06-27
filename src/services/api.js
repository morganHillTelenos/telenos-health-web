// src/services/api.js - Real AWS GraphQL Implementation
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

class ApiService {
    constructor() {
        this.client = null;
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            console.log('🔧 Initializing AWS GraphQL client...');
            this.client = generateClient();
            this.isInitialized = true;
            console.log('✅ AWS GraphQL client initialized');
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
                variables: { input }
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
                variables
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
                throw new Error(error.errors[0].message);
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
                variables: { id: patientId }
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

            console.log('📝 Updating patient with AWS GraphQL:', patientId, updateData);

            const input = {
                id: patientId,
                ...updateData
            };

            const result = await this.client.graphql({
                query: updatePatientMutation,
                variables: { input }
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

            console.log('🗑️ Deleting patient from AWS GraphQL:', patientId);

            const input = { id: patientId };

            const result = await this.client.graphql({
                query: deletePatientMutation,
                variables: { input }
            });

            console.log('✅ Patient deleted successfully:', patientId);

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

    // Search patients by name or email
    async searchPatients(searchTerm) {
        try {
            const filter = {
                or: [
                    { firstName: { contains: searchTerm } },
                    { lastName: { contains: searchTerm } },
                    { email: { contains: searchTerm } }
                ]
            };

            return await this.getPatients({ filter });

        } catch (error) {
            console.error('❌ Failed to search patients:', error);
            throw new Error('Failed to search patients: ' + error.message);
        }
    }

    // Get recent patients (last 30 days)
    async getRecentPatients() {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const filter = {
                createdAt: {
                    gt: thirtyDaysAgo.toISOString()
                }
            };

            return await this.getPatients({ filter, limit: 10 });

        } catch (error) {
            console.error('❌ Failed to get recent patients:', error);
            throw new Error('Failed to get recent patients: ' + error.message);
        }
    }

    // Health check
    async healthCheck() {
        try {
            await this.ensureInitialized();

            // Try a simple query to check if the service is working
            const result = await this.getPatients({ limit: 1 });

            return {
                status: 'healthy',
                message: 'AWS GraphQL API is working',
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            return {
                status: 'unhealthy',
                message: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

// Create and export singleton instance
export const apiService = new ApiService();

export default apiService;