// src/services/twilioTokenService.js - Generate Twilio Access Tokens Client-Side

import { twilioConfig } from '../config/twilioConfig';

// Note: This is a simplified client-side token generation for demo purposes
// In production, you should generate tokens on your backend for security

class TwilioTokenService {
    constructor() {
        this.baseUrl = 'https://video.twilio.com';
    }

    // Generate a simple room name based on appointment ID
    generateRoomName(appointmentId) {
        return `telenos-room-${appointmentId}`;
    }

    // Generate participant identity
    generateIdentity(userType = 'participant', userId = null) {
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);

        if (userId) {
            return `${userType}-${userId}-${timestamp}`;
        }

        return `${userType}-${randomId}-${timestamp}`;
    }

    // For demo purposes, we'll use a mock token
    // In production, this should be generated on your backend
    async generateAccessToken(identity, roomName) {
        try {
            // Check if we have Twilio credentials
            if (!twilioConfig.accountSid || !twilioConfig.apiKey) {
                console.warn('Twilio credentials not configured, using demo mode');
                return this.generateDemoToken(identity, roomName);
            }

            // For now, return demo token - you'll need to implement backend endpoint
            return this.generateDemoToken(identity, roomName);

        } catch (error) {
            console.error('Error generating access token:', error);
            throw new Error('Failed to generate access token');
        }
    }

    // Demo token for testing (replace with real implementation)
    generateDemoToken(identity, roomName) {
        return {
            accessToken: `demo_token_${identity}_${roomName}_${Date.now()}`,
            identity,
            roomName,
            isDemoToken: true
        };
    }

    // Validate room name
    validateRoomName(roomName) {
        const roomNameRegex = /^[a-zA-Z0-9\-_]+$/;
        return roomNameRegex.test(roomName) && roomName.length <= 50;
    }

    // Get room info (mock for demo)
    async getRoomInfo(roomName) {
        return {
            name: roomName,
            status: 'in-progress',
            type: twilioConfig.roomType,
            maxParticipants: twilioConfig.maxParticipants,
            participants: []
        };
    }
}

export const twilioTokenService = new TwilioTokenService();