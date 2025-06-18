// backend/utils/aws-database.js
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Configure DynamoDB
const dynamodb = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION || 'us-east-1'
});

const TABLES = {
    PATIENTS: process.env.DYNAMODB_PATIENTS_TABLE || 'telenos-patients',
    APPOINTMENTS: process.env.DYNAMODB_APPOINTMENTS_TABLE || 'telenos-appointments',
    USERS: process.env.DYNAMODB_USERS_TABLE || 'telenos-users'
};

// Generic DynamoDB operations
const putItem = async (tableName, item) => {
    const params = {
        TableName: tableName,
        Item: {
            ...item,
            createdAt: item.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    };

    try {
        await dynamodb.put(params).promise();
        return params.Item;
    } catch (error) {
        console.error(`Error putting item in ${tableName}:`, error);
        throw error;
    }
};

const getItem = async (tableName, key) => {
    const params = {
        TableName: tableName,
        Key: key
    };

    try {
        const result = await dynamodb.get(params).promise();
        return result.Item;
    } catch (error) {
        console.error(`Error getting item from ${tableName}:`, error);
        throw error;
    }
};

const updateItem = async (tableName, key, updates) => {
    const updateExpression = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    Object.entries(updates).forEach(([field, value], index) => {
        const attrName = `#attr${index}`;
        const attrValue = `:val${index}`;

        updateExpression.push(`${attrName} = ${attrValue}`);
        expressionAttributeNames[attrName] = field;
        expressionAttributeValues[attrValue] = value;
    });

    // Always update the updatedAt timestamp
    updateExpression.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const params = {
        TableName: tableName,
        Key: key,
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
    };

    try {
        const result = await dynamodb.update(params).promise();
        return result.Attributes;
    } catch (error) {
        console.error(`Error updating item in ${tableName}:`, error);
        throw error;
    }
};

const deleteItem = async (tableName, key) => {
    const params = {
        TableName: tableName,
        Key: key,
        ReturnValues: 'ALL_OLD'
    };

    try {
        const result = await dynamodb.delete(params).promise();
        return result.Attributes;
    } catch (error) {
        console.error(`Error deleting item from ${tableName}:`, error);
        throw error;
    }
};

const scanTable = async (tableName, filterExpression = null, expressionAttributeValues = null) => {
    const params = {
        TableName: tableName
    };

    if (filterExpression) {
        params.FilterExpression = filterExpression;
        params.ExpressionAttributeValues = expressionAttributeValues;
    }

    try {
        const result = await dynamodb.scan(params).promise();
        return result.Items;
    } catch (error) {
        console.error(`Error scanning ${tableName}:`, error);
        throw error;
    }
};

const queryTable = async (tableName, keyConditionExpression, expressionAttributeValues, indexName = null) => {
    const params = {
        TableName: tableName,
        KeyConditionExpression: keyConditionExpression,
        ExpressionAttributeValues: expressionAttributeValues
    };

    if (indexName) {
        params.IndexName = indexName;
    }

    try {
        const result = await dynamodb.query(params).promise();
        return result.Items;
    } catch (error) {
        console.error(`Error querying ${tableName}:`, error);
        throw error;
    }
};

// Patient operations
const createPatient = async (patientData) => {
    const patient = {
        id: uuidv4(),
        ...patientData,
        type: 'PATIENT'
    };

    return await putItem(TABLES.PATIENTS, patient);
};

const getPatient = async (patientId) => {
    return await getItem(TABLES.PATIENTS, { id: patientId });
};

const updatePatient = async (patientId, updates) => {
    return await updateItem(TABLES.PATIENTS, { id: patientId }, updates);
};

const deletePatient = async (patientId) => {
    return await deleteItem(TABLES.PATIENTS, { id: patientId });
};

const getAllPatients = async () => {
    return await scanTable(TABLES.PATIENTS);
};

const searchPatients = async (searchTerm) => {
    // Note: For production, consider using Amazon ElasticSearch or implement GSI for better search
    const patients = await getAllPatients();
    const searchLower = searchTerm.toLowerCase();

    return patients.filter(patient =>
        patient.firstName?.toLowerCase().includes(searchLower) ||
        patient.lastName?.toLowerCase().includes(searchLower) ||
        patient.email?.toLowerCase().includes(searchLower) ||
        patient.phone?.includes(searchTerm)
    );
};

// Appointment operations
const createAppointment = async (appointmentData) => {
    const appointment = {
        id: uuidv4(),
        ...appointmentData,
        type: 'APPOINTMENT'
    };

    return await putItem(TABLES.APPOINTMENTS, appointment);
};

const getAppointment = async (appointmentId) => {
    return await getItem(TABLES.APPOINTMENTS, { id: appointmentId });
};

const updateAppointment = async (appointmentId, updates) => {
    return await updateItem(TABLES.APPOINTMENTS, { id: appointmentId }, updates);
};

const deleteAppointment = async (appointmentId) => {
    return await deleteItem(TABLES.APPOINTMENTS, { id: appointmentId });
};

const getAllAppointments = async () => {
    return await scanTable(TABLES.APPOINTMENTS);
};

const getAppointmentsByDate = async (date) => {
    return await scanTable(
        TABLES.APPOINTMENTS,
        '#date = :date',
        { ':date': date, '#date': 'date' }
    );
};

const getAppointmentsByPatient = async (patientId) => {
    return await scanTable(
        TABLES.APPOINTMENTS,
        'patientId = :patientId',
        { ':patientId': patientId }
    );
};

const getAppointmentsByDoctor = async (doctorId) => {
    return await scanTable(
        TABLES.APPOINTMENTS,
        'doctorId = :doctorId',
        { ':doctorId': doctorId }
    );
};

// User operations (for additional user data beyond Cognito)
const createUserProfile = async (userData) => {
    const userProfile = {
        id: userData.cognitoId || uuidv4(),
        ...userData,
        type: 'USER_PROFILE'
    };

    return await putItem(TABLES.USERS, userProfile);
};

const getUserProfile = async (userId) => {
    return await getItem(TABLES.USERS, { id: userId });
};

const updateUserProfile = async (userId, updates) => {
    return await updateItem(TABLES.USERS, { id: userId }, updates);
};

// Utility functions for pagination
const paginateResults = (items, page = 1, limit = 10) => {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    return {
        data: items.slice(startIndex, endIndex),
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(items.length / limit),
            totalItems: items.length,
            itemsPerPage: parseInt(limit),
            hasNextPage: endIndex < items.length,
            hasPreviousPage: startIndex > 0
        }
    };
};

