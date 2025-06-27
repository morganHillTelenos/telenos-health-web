// src/services/frontendChimeService.js - DEBUG VERSION
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

            console.log('📋 SESSION DEBUG INFO:');
            console.log('- Identity ID:', session.identityId);
            console.log('- Auth Status:', session.tokens ? 'AUTHENTICATED' : 'UNAUTHENTICATED');
            console.log('- Credentials Available:', !!session.credentials);

            if (session.credentials) {
                // Don't log the actual keys for security, just show they exist
                console.log('- Access Key ID exists:', !!session.credentials.accessKeyId);
                console.log('- Secret Key exists:', !!session.credentials.secretAccessKey);
                console.log('- Session Token exists:', !!session.credentials.sessionToken);
                console.log('- Credentials Expiration:', session.credentials.expiration);
            }

            if (!session.credentials) {
                throw new Error('No AWS credentials available from Amplify');
            }

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

            console.log('🧪 Testing AWS credentials with a simple CreateMeeting call...');

            const testCommand = new CreateMeetingCommand({
                ClientRequestToken: `test-${Date.now()}`,
                MediaRegion: 'us-east-1',
                ExternalMeetingId: `test-credentials-${Date.now()}`
            });

            console.log('📤 Sending test CreateMeeting command...');
            await this.chimeClient.send(testCommand);
            console.log('✅ Credentials are valid - test meeting created successfully');
            return true;

        } catch (error) {
            console.error('❌ Credential test failed:', error);
            console.error('❌ Error Name:', error.name);
            console.error('❌ Error Message:', error.message);

            if (error.name === 'AccessDeniedException') {
                console.error('🚫 IAM PERMISSIONS ISSUE DETECTED!');
                console.error('The current IAM role does not have chime:CreateMeeting permission');
                console.error('Check the following:');
                console.error('1. Go to AWS IAM Console');
                console.error('2. Find the role being used (check the Identity ID above)');
                console.error('3. Add ChimeSDK permissions to that specific role');

                // Try to extract role info from error
                if (error.message.includes('arn:aws:sts::')) {
                    const arnMatch = error.message.match(/arn:aws:sts::[^\/]+\/([^\/]+)/);
                    if (arnMatch) {
                        console.error('🎯 EXACT ROLE TO FIX:', arnMatch[1]);
                    }
                }
            } else if (error.name === 'CredentialsProviderError') {
                console.error('🔑 Credential provider error. Trying to re-initialize...');
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
            console.log('🎬 Creating meeting for appointment:', appointmentId);

            // Ensure client is initialized
            if (!this.chimeClient) {
                console.log('🔧 Client not initialized, initializing now...');
                await this.initializeChimeClient();
            }

            // Test credentials first
            console.log('🧪 Testing credentials before creating meeting...');
            const credentialsValid = await this.testCredentials();
            if (!credentialsValid) {
                throw new Error('Invalid AWS credentials or insufficient permissions');
            }

            console.log(`🚀 Creating meeting for appointment ${appointmentId}...`);

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

            console.log('📤 Sending CreateMeeting command...');
            const meetingResponse = await this.chimeClient.send(createMeetingCommand);
            const meeting = meetingResponse.Meeting;

            console.log(`✅ Meeting created successfully: ${meeting.MeetingId}`);

            const attendeeCommand = new CreateAttendeeCommand({
                MeetingId: meeting.MeetingId,
                ExternalUserId: `${userType}-${Date.now()}`,
                Capabilities: {
                    Audio: 'SendReceive',
                    Video: 'SendReceive',
                    Content: userType === 'provider' ? 'SendReceive' : 'Receive'
                }
            });

            console.log('📤 Creating attendee...');
            const attendeeResponse = await this.chimeClient.send(attendeeCommand);
            console.log('✅ Attendee created successfully');

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

            console.log('🎉 Meeting setup complete!');
            return {
                success: true,
                meeting: meeting,
                attendee: attendeeResponse.Attendee,
                appointmentId: appointmentId,
                joinUrl: `${window.location.origin}/join/${appointmentId}`
            };

        } catch (error) {
            console.error('❌ Error creating meeting:', error);
            console.error('❌ Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });

            return {
                success: false,
                error: error.message,
                code: error.name
            };
        }
    }

    async joinExistingMeeting(appointmentId, userType = 'patient', userName = 'Patient') {
        try {
            console.log(`👤 ${userName} attempting to join appointment ${appointmentId}...`);

            // Ensure client is initialized
            if (!this.chimeClient) {
                console.log('🔧 Client not initialized for patient, initializing now...');
                await this.initializeChimeClient();
            }

            let meetingInfo = this.activeMeetings.get(appointmentId);
            if (!meetingInfo) {
                console.log('📂 Meeting not in memory, checking storage...');
                meetingInfo = this.loadMeetingFromStorage(appointmentId);
            }

            if (!meetingInfo) {
                throw new Error('Meeting not found. Please ask your healthcare provider to start the session first.');
            }

            console.log('✅ Meeting info found, creating attendee...');

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
            console.log('✅ Patient attendee created successfully');

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

    // Note: Other methods like setupChimeSession, deleteMeeting etc. would go here
    // Keeping this shorter for debugging focus
}

export default FrontendChimeService;