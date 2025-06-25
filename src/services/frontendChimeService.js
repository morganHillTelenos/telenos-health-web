// src/services/frontendChimeService.js - Compatible Version
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
        this.initializeChimeClient();
        this.activeMeetings = new Map();
        this.chimeSDKLoaded = !!ChimeSDK;
        console.log('📦 Chime SDK loaded:', this.chimeSDKLoaded);
    }
    async initializeChimeClient() {
        try {
            // Get credentials from Amplify's current session
            const session = await fetchAuthSession();

            if (!session.credentials) {
                throw new Error('No AWS credentials available. Please sign in.');
            }

            this.chimeSDKMeetings = new ChimeSDKMeetingsClient({
                region: 'us-east-1',
                credentials: {
                    accessKeyId: session.credentials.accessKeyId,
                    secretAccessKey: session.credentials.secretAccessKey,
                    sessionToken: session.credentials.sessionToken,
                }
            });

            console.log('Chime SDK initialized with Amplify credentials');

        } catch (error) {
            console.error('Failed to initialize Chime SDK:', error);
            throw error;
        }
    }


    // initializeChimeClient() {
    //     console.log('Environment check:');
    //     console.log('- AWS Region:', process.env.REACT_APP_AWS_REGION || 'NOT SET');
    //     console.log('- Access Key:', process.env.REACT_APP_AWS_ACCESS_KEY_ID ? 'SET' : 'NOT SET');
    //     console.log('- Secret Key:', process.env.REACT_APP_AWS_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET');

    //     const region = process.env.REACT_APP_AWS_REGION || 'us-east-1';
    //     const accessKeyId = process.env.REACT_APP_AWS_ACCESS_KEY_ID;
    //     const secretAccessKey = process.env.REACT_APP_AWS_SECRET_ACCESS_KEY;

    //     if (!accessKeyId || !secretAccessKey) {
    //         console.error('❌ AWS credentials not found');
    //         throw new Error('AWS credentials not configured');
    //     }

    //     try {
    //         this.chimeClient = new ChimeSDKMeetingsClient({
    //             region: region,
    //             credentials: { accessKeyId, secretAccessKey },
    //             maxAttempts: 3
    //         });

    //         console.log('✅ Chime client initialized successfully');

    //     } catch (error) {
    //         console.error('❌ Failed to initialize Chime client:', error);
    //         throw error;
    //     }
    // }

    async testCredentials() {
        try {
            console.log('🧪 Testing AWS credentials...');

            const testCommand = new CreateMeetingCommand({
                ClientRequestToken: `test-${Date.now()}`,
                MediaRegion: process.env.REACT_APP_AWS_REGION || 'us-east-1',
                ExternalMeetingId: `test-credentials`
            });

            await this.chimeClient.send(testCommand);
            console.log('✅ Credentials are valid');
            return true;
        } catch (error) {
            if (error.name === 'CredentialsProviderError' || error.message.includes('credential')) {
                console.error('❌ Credential error:', error.message);
                return false;
            }
            console.log('✅ Credentials appear valid');
            return true;
        }
    }

    async createMeeting(appointmentId, userType = 'provider', userName = 'User') {
        try {
            const credentialsValid = await this.testCredentials();
            if (!credentialsValid) {
                throw new Error('Invalid AWS credentials');
            }

            console.log(`Creating meeting for appointment ${appointmentId}...`);

            const createMeetingCommand = new CreateMeetingCommand({
                ClientRequestToken: `telenos-${appointmentId}-${Date.now()}`,
                MediaRegion: process.env.REACT_APP_AWS_REGION || 'us-east-1',
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

            const meetingResponse = await this.chimeClient.send(createMeetingCommand);
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

            const attendeeResponse = await this.chimeClient.send(attendeeCommand);

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

            const attendeeResponse = await this.chimeClient.send(attendeeCommand);

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
            }

            // Set up video tile observer with improved handling
            if (typeof session.audioVideo.addVideoTileObserver === 'function') {
                session.audioVideo.addVideoTileObserver({
                    videoTileDidUpdate: (tileState) => {
                        console.log('📹 Video tile updated:', {
                            tileId: tileState.tileId,
                            localTile: tileState.localTile,
                            active: tileState.active,
                            paused: tileState.paused,
                            isContent: tileState.isContent
                        });

                        try {
                            if (tileState.localTile) {
                                // Handle local video (your camera)
                                const localElement = localVideoRef.current;
                                if (localElement) {
                                    session.audioVideo.bindVideoElement(tileState.tileId, localElement);
                                    console.log('✅ Local video bound to element');

                                    // Ensure video element is properly configured
                                    localElement.muted = true; // Local video should be muted
                                    localElement.autoplay = true;
                                    localElement.playsInline = true;

                                    // Force play if needed
                                    localElement.play().catch(e => console.log('Video play error (normal):', e.message));

                                    console.log('✅ Local video element configured');
                                } else {
                                    console.error('❌ Local video element not found');
                                }
                            } else {
                                // Handle remote video (other participants)
                                const remoteElement = remoteVideoRef.current;
                                if (remoteElement) {
                                    session.audioVideo.bindVideoElement(tileState.tileId, remoteElement);
                                    console.log('✅ Remote video bound to element');

                                    // Configure remote video
                                    remoteElement.autoplay = true;
                                    remoteElement.playsInline = true;
                                    remoteElement.play().catch(e => console.log('Video play error (normal):', e.message));
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

            // Request camera permissions explicitly and start local video
            if (typeof session.audioVideo.startLocalVideoTile === 'function') {
                try {
                    console.log('📷 Requesting camera permissions...');

                    // Check if we can get user media first
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: true,
                        audio: false
                    });

                    if (stream) {
                        console.log('✅ Camera permission granted');
                        // Stop the test stream
                        stream.getTracks().forEach(track => track.stop());

                        // Now start Chime local video
                        console.log('📷 Starting Chime local video tile...');
                        session.audioVideo.startLocalVideoTile();
                        console.log('✅ Local video tile started');

                        // Give it a moment to initialize
                        setTimeout(() => {
                            console.log('🔍 Checking video elements after start:');
                            if (localVideoRef.current) {
                                console.log('- Local video src:', localVideoRef.current.src || 'not set');
                                console.log('- Local video ready state:', localVideoRef.current.readyState);
                                console.log('- Local video dimensions:', localVideoRef.current.videoWidth, 'x', localVideoRef.current.videoHeight);
                            }
                        }, 2000);

                    }
                } catch (permissionError) {
                    console.error('❌ Camera permission denied or error:', permissionError);
                    alert('Camera permission is required for video calls. Please allow camera access and refresh the page.');
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
            const meetingInfo = this.activeMeetings.get(appointmentId);
            if (meetingInfo) {
                console.log(`🔚 Ending meeting ${appointmentId}...`);

                const deleteMeetingCommand = new DeleteMeetingCommand({
                    MeetingId: meetingInfo.meetingId
                });

                await this.chimeClient.send(deleteMeetingCommand);
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

const frontendChimeService = new FrontendChimeService();
frontendChimeService.cleanupOldMeetings();

export default frontendChimeService;