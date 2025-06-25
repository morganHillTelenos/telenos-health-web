// src/services/mockVideoService.js - Development Mock Service
class MockVideoService {
    constructor() {
        this.activeMeetings = new Map();
        this.mockMeetingId = null;
        console.log('🎭 Mock Video Service initialized (Development Mode)');
    }

    async createMeeting(appointmentId, userType = 'provider', userName = 'User') {
        try {
            console.log(`🎭 Creating mock meeting for appointment ${appointmentId}...`);

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            const mockMeeting = {
                MeetingId: `mock-meeting-${appointmentId}-${Date.now()}`,
                MediaRegion: 'us-east-1',
                MediaPlacement: {
                    AudioHostUrl: 'mock-audio-host',
                    AudioFallbackUrl: 'mock-audio-fallback',
                    ScreenDataUrl: 'mock-screen-data',
                    ScreenSharingUrl: 'mock-screen-sharing',
                    ScreenViewingUrl: 'mock-screen-viewing',
                    SignalingUrl: 'mock-signaling',
                    TurnControlUrl: 'mock-turn-control'
                }
            };

            const mockAttendee = {
                AttendeeId: `mock-attendee-${userType}-${Date.now()}`,
                ExternalUserId: `${userType}-${Date.now()}`,
                JoinToken: `mock-join-token-${Date.now()}`
            };

            const meetingInfo = {
                meeting: mockMeeting,
                meetingId: mockMeeting.MeetingId,
                appointmentId: appointmentId,
                createdAt: new Date(),
                createdBy: userType,
                userName: userName
            };

            this.activeMeetings.set(appointmentId, meetingInfo);
            this.mockMeetingId = mockMeeting.MeetingId;

            console.log(`✅ Mock meeting created: ${mockMeeting.MeetingId}`);

            return {
                success: true,
                meeting: mockMeeting,
                attendee: mockAttendee,
                appointmentId: appointmentId,
                joinUrl: `${window.location.origin}/join/${appointmentId}`,
                isMock: true
            };

        } catch (error) {
            console.error('❌ Error creating mock meeting:', error);
            return {
                success: false,
                error: error.message,
                code: error.name
            };
        }
    }

    async joinExistingMeeting(appointmentId, userType = 'patient', userName = 'Patient') {
        try {
            console.log(`🎭 ${userName} joining mock appointment ${appointmentId}...`);

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));

            let meetingInfo = this.activeMeetings.get(appointmentId);

            if (!meetingInfo) {
                // Create a mock meeting if none exists
                const createResult = await this.createMeeting(appointmentId, 'provider', 'Healthcare Provider');
                if (!createResult.success) {
                    throw new Error('Failed to create mock meeting');
                }
                meetingInfo = this.activeMeetings.get(appointmentId);
            }

            const mockAttendee = {
                AttendeeId: `mock-attendee-${userType}-${Date.now()}`,
                ExternalUserId: `${userType}-${Date.now()}`,
                JoinToken: `mock-join-token-${Date.now()}`
            };

            console.log(`✅ ${userName} joined mock meeting`);

