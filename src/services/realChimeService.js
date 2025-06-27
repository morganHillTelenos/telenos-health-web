// src/services/realChimeService.js - Production AWS Chime SDK Service
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

class RealChimeService {
    constructor() {
        this.activeMeetings = new Map();
        this.chimeSDKLoaded = !!ChimeSDK;
        this.isInitialized = false;
        console.log('☁️ Real Chime SDK Service initialized');
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
                console.log('⚠️ No AWS credentials available from Amplify session');
                throw new Error('No AWS credentials available. Please sign in through Cognito.');
            }

            console.log('✅ Amplify credentials found:', {
                accessKeyId: session.credentials.accessKeyId ? 'SET' : 'NOT SET',
                secretAccessKey: session.credentials.secretAccessKey ? 'SET' : 'NOT SET',
                sessionToken: session.credentials.sessionToken ? 'SET' : 'NOT SET',
            });

            this.chimeSDKMeetings = new ChimeSDKMeetingsClient({
                region: 'us-east-1',
                credentials: {
                    accessKeyId: session.credentials.accessKeyId,
                    secretAccessKey: session.credentials.secretAccessKey,
                    sessionToken: session.credentials.sessionToken,
                }
            });

            this.isInitialized = true;
            console.log('✅ Real Chime SDK client initialized with Amplify credentials');

        } catch (error) {
            console.error('❌ Failed to initialize Real Chime SDK:', error);
            throw error;
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
                ExternalMeetingId: `test-credentials-${Date.now()}`
            });

            const result = await this.chimeSDKMeetings.send(testCommand);
            console.log('✅ Credentials test successful - meeting created:', result.Meeting.MeetingId);

            // Clean up test meeting
            await this.chimeSDKMeetings.send(new DeleteMeetingCommand({
                MeetingId: result.Meeting.MeetingId
            }));
            console.log('✅ Test meeting cleaned up');

            return true;
        } catch (error) {
            console.error('❌ Credential test failed:', error);

            if (error.name === 'UnauthorizedOperation' || error.message.includes('not authorized')) {
                console.error('🚫 IAM Permission Issue: Your Cognito role needs Chime SDK permissions');
                console.error('💡 You need to attach the Chime SDK policy to your authenticated role');
            }

            return false;
        }
    }

    async createMeeting(appointmentId, userType = 'provider', userName = 'User') {
        try {
            await this.ensureInitialized();

            // Test credentials first
            const credentialsValid = await this.testCredentials();
            if (!credentialsValid) {
                throw new Error('AWS Chime SDK permissions not configured. Please check IAM policies.');
            }

            console.log(`☁️ Creating real Chime meeting for appointment ${appointmentId}...`);

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

            console.log(`✅ Real Chime meeting created: ${meeting.MeetingId}`);

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
                joinUrl: `${window.location.origin}/join/${appointmentId}`,
                isReal: true
            };

        } catch (error) {
            console.error('❌ Error creating real Chime meeting:', error);
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

            console.log(`☁️ ${userName} joining real Chime appointment ${appointmentId}...`);

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
                hostName: meetingInfo.userName,
                isReal: true
            };

        } catch (error) {
            console.error('❌ Error joining real Chime meeting:', error);
            return {
                success: false,
                error: error.message,
                code: error.name
            };
        }
    }

    async setupChimeSession(meeting, attendee, localVideoRef, remoteVideoRef, audioElementRef) {
        try {
            console.log('☁️ Setting up real Chime video session...');

            if (!this.chimeSDKLoaded || !ChimeSDK) {
                throw new Error('Chime SDK not properly loaded. Please refresh and try again.');
            }

            console.log('📦 Using real Chime SDK');

            // Create session
            const logger = new ChimeSDK.ConsoleLogger('VideoCall', ChimeSDK.LogLevel.INFO);
            const deviceController = new ChimeSDK.DefaultDeviceController(logger);
            const configuration = new ChimeSDK.MeetingSessionConfiguration(meeting, attendee);

            const session = new ChimeSDK.DefaultMeetingSession(configuration, logger, deviceController);
            console.log('✅ Real Chime session created');

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
                        console.log('📹 Real video tile updated:', {
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
                                    console.log('🎥 Binding real local video tile...');
                                    session.audioVideo.bindVideoElement(tileState.tileId, localElement);
                                    console.log('✅ Real local video bound to element');

                                    // Force video element properties
                                    setTimeout(() => {
                                        localElement.muted = true;
                                        localElement.autoplay = true;
                                        localElement.playsInline = true;

                                        // Trigger play
                                        localElement.play().then(() => {
                                            console.log('✅ Real local video playing');
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
                                    console.log('🎥 Binding real remote video tile...');
                                    session.audioVideo.bindVideoElement(tileState.tileId, remoteElement);
                                    console.log('✅ Real remote video bound to element');

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
                            console.error('❌ Error binding real video element:', bindError);
                        }
                    },

                    videoTileWasRemoved: (tileId) => {
                        console.log('📹 Real video tile removed:', tileId);
                    }
                });
                console.log('✅ Real video tile observer added');
            }

            // Set up audio
            if (audioElementRef && audioElementRef.current && typeof session.audioVideo.bindAudioElement === 'function') {
                session.audioVideo.bindAudioElement(audioElementRef.current);
                console.log('🔊 Real audio element bound');
            }

            // Start session first
            if (typeof session.audioVideo.start === 'function') {
                console.log('▶️ Starting real Chime session...');
                await session.audioVideo.start();
                console.log('✅ Real Chime session started');
            }

            // Start local video directly - let Chime handle permissions
            if (typeof session.audioVideo.startLocalVideoTile === 'function') {
                try {
                    console.log('📷 Starting real local video tile...');

                    // Start local video directly - Chime will handle permissions
                    await session.audioVideo.startLocalVideoTile();
                    console.log('✅ Real local video tile started');

                    // Debugging: Check video elements state after a delay
                    setTimeout(() => {
                        console.log('🔍 Real video debugging after 3 seconds:');
                        if (localVideoRef.current) {
                            const localVid = localVideoRef.current;
                            console.log('Real local video state:', {
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
                    console.error('❌ Real local video start error:', videoError);

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

            console.log('✅ Real Chime session setup complete!');
            return session;

        } catch (error) {
            console.error('❌ Error setting up real Chime session:', error);
            throw new Error(`Real video setup failed: ${error.message}`);
        }
    }

    async endMeeting(appointmentId) {
        try {
            await this.ensureInitialized();

            const meetingInfo = this.activeMeetings.get(appointmentId);
            if (meetingInfo) {
                console.log(`🔚 Ending real Chime meeting ${appointmentId}...`);

                const deleteMeetingCommand = new DeleteMeetingCommand({
                    MeetingId: meetingInfo.meetingId
                });

                await this.chimeSDKMeetings.send(deleteMeetingCommand);
                this.activeMeetings.delete(appointmentId);

                const meetings = JSON.parse(localStorage.getItem('chimeMeetings') || '{}');
                delete meetings[appointmentId];
                localStorage.setItem('chimeMeetings', JSON.stringify(meetings));

                console.log('✅ Real Chime meeting ended');
            }

            return { success: true };
        } catch (error) {
            console.error('Error ending real Chime meeting:', error);
            this.activeMeetings.delete(appointmentId);
            return { success: true };
        }
    }

    // Storage helper functions (needed by VideoCallPage)
    saveMeetingToStorage(appointmentId, meetingData) {
        try {
            const meetings = JSON.parse(localStorage.getItem('chimeMeetings') || '{}');
            meetings[appointmentId] = {
                ...meetingData,
                createdAt: meetingData.createdAt.toISOString()
            };
            localStorage.setItem('chimeMeetings', JSON.stringify(meetings));
            console.log('💾 Real meeting saved to storage');
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
                console.log('📂 Real meeting loaded from storage');
                return meetingData;
            }
            console.log('📂 No meeting found in storage for:', appointmentId);
        } catch (error) {
            console.error('Storage load error:', error);
        }
        return null;
    }

    // Clean up old meetings (compatibility function)
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
            console.log('🧹 Real meetings cleanup completed');
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    }
}

// Create and export the service instance
const realChimeService = new RealChimeService();

// Clean up old meetings on initialization
realChimeService.cleanupOldMeetings();

export default realChimeService;