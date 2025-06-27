// src/services/frontendChimeService.js - Corrected and Complete Version
import { ChimeSDKMeetingsClient, CreateMeetingCommand, CreateAttendeeCommand, DeleteMeetingCommand } from '@aws-sdk/client-chime-sdk-meetings';
import { fetchAuthSession } from 'aws-amplify/auth';

// Import Chime SDK directly instead of dynamic imports
import {
    ConsoleLogger,
    DefaultDeviceController,
    DefaultMeetingSession,
    MeetingSessionConfiguration,
    LogLevel
} from 'amazon-chime-sdk-js';

// Create the ChimeSDK object
const ChimeSDK = {
    ConsoleLogger,
    DefaultDeviceController,
    DefaultMeetingSession,
    MeetingSessionConfiguration,
    LogLevel
};

console.log('✅ Chime SDK imported directly');
console.log('🔍 SDK Check:', {
    ConsoleLogger: !!ChimeSDK.ConsoleLogger,
    DefaultDeviceController: !!ChimeSDK.DefaultDeviceController,
    DefaultMeetingSession: !!ChimeSDK.DefaultMeetingSession,
    MeetingSessionConfiguration: !!ChimeSDK.MeetingSessionConfiguration
});

class FrontendChimeService {
    constructor() {
        this.activeMeetings = new Map();
        this.chimeSDKLoaded = true;
        this.isInitialized = false;
        this.currentSession = null;
        this.isVideoEnabled = true;
        this.isAudioMuted = false;
        this.videoPollingInterval = null;

        console.log('📦 Chime SDK loaded:', this.chimeSDKLoaded);

        // Initialize the client
        this.initializeChimeClient();
    }

    async initializeChimeClient() {
        try {
            console.log('🔑 Initializing Chime client with Amplify credentials...');

            // Get credentials from Amplify's current session
            const session = await fetchAuthSession();

            if (!session.credentials) {
                console.log('⚠️ No AWS credentials available. Using fallback method.');
                this.chimeSDKMeetings = new ChimeSDKMeetingsClient({
                    region: 'us-east-1'
                });
            } else {
                this.chimeSDKMeetings = new ChimeSDKMeetingsClient({
                    region: 'us-east-1',
                    credentials: {
                        accessKeyId: session.credentials.accessKeyId,
                        secretAccessKey: session.credentials.secretAccessKey,
                        sessionToken: session.credentials.sessionToken,
                    }
                });
            }

            this.isInitialized = true;
            console.log('✅ Chime SDK client initialized');

        } catch (error) {
            console.error('❌ Failed to initialize Chime SDK:', error);

            try {
                console.log('🔄 Trying fallback initialization...');
                this.chimeSDKMeetings = new ChimeSDKMeetingsClient({
                    region: process.env.REACT_APP_AWS_REGION || 'us-east-1'
                });
                this.isInitialized = true;
                console.log('✅ Fallback initialization successful');
            } catch (fallbackError) {
                console.error('❌ Fallback initialization failed:', fallbackError);
                throw fallbackError;
            }
        }
    }

    async ensureInitialized() {
        if (!this.isInitialized) {
            await this.initializeChimeClient();
        }
    }

    async testCredentials() {
        try {
            await this.ensureInitialized();
            console.log('🧪 Testing AWS credentials...');

            const testCommand = new CreateMeetingCommand({
                ClientRequestToken: `test-${Date.now()}`,
                MediaRegion: 'us-east-1',
                ExternalMeetingId: `test-credentials`
            });

            await this.chimeSDKMeetings.send(testCommand);
            console.log('✅ Credentials are valid');
            return true;
        } catch (error) {
            if (error.name === 'CredentialsProviderError' || error.message.includes('credential')) {
                console.error('❌ Credential error:', error.message);
                return false;
            }
            console.log('✅ Credentials appear valid (or test failed for other reasons)');
            return true;
        }
    }

