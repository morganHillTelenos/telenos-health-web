// backend/server.js - Express Server with AWS Chime SDK
const express = require('express');
const cors = require('cors');
const { ChimeSDKMeetingsClient, CreateMeetingCommand, CreateAttendeeCommand, DeleteMeetingCommand } = require('@aws-sdk/client-chime-sdk-meetings');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Initialize AWS Chime SDK Client
const chimeClient = new ChimeSDKMeetingsClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

// In-memory storage for meetings (use database in production)
const activeMeetings = new Map();

// Utility function to create unique meeting ID
const createMeetingId = (appointmentId) => {
    return `telenos-${appointmentId}-${Date.now()}`;
};

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'TelenosHealth Video Service',
        timestamp: new Date().toISOString()
    });
});

// Create a new meeting (Provider/Doctor endpoint)
app.post('/api/meetings/create', async (req, res) => {
    try {
        const { appointmentId, providerName, providerEmail } = req.body;

        console.log('🎥 Creating meeting for appointment:', appointmentId);

        // Validate input
        if (!appointmentId || !providerName) {
            return res.status(400).json({
                success: false,
                error: 'appointmentId and providerName are required'
            });
        }

        // Check if meeting already exists
        if (activeMeetings.has(appointmentId)) {
            const existingMeeting = activeMeetings.get(appointmentId);
            return res.json({
                success: true,
                meeting: existingMeeting.meeting,
                attendee: existingMeeting.providerAttendee,
                joinUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/video-call/${appointmentId}`,
                message: 'Meeting already exists'
            });
        }

        // Create unique meeting ID
        const meetingId = createMeetingId(appointmentId);

        // Create AWS Chime meeting
        const createMeetingCommand = new CreateMeetingCommand({
            ClientRequestToken: uuidv4(),
            MediaRegion: process.env.AWS_REGION || 'us-east-1',
            MeetingFeatures: {
                Audio: {
                    EchoReduction: 'AVAILABLE'
                },
                Video: {
                    MaxResolution: 'HD'
                },
                Content: {
                    MaxResolution: 'FHD'
                },
                Attendee: {
                    MaxCount: 10 // Provider + patient + family members
                }
            },
            ExternalMeetingId: meetingId,
            Tags: [
                { Key: 'Application', Value: 'TelenosHealth' },
                { Key: 'AppointmentId', Value: appointmentId.toString() },
                { Key: 'HIPAA', Value: 'Compliant' },
                { Key: 'Environment', Value: process.env.NODE_ENV || 'development' }
            ]
        });

        const meetingResponse = await chimeClient.send(createMeetingCommand);
        const meeting = meetingResponse.Meeting;

        console.log('✅ AWS Chime meeting created:', meeting.MeetingId);

        // Create provider attendee
        const providerAttendeeCommand = new CreateAttendeeCommand({
            MeetingId: meeting.MeetingId,
            ExternalUserId: `provider-${appointmentId}-${Date.now()}`,
            Capabilities: {
                Audio: 'SendReceive',
                Video: 'SendReceive',
                Content: 'SendReceive'
            },
            Tags: [
                { Key: 'UserType', Value: 'provider' },
                { Key: 'UserName', Value: providerName },
                { Key: 'UserEmail', Value: providerEmail || 'unknown' }
            ]
        });

        const providerAttendeeResponse = await chimeClient.send(providerAttendeeCommand);

        // Store meeting info
        const meetingInfo = {
            appointmentId,
            meeting: meeting,
            meetingId: meeting.MeetingId,
            providerAttendee: providerAttendeeResponse.Attendee,
            createdAt: new Date(),
            createdBy: providerName,
            status: 'waiting_for_patient',
            participants: [{
                type: 'provider',
                name: providerName,
                email: providerEmail,
                attendeeId: providerAttendeeResponse.Attendee.AttendeeId,
                joinedAt: new Date()
            }]
        };

        activeMeetings.set(appointmentId, meetingInfo);

        console.log('✅ Meeting stored and ready for patient');

        res.json({
            success: true,
            meeting: meeting,
            attendee: providerAttendeeResponse.Attendee,
            joinUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/video-call/${appointmentId}`,
            appointmentId,
            meetingId: meeting.MeetingId
        });

    } catch (error) {
        console.error('❌ Error creating meeting:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            code: error.name
        });
    }
});

// Join existing meeting (Patient endpoint)
app.post('/api/meetings/join/:appointmentId', async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { patientName, patientEmail } = req.body;

        console.log(`🤝 Patient ${patientName} joining appointment ${appointmentId}`);

        // Validate input
        if (!patientName) {
            return res.status(400).json({
                success: false,
                error: 'patientName is required'
            });
        }

        // Check if meeting exists
        const meetingInfo = activeMeetings.get(appointmentId);
        if (!meetingInfo) {
            return res.status(404).json({
                success: false,
                error: 'Meeting not found. Please ask your healthcare provider to start the session first.'
            });
        }

        // Create patient attendee
        const patientAttendeeCommand = new CreateAttendeeCommand({
            MeetingId: meetingInfo.meetingId,
            ExternalUserId: `patient-${appointmentId}-${Date.now()}`,
            Capabilities: {
                Audio: 'SendReceive',
                Video: 'SendReceive',
                Content: 'Receive' // Patients typically don't share content
            },
            Tags: [
                { Key: 'UserType', Value: 'patient' },
                { Key: 'UserName', Value: patientName },
                { Key: 'UserEmail', Value: patientEmail || 'unknown' }
            ]
        });

        const patientAttendeeResponse = await chimeClient.send(patientAttendeeCommand);

        // Update meeting info
        meetingInfo.status = 'in_progress';
        meetingInfo.participants.push({
            type: 'patient',
            name: patientName,
            email: patientEmail,
            attendeeId: patientAttendeeResponse.Attendee.AttendeeId,
            joinedAt: new Date()
        });

        activeMeetings.set(appointmentId, meetingInfo);

        console.log('✅ Patient joined successfully');

        res.json({
            success: true,
            meeting: meetingInfo.meeting,
            attendee: patientAttendeeResponse.Attendee,
            appointmentId,
            hostName: meetingInfo.createdBy,
            participantCount: meetingInfo.participants.length
        });

    } catch (error) {
        console.error('❌ Error joining meeting:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            code: error.name
        });
    }
});

