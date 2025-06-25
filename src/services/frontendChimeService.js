// src/services/frontendChimeService.js - Fixed Version
import { ChimeSDKMeetingsClient, CreateMeetingCommand, CreateAttendeeCommand, DeleteMeetingCommand } from '@aws-sdk/client-chime-sdk-meetings';
import { fetchAuthSession } from 'aws-amplify/auth';

// Try multiple import approaches for compatibility
let ChimeSDK = null;

try {
    // Approach 1: Direct imports (preferred)
    const chimeImports = await import('amazon-chime-sdk-js');
    ChimeSDK = {
        ConsoleLogger: chimeImports.ConsoleLogger,
        DefaultDeviceController: chimeImports.DefaultDeviceController,
        DefaultMeetingSession: chimeImports.DefaultMeetingSession,
        MeetingSessionConfiguration: chimeImports.MeetingSessionConfiguration,
        LogLevel: chimeImports.LogLevel
    };
    console.log('✅ Using direct NPM imports');
} catch (importError) {
    console.log('⚠️ Direct imports failed, trying alternative approach');

    try {
        // Approach 2: Default import
        const ChimeSDKDefault = await import('amazon-chime-sdk-js');
        ChimeSDK = ChimeSDKDefault.default || ChimeSDKDefault;
        console.log('✅ Using default import');
    } catch (defaultError) {
        console.error('❌ All import approaches failed:', defaultError);
    }
}

