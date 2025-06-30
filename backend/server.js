const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const twilio = require('twilio');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());

// Twilio configuration
const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

// Validate Twilio configuration on startup
const validateTwilioConfig = () => {
    const requiredVars = ['TWILIO_ACCOUNT_SID', 'TWILIO_API_KEY', 'TWILIO_API_SECRET'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        console.error('❌ Missing required Twilio environment variables:', missingVars);
        process.exit(1);
    }

    console.log('✅ Twilio configuration validated');
};

// Routes

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'TelenosHealth Video Backend'
    });
});

// Generate Twilio access token
app.post('/api/video/token', async (req, res) => {
    try {
        const { identity, roomName, role } = req.body;

        // Validate input
        if (!identity || !roomName) {
            return res.status(400).json({
                error: 'Missing required fields: identity and roomName'
            });
        }

        // Validate identity format (basic security)
        if (!/^[a-zA-Z0-9_-]+$/.test(identity)) {
            return res.status(400).json({
                error: 'Invalid identity format. Use only alphanumeric characters, underscores, and hyphens.'
            });
        }

        // Create access token
        const token = new AccessToken(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_API_KEY,
            process.env.TWILIO_API_SECRET,
            {
                identity,
                ttl: 3600 // Token valid for 1 hour
            }
        );

        // Create video grant
        const videoGrant = new VideoGrant({
            room: roomName,
        });

        token.addGrant(videoGrant);

        console.log(`📹 Generated token for ${identity} in room ${roomName} (role: ${role || 'participant'})`);

        res.json({
            token: token.toJwt(),
            identity,
            roomName,
            expiresAt: new Date(Date.now() + 3600 * 1000).toISOString()
        });

    } catch (error) {
        console.error('Error generating token:', error);
        res.status(500).json({ error: 'Failed to generate access token' });
    }
});

// Create or get room information
app.post('/api/video/room', async (req, res) => {
    try {
        const { roomName, appointmentId, maxParticipants = 2 } = req.body;

        if (!roomName) {
            return res.status(400).json({ error: 'Room name is required' });
        }

        const client = twilio(
            process.env.TWILIO_API_KEY,
            process.env.TWILIO_API_SECRET,
            { accountSid: process.env.TWILIO_ACCOUNT_SID }
        );

        try {
            // Try to create the room
            const room = await client.video.v1.rooms.create({
                uniqueName: roomName,
                type: maxParticipants > 2 ? 'group' : 'peer-to-peer',
                maxParticipants: Math.min(maxParticipants, 10), // Cap at 10 for safety
                recordParticipantsOnConnect: false,
                statusCallback: process.env.WEBHOOK_URL // Optional webhook for room events
            });

            console.log(`🏠 Created room: ${room.uniqueName} (${room.sid}) for appointment: ${appointmentId}`);

            res.json({
                roomSid: room.sid,
                roomName: room.uniqueName,
                status: room.status,
                created: true,
                appointmentId,
                maxParticipants: room.maxParticipants
            });

        } catch (error) {
            if (error.code === 53113) {
                // Room already exists - fetch existing room info
                const existingRoom = await client.video.v1.rooms(roomName).fetch();

                console.log(`🏠 Room ${roomName} already exists (${existingRoom.status})`);

                res.json({
                    roomSid: existingRoom.sid,
                    roomName: existingRoom.uniqueName,
                    status: existingRoom.status,
                    created: false,
                    message: 'Room already exists',
                    appointmentId
                });
            } else {
                throw error;
            }
        }

    } catch (error) {
        console.error('Error with room:', error);
        res.status(500).json({ error: 'Failed to create or access room' });
    }
});

// Get room status and participants
app.get('/api/video/room/:roomName', async (req, res) => {
    try {
        const { roomName } = req.params;

        const client = twilio(
            process.env.TWILIO_API_KEY,
            process.env.TWILIO_API_SECRET,
            { accountSid: process.env.TWILIO_ACCOUNT_SID }
        );

        const room = await client.video.v1.rooms(roomName).fetch();
        const participants = await client.video.v1.rooms(roomName).participants.list();

        res.json({
            roomSid: room.sid,
            roomName: room.uniqueName,
            status: room.status,
            participants: participants.map(p => ({
                identity: p.identity,
                status: p.status,
                connectedAt: p.dateConnected
            })),
            participantCount: participants.length,
            maxParticipants: room.maxParticipants
        });

    } catch (error) {
        if (error.code === 20404) {
            res.status(404).json({ error: 'Room not found' });
        } else {
            console.error('Error fetching room:', error);
            res.status(500).json({ error: 'Failed to fetch room status' });
        }
    }
});

// End room (disconnect all participants)
app.post('/api/video/room/:roomName/end', async (req, res) => {
    try {
        const { roomName } = req.params;

        const client = twilio(
            process.env.TWILIO_API_KEY,
            process.env.TWILIO_API_SECRET,
            { accountSid: process.env.TWILIO_ACCOUNT_SID }
        );

        // Update room status to completed
        const room = await client.video.v1.rooms(roomName)
            .update({ status: 'completed' });

        console.log(`🔚 Ended room: ${roomName}`);

        res.json({
            roomName: room.uniqueName,
            status: room.status,
            message: 'Room ended successfully'
        });

    } catch (error) {
        console.error('Error ending room:', error);
        res.status(500).json({ error: 'Failed to end room' });
    }
});

// Webhook endpoint for Twilio events (optional)
app.post('/api/video/webhook', (req, res) => {
    const event = req.body;

    console.log('📡 Twilio webhook event:', {
        type: event.StatusCallbackEvent,
        room: event.RoomName,
        participant: event.ParticipantIdentity,
        timestamp: event.Timestamp
    });

    // Handle different event types
    switch (event.StatusCallbackEvent) {
        case 'room-created':
            console.log(`🏠 Room created: ${event.RoomName}`);
            break;
        case 'room-ended':
            console.log(`🔚 Room ended: ${event.RoomName}`);
            break;
        case 'participant-connected':
            console.log(`👤 Participant joined: ${event.ParticipantIdentity} in ${event.RoomName}`);
            break;
        case 'participant-disconnected':
            console.log(`👋 Participant left: ${event.ParticipantIdentity} from ${event.RoomName}`);
            break;
    }

    res.status(200).send('OK');
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        error: 'Internal server error',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.path,
        method: req.method
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('📴 Received SIGTERM, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('📴 Received SIGINT, shutting down gracefully');
    process.exit(0);
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`🚀 TelenosHealth Video Backend running on port ${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/health`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);

    // Validate configuration
    validateTwilioConfig();
});

module.exports = app;