// End meeting (Provider endpoint)
app.delete('/api/meetings/:appointmentId', async (req, res) => {
    try {
        const { appointmentId } = req.params;

        console.log(`☎️ Ending meeting for appointment ${appointmentId}`);

        const meetingInfo = activeMeetings.get(appointmentId);
        if (!meetingInfo) {
            return res.status(404).json({
                success: false,
                error: 'Meeting not found'
            });
        }

        // Delete AWS Chime meeting
        const deleteMeetingCommand = new DeleteMeetingCommand({
            MeetingId: meetingInfo.meetingId
        });

        await chimeClient.send(deleteMeetingCommand);

        // Update meeting status
        meetingInfo.status = 'ended';
        meetingInfo.endedAt = new Date();

        // Remove from active meetings
        activeMeetings.delete(appointmentId);

        console.log('✅ Meeting ended successfully');

        res.json({
            success: true,
            message: 'Meeting ended successfully',
            meetingDuration: meetingInfo.endedAt - meetingInfo.createdAt
        });

    } catch (error) {
        console.error('❌ Error ending meeting:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            code: error.name
        });
    }
});

// Get meeting info
app.get('/api/meetings/:appointmentId', (req, res) => {
    try {
        const { appointmentId } = req.params;
        const meetingInfo = activeMeetings.get(appointmentId);

        if (!meetingInfo) {
            return res.status(404).json({
                success: false,
                error: 'Meeting not found'
            });
        }

        // Return safe meeting info (without sensitive AWS data)
        res.json({
            success: true,
            appointmentId,
            status: meetingInfo.status,
            createdAt: meetingInfo.createdAt,
            createdBy: meetingInfo.createdBy,
            participantCount: meetingInfo.participants.length,
            participants: meetingInfo.participants.map(p => ({
                type: p.type,
                name: p.name,
                joinedAt: p.joinedAt
            }))
        });

    } catch (error) {
        console.error('❌ Error getting meeting info:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// List active meetings (Admin endpoint)
app.get('/api/meetings', (req, res) => {
    try {
        const meetings = Array.from(activeMeetings.entries()).map(([appointmentId, info]) => ({
            appointmentId,
            status: info.status,
            createdAt: info.createdAt,
            createdBy: info.createdBy,
            participantCount: info.participants.length
        }));

        res.json({
            success: true,
            meetings,
            totalActiveMeetings: meetings.length
        });

    } catch (error) {
        console.error('❌ Error listing meetings:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Test AWS Chime connection
app.get('/api/test-chime', async (req, res) => {
    try {
        // Create a test meeting to verify AWS credentials
        const testMeetingCommand = new CreateMeetingCommand({
            ClientRequestToken: `test-${Date.now()}`,
            MediaRegion: process.env.AWS_REGION || 'us-east-1',
            ExternalMeetingId: `test-meeting-${Date.now()}`
        });

        const testMeeting = await chimeClient.send(testMeetingCommand);

        // Immediately delete the test meeting
        const deleteMeetingCommand = new DeleteMeetingCommand({
            MeetingId: testMeeting.Meeting.MeetingId
        });
        await chimeClient.send(deleteMeetingCommand);

        res.json({
            success: true,
            message: 'AWS Chime SDK connection successful',
            region: process.env.AWS_REGION || 'us-east-1',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ AWS Chime test failed:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'AWS Chime SDK connection failed - check your credentials'
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('❌ Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        availableEndpoints: [
            'POST /api/meetings/create',
            'POST /api/meetings/join/:appointmentId',
            'DELETE /api/meetings/:appointmentId',
            'GET /api/meetings/:appointmentId',
            'GET /api/meetings',
            'GET /api/test-chime',
            'GET /health'
        ]
    });
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 TelenosHealth Video Service started');
    console.log(`📍 Server running on port ${PORT}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    console.log(`☁️ AWS Region: ${process.env.AWS_REGION || 'us-east-1'}`);
    console.log(`🔑 AWS Access Key: ${process.env.AWS_ACCESS_KEY_ID ? 'SET' : 'NOT SET'}`);
    console.log(`🔐 AWS Secret Key: ${process.env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET'}`);
    console.log('');
    console.log('📋 Available endpoints:');
    console.log('  POST /api/meetings/create - Create new meeting');
    console.log('  POST /api/meetings/join/:id - Join existing meeting');
    console.log('  DELETE /api/meetings/:id - End meeting');
    console.log('  GET /api/meetings - List active meetings');
    console.log('  GET /api/test-chime - Test AWS connection');
    console.log('  GET /health - Health check');
});

module.exports = app;