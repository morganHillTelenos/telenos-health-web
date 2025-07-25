// src/services/api.js - CORRECTED to match your ACTUAL deployed schema
import { generateClient } from 'aws-amplify/api';

// ===== DOCTOR OPERATIONS (MATCHING YOUR ACTUAL DEPLOYED SCHEMA) =====
const createDoctorMutation = `
  mutation CreateDoctor($input: CreateDoctorInput!) {
    createDoctor(input: $input) {
      id
      firstName
      lastName
      email
      licenseNumber
      specialty
      phone
      credentials
      yearsOfExperience
      bio
      isActive
      owner
      createdAt
      updatedAt
    }
  }
`;

const listDoctorsQuery = `
  query ListDoctors($filter: ModelDoctorFilterInput, $limit: Int, $nextToken: String) {
    listDoctors(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        firstName
        lastName
        email
        licenseNumber
        specialty
        phone
        credentials
        yearsOfExperience
        bio
        isActive
        owner
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
      phone
      credentials
      yearsOfExperience
      bio
      isActive
      owner
      createdAt
      updatedAt
    }
  }
`;

const updateDoctorMutation = `
  mutation UpdateDoctor($input: UpdateDoctorInput!) {
    updateDoctor(input: $input) {
      id
      firstName
      lastName
      email
      licenseNumber
      specialty
      phone
      credentials
      yearsOfExperience
      bio
      isActive
      owner
      createdAt
      updatedAt
    }
  }
`;

const deleteDoctorMutation = `
  mutation DeleteDoctor($input: DeleteDoctorInput!) {
    deleteDoctor(input: $input) {
      id
    }
  }
`;

// ===== PATIENT OPERATIONS =====
const createPatientMutation = `
  mutation CreatePatient($input: CreatePatientInput!) {
    createPatient(input: $input) {
      id
      firstName
      lastName
      email
      dateOfBirth
      doctorId
      owner
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
        doctorId
        owner
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
      doctorId
      owner
      createdAt
      updatedAt
    }
  }
`;