            return {
                success: true,
                meeting: meetingInfo.meeting,
                attendee: mockAttendee,
                appointmentId: appointmentId,
                hostName: meetingInfo.userName,
                isMock: true
            };

        } catch (error) {
            console.error('❌ Error joining mock meeting:', error);
            return {
                success: false,
                error: error.message,
                code: error.name
            };
        }
    }

    async setupChimeSession(meeting, attendee, localVideoRef, remoteVideoRef, audioElementRef) {
        try {
            console.log('🎭 Setting up mock video session...');

            // Simulate session setup delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock session object
            const mockSession = {
                audioVideo: {
                    start: async () => {
                        console.log('✅ Mock session started');
                    },
                    startLocalVideoTile: async () => {
                        console.log('📷 Mock local video tile started');
                        this.setupMockLocalVideo(localVideoRef);
                    },
                    stopLocalVideoTile: () => {
                        console.log('📷 Mock local video tile stopped');
                        if (localVideoRef.current) {
                            localVideoRef.current.srcObject = null;
                        }
                    },
                    realtimeMuteLocalAudio: () => {
                        console.log('🔇 Mock audio muted');
                    },
                    realtimeUnmuteLocalAudio: () => {
                        console.log('🎤 Mock audio unmuted');
                    },
                    addVideoTileObserver: (observer) => {
                        console.log('✅ Mock video tile observer added');

                        // Simulate local video tile creation after a delay
                        setTimeout(() => {
                            if (observer.videoTileDidUpdate) {
                                observer.videoTileDidUpdate({
                                    tileId: 1,
                                    localTile: true,
                                    active: true,
                                    paused: false,
                                    isContent: false,
                                    boundAttendeeId: attendee.AttendeeId
                                });
                            }
                        }, 1000);

                        // Simulate remote video tile creation after another delay
                        setTimeout(() => {
                            if (observer.videoTileDidUpdate) {
                                observer.videoTileDidUpdate({
                                    tileId: 2,
                                    localTile: false,
                                    active: true,
                                    paused: false,
                                    isContent: false,
                                    boundAttendeeId: 'remote-attendee'
                                });
                            }
                        }, 2000);
                    },
                    bindVideoElement: (tileId, videoElement) => {
                        console.log(`🎥 Mock video bound to element (tile: ${tileId})`);

                        if (tileId === 1 && localVideoRef.current === videoElement) {
                            // Local video - show camera feed
                            this.setupMockLocalVideo(localVideoRef);
                        } else if (tileId === 2 && remoteVideoRef.current === videoElement) {
                            // Remote video - show mock remote participant
                            this.setupMockRemoteVideo(remoteVideoRef);
                        }
                    },
                    bindAudioElement: (audioElement) => {
                        console.log('🔊 Mock audio element bound');
                    },
                    stop: () => {
                        console.log('🛑 Mock session stopped');
                        // Clean up mock video streams
                        if (localVideoRef.current && localVideoRef.current.srcObject) {
                            localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
                            localVideoRef.current.srcObject = null;
                        }
                        if (remoteVideoRef.current) {
                            remoteVideoRef.current.src = '';
                        }
                    }
                }
            };

            console.log('✅ Mock video session setup complete!');
            return mockSession;

        } catch (error) {
            console.error('❌ Error setting up mock session:', error);
            throw new Error(`Mock video setup failed: ${error.message}`);
        }
    }

    async setupMockLocalVideo(localVideoRef) {
        try {
            if (localVideoRef.current) {
                console.log('📷 Setting up mock local video (real camera)...');

                // Get real camera feed for local video
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 640, height: 480 },
                    audio: false
                });

                localVideoRef.current.srcObject = stream;
                localVideoRef.current.muted = true;
                localVideoRef.current.autoplay = true;
                localVideoRef.current.playsInline = true;

                // Ensure video plays
                try {
                    await localVideoRef.current.play();
                    console.log('✅ Mock local video playing');
                } catch (playError) {
                    console.log('⚠️ Video play issue (may be normal):', playError.message);
                }
            }
        } catch (error) {
            console.error('❌ Mock local video setup failed:', error);
            // Create a colored rectangle as fallback
            this.createMockVideoFallback(localVideoRef, '#4F46E5', 'You');
        }
    }

    setupMockRemoteVideo(remoteVideoRef) {
        try {
            if (remoteVideoRef.current) {
                console.log('📺 Setting up mock remote video...');

                // Create a mock video for remote participant
                this.createMockVideoFallback(remoteVideoRef, '#10B981', 'Dr. Smith');
            }
        } catch (error) {
            console.error('❌ Mock remote video setup failed:', error);
        }
    }

    createMockVideoFallback(videoRef, color, label) {
        if (!videoRef.current) return;

        // Create a canvas with a colored background and label
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');

        // Fill with color
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add label
        ctx.fillStyle = 'white';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, canvas.width / 2, canvas.height / 2 - 30);

        // Add "Mock Video" text
        ctx.font = 'bold 24px Arial';
        ctx.fillText('(Mock Video)', canvas.width / 2, canvas.height / 2 + 30);

        // Convert canvas to video stream
        const stream = canvas.captureStream(30); // 30 FPS
        videoRef.current.srcObject = stream;
        videoRef.current.autoplay = true;
        videoRef.current.playsInline = true;

        if (label === 'You') {
            videoRef.current.muted = true;
        }

        videoRef.current.play().catch(e => console.log('Fallback video play error:', e.message));
    }

    async endMeeting(appointmentId) {
        try {
            console.log(`🔚 Ending mock meeting ${appointmentId}...`);

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));

            this.activeMeetings.delete(appointmentId);
            console.log('✅ Mock meeting ended');

            return { success: true };
        } catch (error) {
            console.error('Error ending mock meeting:', error);
            return { success: true };
        }
    }
}

const mockVideoService = new MockVideoService();
export default mockVideoService;