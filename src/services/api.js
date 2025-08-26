// src/services/api.js - Simplified with API key only
import { generateClient } from 'aws-amplify/api';

// GraphQL queries
const LIST_DOCTORS = `
  query ListDoctors($filter: ModelDoctorFilterInput, $limit: Int, $nextToken: String) {
    listDoctors(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        firstName
        lastName
        email
        specialty
        isActive
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

const CREATE_DOCTOR = `
  mutation CreateDoctor($input: CreateDoctorInput!) {
    createDoctor(input: $input) {
      id
      firstName
      lastName
      email
      specialty
      isActive
      createdAt
      updatedAt
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
            // Use API key for all operations (no authentication required)
            this.client = generateClient({
                authMode: 'apiKey'
            });

            this.isInitialized = true;
            console.log('✅ API client initialized with API key');
        } catch (error) {
            console.error('❌ Failed to initialize client:', error);
            throw error;
        }
    }

    async ensureInitialized() {
        if (!this.isInitialized) {
            await this.initialize();
        }
    }

    // Test connection
    async testConnection() {
        try {
            await this.ensureInitialized();

            console.log('🔧 Testing API connection...');

            const result = await this.client.graphql({
                query: LIST_DOCTORS,
                variables: { limit: 1 }
            });

            console.log('✅ Connection test successful');
            return {
                success: true,
                message: 'API connection working',
                doctorCount: result.data.listDoctors.items.length
            };
        } catch (error) {
            console.error('❌ Connection test failed:', error);
            throw error;
        }
    }

    // Get doctors (public access)
    async getDoctors() {
        try {
            await this.ensureInitialized();

            console.log('🔍 Fetching doctors...');

            const result = await this.client.graphql({
                query: LIST_DOCTORS
            });

            console.log('✅ Doctors fetched:', result.data.listDoctors.items.length);
            return {
                success: true,
                data: result.data.listDoctors.items,
                count: result.data.listDoctors.items.length
            };
        } catch (error) {
            console.error('❌ Failed to fetch doctors:', error);
            throw error;
        }
    }

    // Create doctor (try with API key)
    async createDoctor(doctorData) {
        try {
            await this.ensureInitialized();

            console.log('🔍 Creating doctor:', doctorData);

            const result = await this.client.graphql({
                query: CREATE_DOCTOR,
                variables: { input: doctorData }
            });

            console.log('✅ Doctor created:', result.data.createDoctor);
            return {
                success: true,
                data: result.data.createDoctor
            };
        } catch (error) {
            console.error('❌ Failed to create doctor:', error);
            throw error;
        }
    }
}

// Create and export singleton
const apiService = new ApiService();
export { apiService };
export default apiService;