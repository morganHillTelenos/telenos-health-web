// src/services/chimeService.js - Frontend service that connects to backend
import {
    ConsoleLogger,
    DefaultDeviceController,
    DefaultMeetingSession,
    MeetingSessionConfiguration,
    LogLevel
} from 'amazon-chime-sdk-js';

import { authService } from './auth';

class ChimeVideoService {
    constructor() {
        this.currentSession = null;
        this.deviceController = null;
        this.logger = null;
        this.backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
        this.isConnected = false;
        this.participants = new Map();

        this.initializeSDK();
    }

    initializeSDK() {
        try {
            console.log('🎥 Initializing Chime SDK...');
            this.logger = new ConsoleLogger('ChimeVideoCall', LogLevel.INFO);
            this.deviceController = new DefaultDeviceController(this.logger);
            console.log('✅ Chime SDK initialized');
        } catch (error) {
            console.error('❌ Failed to initialize Chime SDK:', error);
            throw error;
        }
    }

    // Get auth headers for API calls
    async getAuthHeaders() {
        try {
            const token = await authService.getAuthToken();
            return {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            };
        } catch (error) {
            console.warn('⚠️ No auth token available, proceeding without authentication');
            return {
                'Content-Type': 'application/json'
            };
        }
    }

    // Create a new meeting (Provider/Doctor)
    async createMeeting(appointmentId, providerName = 'Healthcare Provider') {
        try {
            console.log('🎥 Creating meeting for appointment:', appointmentId);

            const user = await authService.getCurrentUser();
            const headers = await this.getAuthHeaders();

            const response = await fetch(`${this.backendUrl}/api/meetings/create`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    appointmentId,
                    providerName: providerName || user?.name || 'Healthcare Provider',
                    providerEmail: user?.email || user?.username
                })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to create meeting');
            }

