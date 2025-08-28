// src/services/directDynamoService.js - Direct DynamoDB access
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, PutCommand, GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

class DirectDynamoService {
    constructor() {
        this.client = null;
        this.docClient = null;
        this.initialized = false;

        // Your table names from the AWS Console screenshot
        this.tables = {
            patient: 'Patient-muuv472ebfgynlqjjqth7266m-NONE',
            doctor: 'Doctor-muuv472ebfgynlqjjqth7266m-NONE', // Use one of your doctor tables
            note: 'Note-muuv472ebfgynlqjjqth7266m-NONE'
        };
    }

    async initialize() {
        if (!this.initialized) {
            // Configure AWS region
            this.client = new DynamoDBClient({
                region: 'us-east-1',
                // If you have AWS credentials configured locally, this will use them
            });

            this.docClient = DynamoDBDocumentClient.from(this.client);
            this.initialized = true;
            console.log('Direct DynamoDB client initialized');
        }
    }

    // PATIENT METHODS
    async getPatients(limit = 50) {
        try {
            await this.initialize();

            const command = new ScanCommand({
                TableName: this.tables.patient,
                Limit: limit
            });

            const result = await this.docClient.send(command);

            return {
                success: true,
                data: result.Items || [],
                count: result.Count
            };
        } catch (error) {
            console.error('Failed to get patients:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    async createPatient(patientData) {
        try {
            await this.initialize();

            const item = {
                id: `patient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                firstName: patientData.firstName,
                lastName: patientData.lastName,
                email: patientData.email,
                dateOfBirth: patientData.dateOfBirth,
                phone: patientData.phone || null,
                isActive: patientData.isActive !== false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const command = new PutCommand({
                TableName: this.tables.patient,
                Item: item
            });

            await this.docClient.send(command);

            return {
                success: true,
                data: item
            };
        } catch (error) {
            console.error('Failed to create patient:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getPatient(patientId) {
        try {
            await this.initialize();

            const command = new GetCommand({
                TableName: this.tables.patient,
                Key: { id: patientId }
            });

            const result = await this.docClient.send(command);

            if (result.Item) {
                return {
                    success: true,
                    data: result.Item
                };
            } else {
                return {
                    success: false,
                    error: 'Patient not found'
                };
            }
        } catch (error) {
            console.error('Failed to get patient:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // DOCTOR METHODS
    async getDoctors(limit = 50) {
        try {
            await this.initialize();

            const command = new ScanCommand({
                TableName: this.tables.doctor,
                Limit: limit
            });

            const result = await this.docClient.send(command);

            return {
                success: true,
                data: result.Items || [],
                count: result.Count
            };
        } catch (error) {
            console.error('Failed to get doctors:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    async createDoctor(doctorData) {
        try {
            await this.initialize();

            const item = {
                id: `doctor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                firstName: doctorData.firstName,
                lastName: doctorData.lastName,
                email: doctorData.email,
                specialty: doctorData.specialty,
                experience: doctorData.experience || null,
                phone: doctorData.phone || null,
                bio: doctorData.bio || null,
                isActive: doctorData.isActive !== false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const command = new PutCommand({
                TableName: this.tables.doctor,
                Item: item
            });

            await this.docClient.send(command);

            return {
                success: true,
                data: item
            };
        } catch (error) {
            console.error('Failed to create doctor:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // NOTE METHODS
    async getNotes(limit = 50) {
        try {
            await this.initialize();

            const command = new ScanCommand({
                TableName: this.tables.note,
                Limit: limit
            });

            const result = await this.docClient.send(command);

            return {
                success: true,
                data: result.Items || [],
                count: result.Count
            };
        } catch (error) {
            console.error('Failed to get notes:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    async createNote(noteData) {
        try {
            await this.initialize();

            const item = {
                id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title: noteData.title,
                content: noteData.content,
                category: noteData.category || null,
                priority: noteData.priority || null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const command = new PutCommand({
                TableName: this.tables.note,
                Item: item
            });

            await this.docClient.send(command);

            return {
                success: true,
                data: item
            };
        } catch (error) {
            console.error('Failed to create note:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // UTILITY METHODS
    async healthCheck() {
        try {
            await this.initialize();

            // Test each table
            const tests = [];

            // Test patient table
            try {
                const patientResult = await this.docClient.send(new ScanCommand({
                    TableName: this.tables.patient,
                    Limit: 1
                }));
                tests.push({ table: 'Patient', status: 'healthy', count: patientResult.Count });
            } catch (error) {
                tests.push({ table: 'Patient', status: 'error', error: error.message });
            }

            // Test doctor table
            try {
                const doctorResult = await this.docClient.send(new ScanCommand({
                    TableName: this.tables.doctor,
                    Limit: 1
                }));
                tests.push({ table: 'Doctor', status: 'healthy', count: doctorResult.Count });
            } catch (error) {
                tests.push({ table: 'Doctor', status: 'error', error: error.message });
            }

            // Test note table
            try {
                const noteResult = await this.docClient.send(new ScanCommand({
                    TableName: this.tables.note,
                    Limit: 1
                }));
                tests.push({ table: 'Note', status: 'healthy', count: noteResult.Count });
            } catch (error) {
                tests.push({ table: 'Note', status: 'error', error: error.message });
            }

            const allHealthy = tests.every(test => test.status === 'healthy');

            return {
                status: allHealthy ? 'healthy' : 'partial',
                timestamp: new Date().toISOString(),
                tests: tests,
                region: 'us-east-1',
                connectionType: 'Direct DynamoDB'
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString(),
                connectionType: 'Direct DynamoDB'
            };
        }
    }
}

// Create and export singleton instance
const directDynamoService = new DirectDynamoService();
export { directDynamoService };
export default directDynamoService;