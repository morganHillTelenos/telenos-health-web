// src/services/twilioVideo.js
import { connect, createLocalTracks } from 'twilio-video';

class TwilioVideoService {
    constructor() {
        this.room = null;
        this.localVideoTrack = null;
        this.localAudioTrack = null;
    }

    // Get access token from your backend
    async getAccessToken(identity, roomName) {
        try {
            const response = await fetch('/api/video/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ identity, roomName })
            });

            if (!response.ok) {
                throw new Error('Failed to get access token');
            }

            const data = await response.json();
            return data.token;
        } catch (error) {
            console.error('Error getting access token:', error);
            throw error;
        }
    }

    // Create local video and audio tracks
    async createLocalTracks() {
        try {
            const tracks = await createLocalTracks({
                audio: true,
                video: { width: 640, height: 480 }
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
    async joinRoom(identity, roomName) {
        try {
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
                }
            });

            return this.room;
        } catch (error) {
            console.error('Error joining room:', error);
            throw error;
        }
    }

    // Leave room and cleanup
    async leaveRoom() {
        if (this.room) {
            this.room.disconnect();
            this.room = null;
        }

        // Stop local tracks
        if (this.localVideoTrack) {
            this.localVideoTrack.stop();
            this.localVideoTrack = null;
        }

        if (this.localAudioTrack) {
            this.localAudioTrack.stop();
            this.localAudioTrack = null;
        }
    }

    // Toggle audio
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

    // Toggle video
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

    // Get room instance
    getRoom() {
        return this.room;
    }
}

export default new TwilioVideoService();