// Statistics for dashboard
const getStatistics = async () => {
    try {
        const [patients, appointments] = await Promise.all([
            getAllPatients(),
            getAllAppointments()
        ]);

        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const thisMonth = now.toISOString().slice(0, 7);

        return {
            patients: {
                total: patients.length,
                newThisMonth: patients.filter(p =>
                    p.createdAt?.slice(0, 7) === thisMonth
                ).length
            },
            appointments: {
                total: appointments.length,
                today: appointments.filter(a => a.date === today).length,
                thisMonth: appointments.filter(a =>
                    a.date?.slice(0, 7) === thisMonth
                ).length,
                byStatus: appointments.reduce((acc, appointment) => {
                    acc[appointment.status] = (acc[appointment.status] || 0) + 1;
                    return acc;
                }, {}),
                byType: appointments.reduce((acc, appointment) => {
                    acc[appointment.appointmentType] = (acc[appointment.appointmentType] || 0) + 1;
                    return acc;
                }, {})
            }
        };
    } catch (error) {
        console.error('Error getting statistics:', error);
        throw error;
    }
};

module.exports = {
    // Patient operations
    createPatient,
    getPatient,
    updatePatient,
    deletePatient,
    getAllPatients,
    searchPatients,

    // Appointment operations
    createAppointment,
    getAppointment,
    updateAppointment,
    deleteAppointment,
    getAllAppointments,
    getAppointmentsByDate,
    getAppointmentsByPatient,
    getAppointmentsByDoctor,

    // User operations
    createUserProfile,
    getUserProfile,
    updateUserProfile,

    // Utilities
    paginateResults,
    getStatistics,

    // Table names
    TABLES
};