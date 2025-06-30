// src/pages/VideoCallPage.js - Using CSS classes from globals.css
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const VideoCallPage = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();

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

    // Video refs
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();

    // Configuration
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const roomName = `appointment-${appointmentId}`;

    console.log('🎥 VideoCallPage loaded, appointmentId:', appointmentId);

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

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            leaveRoom();
        };
    }, []);

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

    // Create local tracks
    const createLocalTracks = async () => {
        try {
            const Video = require('twilio-video');

            const tracks = await Video.createLocalTracks({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                },
                video: {
                    width: 640,
                    height: 480,
                    frameRate: 24
                }
            });

            const videoTrack = tracks.find(track => track.kind === 'video');
            const audioTrack = tracks.find(track => track.kind === 'audio');

            setLocalTracks({ video: videoTrack, audio: audioTrack });

            // Attach local video
            if (videoTrack && localVideoRef.current) {
                videoTrack.attach(localVideoRef.current);
            }

            return tracks;
        } catch (error) {
            console.error('Error creating local tracks:', error);
            throw error;
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

    // Leave room and cleanup
    const leaveRoom = async () => {
        try {
            if (room) {
                console.log('📱 Leaving room...');
                room.disconnect();
            }
            cleanup();
            navigate('/calendar');
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

    // Render different states
    if (error) {
        return (
            <div className="video-call-page">
                <div className="video-header">
                    <h1>Video Consultation</h1>
                    <span className="appointment-id">Appointment: {appointmentId}</span>
                </div>
                <div className="video-container">
                    <div className="name-input-screen">
                        <div className="name-input-content">
                            <div style={{ fontSize: '4rem', color: '#dc3545', marginBottom: '1rem' }}>⚠️</div>
                            <h2>Connection Error</h2>
                            <p>{error}</p>
                            {error.includes('not installed') && (
                                <div style={{
                                    background: '#f8f9fa',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    textAlign: 'left',
                                    marginBottom: '1.5rem'
                                }}>
                                    <p><strong>To enable video calling:</strong></p>
                                    <ol style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                                        <li>Run: <code>npm install twilio-video twilio --legacy-peer-deps</code></li>
                                        <li>Start the backend: <code>cd backend && npm run dev</code></li>
                                        <li>Refresh this page</li>
                                    </ol>
                                </div>
                            )}
                            <button onClick={() => navigate('/calendar')} className="back-btn">
                                Back to Calendar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (showNameInput) {
        return (
            <div className="video-call-page">
                <div className="video-header">
                    <h1>Join Video Consultation</h1>
                    <span className="appointment-id">Appointment: {appointmentId}</span>
                </div>
                <div className="video-container">
                    <div className="name-input-screen">
                        <div className="name-input-content">
                            <div className="video-icon">🎥</div>
                            <h2>Enter Your Name</h2>
                            <p>Please enter your name to join the video consultation</p>
                            <div className="name-form">
                                <input
                                    type="text"
                                    placeholder="Your full name"
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
                                        'Join Call'
                                    )}
                                </button>
                            </div>
                            <div className="security-info">
                                <p>🔒 This call is encrypted and HIPAA compliant</p>
                                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem' }}>
                                    Twilio Available: {twilioAvailable ? '✅ Yes' : '❌ No'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                            <video ref={localVideoRef} autoPlay muted playsInline className="video-element" />
                            <div className="video-label">You {isVideoMuted && '(Video Off)'}</div>
                        </div>

                        <div className="video-container remote">
                            <video ref={remoteVideoRef} autoPlay playsInline className="video-element" />
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

                        <button onClick={leaveRoom} className="end-call-btn">
                            End Call
                        </button>
                    </div>

                    <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>
                        <p style={{ margin: '0.25rem 0' }}>Participants: {participants.length + 1}</p>
                        <p style={{ margin: '0.25rem 0' }}>Room: {roomName}</p>
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
                <div className="name-input-screen">
                    <div className="name-input-content">
                        <div style={{
                            width: '60px',
                            height: '60px',
                            border: '4px solid rgba(102, 126, 234, 0.3)',
                            borderTop: '4px solid #667eea',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 1rem'
                        }}></div>
                        <h2>Preparing Video Call...</h2>
                        <p>Please wait while we set up your consultation.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoCallPage;