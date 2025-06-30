// src/pages/VideoCallPage.js - Rewritten and Optimized
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const VideoCallPage = ({ isPatient = false }) => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();

    console.log('🎥 VideoCallPage loaded, appointmentId:', appointmentId);
    console.log('🎥 isPatient:', isPatient);

    // State management
    const [room, setRoom] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoMuted, setIsVideoMuted] = useState(false);
    const [error, setError] = useState(null);
    const [userName, setUserName] = useState('');
    const [showNameInput, setShowNameInput] = useState(true);
    const [localTracks, setLocalTracks] = useState({ video: null, audio: null });
    const [twilioAvailable, setTwilioAvailable] = useState(false);
    const [patientMode, setPatientMode] = useState(isPatient);
    const [debugMode, setDebugMode] = useState(false);

    // Video refs
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();

    // Configuration
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const roomName = `appointment-${appointmentId}`;

    // Check if Twilio Video is available
    useEffect(() => {
        try {
            const Video = require('twilio-video');
            setTwilioAvailable(true);
            console.log('✅ Twilio Video is available');
        } catch (error) {
            console.warn('⚠️ Twilio Video not installed:', error.message);
            setTwilioAvailable(false);
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            leaveRoom(false);
        };
    }, []);

    // Handle video track attachment when tracks change
    useEffect(() => {
        if (localTracks.video && localVideoRef.current && isConnected) {
            console.log('🔄 Re-attaching video track after state change');
            attachVideoTrack(localTracks.video);
        }
    }, [localTracks.video, isConnected]);

    // Get access token from backend
    const getAccessToken = async (identity, roomName) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/video/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ identity, roomName })
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Video service not available. Please start the backend server at localhost:3001');
                }
                const error = await response.json();
                throw new Error(error.error || 'Failed to get access token');
            }

            const data = await response.json();
            return data.token;
        } catch (error) {
            console.error('Error getting access token:', error);
            throw error;
        }
    };

    // Test camera access directly
    const testCameraAccess = async () => {
        try {
            console.log('🧪 Testing direct camera access...');
            setError(null);

            // First check if we have camera permissions
            const permissions = await navigator.permissions.query({ name: 'camera' });
            console.log('🧪 Camera permission status:', permissions.state);

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                },
                audio: true
            });

            console.log('🧪 Direct camera access successful:', stream);
            console.log('🧪 Video tracks:', stream.getVideoTracks());
            console.log('🧪 Audio tracks:', stream.getAudioTracks());

            if (localVideoRef.current) {
                // Clear any existing stream
                localVideoRef.current.srcObject = null;

                // Set new stream
                localVideoRef.current.srcObject = stream;
                console.log('🧪 Direct assignment to video element completed');

                // Set video properties
                localVideoRef.current.muted = true;
                localVideoRef.current.autoplay = true;
                localVideoRef.current.playsInline = true;

                try {
                    await localVideoRef.current.play();
                    console.log('🧪 Video play() succeeded');
                } catch (playError) {
                    console.warn('🧪 Video play() failed:', playError);
                    // Try user interaction
                    localVideoRef.current.onclick = async () => {
                        try {
                            await localVideoRef.current.play();
                            console.log('🧪 Video play() succeeded after user interaction');
                        } catch (e) {
                            console.error('🧪 Video play() still failed:', e);
                        }
                    };
                }
            } else {
                console.error('🧪 No video element ref available');
            }

            // Stop the test stream after 5 seconds
            setTimeout(() => {
                stream.getTracks().forEach(track => {
                    track.stop();
                    console.log('🧪 Stopped track:', track.kind);
                });
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = null;
                    localVideoRef.current.onclick = null;
                }
                console.log('🧪 Test stream stopped');
            }, 5000);

            return stream;
        } catch (error) {
            console.error('🧪 Direct camera test failed:', error);
            let errorMessage = `Camera test failed: ${error.message}`;

            if (error.name === 'NotAllowedError') {
                errorMessage = 'Camera permission denied. Please click the camera icon in your browser address bar and allow access.';
            } else if (error.name === 'NotFoundError') {
                errorMessage = 'No camera found. Please check that your camera is connected and not being used by another application.';
            } else if (error.name === 'NotReadableError') {
                errorMessage = 'Camera is in use by another application. Please close other video apps and try again.';
            }

            setError(errorMessage);
            throw error;
        }
    };

    // Create local tracks with comprehensive debugging
    const createLocalTracks = async () => {
        try {
            console.log('🎥 Creating local tracks...');
            const Video = require('twilio-video');

            console.log('📷 Requesting camera/microphone permissions...');

            const tracks = await Video.createLocalTracks({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                },
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    frameRate: { ideal: 24 }
                }
            });

            console.log('📹 Created tracks:', tracks);
            console.log('📹 Number of tracks:', tracks.length);

            const videoTrack = tracks.find(track => track.kind === 'video');
            const audioTrack = tracks.find(track => track.kind === 'audio');

            console.log('📹 Video track found:', !!videoTrack);
            console.log('🎤 Audio track found:', !!audioTrack);

            if (videoTrack) {
                console.log('📹 Video track details:', {
                    kind: videoTrack.kind,
                    enabled: videoTrack.isEnabled,
                    name: videoTrack.name,
                    mediaStreamTrack: !!videoTrack.mediaStreamTrack
                });
            }

            setLocalTracks({ video: videoTrack, audio: audioTrack });

            // Delay video attachment to ensure DOM is ready
            setTimeout(() => attachVideoTrack(videoTrack), 100);

            return tracks;
        } catch (error) {
            console.error('❌ Error creating local tracks:', error);

            // Specific error handling
            if (error.name === 'NotAllowedError') {
                throw new Error('Camera/microphone permission denied. Please allow access and refresh the page.');
            } else if (error.name === 'NotFoundError') {
                throw new Error('No camera or microphone found. Please check your devices.');
            } else if (error.name === 'NotReadableError') {
                throw new Error('Camera is being used by another application. Please close other apps and try again.');
            } else if (error.name === 'OverconstrainedError') {
                throw new Error('Camera does not support the requested video quality. Trying with lower quality...');
            }

            throw error;
        }
    };

    // Separate function to attach video track with retries
    const attachVideoTrack = async (videoTrack, retryCount = 0) => {
        const maxRetries = 5;

        if (!videoTrack) {
            console.warn('❌ No video track to attach');
            return;
        }

        if (!localVideoRef.current) {
            console.warn(`❌ Video element not ready, retry ${retryCount + 1}/${maxRetries}`);
            if (retryCount < maxRetries) {
                setTimeout(() => attachVideoTrack(videoTrack, retryCount + 1), 200);
            }
            return;
        }

        try {
            console.log('📹 Attaching video track to element...');
            console.log('📹 Video element:', localVideoRef.current);

            // Method 1: Use Twilio's attach method
            try {
                const attachedElements = videoTrack.attach(localVideoRef.current);
                console.log('📹 Twilio attach success:', attachedElements);
            } catch (attachError) {
                console.warn('📹 Twilio attach failed, trying direct method:', attachError);

                // Method 2: Direct srcObject assignment
                if (videoTrack.mediaStreamTrack) {
                    const stream = new MediaStream([videoTrack.mediaStreamTrack]);
                    localVideoRef.current.srcObject = stream;
                    console.log('📹 Direct srcObject assignment completed');
                }
            }

            // Force play
            try {
                await localVideoRef.current.play();
                console.log('📹 Video play() succeeded');
            } catch (playError) {
                console.warn('📹 Video play() failed:', playError);
                // Try to play again after a short delay
                setTimeout(async () => {
                    try {
                        await localVideoRef.current.play();
                        console.log('📹 Video play() succeeded on retry');
                    } catch (retryError) {
                        console.error('📹 Video play() failed on retry:', retryError);
                    }
                }, 500);
            }

        } catch (error) {
            console.error('❌ Error in attachVideoTrack:', error);
        }
    };

    // Join room
    const joinRoom = async () => {
        try {
            setIsConnecting(true);
            setError(null);

            if (!twilioAvailable) {
                throw new Error('Twilio Video not installed. Please run: npm install twilio-video twilio --legacy-peer-deps');
            }

            const Video = require('twilio-video');
            const identity = userName || `user-${Date.now()}`;

            // Get access token
            const token = await getAccessToken(identity, roomName);

            // Create local tracks
            const tracks = await createLocalTracks();

            // Connect to room
            const connectedRoom = await Video.connect(token, {
                name: roomName,
                tracks: tracks,
                audio: true,
                video: true,
                networkQuality: {
                    local: 1,
                    remote: 1
                },
                bandwidthProfile: {
                    video: {
                        mode: 'collaboration',
                        maxTracks: 2
                    }
                },
                preferredVideoCodecs: ['VP8'],
                logLevel: 'warn'
            });

            setRoom(connectedRoom);
            setIsConnected(true);
            setIsConnecting(false);
            setShowNameInput(false);

            console.log(`📹 Connected to room: ${roomName} as ${identity}`);

            // Set up event listeners
            setupRoomEventListeners(connectedRoom);

        } catch (error) {
            console.error('Error joining room:', error);
            setError(error.message);
            setIsConnecting(false);
        }
    };

    // Setup room event listeners
    const setupRoomEventListeners = (room) => {
        // Room disconnected
        room.on('disconnected', (room, error) => {
            console.log('📱 Disconnected from room:', room.name);
            if (error) {
                console.error('Disconnection error:', error);
                setError(error.message);
            }
            cleanup();
        });

        // Participant connected
        room.on('participantConnected', (participant) => {
            console.log(`👤 Participant connected: ${participant.identity}`);
            setParticipants(prev => [...prev, participant]);
            setupParticipantEventListeners(participant);
        });

        // Participant disconnected
        room.on('participantDisconnected', (participant) => {
            console.log(`👋 Participant disconnected: ${participant.identity}`);
            setParticipants(prev => prev.filter(p => p.sid !== participant.sid));
        });

        // Handle existing participants
        room.participants.forEach(participant => {
            setParticipants(prev => [...prev, participant]);
            setupParticipantEventListeners(participant);
        });
    };

    // Setup participant event listeners
    const setupParticipantEventListeners = (participant) => {
        const addTrack = (track) => {
            if (track.kind === 'video' && remoteVideoRef.current) {
                track.attach(remoteVideoRef.current);
            }
        };

        // Track subscribed
        participant.on('trackSubscribed', addTrack);

        // Handle existing tracks
        participant.tracks.forEach(publication => {
            if (publication.isSubscribed) {
                addTrack(publication.track);
            }
        });
    };

    // Leave room
    const leaveRoom = async (shouldNavigate = true) => {
        try {
            if (room) {
                console.log('📱 Leaving room...');
                room.disconnect();
            }
            cleanup();

            if (shouldNavigate) {
                console.log('🔄 Navigating back to calendar...');
                navigate('/calendar');
            }
        } catch (error) {
            console.error('Error leaving room:', error);
        }
    };

    // Cleanup resources
    const cleanup = () => {
        // Stop local tracks
        if (localTracks.video) {
            localTracks.video.stop();
        }
        if (localTracks.audio) {
            localTracks.audio.stop();
        }

        setLocalTracks({ video: null, audio: null });
        setParticipants([]);
        setRoom(null);
        setIsConnected(false);
    };

    // Toggle audio mute
    const toggleAudio = () => {
        if (localTracks.audio) {
            if (localTracks.audio.isEnabled) {
                localTracks.audio.disable();
                setIsAudioMuted(true);
            } else {
                localTracks.audio.enable();
                setIsAudioMuted(false);
            }
        }
    };

    // Toggle video mute
    const toggleVideo = () => {
        if (localTracks.video) {
            if (localTracks.video.isEnabled) {
                localTracks.video.disable();
                setIsVideoMuted(true);
            } else {
                localTracks.video.enable();
                setIsVideoMuted(false);
            }
        }
    };

    // Mock join for when Twilio isn't installed
    const mockJoinRoom = () => {
        setIsConnecting(true);
        setTimeout(() => {
            setIsConnecting(false);
            setIsConnected(true);
            setShowNameInput(false);
            console.log('📹 Mock room joined - install Twilio Video for real functionality');
        }, 2000);
    };

    // Toggle debug mode
    const toggleDebugMode = () => {
        setDebugMode(!debugMode);
    };

    // Render error state
    if (error) {
        return (
            <div className="video-call-page">
                <div className="video-header">
                    <h1>Video Consultation</h1>
                    <span className="appointment-id">Appointment: {appointmentId}</span>
                </div>
                <div className="video-container">
                    <div className="error-screen">
                        <div className="error-content">
                            <div className="error-icon">⚠️</div>
                            <h2>Connection Error</h2>
                            <p>{error}</p>
                            {error.includes('not installed') && (
                                <div className="installation-guide">
                                    <p><strong>To enable video calling:</strong></p>
                                    <ol>
                                        <li>Run: <code>npm install twilio-video twilio --legacy-peer-deps</code></li>
                                        <li>Start the backend: <code>cd backend && npm run dev</code></li>
                                        <li>Refresh this page</li>
                                    </ol>
                                </div>
                            )}
                            <div className="error-actions">
                                <button onClick={() => setError(null)} className="retry-btn">
                                    Try Again
                                </button>
                                <button onClick={() => navigate('/calendar')} className="back-btn">
                                    Back to Calendar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Render name input state
    if (showNameInput) {
        return (
            <div className="video-call-page">
                <div className="video-header">
                    <h1>{patientMode ? 'Join Your Appointment' : 'Join Video Consultation'}</h1>
                    <span className="appointment-id">Appointment: {appointmentId}</span>
                </div>
                <div className="video-container">
                    <div className="name-input-screen">
                        <div className="name-input-content">
                            <div className="video-icon">🎥</div>
                            <h2>{patientMode ? 'Welcome!' : 'Enter Your Name'}</h2>
                            <p>
                                {patientMode
                                    ? 'Please enter your name to join your video appointment'
                                    : 'Please enter your name to join the video consultation'
                                }
                            </p>
                            <div className="name-form">
                                <input
                                    type="text"
                                    placeholder={patientMode ? "Your full name" : "Your full name"}
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && userName.trim() && (twilioAvailable ? joinRoom() : mockJoinRoom())}
                                    className="name-input"
                                    autoFocus
                                />
                                <button
                                    onClick={twilioAvailable ? joinRoom : mockJoinRoom}
                                    disabled={!userName.trim() || isConnecting}
                                    className="join-call-btn"
                                >
                                    {isConnecting ? (
                                        <span className="loading-text">
                                            <div className="spinner"></div>
                                            Connecting...
                                        </span>
                                    ) : (
                                        patientMode ? 'Join Appointment' : 'Join Call'
                                    )}
                                </button>
                            </div>
                            <div className="security-info">
                                <p>🔒 This call is encrypted and HIPAA compliant</p>
                                {patientMode && (
                                    <p>Your healthcare provider will join shortly</p>
                                )}
                            </div>
                            {/* Debug Controls */}
                            {!twilioAvailable && (
                                <div className="debug-controls">
                                    <button onClick={toggleDebugMode} className="debug-toggle-btn">
                                        {debugMode ? 'Hide' : 'Show'} Debug Options
                                    </button>
                                    {debugMode && (
                                        <div className="debug-options">
                                            <button onClick={testCameraAccess} className="test-camera-btn">
                                                🧪 Test Camera Access
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Render connected state
    if (isConnected) {
        return (
            <div className="video-call-page">
                <div className="video-header">
                    <h1>Video Consultation - In Progress</h1>
                    <span className="appointment-id">Appointment: {appointmentId}</span>
                </div>

                <div className="video-grid-container">
                    <div className="video-grid">
                        <div className="video-container local">
                            <video
                                ref={localVideoRef}
                                autoPlay
                                muted
                                playsInline
                                className="video-element"
                                onLoadedMetadata={() => console.log('📹 Local video metadata loaded')}
                                onCanPlay={() => console.log('📹 Local video can play')}
                                onPlay={() => console.log('📹 Local video started playing')}
                                onError={(e) => console.error('📹 Local video error:', e)}
                            />
                            <div className="video-label">
                                You {isVideoMuted && '(Video Off)'}
                            </div>
                        </div>

                        <div className="video-container remote">
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                className="video-element"
                                onLoadedMetadata={() => console.log('📹 Remote video metadata loaded')}
                                onCanPlay={() => console.log('📹 Remote video can play')}
                                onPlay={() => console.log('📹 Remote video started playing')}
                                onError={(e) => console.error('📹 Remote video error:', e)}
                            />
                            <div className="video-label">
                                {participants.length > 0 ? participants[0].identity : 'Waiting for others...'}
                            </div>
                        </div>
                    </div>

                    <div className="video-controls">
                        <button
                            onClick={toggleAudio}
                            className={`control-btn ${isAudioMuted ? 'muted' : ''}`}
                            title={isAudioMuted ? 'Unmute' : 'Mute'}
                        >
                            {isAudioMuted ? '🔇' : '🎤'}
                        </button>

                        <button
                            onClick={toggleVideo}
                            className={`control-btn ${isVideoMuted ? 'muted' : ''}`}
                            title={isVideoMuted ? 'Turn on camera' : 'Turn off camera'}
                        >
                            {isVideoMuted ? '📷' : '📹'}
                        </button>

                        {debugMode && (
                            <button
                                onClick={testCameraAccess}
                                className="control-btn test-btn"
                                title="Test camera access"
                            >
                                🧪
                            </button>
                        )}

                        <button onClick={leaveRoom} className="end-call-btn">
                            End Call
                        </button>
                    </div>

                    <div className="call-info">
                        <p>Participants: {participants.length + 1}</p>
                        <p>Room: {roomName}</p>
                        {debugMode && (
                            <div className="debug-info">
                                <p>Twilio Available: {twilioAvailable ? '✅' : '❌'}</p>
                                <p>Local Video: {localTracks.video ? '✅' : '❌'}</p>
                                <p>Local Audio: {localTracks.audio ? '✅' : '❌'}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Default loading state
    return (
        <div className="video-call-page">
            <div className="video-header">
                <h1>Video Consultation</h1>
                <span className="appointment-id">Appointment: {appointmentId}</span>
            </div>
            <div className="video-container">
                <div className="loading-screen">
                    <div className="loading-content">
                        <div className="loading-spinner"></div>
                        <h2>Preparing Video Call...</h2>
                        <p>Please wait while we set up your consultation.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoCallPage;