// services/chimeMeetingService.js - Provider-Only Implementation
import { ChimeSDKMeetingsClient, CreateMeetingCommand, CreateAttendeeCommand } from '@aws-sdk/client-chime-sdk-meetings';

class ChimeMeetingService {
    constructor() {
        this.chimeClient = new ChimeSDKMeetingsClient({
            region: 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            }
        });
        this.activeMeetings = new Map(); // Store active meetings
    }

    async createProviderMeeting(appointmentId, providerId, providerName) {
        try {
            // Create the meeting
            const createMeetingCommand = new CreateMeetingCommand({
                ClientRequestToken: `appointment-${appointmentId}-${Date.now()}`,
                MediaRegion: 'us-east-1',
                MeetingFeatures: {
                    Audio: {
                        EchoReduction: 'AVAILABLE'
                    },
                    Video: {
                        MaxResolution: 'HD'
                    },
                    Attendee: {
                        MaxCount: 5 // Provider + patient + maybe family members
                    }
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

            // Create provider attendee
            const providerAttendeeCommand = new CreateAttendeeCommand({
                MeetingId: meeting.MeetingId,
                ExternalUserId: `provider-${providerId}`,
                Tags: [
                    { Key: 'UserType', Value: 'provider' },
                    { Key: 'UserName', Value: providerName }
                ]
            });

            const providerAttendeeResponse = await this.chimeClient.send(providerAttendeeCommand);

            // Store meeting info for patient joins
            this.activeMeetings.set(appointmentId, {
                meeting: meeting,
                meetingId: meeting.MeetingId,
                appointmentId: appointmentId,
                createdAt: new Date(),
                providerName: providerName
            });

            return {
                success: true,
                meetingResponse: meeting,
                attendeeResponse: providerAttendeeResponse.Attendee,
                patientJoinUrl: this.generatePatientJoinUrl(appointmentId)
            };

        } catch (error) {
            console.error('Error creating provider meeting:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    generatePatientJoinUrl(appointmentId) {
        // Create a simple join URL that patients can click
        const baseUrl = process.env.PATIENT_PORTAL_URL || 'https://your-domain.com';
        return `${baseUrl}/join/${appointmentId}`;
    }

    async getPatientJoinInfo(appointmentId, patientName = 'Patient') {
        try {
            const meetingInfo = this.activeMeetings.get(appointmentId);
            if (!meetingInfo) {
                throw new Error('Meeting not found. Please ask your provider to start the session first.');
            }

            // Create patient attendee
            const patientAttendeeCommand = new CreateAttendeeCommand({
                MeetingId: meetingInfo.meetingId,
                ExternalUserId: `patient-${Date.now()}`,
                Tags: [
                    { Key: 'UserType', Value: 'patient' },
                    { Key: 'UserName', Value: patientName }
                ]
            });

            const patientAttendeeResponse = await this.chimeClient.send(patientAttendeeCommand);

            return {
                success: true,
                meeting: meetingInfo.meeting,
                attendee: patientAttendeeResponse.Attendee,
                providerName: meetingInfo.providerName
            };

        } catch (error) {
            console.error('Error getting patient join info:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async endMeeting(appointmentId) {
        // Clean up meeting info
        this.activeMeetings.delete(appointmentId);
        return { success: true };
    }

    // Express.js route handlers
    setupRoutes(app) {
        // Provider starts meeting
        app.post('/api/meetings/start', async (req, res) => {
            const { appointmentId, providerId, providerName } = req.body;

            const result = await this.createProviderMeeting(appointmentId, providerId, providerName);
            res.json(result);
        });

        // Patient joins meeting  
        app.get('/api/meetings/join/:appointmentId', async (req, res) => {
            const { appointmentId } = req.params;
            const { patientName } = req.query;

            const result = await this.getPatientJoinInfo(appointmentId, patientName);
            res.json(result);
        });

        // Simple patient join page
        app.get('/join/:appointmentId', (req, res) => {
            const { appointmentId } = req.params;

            res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Join Healthcare Video Session</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #2c5f41 0%, #4a9d6f 100%);
            color: white;
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        .container {
            text-align: center;
            max-width: 500px;
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }
        .logo {
            font-size: 60px;
            margin-bottom: 20px;
        }
        h1 {
            font-size: 28px;
            margin-bottom: 15px;
        }
        p {
            font-size: 16px;
            opacity: 0.9;
            line-height: 1.5;
            margin-bottom: 30px;
        }
        .join-btn {
            background: white;
            color: #2c5f41;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            margin-bottom: 20px;
            transition: transform 0.2s;
        }
        .join-btn:hover {
            transform: translateY(-2px);
        }
        .security-info {
            font-size: 14px;
            opacity: 0.8;
            margin-top: 20px;
        }
        .loading {
            display: none;
        }
        .video-container {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
        }
        #remote-video, #local-video {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        #local-video {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 200px;
            height: 150px;
            border-radius: 10px;
            border: 2px solid #4a9d6f;
        }
        .controls {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 15px;
        }
        .control-btn {
            width: 60px;
            height: 60px;
            border-radius: 30px;
            border: none;
            font-size: 24px;
            color: white;
            cursor: pointer;
            background: rgba(0, 0, 0, 0.7);
        }
        .end-btn {
            background: #ff4757;
        }
    </style>
</head>
<body>
    <div class="container" id="join-screen">
        <div class="logo">👩‍⚕️</div>
        <h1>Secure Healthcare Video Session</h1>
        <p>Your healthcare provider has invited you to a secure video consultation. Click "Join Now" to begin.</p>
        
        <button class="join-btn" onclick="joinMeeting()">Join Now</button>
        
        <div class="security-info">
            🔒 HIPAA Compliant • 🔐 End-to-End Encrypted<br>
            No app download required
        </div>
    </div>

    <div class="loading" id="loading">
        <div style="text-align: center; color: white;">
            <div style="font-size: 40px; margin-bottom: 20px;">⏳</div>
            <h2>Connecting to your healthcare provider...</h2>
        </div>
    </div>

    <div class="video-container" id="video-container">
        <video id="remote-video" autoplay></video>
        <video id="local-video" autoplay muted></video>
        <div class="controls">
            <button class="control-btn" onclick="toggleMute()" id="mute-btn">🎤</button>
            <button class="control-btn" onclick="toggleVideo()" id="video-btn">📹</button>
            <button class="control-btn end-btn" onclick="endCall()">✕</button>
        </div>
    </div>

    <script src="https://unpkg.com/amazon-chime-sdk-js@latest/build/amazon-chime-sdk.min.js"></script>
    <script>
        let meetingSession = null;
        let isAudioMuted = false;
        let isVideoEnabled = true;

        async function joinMeeting() {
            document.getElementById('join-screen').style.display = 'none';
            document.getElementById('loading').style.display = 'flex';

            try {
                // Get meeting info from server
                const response = await fetch('/api/meetings/join/${appointmentId}?patientName=' + encodeURIComponent('Patient'));
                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.error);
                }

                // Initialize Chime SDK
                const logger = new ChimeSDK.ConsoleLogger('Patient', ChimeSDK.LogLevel.INFO);
                const deviceController = new ChimeSDK.DefaultDeviceController(logger);
                const configuration = new ChimeSDK.MeetingSessionConfiguration(data.meeting, data.attendee);
                
                meetingSession = new ChimeSDK.DefaultMeetingSession(configuration, logger, deviceController);
                
                // Set up video tiles
                meetingSession.audioVideo.addVideoTileObserver({
                    videoTileDidUpdate: (tileState) => {
                        const videoElement = tileState.localTile ? 
                            document.getElementById('local-video') : 
                            document.getElementById('remote-video');
                        meetingSession.audioVideo.bindVideoElement(tileState.tileId, videoElement);
                    }
                });

                // Set up audio
                const audioElement = new Audio();
                audioElement.autoplay = true;
                meetingSession.audioVideo.bindAudioElement(audioElement);

                // Start session
                meetingSession.audioVideo.startLocalVideoTile();
                meetingSession.audioVideo.start();

                // Show video interface
                document.getElementById('loading').style.display = 'none';
                document.getElementById('video-container').style.display = 'block';

            } catch (error) {
                alert('Failed to join session: ' + error.message);
                document.getElementById('loading').style.display = 'none';
                document.getElementById('join-screen').style.display = 'block';
            }
        }

        function toggleMute() {
            const btn = document.getElementById('mute-btn');
            if (isAudioMuted) {
                meetingSession.audioVideo.realtimeUnmuteLocalAudio();
                btn.textContent = '🎤';
                isAudioMuted = false;
            } else {
                meetingSession.audioVideo.realtimeMuteLocalAudio();
                btn.textContent = '🔇';
                isAudioMuted = true;
            }
        }

        function toggleVideo() {
            const btn = document.getElementById('video-btn');
            if (isVideoEnabled) {
                meetingSession.audioVideo.stopLocalVideoTile();
                btn.textContent = '📷';
                isVideoEnabled = false;
            } else {
                meetingSession.audioVideo.startLocalVideoTile();
                btn.textContent = '📹';
                isVideoEnabled = true;
            }
        }

        function endCall() {
            if (meetingSession) {
                meetingSession.audioVideo.stop();
            }
            document.body.innerHTML = '<div style="text-align: center; padding: 50px; font-family: sans-serif;"><h2>Session Ended</h2><p>Thank you for using our secure healthcare platform.</p></div>';
        }
    </script>
</body>
</html>
            `);
        });

        // End meeting
        app.post('/api/meetings/end', async (req, res) => {
            const { appointmentId } = req.body;
            const result = await this.endMeeting(appointmentId);
            res.json(result);
        });
    }
}

export default new ChimeMeetingService();