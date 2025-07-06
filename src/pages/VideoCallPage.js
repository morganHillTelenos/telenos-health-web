// src/pages/VideoCallPage.js - Fixed Local Video Track Issue
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './VideoCallPage.css';

const VideoCallPage = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();

    // State management
    const [currentScreen, setCurrentScreen] = useState('join');
    const [participantName, setParticipantName] = useState('');
    const [nameInputValue, setNameInputValue] = useState('');
    const [room, setRoom] = useState(null);
    const [participants, setParticipants] = useState(new Map());
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [error, setError] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [localAudioTrack, setLocalAudioTrack] = useState(null);
    const [localVideoTrack, setLocalVideoTrack] = useState(null);
    const [connectionLog, setConnectionLog] = useState([]);

    // Refs for video elements
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    // Add to connection log for debugging
    const addToLog = (message) => {
        console.log(`🔊 ${message}`);
        setConnectionLog(prev => [...prev.slice(-10), { time: new Date().toISOString(), message }]);
    };

    // Enhanced token service
    const getVideoToken = async (identity, roomName) => {
        try {
            addToLog(`🔍 Attempting to get token for identity: ${identity}, room: ${roomName}`);

            const tokenEndpoint = process.env.REACT_APP_TWILIO_TOKEN_ENDPOINT;
            console.log('🌐 Token endpoint:', tokenEndpoint);

            if (!tokenEndpoint) {
                throw new Error('REACT_APP_TWILIO_TOKEN_ENDPOINT not configured');
            }

            const requestData = { identity, room: roomName };
            console.log('📤 Request data:', requestData);

            addToLog(`📡 Making API request to ${tokenEndpoint}`);

            const response = await fetch(tokenEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            console.log('📨 Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Error Response:', errorText);
                throw new Error(`API request failed: ${response.status} - ${errorText}`);
            }

            const tokenData = await response.json();
            console.log('✅ Token response received:', {
                ...tokenData,
                token: tokenData.token ? '***HIDDEN***' : 'MISSING'
            });

            if (!tokenData.token) {
                throw new Error('No token received from API');
            }

            addToLog(`✅ Token received - isDemoToken: ${tokenData.isDemoToken || 'false'}`);

            if (tokenData.isDemoToken) {
                console.warn('⚠️  Still receiving demo token - check Lambda function');
                addToLog('⚠️  WARNING: Still receiving demo token');
            } else {
                addToLog('🎉 Real Twilio token received!');
            }

            return tokenData.token;
        } catch (error) {
            console.error('❌ Token fetch error:', error);
            addToLog(`❌ Token error: ${error.message}`);
            throw new Error(`Failed to get video token: ${error.message}`);
        }
    };

    // Join video call function - FIXED LOCAL VIDEO HANDLING
    const joinVideoCall = async (identity) => {
        try {
            setIsConnecting(true);
            setError(null);
            addToLog(`🚀 Starting video call connection for ${identity}`);

            // Import Twilio Video SDK
            const Video = (await import('twilio-video')).default;
            addToLog('📦 Twilio Video SDK loaded');

            const roomName = `telenos-room-${appointmentId}`;
            addToLog(`🏠 Room name: ${roomName}`);

            // Get access token
            const token = await getVideoToken(identity, roomName);
            addToLog('🎫 Token obtained, connecting to room...');

            // Connect to room
            const connectedRoom = await Video.connect(token, {
                name: roomName,
                audio: true,
                video: { width: 640, height: 480 },
                dominantSpeaker: true,
                networkQuality: true
            });

            addToLog(`🎉 Successfully connected to room: ${connectedRoom.name}`);
            console.log('📹 Connected to room:', connectedRoom.name);
            console.log('👤 Local participant:', connectedRoom.localParticipant.identity);

            setRoom(connectedRoom);
            setCurrentScreen('in-call');

            // FIXED: Handle local tracks properly
            connectedRoom.localParticipant.tracks.forEach(publication => {
                const track = publication.track;
                if (track) {
                    if (track.kind === 'video' && localVideoRef.current) {
                        console.log('📹 Attaching local video track');
                        const videoElement = track.attach();
                        videoElement.style.width = '100%';
                        videoElement.style.height = '100%';
                        videoElement.style.objectFit = 'cover';
                        localVideoRef.current.appendChild(videoElement);
                        setLocalVideoTrack(track);
                        addToLog('📹 Local video track attached');
                    } else if (track.kind === 'audio') {
                        console.log('🎤 Setting local audio track');
                        setLocalAudioTrack(track);
                        addToLog('🎤 Local audio track set');
                    }
                }
            });

            // Listen for track events on local participant
            connectedRoom.localParticipant.on('trackPublished', publication => {
                console.log('📤 Local track published:', publication.kind);
                const track = publication.track;
                if (track && track.kind === 'video' && localVideoRef.current && !localVideoTrack) {
                    console.log('📹 Late attaching local video track');
                    const videoElement = track.attach();
                    videoElement.style.width = '100%';
                    videoElement.style.height = '100%';
                    videoElement.style.objectFit = 'cover';
                    localVideoRef.current.appendChild(videoElement);
                    setLocalVideoTrack(track);
                    addToLog('📹 Local video track attached (late)');
                }
            });

            // Handle existing participants
            connectedRoom.participants.forEach(participant => {
                addToLog(`👤 Existing participant: ${participant.identity}`);
                handleParticipantConnected(participant);
            });

            // Set up event listeners
            connectedRoom.on('participantConnected', (participant) => {
                addToLog(`👋 Participant joined: ${participant.identity}`);
                handleParticipantConnected(participant);
            });

            connectedRoom.on('participantDisconnected', (participant) => {
                addToLog(`👋 Participant left: ${participant.identity}`);
                handleParticipantDisconnected(participant);
            });

            connectedRoom.on('disconnected', (room) => {
                addToLog('📞 Disconnected from room');
                handleRoomDisconnected(room);
            });

        } catch (error) {
            console.error('❌ Failed to join video call:', error);
            addToLog(`❌ Connection failed: ${error.message}`);
            setError(error.message);
            setCurrentScreen('error');
        } finally {
            setIsConnecting(false);
        }
    };

    // Handle participant connected
    const handleParticipantConnected = (participant) => {
        setParticipants(prev => new Map(prev.set(participant.sid, participant)));

        participant.tracks.forEach(publication => {
            if (publication.isSubscribed) {
                handleTrackSubscribed(publication.track, participant);
            }
        });

        participant.on('trackSubscribed', (track) => {
            handleTrackSubscribed(track, participant);
        });

        participant.on('trackUnsubscribed', (track) => {
            track.detach().forEach(element => element.remove());
        });
    };

    // Handle participant disconnected
    const handleParticipantDisconnected = (participant) => {
        setParticipants(prev => {
            const newMap = new Map(prev);
            newMap.delete(participant.sid);
            return newMap;
        });
    };

    // Handle track subscribed
    const handleTrackSubscribed = (track, participant) => {
        if (track.kind === 'video' && remoteVideoRef.current) {
            console.log('📹 Attaching remote video track from:', participant.identity);
            const videoElement = track.attach();
            videoElement.style.width = '100%';
            videoElement.style.height = '100%';
            videoElement.style.objectFit = 'cover';
            remoteVideoRef.current.appendChild(videoElement);
        } else if (track.kind === 'audio') {
            console.log('🎤 Attaching remote audio track from:', participant.identity);
            track.attach();
        }
    };

    // Handle room disconnected
    const handleRoomDisconnected = (room) => {
        room.localParticipant.tracks.forEach(publication => {
            if (publication.track) {
                publication.track.stop();
            }
        });
        setRoom(null);
        setParticipants(new Map());
        setCurrentScreen('ended');
    };

    // Toggle audio - IMPROVED
    const toggleAudio = () => {
        if (localAudioTrack) {
            if (isAudioEnabled) {
                localAudioTrack.disable();
                addToLog('🎤 Audio disabled');
            } else {
                localAudioTrack.enable();
                addToLog('🎤 Audio enabled');
            }
            setIsAudioEnabled(!isAudioEnabled);
        } else {
            console.warn('No local audio track available');
            addToLog('⚠️ No local audio track available');
        }
    };

    // Toggle video - IMPROVED
    const toggleVideo = () => {
        if (localVideoTrack) {
            if (isVideoEnabled) {
                localVideoTrack.disable();
                addToLog('📹 Video disabled');
            } else {
                localVideoTrack.enable();
                addToLog('📹 Video enabled');
            }
            setIsVideoEnabled(!isVideoEnabled);
        } else {
            console.warn('No local video track available');
            addToLog('⚠️ No local video track available');
        }
    };

    // End call
    const endCall = () => {
        if (room) {
            addToLog('📞 Ending call...');
            room.disconnect();
        } else {
            setCurrentScreen('ended');
        }
    };

    // Handle name submission
    const handleNameSubmit = (e) => {
        e.preventDefault();
        if (nameInputValue.trim()) {
            setParticipantName(nameInputValue.trim());
            setCurrentScreen('loading');
            joinVideoCall(nameInputValue.trim());
        }
    };

    // Copy room link
    const copyRoomLink = () => {
        const roomLink = window.location.href;
        navigator.clipboard.writeText(roomLink).then(() => {
            alert('Room link copied to clipboard!');
        });
    };

    // Get shareable room link
    const getShareableLink = () => {
        const baseUrl = window.location.origin;
        return `${baseUrl}/video-call/${appointmentId}`;
    };

    // Render loading screen
    const renderLoadingScreen = () => (
        <div className="loading-screen">
            <div className="loading-content">
                <div className="loading-spinner"></div>
                <h2>Connecting to Video Call</h2>
                <p>Please wait while we connect you to the appointment...</p>
                <div style={{ marginTop: '20px', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                    {connectionLog.slice(-3).map((log, index) => (
                        <div key={index}>{log.message}</div>
                    ))}
                </div>
            </div>
        </div>
    );

    // Render join screen
    const renderJoinScreen = () => {
        const isProviderStart = window.location.pathname.includes('/start/');

        return (
            <div className="join-screen">
                <div className="join-content">
                    <div className="video-icon">🎥</div>
                    <h2>{isProviderStart ? 'Start Video Consultation' : 'Join Video Consultation'}</h2>

                    {isProviderStart && (
                        <div className="provider-info">
                            <p><strong>Provider:</strong> Dr. Smith</p>
                            <p><strong>Appointment:</strong> {appointmentId}</p>
                            <p><strong>Room:</strong> telenos-room-{appointmentId}</p>
                        </div>
                    )}

                    {!isProviderStart && (
                        <div className="patient-info">
                            <p><strong>Appointment ID:</strong> {appointmentId}</p>
                            <p>Please enter your name to join the video consultation.</p>
                        </div>
                    )}

                    {isProviderStart && (
                        <div className="shareable-link-section">
                            <label>Share this link with your patient:</label>
                            <div className="link-container">
                                <input
                                    type="text"
                                    value={getShareableLink()}
                                    readOnly
                                    className="shareable-link"
                                />
                                <button onClick={copyRoomLink} className="copy-btn">
                                    Copy
                                </button>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleNameSubmit} className="name-form">
                        <input
                            type="text"
                            value={nameInputValue}
                            onChange={(e) => setNameInputValue(e.target.value)}
                            placeholder={isProviderStart ? "Dr. Smith" : "Enter your name"}
                            className="name-input"
                            required
                        />
                        <button type="submit" className="join-btn" disabled={isConnecting}>
                            {isConnecting ? 'Connecting...' : (isProviderStart ? 'Start Call' : 'Join Call')}
                        </button>
                    </form>

                    <div className="security-info">
                        🔒 This video call is encrypted and HIPAA compliant
                    </div>
                </div>
            </div>
        );
    };

    // Render in-call screen
    const renderInCallScreen = () => (
        <div className="in-call-screen">
            <div className="video-grid">
                <div className="local-video-container">
                    <div ref={localVideoRef} className="local-video"></div>
                    <div className="participant-label">You ({participantName})</div>
                </div>

                {participants.size > 0 && (
                    <div className="remote-video-container">
                        <div ref={remoteVideoRef} className="remote-video"></div>
                        <div className="participant-label">
                            {Array.from(participants.values())[0]?.identity}
                        </div>
                    </div>
                )}
            </div>

            <div className="call-controls">
                <button
                    onClick={toggleAudio}
                    className={`control-btn ${!isAudioEnabled ? 'disabled' : ''}`}
                >
                    {isAudioEnabled ? '🎤' : '🎤❌'}
                </button>

                <button
                    onClick={toggleVideo}
                    className={`control-btn ${!isVideoEnabled ? 'disabled' : ''}`}
                >
                    {isVideoEnabled ? '📹' : '📹❌'}
                </button>

                <button onClick={endCall} className="end-call-btn">
                    End Call
                </button>
            </div>

            <div className="call-info">
                <p>Room: telenos-room-{appointmentId}</p>
                <p>Participants: {participants.size + 1}</p>
                <p>Status: Connected ✅</p>
            </div>
        </div>
    );

    // Render error screen
    const renderErrorScreen = () => (
        <div className="error-screen">
            <div className="error-content">
                <div className="error-icon">❌</div>
                <h2>Connection Failed</h2>
                <p>Unable to connect to the video call:</p>
                <p><strong>{error}</strong></p>
                <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
                    <strong>Debug Log:</strong>
                    {connectionLog.slice(-5).map((log, index) => (
                        <div key={index} style={{ marginBottom: '5px' }}>
                            {new Date(log.time).toLocaleTimeString()}: {log.message}
                        </div>
                    ))}
                </div>
                <button onClick={() => setCurrentScreen('join')} className="back-btn">
                    Try Again
                </button>
            </div>
        </div>
    );

    // Render call ended screen
    const renderCallEndedScreen = () => (
        <div className="call-ended-screen">
            <div className="call-ended-content">
                <div className="call-ended-icon">✅</div>
                <h2>Call Ended</h2>
                <p>The video consultation has ended. Thank you for using TelenosHealth.</p>
                <button onClick={() => navigate('/dashboard')} className="back-btn">
                    Return to Dashboard
                </button>
            </div>
        </div>
    );

    return (
        <div className="video-call-page">
            <div className="video-header">
                <h1>Video Consultation</h1>
                <div className="appointment-id">Appointment: {appointmentId}</div>
            </div>

            <div className="video-container">
                {currentScreen === 'join' && renderJoinScreen()}
                {currentScreen === 'loading' && renderLoadingScreen()}
                {currentScreen === 'in-call' && renderInCallScreen()}
                {currentScreen === 'error' && renderErrorScreen()}
                {currentScreen === 'ended' && renderCallEndedScreen()}
            </div>
        </div>
    );
};

export default VideoCallPage;