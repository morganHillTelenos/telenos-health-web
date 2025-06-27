// src/services/productionChimeService.js
import {
    ChimeSDKMeetingsClient,
    CreateMeetingCommand,
    CreateAttendeeCommand,
    DeleteMeetingCommand,
    GetMeetingCommand,
    ListAttendeesCommand
} from '@aws-sdk/client-chime-sdk-meetings';

// Import Chime SDK JS
import {
    ConsoleLogger,
    DefaultDeviceController,
    DefaultMeetingSession,
    MeetingSessionConfiguration,
    LogLevel
} from 'amazon-chime-sdk-js';

class ProductionChimeService {
    constructor() {
        this.initializeChimeClient();
        this.activeMeetings = new Map();
        this.logger = new ConsoleLogger('TelenosChime', LogLevel.INFO);
        console.log('🏥 Production Chime Service initialized');
    }

    initializeChimeClient() {
        // Validate environment variables
        const region = process.env.REACT_APP_AWS_REGION;
        const accessKeyId = process.env.REACT_APP_AWS_ACCESS_KEY_ID;
        const secretAccessKey = process.env.REACT_APP_AWS_SECRET_ACCESS_KEY;

        console.log('Environment check:');
        console.log('- AWS Region:', region || 'NOT SET');
        console.log('- Access Key:', accessKeyId ? 'SET ✅' : 'NOT SET ❌');
        console.log('- Secret Key:', secretAccessKey ? 'SET ✅' : 'NOT SET ❌');

        if (!region || !accessKeyId || !secretAccessKey) {
            const error = 'Missing required AWS environment variables. Please check your .env file.';
            console.error('❌', error);
            throw new Error(error);
        }

        try {
            this.chimeClient = new ChimeSDKMeetingsClient({
                region: region,
                credentials: {
                    accessKeyId: accessKeyId,
                    secretAccessKey: secretAccessKey
                },
                maxAttempts: 3,
                retryMode: 'adaptive'
            });

            console.log('✅ Chime client initialized successfully');

        } catch (error) {
            console.error('❌ Failed to initialize Chime client:', error);
            throw new Error(`Chime initialization failed: ${error.message}`);
        }
    }

    async validateCredentials() {
        try {
            console.log('🔐 Validating AWS credentials...');

            // Create a test meeting to validate credentials
            const testCommand = new CreateMeetingCommand({
                ClientRequestToken: `credentials-test-${Date.now()}`,
                MediaRegion: process.env.REACT_APP_AWS_REGION,
                ExternalMeetingId: `credential-validation-test`
            });

            const testResponse = await this.chimeClient.send(testCommand);

            // Immediately delete the test meeting
            if (testResponse.Meeting) {
                await this.chimeClient.send(new DeleteMeetingCommand({
                    MeetingId: testResponse.Meeting.MeetingId
                }));
            }

            console.log('✅ AWS credentials validated successfully');
            return { valid: true, error: null };

        } catch (error) {
            console.error('❌ Credential validation failed:', error);

            let errorMessage = 'Unknown credential error';
            if (error.name === 'UnauthorizedOperation' || error.name === 'AccessDenied') {
                errorMessage = 'AWS credentials lack required permissions for Chime SDK';
            } else if (error.name === 'InvalidParameterException') {
                errorMessage = 'Invalid AWS credentials or region';
            } else if (error.message.includes('credential')) {
                errorMessage = 'Invalid AWS credentials';
            }

            return { valid: false, error: errorMessage };
        }
    }