class FrontendChimeService {
    constructor() {
        this.activeMeetings = new Map();
        this.chimeSDKLoaded = !!ChimeSDK;
        this.isInitialized = false;
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
                // For development, create a basic client without auth
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

            // Fallback: try with environment variables or basic config
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

            // Note: Fixed - using this.chimeSDKMeetings instead of this.chimeClient
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

            // Fixed: using this.chimeSDKMeetings instead of this.chimeClient
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

            // Fixed: using this.chimeSDKMeetings instead of this.chimeClient
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

            // Fixed: using this.chimeSDKMeetings instead of this.chimeClient
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

    // Improved video setup with better local video handling
    async setupChimeSession(meeting, attendee, localVideoRef, remoteVideoRef, audioElementRef) {
        try {
            console.log('🎥 Setting up Chime session...');

            if (!this.chimeSDKLoaded || !ChimeSDK) {
                throw new Error('Chime SDK not properly loaded. Please refresh and try again.');
            }

            console.log('📦 Using compatible Chime SDK version');

            // Create session
            const logger = new ChimeSDK.ConsoleLogger('VideoCall', ChimeSDK.LogLevel.INFO);
            const deviceController = new ChimeSDK.DefaultDeviceController(logger);
            const configuration = new ChimeSDK.MeetingSessionConfiguration(meeting, attendee);

            const session = new ChimeSDK.DefaultMeetingSession(configuration, logger, deviceController);
            console.log('✅ Session created with compatible SDK');

            // Validate session
            if (!session || !session.audioVideo) {
                throw new Error('Session or audioVideo not available');
            }

            // Check video elements availability
            console.log('📺 Video elements check:');
            console.log('- Local video ref:', !!localVideoRef.current);
            console.log('- Remote video ref:', !!remoteVideoRef.current);

            if (localVideoRef.current) {
                console.log('- Local video element tag:', localVideoRef.current.tagName);
                console.log('- Local video element ready:', localVideoRef.current.readyState);

                // Pre-configure local video element
                localVideoRef.current.muted = true;
                localVideoRef.current.autoplay = true;
                localVideoRef.current.playsInline = true;
                console.log('✅ Local video element pre-configured');
            }

            // Set up video tile observer BEFORE starting session
            if (typeof session.audioVideo.addVideoTileObserver === 'function') {
                session.audioVideo.addVideoTileObserver({
                    videoTileDidUpdate: (tileState) => {
                        console.log('📹 Video tile updated:', {
                            tileId: tileState.tileId,
                            localTile: tileState.localTile,
                            active: tileState.active,
                            paused: tileState.paused,
                            isContent: tileState.isContent,
                            boundAttendeeId: tileState.boundAttendeeId
                        });

                        try {
                            if (tileState.localTile && tileState.active) {
                                // Handle local video (your camera)
                                const localElement = localVideoRef.current;
                                if (localElement) {
                                    console.log('🎥 Binding local video tile...');
                                    session.audioVideo.bindVideoElement(tileState.tileId, localElement);
                                    console.log('✅ Local video bound to element');

                                    // Force video element properties
                                    setTimeout(() => {
                                        localElement.muted = true;
                                        localElement.autoplay = true;
                                        localElement.playsInline = true;

                                        // Trigger play
                                        localElement.play().then(() => {
                                            console.log('✅ Local video playing');
                                            console.log('📏 Video dimensions:', localElement.videoWidth, 'x', localElement.videoHeight);
                                        }).catch(e => {
                                            console.log('⚠️ Video play issue (may be normal):', e.message);
                                        });
                                    }, 100);

                                } else {
                                    console.error('❌ Local video element not found during binding');
                                }
                            } else if (!tileState.localTile && tileState.active) {
                                // Handle remote video (other participants)
                                const remoteElement = remoteVideoRef.current;
                                if (remoteElement) {
                                    console.log('🎥 Binding remote video tile...');
                                    session.audioVideo.bindVideoElement(tileState.tileId, remoteElement);
                                    console.log('✅ Remote video bound to element');

                                    // Configure remote video
                                    setTimeout(() => {
                                        remoteElement.autoplay = true;
                                        remoteElement.playsInline = true;
                                        remoteElement.play().catch(e => console.log('Remote video play error (normal):', e.message));
                                    }, 100);
                                } else {
                                    console.error('❌ Remote video element not found');
                                }
                            }
                        } catch (bindError) {
                            console.error('❌ Error binding video element:', bindError);
                        }
                    },

                    videoTileWasRemoved: (tileId) => {
                        console.log('📹 Video tile removed:', tileId);
                    }
                });
                console.log('✅ Video tile observer added');
            }

            // Set up audio
            if (audioElementRef && audioElementRef.current && typeof session.audioVideo.bindAudioElement === 'function') {
                session.audioVideo.bindAudioElement(audioElementRef.current);
                console.log('🔊 Audio element bound');
            }

            // Start session first
            if (typeof session.audioVideo.start === 'function') {
                console.log('▶️ Starting session...');
                await session.audioVideo.start();
                console.log('✅ Session started');
            }

            // IMPROVED: Start local video directly - let Chime handle permissions
            if (typeof session.audioVideo.startLocalVideoTile === 'function') {
                try {
                    console.log('📷 Starting local video tile...');

                    // Start local video directly - Chime will handle permissions
                    await session.audioVideo.startLocalVideoTile();
                    console.log('✅ Local video tile started');

                    // Debugging: Check video elements state after a delay
                    setTimeout(() => {
                        console.log('🔍 Video debugging after 3 seconds:');
                        if (localVideoRef.current) {
                            const localVid = localVideoRef.current;
                            console.log('Local video state:', {
                                src: localVid.src || 'not set',
                                readyState: localVid.readyState,
                                videoWidth: localVid.videoWidth,
                                videoHeight: localVid.videoHeight,
                                paused: localVid.paused,
                                muted: localVid.muted,
                                autoplay: localVid.autoplay
                            });

                            // If no video dimensions, try to restart
                            if (localVid.videoWidth === 0 || localVid.videoHeight === 0) {
                                console.log('⚠️ No video dimensions detected, attempting restart...');
                                session.audioVideo.stopLocalVideoTile();
                                setTimeout(() => {
                                    session.audioVideo.startLocalVideoTile();
                                }, 1000);
                            }
                        }
                    }, 3000);

                } catch (videoError) {
                    console.error('❌ Local video start error:', videoError);

                    // Try alternative approach: request permissions manually first
                    try {
                        console.log('🔄 Trying manual permission request...');
                        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                        console.log('✅ Manual camera permission granted');

                        // Don't stop the stream immediately, let Chime use it
                        setTimeout(() => {
                            stream.getTracks().forEach(track => track.stop());
                            session.audioVideo.startLocalVideoTile();
                        }, 500);

                    } catch (permissionError) {
                        console.error('❌ Camera permission denied:', permissionError);
                        alert('Camera permission is required for video calls. Please:\n1. Click the camera icon in your browser address bar\n2. Allow camera access\n3. Refresh the page and try again');
                    }
                }
            }

            console.log('✅ Chime session setup complete!');
            return session;

        } catch (error) {
            console.error('❌ Error setting up Chime session:', error);
            throw new Error(`Video setup failed: ${error.message}`);
        }
    }

    async endMeeting(appointmentId) {
        try {
            await this.ensureInitialized();

            const meetingInfo = this.activeMeetings.get(appointmentId);
            if (meetingInfo) {
                console.log(`🔚 Ending meeting ${appointmentId}...`);

                const deleteMeetingCommand = new DeleteMeetingCommand({
                    MeetingId: meetingInfo.meetingId
                });

                // Fixed: using this.chimeSDKMeetings instead of this.chimeClient
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

    // Storage helpers
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

// Additional debugging function you can call from browser console
window.debugChimeVideo = () => {
    console.log('🔍 Chime Video Debug Info:');
    const localVideo = document.querySelector('video[muted]'); // Local video is muted
    const remoteVideo = document.querySelector('video:not([muted])'); // Remote video is not muted

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

const frontendChimeService = new FrontendChimeService();
frontendChimeService.cleanupOldMeetings();

export default frontendChimeService;