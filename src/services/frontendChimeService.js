// src/services/frontendChimeService.js - FIXED for Amplify
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
        this.chimeClient = null;
        console.log('📦 Chime SDK loaded:', this.chimeSDKLoaded);
    }

    async initializeChimeClient() {
        try {
            console.log('🔧 Initializing Chime client with Amplify credentials...');

            // Get Amplify session with credentials
            const session = await fetchAuthSession();

            if (!session.credentials) {
                throw new Error('No AWS credentials available from Amplify');
            }

            console.log('✅ Got Amplify credentials');
            console.log('- Region:', session.credentials.region || 'us-east-1');
            console.log('- Identity ID:', session.identityId || 'Not available');

            // Create Chime client with Amplify credentials
            this.chimeClient = new ChimeSDKMeetingsClient({
                region: 'us-east-1', // Your region
                credentials: {
                    accessKeyId: session.credentials.accessKeyId,
                    secretAccessKey: session.credentials.secretAccessKey,
                    sessionToken: session.credentials.sessionToken, // Important for temporary credentials
                },
                maxAttempts: 3
            });

            console.log('✅ Chime client initialized with Amplify credentials');
            return true;

        } catch (error) {
            console.error('❌ Failed to initialize Chime client:', error);
            throw error;
        }
    }

    async testCredentials() {
        try {
            if (!this.chimeClient) {
                await this.initializeChimeClient();
            }

            console.log('🧪 Testing AWS credentials...');

            const testCommand = new CreateMeetingCommand({
                ClientRequestToken: `test-${Date.now()}`,
                MediaRegion: 'us-east-1',
                ExternalMeetingId: `test-credentials`
            });

            await this.chimeClient.send(testCommand);
            console.log('✅ Credentials are valid');
            return true;
        } catch (error) {
            console.error('❌ Credential test failed:', error);

            if (error.name === 'AccessDeniedException') {
                console.error('IAM permissions issue. Check if the role has chime:CreateMeeting permission');
            } else if (error.name === 'CredentialsProviderError') {
                console.error('Credential provider error. Trying to re-initialize...');
                try {
                    await this.initializeChimeClient();
                    return true;
                } catch (retryError) {
                    console.error('Re-initialization failed:', retryError);
                }
            }

            return false;
        }
    }

    async createMeeting(appointmentId, userType = 'provider', userName = 'User') {
        try {
            // Ensure client is initialized
            if (!this.chimeClient) {
                await this.initializeChimeClient();
            }

            const credentialsValid = await this.testCredentials();
            if (!credentialsValid) {
                throw new Error('Invalid AWS credentials or insufficient permissions');
            }

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
            // Ensure client is initialized
            if (!this.chimeClient) {
                await this.initializeChimeClient();
            }

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

            const logger = new ChimeSDK.ConsoleLogger('TelenosHealth', ChimeSDK.LogLevel.INFO);
            const deviceController = new ChimeSDK.DefaultDeviceController(logger);

            const configuration = new ChimeSDK.MeetingSessionConfiguration(meeting, attendee);
            const session = new ChimeSDK.DefaultMeetingSession(configuration, logger, deviceController);

            // Set up video tile observers
            const videoTileObserver = {
                videoTileDidUpdate: (tileState) => {
                    console.log(`📺 Video tile updated:`, tileState);

                    if (tileState.localTile && localVideoRef.current) {
                        console.log('🎥 Binding local video tile');
                        session.audioVideo.bindVideoElement(tileState.tileId, localVideoRef.current);
                    } else if (!tileState.localTile && remoteVideoRef.current) {
                        console.log('📡 Binding remote video tile');
                        session.audioVideo.bindVideoElement(tileState.tileId, remoteVideoRef.current);
                    }
                },

                videoTileWasRemoved: (tileId) => {
                    console.log(`📺 Video tile removed: ${tileId}`);
                }
            };

            session.audioVideo.addVideoTileObserver(videoTileObserver);

            // Set up audio
            if (audioElementRef && audioElementRef.current) {
                session.audioVideo.bindAudioElement(audioElementRef.current);
            }

            // Start the session
            if (typeof session.audioVideo.start === 'function') {
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

            return {
                session,
                deviceController,
                meetingSession: session,
                audioVideo: session.audioVideo
            };

        } catch (error) {
            console.error('❌ Error setting up Chime session:', error);
            throw error;
        }
    }

    // Utility methods
    saveMeetingToStorage(appointmentId, meetingInfo) {
        try {
            const meetings = JSON.parse(localStorage.getItem('active_meetings') || '{}');
            meetings[appointmentId] = meetingInfo;
            localStorage.setItem('active_meetings', JSON.stringify(meetings));
            console.log(`💾 Meeting ${appointmentId} saved to storage`);
        } catch (error) {
            console.error('Error saving meeting to storage:', error);
        }
    }

    loadMeetingFromStorage(appointmentId) {
        try {
            const meetings = JSON.parse(localStorage.getItem('active_meetings') || '{}');
            const meetingInfo = meetings[appointmentId];
            if (meetingInfo) {
                console.log(`📂 Meeting ${appointmentId} loaded from storage`);
                this.activeMeetings.set(appointmentId, meetingInfo);
                return meetingInfo;
            }
            return null;
        } catch (error) {
            console.error('Error loading meeting from storage:', error);
            return null;
        }
    }

    async deleteMeeting(appointmentId) {
        try {
            const meetingInfo = this.activeMeetings.get(appointmentId) || this.loadMeetingFromStorage(appointmentId);

            if (!meetingInfo) {
                console.log(`Meeting ${appointmentId} not found`);
                return { success: true, message: 'Meeting not found' };
            }

            // Ensure client is initialized
            if (!this.chimeClient) {
                await this.initializeChimeClient();
            }

            const deleteCommand = new DeleteMeetingCommand({
                MeetingId: meetingInfo.meetingId
            });

            await this.chimeClient.send(deleteCommand);

            // Clean up local storage
            this.activeMeetings.delete(appointmentId);
            const meetings = JSON.parse(localStorage.getItem('active_meetings') || '{}');
            delete meetings[appointmentId];
            localStorage.setItem('active_meetings', JSON.stringify(meetings));

            console.log(`✅ Meeting ${appointmentId} deleted successfully`);
            return { success: true };

        } catch (error) {
            console.error('❌ Error deleting meeting:', error);
            return { success: false, error: error.message };
        }
    }
}

export default FrontendChimeService;