    async createHealthcareMeeting(appointmentId, providerInfo = {}) {
        try {
            // Validate credentials first
            const credentialCheck = await this.validateCredentials();
            if (!credentialCheck.valid) {
                throw new Error(credentialCheck.error);
            }

            console.log(`🏥 Creating healthcare meeting for appointment ${appointmentId}...`);

            const createMeetingCommand = new CreateMeetingCommand({
                ClientRequestToken: `telenos-healthcare-${appointmentId}-${Date.now()}`,
                MediaRegion: process.env.REACT_APP_AWS_REGION,
                ExternalMeetingId: `healthcare-consult-${appointmentId}`,
                MeetingFeatures: {
                    Audio: {
                        EchoReduction: 'AVAILABLE'
                    },
                    Video: {
                        MaxResolution: 'HD'
                    }
                },
                Tags: [
                    { Key: 'Application', Value: 'TelenosHealth' },
                    { Key: 'Type', Value: 'HealthcareConsultation' },
                    { Key: 'AppointmentId', Value: appointmentId.toString() },
                    { Key: 'HIPAA', Value: 'Compliant' },
                    { Key: 'CreatedBy', Value: providerInfo.name || 'Unknown' },
                    { Key: 'Department', Value: providerInfo.department || 'General' }
                ]
            });

            const meetingResponse = await this.chimeClient.send(createMeetingCommand);
            const meeting = meetingResponse.Meeting;

            console.log(`✅ Healthcare meeting created: ${meeting.MeetingId}`);

            // Create provider attendee
            const providerAttendee = await this.createAttendee(
                meeting.MeetingId,
                'provider',
                providerInfo.id || `provider-${Date.now()}`
            );

            const meetingInfo = {
                meeting: meeting,
                meetingId: meeting.MeetingId,
                appointmentId: appointmentId,
                createdAt: new Date(),
                createdBy: 'provider',
                providerInfo: providerInfo,
                attendees: [providerAttendee.attendee],
                status: 'active'
            };

            this.activeMeetings.set(appointmentId, meetingInfo);
            this.saveMeetingToStorage(appointmentId, meetingInfo);

            return {
                success: true,
                meeting: meeting,
                providerAttendee: providerAttendee.attendee,
                appointmentId: appointmentId,
                joinUrl: `${window.location.origin}/video-call/${appointmentId}`,
                meetingId: meeting.MeetingId
            };

        } catch (error) {
            console.error('❌ Error creating healthcare meeting:', error);
            return {
                success: false,
                error: error.message,
                code: error.name || 'UnknownError'
            };
        }
    }

