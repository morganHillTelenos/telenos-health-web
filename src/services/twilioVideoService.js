// src/services/twilioVideoService.js
import { connect, createLocalTracks } from 'twilio-video';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class TwilioVideoService {
    constructor() {
        this.room = null;
        this.localVideoTrack = null;
        this.localAudioTrack = null;
        this.participants = new Map();
    }

    // Get access token from backend
    async getAccessToken(identity, roomName, role = 'participant') {
        try {
            const response = await fetch(`${API_BASE_URL}/api/video/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add authorization header if you have authentication
                    // 'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ identity, roomName, role })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to get access token');
            }

            const data = await response.json();
            return data.token;
        } catch (error) {
            console.error('Error getting access token:', error);
            throw error;
        }
    }

    // Create or join room
    async createRoom(roomName, appointmentId, maxParticipants = 2) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/video/room`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ roomName, appointmentId, maxParticipants })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create room');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating room:', error);
            throw error;
        }
    }

    // Get room status
    async getRoomStatus(roomName) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/video/room/${roomName}`);

            if (!response.ok) {
                if (response.status === 404) {
                    return null; // Room doesn't exist
                }
                const error = await response.json();
                throw new Error(error.error || 'Failed to get room status');
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting room status:', error);
            throw error;
        }
    }

    // Create local video and audio tracks
    async createLocalTracks() {
        try {
            const tracks = await createLocalTracks({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                },
                video: {
                    width: 640,
                    height: 480,
                    frameRate: 24
                }
            });

            this.localVideoTrack = tracks.find(track => track.kind === 'video');
            this.localAudioTrack = tracks.find(track => track.kind === 'audio');

            return tracks;
        } catch (error) {
            console.error('Error creating local tracks:', error);
            throw error;
        }
    }

    // Join video room
    async joinRoom(identity, roomName, appointmentId) {
        try {
            // First, create/ensure room exists
            await this.createRoom(roomName, appointmentId);

            // Get access token
            const token = await this.getAccessToken(identity, roomName);

            // Create local tracks
            const localTracks = await this.createLocalTracks();

            // Connect to room
            this.room = await connect(token, {
                name: roomName,
                tracks: localTracks,
                audio: true,
                video: true,
                networkQuality: {
                    local: 1,
                    remote: 1
                },
                bandwidthProfile: {
                    video: {
                        mode: 'collaboration',
                        maxTracks: 2
                    }
                },
                preferredVideoCodecs: ['VP8'],
                logLevel: 'warn'
            });

            console.log(`📹 Connected to room: ${roomName} as ${identity}`);

            // Set up event listeners
            this.setupRoomEventListeners();

            return this.room;
        } catch (error) {
            console.error('Error joining room:', error);
            await this.cleanup();
            throw error;
        }
    }

    // Setup room event listeners
    setupRoomEventListeners() {
        if (!this.room) return;

        // Room disconnected
        this.room.on('disconnected', (room, error) => {
            console.log('📱 Disconnected from room:', room.name);
            if (error) {
                console.error('Disconnection error:', error);
            }
            this.cleanup();
        });

        // Participant connected
        this.room.on('participantConnected', (participant) => {
            console.log(`👤 Participant connected: ${participant.identity}`);
            this.participants.set(participant.sid, participant);
            this.setupParticipantEventListeners(participant);
        });

        // Participant disconnected
        this.room.on('participantDisconnected', (participant) => {
            console.log(`👋 Participant disconnected: ${participant.identity}`);
            this.participants.delete(participant.sid);
        });

        // Network quality changed
        this.room.on('participantNetworkQualityChanged', (participant, networkQuality) => {
            console.log(`📡 Network quality for ${participant.identity}: ${networkQuality.level}`);
        });

        // Handle existing participants
        this.room.participants.forEach(participant => {
            this.participants.set(participant.sid, participant);
            this.setupParticipantEventListeners(participant);
        });
    }

    // Setup participant event listeners
    setupParticipantEventListeners(participant) {
        // Track subscribed
        participant.on('trackSubscribed', (track) => {
            console.log(`📹 Track subscribed: ${track.kind} from ${participant.identity}`);
        });

        // Track unsubscribed
        participant.on('trackUnsubscribed', (track) => {
            console.log(`📹 Track unsubscribed: ${track.kind} from ${participant.identity}`);
        });

        // Handle existing tracks
        participant.tracks.forEach(publication => {
            if (publication.isSubscribed) {
                console.log(`📹 Existing track: ${publication.track.kind} from ${participant.identity}`);
            }
        });
    }

    // Leave room and cleanup
    async leaveRoom() {
        try {
            if (this.room) {
                console.log('📱 Leaving room...');
                this.room.disconnect();
            }
            await this.cleanup();
        } catch (error) {
            console.error('Error leaving room:', error);
        }
    }

    // End room for all participants
    async endRoom(roomName) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/video/room/${roomName}/end`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to end room');
            }

            await this.leaveRoom();
            return await response.json();
        } catch (error) {
            console.error('Error ending room:', error);
            throw error;
        }
    }

    // Cleanup resources
    async cleanup() {
        // Stop local tracks
        if (this.localVideoTrack) {
            this.localVideoTrack.stop();
            this.localVideoTrack = null;
        }

        if (this.localAudioTrack) {
            this.localAudioTrack.stop();
            this.localAudioTrack = null;
        }

        // Clear participants
        this.participants.clear();
        this.room = null;
    }

    // Toggle audio mute
    toggleAudio() {
        if (this.localAudioTrack) {
            if (this.localAudioTrack.isEnabled) {
                this.localAudioTrack.disable();
            } else {
                this.localAudioTrack.enable();
            }
            return !this.localAudioTrack.isEnabled;
        }
        return false;
    }

    // Toggle video mute
    toggleVideo() {
        if (this.localVideoTrack) {
            if (this.localVideoTrack.isEnabled) {
                this.localVideoTrack.disable();
            } else {
                this.localVideoTrack.enable();
            }
            return !this.localVideoTrack.isEnabled;
        }
        return false;
    }

    // Get current room
    getRoom() {
        return this.room;
    }

    // Get participants
    getParticipants() {
        return Array.from(this.participants.values());
    }

    // Get local tracks
    getLocalTracks() {
        return {
            video: this.localVideoTrack,
            audio: this.localAudioTrack
        };
    }
}

export default new TwilioVideoService();