class ApiService {
    constructor() {
        this.client = null;
        this.isInitialized = false;
        // CRITICAL: Your amplify_outputs.json shows COGNITO_USER_POOLS as default
        this.authMode = 'userPool'; // Start with Cognito as default
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            console.log('🔧 Initializing AWS GraphQL client...');

            // Create client with Cognito User Pools as default (matches your config)
            this.client = generateClient({
                authMode: this.authMode
            });

            this.isInitialized = true;
            console.log(`✅ AWS GraphQL client initialized with ${this.authMode} auth`);

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

    async ensureAuthenticated() {
        try {
            const { getCurrentUser } = await import('aws-amplify/auth');
            const user = await getCurrentUser();
            console.log('✅ User authenticated:', user.username);
            return user;
        } catch (error) {
            console.error('❌ User not authenticated:', error);
            throw new Error('Please sign in to perform this action');
        }
    }

    async testConnection() {
        try {
            await this.ensureInitialized();
            await this.ensureAuthenticated();

            console.log('🧪 Testing GraphQL connection...');

            const result = await this.client.graphql({
                query: listPatientsQuery,
                variables: { limit: 1 }
            });

            console.log('✅ Connection test successful:', result);
            return { success: true, data: result };

        } catch (error) {
            console.error('❌ Connection test failed:', error);
            throw error;
        }
    }

    // ===== DOCTOR METHODS (CORRECTED FIELD MAPPINGS) =====
    async createDoctor(doctorData) {
        try {
            await this.ensureInitialized();
            const currentUser = await this.ensureAuthenticated();

            console.log('📝 Creating doctor with AWS GraphQL:', doctorData);

            // Validate required fields based on your ACTUAL schema
            if (!doctorData.firstName || !doctorData.lastName || !doctorData.email ||
                !doctorData.licenseNumber || !doctorData.specialty) {
                throw new Error('Missing required fields: firstName, lastName, email, licenseNumber, specialty');
            }

            // CORRECTED: Match your actual schema fields exactly
            const input = {
                firstName: doctorData.firstName.trim(),
                lastName: doctorData.lastName.trim(),
                email: doctorData.email.trim().toLowerCase(),
                licenseNumber: doctorData.licenseNumber.trim(),
                specialty: doctorData.specialty.trim(),
                // CORRECTED: Use exact schema field names
                ...(doctorData.phone && { phone: doctorData.phone.trim() }),
                ...(doctorData.credentials && { credentials: doctorData.credentials }), // Array of strings
                ...(doctorData.yearsOfExperience !== undefined && { yearsOfExperience: parseInt(doctorData.yearsOfExperience) }),
                ...(doctorData.bio && { bio: doctorData.bio.trim() }),
                ...(doctorData.isActive !== undefined && { isActive: doctorData.isActive }),
                // Set owner to current Cognito user
                owner: currentUser.username
            };

            console.log('📤 Sending doctor input:', input);

            const result = await this.client.graphql({
                query: createDoctorMutation,
                variables: { input }
            });

            console.log('✅ Doctor created successfully:', result.data.createDoctor);

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
            await this.ensureAuthenticated();

            console.log('📋 Fetching doctors from AWS GraphQL...');

            const variables = {
                limit: options.limit || 100,
                nextToken: options.nextToken || null,
                filter: options.filter || null
            };

            const result = await this.client.graphql({
                query: listDoctorsQuery,
                variables
            });

            console.log('🔍 Raw GraphQL result:', result);

            if (!result.data || !result.data.listDoctors) {
                throw new Error('No doctor data returned - check authorization or schema deployment');
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
            await this.ensureAuthenticated();

            console.log('👤 Fetching doctor from AWS GraphQL:', doctorId);

            const result = await this.client.graphql({
                query: getDoctorQuery,
                variables: { id: doctorId }
            });

            if (!result.data || !result.data.getDoctor) {
                throw new Error('Doctor not found');
            }

            console.log('✅ Doctor fetched successfully:', result.data.getDoctor.id);

            return {
                success: true,
                data: result.data.getDoctor
            };

        } catch (error) {
            console.error('❌ Failed to fetch doctor:', error);
            this.handleGraphQLError(error);
        }
    }

    async updateDoctor(doctorId, updateData) {
        try {
            await this.ensureInitialized();
            await this.ensureAuthenticated();

            console.log('📝 Updating doctor:', doctorId, updateData);

            const input = {
                id: doctorId,
                ...updateData
            };

            const result = await this.client.graphql({
                query: updateDoctorMutation,
                variables: { input }
            });

            console.log('✅ Doctor updated successfully:', result.data.updateDoctor);

            return {
                success: true,
                data: result.data.updateDoctor
            };

        } catch (error) {
            console.error('❌ Failed to update doctor:', error);
            this.handleGraphQLError(error);
        }
    }

    async deleteDoctor(doctorId) {
        try {
            await this.ensureInitialized();
            await this.ensureAuthenticated();

            console.log('🗑️ Deleting doctor:', doctorId);

            const result = await this.client.graphql({
                query: deleteDoctorMutation,
                variables: { input: { id: doctorId } }
            });

            console.log('✅ Doctor deleted successfully:', result.data.deleteDoctor);

            return {
                success: true,
                data: result.data.deleteDoctor
            };

        } catch (error) {
            console.error('❌ Failed to delete doctor:', error);
            this.handleGraphQLError(error);
        }
    }

    // ===== PATIENT METHODS (CORRECTED) =====
    async createPatient(patientData) {
        try {
            await this.ensureInitialized();
            const currentUser = await this.ensureAuthenticated();

            console.log('📝 Creating patient with AWS GraphQL:', patientData);

            if (!patientData.firstName || !patientData.lastName || !patientData.email || !patientData.dateOfBirth) {
                throw new Error('Missing required fields: firstName, lastName, email, dateOfBirth');
            }

            const input = {
                firstName: patientData.firstName.trim(),
                lastName: patientData.lastName.trim(),
                email: patientData.email.trim().toLowerCase(),
                dateOfBirth: patientData.dateOfBirth,
                ...(patientData.doctorId && { doctorId: patientData.doctorId }),
                owner: currentUser.username
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
            await this.ensureAuthenticated();

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
            this.handleGraphQLError(error);
        }
    }

    // ===== ERROR HANDLING =====
    handleGraphQLError(error) {
        if (error.errors && error.errors.length > 0) {
            const graphqlError = error.errors[0];
            console.error('📋 GraphQL Error Details:', graphqlError);

            if (graphqlError.message.includes('UnauthorizedException') ||
                graphqlError.message.includes('Not Authorized') ||
                graphqlError.message.includes('Unauthorized')) {
                throw new Error('Authorization failed - please sign in again');
            } else if (graphqlError.message.includes('ValidationException')) {
                throw new Error('Invalid data: ' + graphqlError.message);
            } else if (graphqlError.message.includes('already exists')) {
                throw new Error('A record with this information already exists');
            } else if (graphqlError.message.includes('Cannot query field')) {
                throw new Error('Schema not deployed properly. Run: npx amplify push --force');
            }
            throw new Error(graphqlError.message);
        }

        throw new Error('Failed to perform operation: ' + error.message);
    }
}

// Create and export singleton instance
const apiService = new ApiService();
export { apiService };
export default apiService;