    async createAttendee(meetingId, userType, externalUserId) {
        try {
            const attendeeCommand = new CreateAttendeeCommand({
                MeetingId: meetingId,
                ExternalUserId: externalUserId,
                Capabilities: {
                    Audio: 'SendReceive',
                    Video: 'SendReceive',
                    Content: userType === 'provider' ? 'SendReceive' : 'Receive'
                }
            });

            const attendeeResponse = await this.chimeClient.send(attendeeCommand);
            console.log(`✅ ${userType} attendee created:`, attendeeResponse.Attendee.AttendeeId);

            return {
                success: true,
                attendee: attendeeResponse.Attendee
            };

        } catch (error) {
            console.error(`❌ Error creating ${userType} attendee:`, error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async joinMeetingAsPatient(appointmentId, patientInfo = {}) {
        try {
            console.log(`🏥 Patient joining appointment ${appointmentId}...`);

            let meetingInfo = this.activeMeetings.get(appointmentId);
            if (!meetingInfo) {
                meetingInfo = this.loadMeetingFromStorage(appointmentId);
            }

            if (!meetingInfo) {
                throw new Error('Healthcare consultation not found. Please ensure your provider has started the session.');
            }

            // Verify meeting is still active on AWS
            try {
                await this.chimeClient.send(new GetMeetingCommand({
                    MeetingId: meetingInfo.meetingId
                }));
            } catch (error) {
                throw new Error('This consultation session has expired. Please contact your healthcare provider.');
            }

            // Create patient attendee
            const patientAttendee = await this.createAttendee(
                meetingInfo.meetingId,
                'patient',
                patientInfo.id || `patient-${Date.now()}`
            );

            if (!patientAttendee.success) {
                throw new Error(patientAttendee.error);
            }

            // Update meeting info with patient
            meetingInfo.attendees.push(patientAttendee.attendee);
            meetingInfo.patientInfo = patientInfo;
            this.activeMeetings.set(appointmentId, meetingInfo);
            this.saveMeetingToStorage(appointmentId, meetingInfo);

            return {
                success: true,
                meeting: meetingInfo.meeting,
                attendee: patientAttendee.attendee,
                appointmentId: appointmentId,
                providerName: meetingInfo.providerInfo?.name || 'Your Healthcare Provider'
            };

        } catch (error) {
            console.error('❌ Error joining healthcare consultation:', error);
            return {
                success: false,
                error: error.message,
                code: error.name || 'UnknownError'
            };
        }
    }

    async setupMeetingSession(meeting, attendee, videoElements) {
        try {
            console.log('🎥 Setting up healthcare meeting session...');

            const { localVideoRef, remoteVideoRef, audioElementRef } = videoElements;

            // Create meeting session configuration
            const configuration = new MeetingSessionConfiguration(meeting, attendee);
            const deviceController = new DefaultDeviceController(this.logger);
            const session = new DefaultMeetingSession(configuration, this.logger, deviceController);

            console.log('✅ Meeting session created');

            // Set up video tile observers
            session.audioVideo.addVideoTileObserver({
                videoTileDidUpdate: (tileState) => {
                    console.log('📹 Video tile updated:', {
                        tileId: tileState.tileId,
                        localTile: tileState.localTile,
                        active: tileState.active
                    });

                    if (tileState.localTile && localVideoRef.current) {
                        // Local video (your camera)
                        session.audioVideo.bindVideoElement(tileState.tileId, localVideoRef.current);
                        localVideoRef.current.muted = true;
                        console.log('✅ Local video bound');
                    } else if (!tileState.localTile && remoteVideoRef.current) {
                        // Remote video (other participant)
                        session.audioVideo.bindVideoElement(tileState.tileId, remoteVideoRef.current);
                        console.log('✅ Remote video bound');
                    }
                },

                videoTileWasRemoved: (tileId) => {
                    console.log('📹 Video tile removed:', tileId);
                }
            });

            // Set up audio element
            if (audioElementRef.current) {
                session.audioVideo.bindAudioElement(audioElementRef.current);
                console.log('✅ Audio element bound');
            }

            // Start the session
            session.audioVideo.start();
            console.log('✅ Meeting session started');

            // Start local video
            try {
                await this.requestCameraPermission();
                session.audioVideo.startLocalVideoTile();
                console.log('✅ Local video started');
            } catch (error) {
                console.error('❌ Camera permission error:', error);
                alert('Camera access is required for video consultations. Please allow camera access and refresh.');
            }

            return session;

        } catch (error) {
            console.error('❌ Error setting up meeting session:', error);
            throw new Error(`Session setup failed: ${error.message}`);
        }
    }

    async requestCameraPermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            // Stop the test stream
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error) {
            throw new Error('Camera and microphone access required');
        }
    }

    async endMeeting(appointmentId) {
        try {
            const meetingInfo = this.activeMeetings.get(appointmentId);
            if (meetingInfo) {
                console.log(`🔚 Ending healthcare consultation ${appointmentId}...`);

                const deleteMeetingCommand = new DeleteMeetingCommand({
                    MeetingId: meetingInfo.meetingId
                });

                await this.chimeClient.send(deleteMeetingCommand);
                this.activeMeetings.delete(appointmentId);

                // Clean up storage
                const meetings = JSON.parse(localStorage.getItem('chimeMeetings') || '{}');
                delete meetings[appointmentId];
                localStorage.setItem('chimeMeetings', JSON.stringify(meetings));

                console.log('✅ Healthcare consultation ended');
            }

            return { success: true };
        } catch (error) {
            console.error('❌ Error ending meeting:', error);
            // Still clean up locally even if AWS call fails
            this.activeMeetings.delete(appointmentId);
            return { success: true, warning: 'Meeting ended locally but AWS cleanup may have failed' };
        }
    }

    // Storage helpers
    saveMeetingToStorage(appointmentId, meetingData) {
        try {
            const meetings = JSON.parse(localStorage.getItem('chimeMeetings') || '{}');
            meetings[appointmentId] = {
                ...meetingData,
                createdAt: meetingData.createdAt.toISOString(),
                status: meetingData.status || 'active'
            };
            localStorage.setItem('chimeMeetings', JSON.stringify(meetings));
        } catch (error) {
            console.error('❌ Storage error:', error);
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
            return null;
        } catch (error) {
            console.error('❌ Storage load error:', error);
            return null;
        }
    }

    // Utility methods
    getMeetingStatus(appointmentId) {
        const meetingInfo = this.activeMeetings.get(appointmentId);
        return meetingInfo ? meetingInfo.status : 'not_found';
    }

    async listActiveMeetings() {
        return Array.from(this.activeMeetings.entries()).map(([appointmentId, meetingInfo]) => ({
            appointmentId,
            meetingId: meetingInfo.meetingId,
            createdAt: meetingInfo.createdAt,
            attendeeCount: meetingInfo.attendees?.length || 0,
            status: meetingInfo.status
        }));
    }
}

// Export singleton instance
export const chimeService = new ProductionChimeService();
export default chimeService;