            console.log('✅ Meeting created successfully');
            return result;

        } catch (error) {
            console.error('❌ Failed to create meeting:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Join an existing meeting (Patient)
    async joinMeeting(appointmentId, participantName = 'Patient', participantEmail = '') {
        try {
            console.log('🤝 Joining meeting for appointment:', appointmentId);

            const headers = await this.getAuthHeaders();

            const response = await fetch(`${this.backendUrl}/api/meetings/join/${appointmentId}`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    patientName: participantName,
                    patientEmail: participantEmail
                })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to join meeting');
            }

            console.log('✅ Successfully joined meeting');
            return result;

        } catch (error) {
            console.error('❌ Failed to join meeting:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Set up the video session with AWS Chime SDK
    async setupVideoSession(meeting, attendee, localVideoElement, remoteVideoElement, audioElement) {
        try {
            console.log('📹 Setting up video session...');

            // Create meeting session configuration
            const configuration = new MeetingSessionConfiguration(meeting, attendee);

            // Create meeting session
            this.currentSession = new DefaultMeetingSession(configuration, this.logger, this.deviceController);

            // Set up audio element for remote audio
            if (audioElement) {
                this.currentSession.audioVideo.bindAudioElement(audioElement);
                console.log('🔊 Audio element bound');
            }

            

            // Set up video tile observer
            this.currentSession.audioVideo.addVideoTileObserver({
                videoTileDidUpdate: (tileState) => {
                    console.log('📹 Video tile updated:', {
                        tileId: tileState.tileId,
                        localTile: tileState.localTile,
                        active: tileState.active,
                        paused: tileState.paused
                    });

                    if (tileState.localTile && localVideoElement) {
                        // Bind local video (your camera)
                        this.currentSession.audioVideo.bindVideoElement(tileState.tileId, localVideoElement);
                        localVideoElement.muted = true; // Prevent feedback
                        localVideoElement.style.transform = 'scaleX(-1)'; // Mirror effect
                        console.log('✅ Local video bound');
                    } else if (!tileState.localTile && remoteVideoElement) {
                        // Bind remote video (other participant)
                        this.currentSession.audioVideo.bindVideoElement(tileState.tileId, remoteVideoElement);
                        console.log('✅ Remote video bound');
                    }
                },

                videoTileWasRemoved: (tileId) => {
                    console.log('📹 Video tile removed:', tileId);
                }
            });

            // Set up audio/video observers
            this.currentSession.audioVideo.addAudioVideoObserver({
                connectionDidStart: () => {
                    console.log('✅ Audio/Video connection started');
                    this.isConnected = true;
                },

                connectionDidStop: () => {
                    console.log('🔌 Audio/Video connection stopped');
                    this.isConnected = false;
                },

                videoAvailabilityDidChange: (availability) => {
                    console.log('📹 Video availability changed:', availability);
                }
            });

            // Set up real-time observers for participant updates
            this.currentSession.audioVideo.realtimeSubscribeToAttendeeIdPresence((attendeeId, present) => {
                console.log(`👤 Attendee ${attendeeId} ${present ? 'joined' : 'left'}`);
                if (present) {
                    this.participants.set(attendeeId, { joinedAt: new Date() });
                } else {
                    this.participants.delete(attendeeId);
                }
            });

            // Start audio/video
            await this.currentSession.audioVideo.start();
            console.log('✅ Audio/Video started');

            // Start local video
            await this.currentSession.audioVideo.startLocalVideoTile();
            console.log('✅ Local video started');

            return this.currentSession;

        } catch (error) {
            console.error('❌ Failed to setup video session:', error);
            throw error;
        }
    }

    // Control functions
    async toggleAudio() {
        if (!this.currentSession) return false;

        try {
            const isMuted = this.currentSession.audioVideo.realtimeIsLocalAudioMuted();
            if (isMuted) {
                this.currentSession.audioVideo.realtimeUnmuteLocalAudio();
            } else {
                this.currentSession.audioVideo.realtimeMuteLocalAudio();
            }
            console.log(`🎤 Audio ${isMuted ? 'unmuted' : 'muted'}`);
            return !isMuted;
        } catch (error) {
            console.error('❌ Failed to toggle audio:', error);
            return false;
        }
    }

    async toggleVideo() {
        if (!this.currentSession) return false;

        try {
            const isVideoEnabled = this.currentSession.audioVideo.hasStartedLocalVideoTile();
            if (isVideoEnabled) {
                this.currentSession.audioVideo.stopLocalVideoTile();
            } else {
                await this.currentSession.audioVideo.startLocalVideoTile();
            }
            console.log(`📹 Video ${isVideoEnabled ? 'stopped' : 'started'}`);
            return !isVideoEnabled;
        } catch (error) {
            console.error('❌ Failed to toggle video:', error);
            return false;
        }
    }

    async endCall(appointmentId) {
        try {
            console.log('☎️ Ending call...');

            // Stop local video and audio
            if (this.currentSession) {
                this.currentSession.audioVideo.stopLocalVideoTile();
                this.currentSession.audioVideo.stop();
                this.currentSession = null;
            }

            // Notify backend to end meeting
            if (appointmentId) {
                try {
                    const headers = await this.getAuthHeaders();
                    await fetch(`${this.backendUrl}/api/meetings/${appointmentId}`, {
                        method: 'DELETE',
                        headers
                    });
                } catch (error) {
                    console.warn('⚠️ Failed to notify backend of call end:', error);
                }
            }

            this.isConnected = false;
            this.participants.clear();

            console.log('✅ Call ended');
            return true;
        } catch (error) {
            console.error('❌ Failed to end call:', error);
            return false;
        }
    }

    // Get available devices
    async getDevices() {
        try {
            const audioInputDevices = await this.deviceController.listAudioInputDevices();
            const videoInputDevices = await this.deviceController.listVideoInputDevices();
            const audioOutputDevices = await this.deviceController.listAudioOutputDevices();

            return {
                audioInput: audioInputDevices,
                videoInput: videoInputDevices,
                audioOutput: audioOutputDevices
            };
        } catch (error) {
            console.error('❌ Failed to get devices:', error);
            return { audioInput: [], videoInput: [], audioOutput: [] };
        }
    }

    // Set audio output device
    async setAudioOutputDevice(deviceId) {
        try {
            await this.deviceController.chooseAudioOutputDevice(deviceId);
            console.log('🔊 Audio output device changed:', deviceId);
            return true;
        } catch (error) {
            console.error('❌ Failed to set audio output device:', error);
            return false;
        }
    }

    // Set video input device
    async setVideoInputDevice(deviceId) {
        try {
            await this.deviceController.chooseVideoInputDevice(deviceId);
            console.log('📹 Video input device changed:', deviceId);
            return true;
        } catch (error) {
            console.error('❌ Failed to set video input device:', error);
            return false;
        }
    }

    // Get meeting info from backend
    async getMeetingInfo(appointmentId) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${this.backendUrl}/api/meetings/${appointmentId}`, {
                headers
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('❌ Failed to get meeting info:', error);
            return { success: false, error: error.message };
        }
    }

    // Test backend connection
    async testConnection() {
        try {
            const response = await fetch(`${this.backendUrl}/health`);
            const result = await response.json();

            console.log('✅ Backend connection test successful');
            return { success: true, ...result };
        } catch (error) {
            console.error('❌ Backend connection test failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Health check
    async healthCheck() {
        try {
            const backendHealth = await this.testConnection();
            const devices = await this.getDevices();

            return {
                status: backendHealth.success ? 'healthy' : 'unhealthy',
                backend: backendHealth,
                devices: {
                    audio: devices.audioInput.length,
                    video: devices.videoInput.length,
                    speakers: devices.audioOutput.length
                },
                connected: this.isConnected,
                participants: this.participants.size,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

// Create and export singleton instance
export const chimeVideoService = new ChimeVideoService();
export default chimeVideoService;