    async createMeeting(appointmentId, userType = 'provider', userName = 'User') {
        try {
            await this.ensureInitialized();

            console.log(`Creating meeting for appointment ${appointmentId}...`);

            const createMeetingCommand = new CreateMeetingCommand({
                ClientRequestToken: `telenos-${appointmentId}-${Date.now()}`,
                MediaRegion: 'us-east-1',
                MeetingFeatures: {
                    Audio: { EchoReduction: 'AVAILABLE' },
                    Video: { MaxResolution: 'HD' }
                },
                ExternalMeetingId: `healthcare-${appointmentId}`,
                Tags: [
                    { Key: 'Application', Value: 'TelenosHealth' },
                    { Key: 'AppointmentId', Value: appointmentId.toString() },
                    { Key: 'HIPAA', Value: 'Compliant' }
                ]
            });

            const meetingResponse = await this.chimeSDKMeetings.send(createMeetingCommand);
            const meeting = meetingResponse.Meeting;

            console.log(`✅ Meeting created: ${meeting.MeetingId}`);

            const attendeeCommand = new CreateAttendeeCommand({
                MeetingId: meeting.MeetingId,
                ExternalUserId: `${userType}-${Date.now()}`,
                Capabilities: {
                    Audio: 'SendReceive',
                    Video: 'SendReceive',
                    Content: userType === 'provider' ? 'SendReceive' : 'Receive'
                }
            });

            const attendeeResponse = await this.chimeSDKMeetings.send(attendeeCommand);

            const meetingInfo = {
                meeting: meeting,
                meetingId: meeting.MeetingId,
                appointmentId: appointmentId,
                createdAt: new Date(),
                createdBy: userType,
                userName: userName
            };

            this.activeMeetings.set(appointmentId, meetingInfo);
            this.saveMeetingToStorage(appointmentId, meetingInfo);

            return {
                success: true,
                meeting: meeting,
                attendee: attendeeResponse.Attendee,
                appointmentId: appointmentId,
                joinUrl: `${window.location.origin}/join/${appointmentId}`
            };

        } catch (error) {
            console.error('❌ Error creating meeting:', error);
            return {
                success: false,
                error: error.message,
                code: error.name
            };
        }
    }

    async joinExistingMeeting(appointmentId, userType = 'patient', userName = 'Patient') {
        try {
            await this.ensureInitialized();

            console.log(`${userName} joining appointment ${appointmentId}...`);

            let meetingInfo = this.activeMeetings.get(appointmentId);
            if (!meetingInfo) {
                meetingInfo = this.loadMeetingFromStorage(appointmentId);
            }

            if (!meetingInfo) {
                throw new Error('Meeting not found. Please ask your healthcare provider to start the session first.');
            }

            const attendeeCommand = new CreateAttendeeCommand({
                MeetingId: meetingInfo.meetingId,
                ExternalUserId: `${userType}-${Date.now()}`,
                Capabilities: {
                    Audio: 'SendReceive',
                    Video: 'SendReceive',
                    Content: 'Receive'
                }
            });

            const attendeeResponse = await this.chimeSDKMeetings.send(attendeeCommand);

            return {
                success: true,
                meeting: meetingInfo.meeting,
                attendee: attendeeResponse.Attendee,
                appointmentId: appointmentId,
                hostName: meetingInfo.userName
            };

        } catch (error) {
            console.error('❌ Error joining meeting:', error);
            return {
                success: false,
                error: error.message,
                code: error.name
            };
        }
    }

