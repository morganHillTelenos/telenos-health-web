
// server.js - TelenosHealth Backend API
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Pre-hashed password for demo123
const users = [
    {
        id: '1',
        email: 'demo@telenos.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // demo123
        name: 'Dr. Demo User',
        role: 'doctor',
        isActive: true
    }
];

// Login route
app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt:', email);

        const user = users.find(u => u.email === email && u.isActive);
        if (!user) {
            console.log('User not found');
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Temporary plain text password check
        const isValidPassword = password === 'demo123' || await bcrypt.compare(password, user.password);
        console.log('Password valid:', isValidPassword);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name
            },
            process.env.JWT_SECRET || 'default-secret',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        users: users.length,
        name: 'TelenosHealth Backend'
    });
});

// API info
app.get('/api/info', (req, res) => {
    res.json({
        name: 'TelenosHealth Backend API',
        version: '1.0.0',
        authMode: 'jwt'
    });
});

// Debug users
app.get('/debug/users', (req, res) => {
    res.json({
        users: users.map(u => ({
            id: u.id,
            email: u.email,
            name: u.name,
            role: u.role
        }))
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 TelenosHealth Backend running on port ${PORT}`);
    console.log(`📋 Health: http://localhost:${PORT}/health`);
    console.log(`🔐 Login: demo@telenos.com / demo123`);
});

// JWT middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Access token required'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'default-secret', (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                error: 'Invalid token'
            });
        }
        req.user = user;
        next();
    });
};

// Sample data
let patients = [
    {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '+1-555-123-4567',
        dateOfBirth: '1990-01-15',
        address: '123 Main St, Anytown, ST 12345',
        emergencyContact: 'Jane Doe - (555) 987-6543',
        medicalHistory: 'No known allergies',
        createdAt: new Date().toISOString()
    },
    {
        id: '2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1-555-234-5678',
        dateOfBirth: '1985-06-22',
        address: '456 Oak Ave, Springfield, ST 67890',
        emergencyContact: 'Mike Johnson - (555) 876-5432',
        medicalHistory: 'Diabetes Type 2',
        createdAt: new Date().toISOString()
    }
];

let appointments = [
    {
        id: '1',
        patientId: '1',
        doctorId: '1',
        date: '2025-06-20',
        time: '10:00',
        type: 'consultation',
        status: 'scheduled',
        notes: 'Follow-up consultation',
        createdAt: new Date().toISOString()
    }
];

// Patients routes
app.get('/patients', authenticateToken, (req, res) => {
    res.json({
        success: true,
        patients: patients
    });
});

app.post('/patients', authenticateToken, (req, res) => {
    const newPatient = {
        id: (patients.length + 1).toString(),
        ...req.body,
        createdAt: new Date().toISOString()
    };
    patients.push(newPatient);

    res.status(201).json({
        success: true,
        message: 'Patient created successfully',
        patient: newPatient
    });
});

// Appointments routes
app.get('/appointments', authenticateToken, (req, res) => {
    const populatedAppointments = appointments.map(apt => {
        const patient = patients.find(p => p.id === apt.patientId);
        return {
            ...apt,
            patient: patient ? {
                id: patient.id,
                firstName: patient.firstName,
                lastName: patient.lastName,
                email: patient.email
            } : null
        };
    });

    res.json({
        success: true,
        appointments: populatedAppointments
    });
});