    // MAIN VIDEO SESSION SETUP METHOD
    async setupChimeSession(meeting, attendee, localVideoRef, remoteVideoRef, audioElementRef) {
        try {
            console.log('🎥 Setting up Chime session...');

            if (!this.chimeSDKLoaded || !ChimeSDK) {
                throw new Error('Chime SDK not properly loaded. Please refresh and try again.');
            }

            console.log('📦 Using compatible Chime SDK version');

            // Create session
            const logger = new ChimeSDK.ConsoleLogger('VideoCall', ChimeSDK.LogLevel.ERROR);
            const deviceController = new ChimeSDK.DefaultDeviceController(logger);
            const configuration = new ChimeSDK.MeetingSessionConfiguration(meeting, attendee);

            const session = new ChimeSDK.DefaultMeetingSession(configuration, logger, deviceController);
            this.currentSession = session;

            console.log('✅ Session created');

            // Validate session
            if (!this.currentSession || !this.currentSession.audioVideo) {
                throw new Error('Session or audioVideo not available');
            }

            // Set up audio first
            if (audioElementRef && audioElementRef.current) {
                try {
                    this.currentSession.audioVideo.bindAudioElement(audioElementRef.current);
                    console.log('🔊 Audio element bound successfully');
                } catch (audioError) {
                    console.warn('⚠️ Audio binding failed:', audioError.message);
                }
            }

            // Start the session
            console.log('▶️ Starting audio/video session...');
            await this.currentSession.audioVideo.start();
            console.log('✅ Session started');

            // IMMEDIATE CAMERA SETUP with direct permission request
            console.log('📷 Setting up camera with immediate permission request...');

            try {
                // Request camera permission explicitly
                console.log('🔐 Requesting camera permission...');
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 1280, min: 640 },
                        height: { ideal: 720, min: 480 },
                        facingMode: 'user'
                    },
                    audio: false
                });

                console.log('✅ Camera permission granted!');

                // In your setupChimeSession method, after getting camera permission,
                // replace the section that says "Immediately bind to local video element" with this:

                // Immediately bind to local video element with retry logic
                if (localVideoRef && localVideoRef.current) {
                    console.log('📺 Binding camera stream to local video element...');
                    localVideoRef.current.srcObject = stream;
                    localVideoRef.current.muted = true;
                    localVideoRef.current.autoplay = true;
                    localVideoRef.current.playsInline = true;

                    try {
                        await localVideoRef.current.play();
                        console.log('✅ Local video element playing!');

                        setTimeout(() => {
                            const vid = localVideoRef.current;
                            console.log('📏 Local video dimensions:', {
                                videoWidth: vid.videoWidth,
                                videoHeight: vid.videoHeight,
                                readyState: vid.readyState
                            });
                        }, 1000);

                    } catch (playError) {
                        console.warn('⚠️ Auto-play blocked:', playError.message);
                        console.log('💡 Click the video area to start playback');
                    }
                } else {
                    console.error('❌ Local video ref not available, trying retry...');

                    // Retry after a short delay
                    setTimeout(async () => {
                        if (localVideoRef && localVideoRef.current) {
                            console.log('🔄 Retry: Binding camera stream to local video element...');
                            localVideoRef.current.srcObject = stream;
                            localVideoRef.current.muted = true;
                            localVideoRef.current.autoplay = true;
                            localVideoRef.current.playsInline = true;

                            try {
                                await localVideoRef.current.play();
                                console.log('✅ Local video playing after retry!');
                            } catch (retryError) {
                                console.warn('⚠️ Retry failed:', retryError.message);
                            }
                        } else {
                            console.error('❌ Local video ref still not available after retry');
                        }
                    }, 1000);
                }

                // Try to start Chime's video tile system
                try {
                    console.log('🎥 Starting Chime local video tile...');
                    await this.currentSession.audioVideo.startLocalVideoTile();
                    console.log('✅ Chime video tile started');
                } catch (chimeVideoError) {
                    console.warn('⚠️ Chime video tile failed (using direct stream instead):', chimeVideoError.message);
                }

                // Set up polling for remote video
                this.setupVideoPolling(localVideoRef, remoteVideoRef);

            } catch (permissionError) {
                console.error('❌ Camera permission denied:', permissionError);

                const errorMsg = `Camera access is required for video calls.

To fix this:
1. Click the camera icon (🎥) in your browser's address bar
2. Select "Always allow" for this site
3. Refresh the page

Error: ${permissionError.message}`;

                alert(errorMsg);

                // Continue without video
                console.log('⚠️ Continuing without local video...');
                this.setupVideoPolling(localVideoRef, remoteVideoRef);
            }

            console.log('✅ Video session setup complete');
            return this.currentSession;

        } catch (error) {
            console.error('❌ Error setting up video session:', error);
            throw new Error(`Video setup failed: ${error.message}`);
        }
    }

    // SIMPLIFIED VIDEO POLLING for remote video
    setupVideoPolling(localVideoRef, remoteVideoRef) {
        console.log('🔄 Setting up video polling for remote video...');

        let pollCount = 0;
        const maxPolls = 20;

        const videoPoller = setInterval(() => {
            pollCount++;

            try {
                const allVideos = document.querySelectorAll('video');

                allVideos.forEach((video, index) => {
                    // Skip our own local video element
                    if (video === localVideoRef?.current) return;

                    if (video.videoWidth > 0 && video.videoHeight > 0 && video.srcObject) {
                        console.log(`📹 Found active video ${index}:`, {
                            width: video.videoWidth,
                            height: video.videoHeight,
                            muted: video.muted,
                            isLocal: video === localVideoRef?.current
                        });

                        // If this is a remote video and we don't have remote video yet
                        if (video !== localVideoRef?.current &&
                            remoteVideoRef &&
                            remoteVideoRef.current &&
                            !remoteVideoRef.current.srcObject) {

                            console.log('🎥 Binding remote video stream');
                            remoteVideoRef.current.srcObject = video.srcObject;
                            remoteVideoRef.current.autoplay = true;
                            remoteVideoRef.current.playsInline = true;
                            remoteVideoRef.current.play().catch(e => console.log('Remote play error:', e));
                        }
                    }
                });

            } catch (error) {
                console.warn('⚠️ Polling error:', error);
            }

            if (pollCount >= maxPolls) {
                console.log('🔄 Remote video polling complete');
                clearInterval(videoPoller);
            }

        }, 1000);

        this.videoPollingInterval = videoPoller;
    }

    // CLEAN UP VIDEO POLLING
    clearVideoPolling() {
        if (this.videoPollingInterval) {
            clearInterval(this.videoPollingInterval);
            this.videoPollingInterval = null;
            console.log('🛑 Video polling cleared');
        }
    }

    // ALIAS METHOD for backward compatibility
    async setupVideoSession(meeting, attendee, localVideoRef, remoteVideoRef, audioElementRef) {
        console.log('📞 setupVideoSession called - redirecting to setupChimeSession');
        return await this.setupChimeSession(meeting, attendee, localVideoRef, remoteVideoRef, audioElementRef);
    }

    // GET DEVICES METHOD
    async getDevices() {
        try {
            console.log('🎤📹 Getting available devices...');

            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            const audioDevices = devices.filter(device => device.kind === 'audioinput');

            console.log('✅ Devices retrieved:', {
                videoDevices: videoDevices,
                audioDevices: audioDevices
            });

            return {
                videoDevices: videoDevices,
                audioDevices: audioDevices
            };
        } catch (error) {
            console.error('❌ Error getting devices:', error);
            return {
                videoDevices: [],
                audioDevices: []
            };
        }
    }

    // VIDEO CONTROL METHODS
    async toggleVideo() {
        console.log('📹 toggleVideo called');

        try {
            if (!this.currentSession || !this.currentSession.audioVideo) {
                console.warn('⚠️ No active session to toggle video');
                return { success: false, error: 'No active session' };
            }

            if (this.isVideoEnabled) {
                console.log('📷 Stopping local video...');
                this.currentSession.audioVideo.stopLocalVideoTile();
                this.isVideoEnabled = false;
                console.log('✅ Video disabled');
            } else {
                console.log('📷 Starting local video...');
                await this.currentSession.audioVideo.startLocalVideoTile();
                this.isVideoEnabled = true;
                console.log('✅ Video enabled');
            }

            return {
                success: true,
                videoEnabled: this.isVideoEnabled
            };

        } catch (error) {
            console.error('❌ Error toggling video:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async toggleMute() {
        console.log('🎤 toggleMute called');

        try {
            if (!this.currentSession || !this.currentSession.audioVideo) {
                console.warn('⚠️ No active session to toggle mute');
                return { success: false, error: 'No active session' };
            }

            if (this.isAudioMuted) {
                console.log('🎤 Unmuting audio...');
                this.currentSession.audioVideo.realtimeUnmuteLocalAudio();
                this.isAudioMuted = false;
                console.log('✅ Audio unmuted');
            } else {
                console.log('🔇 Muting audio...');
                this.currentSession.audioVideo.realtimeMuteLocalAudio();
                this.isAudioMuted = true;
                console.log('✅ Audio muted');
            }

            return {
                success: true,
                audioMuted: this.isAudioMuted
            };

        } catch (error) {
            console.error('❌ Error toggling mute:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ALIAS for toggleMute
    async toggleAudio() {
        console.log('🎤 toggleAudio called - redirecting to toggleMute');
        return await this.toggleMute();
    }

    // GET VIDEO STATE
    getVideoState() {
        return {
            isVideoEnabled: this.isVideoEnabled,
            isAudioMuted: this.isAudioMuted,
            hasActiveSession: !!(this.currentSession && this.currentSession.audioVideo)
        };
    }

    // END CALL METHOD
    async endCall(appointmentId) {
        console.log('📞 endCall called for appointment:', appointmentId);

        try {
            // Clear video polling
            this.clearVideoPolling();

            // Stop current session
            if (this.currentSession) {
                try {
                    console.log('🛑 Stopping current session...');
                    this.currentSession.audioVideo.stop();
                    this.currentSession = null;
                    console.log('✅ Current session stopped');
                } catch (sessionError) {
                    console.error('⚠️ Error stopping session:', sessionError);
                }
            }

            // End the meeting
            if (appointmentId) {
                const result = await this.endMeeting(appointmentId);
                console.log('✅ Meeting ended:', result);
            }

            return { success: true };

        } catch (error) {
            console.error('❌ Error in endCall:', error);
            return { success: false, error: error.message };
        }
    }

    // END MEETING METHOD
    async endMeeting(appointmentId) {
        try {
            await this.ensureInitialized();

            const meetingInfo = this.activeMeetings.get(appointmentId);
            if (meetingInfo) {
                console.log(`🔚 Ending meeting ${appointmentId}...`);

                const deleteMeetingCommand = new DeleteMeetingCommand({
                    MeetingId: meetingInfo.meetingId
                });

                await this.chimeSDKMeetings.send(deleteMeetingCommand);
                this.activeMeetings.delete(appointmentId);

                const meetings = JSON.parse(localStorage.getItem('chimeMeetings') || '{}');
                delete meetings[appointmentId];
                localStorage.setItem('chimeMeetings', JSON.stringify(meetings));

                console.log('✅ Meeting ended');
            }

            return { success: true };
        } catch (error) {
            console.error('Error ending meeting:', error);
            this.activeMeetings.delete(appointmentId);
            return { success: true };
        }
    }

    // STORAGE METHODS
    saveMeetingToStorage(appointmentId, meetingData) {
        try {
            const meetings = JSON.parse(localStorage.getItem('chimeMeetings') || '{}');
            meetings[appointmentId] = {
                ...meetingData,
                createdAt: meetingData.createdAt.toISOString()
            };
            localStorage.setItem('chimeMeetings', JSON.stringify(meetings));
        } catch (error) {
            console.error('Storage error:', error);
        }
    }

    loadMeetingFromStorage(appointmentId) {
        try {
            const meetings = JSON.parse(localStorage.getItem('chimeMeetings') || '{}');
            const meetingData = meetings[appointmentId];
            if (meetingData) {
                meetingData.createdAt = new Date(meetingData.createdAt);
                this.activeMeetings.set(appointmentId, meetingData);
                return meetingData;
            }
        } catch (error) {
            console.error('Storage load error:', error);
        }
        return null;
    }

    cleanupOldMeetings() {
        try {
            const meetings = JSON.parse(localStorage.getItem('chimeMeetings') || '{}');
            const now = Date.now();
            const oneDay = 24 * 60 * 60 * 1000;

            Object.keys(meetings).forEach(appointmentId => {
                const meeting = meetings[appointmentId];
                const createdAt = new Date(meeting.createdAt).getTime();
                if (now - createdAt > oneDay) {
                    delete meetings[appointmentId];
                    this.activeMeetings.delete(appointmentId);
                }
            });

            localStorage.setItem('chimeMeetings', JSON.stringify(meetings));
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    }
}

// Debugging functions
window.debugChimeVideo = () => {
    console.log('🔍 Chime Video Debug Info:');
    const localVideo = document.querySelector('video[muted]');
    const remoteVideo = document.querySelector('video:not([muted])');

    if (localVideo) {
        console.log('Local video found:', {
            src: localVideo.src,
            readyState: localVideo.readyState,
            dimensions: `${localVideo.videoWidth}x${localVideo.videoHeight}`,
            playing: !localVideo.paused
        });
    } else {
        console.log('❌ Local video element not found');
    }

    if (remoteVideo) {
        console.log('Remote video found:', {
            src: remoteVideo.src,
            readyState: remoteVideo.readyState,
            dimensions: `${remoteVideo.videoWidth}x${remoteVideo.videoHeight}`,
            playing: !remoteVideo.paused
        });
    } else {
        console.log('❌ Remote video element not found');
    }
};

window.testCamera = async () => {
    try {
        console.log('🧪 Testing camera...');
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        console.log('✅ Camera test successful!', stream);
        stream.getTracks().forEach(track => track.stop());
        return true;
    } catch (error) {
        console.error('❌ Camera test failed:', error);
        return false;
    }
};

const frontendChimeService = new FrontendChimeService();
frontendChimeService.cleanupOldMeetings();

export default frontendChimeService;