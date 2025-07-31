// src/pages/VideoCallPage.js - Fixed Identity Issue
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './VideoCallPage.css';
import RecordingControls from '../components/RecordingControls';
import '../components/RecordingControls.css';
import RecordingDebugComponent from '../components/RecordingDebugComponent';

const VideoCallPage = ({ isPatient = false }) => {
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
    const [roomSid, setRoomSid] = useState(null);
    // ✅ ADD IDENTITY STATE
    const [identity, setIdentity] = useState(null);

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

    const joinVideoCall = async (userIdentity) => {
        try {
            setIsConnecting(true);
            setError(null);

            // ✅ SET IDENTITY STATE
            setIdentity(userIdentity);
            addToLog(`🚀 Starting video call connection for ${userIdentity}`);

            // Import Twilio Video SDK
            const Video = (await import('twilio-video')).default;
            addToLog('📦 Twilio Video SDK loaded');

            const roomName = `telenos-room-${appointmentId}`;
            addToLog(`🏠 Room name: ${roomName}`);

            // STEP 1: Explicitly get camera and microphone access FIRST
            addToLog('📹 Requesting camera and microphone access...');
            let localTracks;
            try {
                localTracks = await Video.createLocalTracks({
                    audio: true,
                    video: {
                        width: 640,
                        height: 480,
                        facingMode: 'user'
                    }
                });
                console.log('✅ Local tracks created:', localTracks);
                addToLog(`✅ Created ${localTracks.length} local tracks`);

                // Check what tracks we got
                localTracks.forEach((track, index) => {
                    console.log(`Track ${index}:`, track.kind, track);
                    addToLog(`📱 Track ${index}: ${track.kind}`);
                });

            } catch (trackError) {
                console.error('❌ Failed to create local tracks:', trackError);
                addToLog(`❌ Camera access failed: ${trackError.message}`);
                throw new Error(`Cannot access camera/microphone: ${trackError.message}`);
            }

            // STEP 2: Get access token
            const token = await getVideoToken(userIdentity, roomName);
            addToLog('🎫 Token obtained, connecting to room...');

            // STEP 3: Connect to room WITH the pre-created tracks
            const connectedRoom = await Video.connect(token, {
                name: roomName,
                tracks: localTracks,
                dominantSpeaker: true,
                networkQuality: true
            });

            addToLog(`🎉 Successfully connected to room: ${connectedRoom.name}`);
            console.log('📹 Connected to room:', connectedRoom.name);
            console.log('👤 Local participant:', connectedRoom.localParticipant.identity);

            // Save the room SID for recording
            setRoomSid(connectedRoom.sid);
            addToLog(`📝 Room SID saved: ${connectedRoom.sid}`);

            setRoom(connectedRoom);
            setCurrentScreen('in-call');

            // STEP 4: Attach local tracks to DOM with proper timing
            setTimeout(() => {
                console.log('🔍 Checking DOM refs after screen change...');
                console.log('localVideoRef.current:', localVideoRef.current);

                localTracks.forEach(track => {
                    if (track.kind === 'video') {
                        console.log('📹 Attaching local video track with delay');
                        if (localVideoRef.current) {
                            // Clear any existing content
                            localVideoRef.current.innerHTML = '';

                            const videoElement = track.attach();
                            videoElement.style.width = '100%';
                            videoElement.style.height = '100%';
                            videoElement.style.objectFit = 'cover';
                            videoElement.style.borderRadius = '12px';
                            videoElement.autoplay = true;
                            videoElement.playsInline = true;

                            localVideoRef.current.appendChild(videoElement);
                            setLocalVideoTrack(track);
                            addToLog('📹 Local video attached to DOM (delayed)');
                            console.log('✅ Video element created and attached:', videoElement);
                        } else {
                            console.error('❌ localVideoRef is still null after delay');
                            addToLog('❌ Video container still not found after delay');

                            // Try finding it by class name as fallback
                            const videoContainer = document.querySelector('.local-video');
                            if (videoContainer) {
                                console.log('📹 Found video container by class, attaching...');
                                videoContainer.innerHTML = '';
                                const videoElement = track.attach();
                                videoElement.style.width = '100%';
                                videoElement.style.height = '100%';
                                videoElement.style.objectFit = 'cover';
                                videoElement.autoplay = true;
                                videoElement.playsInline = true;
                                videoContainer.appendChild(videoElement);
                                setLocalVideoTrack(track);
                                addToLog('📹 Video attached via fallback method');
                            }
                        }
                    } else if (track.kind === 'audio') {
                        console.log('🎤 Setting local audio track');
                        setLocalAudioTrack(track);
                        addToLog('🎤 Local audio track ready');
                    }
                });
            }, 500);

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

    // Toggle audio
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

    // Toggle video
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

            if (roomSid) {
                addToLog('🎬 Recording cleanup will be handled by RecordingControls');
            }

            room.disconnect();
            setRoomSid(null);
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
        const shareableLink = getShareableLink();
        navigator.clipboard.writeText(shareableLink).then(() => {
            alert('Room link copied to clipboard!');
        });
    };

    // Get shareable room link
    const getShareableLink = () => {
        const baseUrl = window.location.origin;
        return `${baseUrl}/video-call/${appointmentId}`;
    };

    // ✅ CONVERT PARTICIPANTS MAP TO ARRAY FOR RECORDING CONTROLS
    const participantsArray = Array.from(participants.values());

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
        const shouldShowShareableLink = isProviderStart && !isPatient;

        return (
            <div className="join-screen">
                <div className="join-content">
                    <div className="video-icon">🎥</div>
                    <h2>{isProviderStart ? 'Start Video Consultation' : 'Join Video Consultation'}</h2>

                    {isProviderStart && !isPatient && (
                        <div className="provider-info">
                            <p><strong>Provider:</strong> Dr. Smith</p>
                            <p><strong>Appointment:</strong> {appointmentId}</p>
                            <p><strong>Room:</strong> telenos-room-{appointmentId}</p>
                        </div>
                    )}

                    {(!isProviderStart || isPatient) && (
                        <div className="patient-info">
                            <p><strong>Appointment ID:</strong> {appointmentId}</p>
                            <p>Please enter your name to join the video consultation.</p>
                        </div>
                    )}

                    {shouldShowShareableLink && (
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

                            <button onClick={() => {
                                setRoomSid('RM1234567890abcdef1234567890abcdef');
                                setIdentity('test-doctor');
                                setCurrentScreen('in-call');
                            }}>
                                Test Recording (Skip Video)
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleNameSubmit} className="name-form">
                        <input
                            type="text"
                            value={nameInputValue}
                            onChange={(e) => setNameInputValue(e.target.value)}
                            placeholder={isProviderStart && !isPatient ? "Dr. Smith" : "Enter your name"}
                            className="name-input"
                            required
                        />
                        <button type="submit" className="join-btn" disabled={isConnecting}>
                            {isConnecting ? 'Connecting...' : (isProviderStart && !isPatient ? 'Start Call' : 'Join Call')}
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
                    {process.env.NODE_ENV === 'development' && <RecordingDebugComponent />}
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

            {/* ✅ FIXED RECORDING CONTROLS WITH PROPER PROPS */}
            {roomSid && (
                <RecordingControls
                    room={room}
                    identity={identity}                    // ✅ Now properly defined
                    appointmentId={appointmentId}
                    participants={participantsArray}      // ✅ Convert Map to Array
                />
            )}

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
                {/* ✅ DEBUG INFO */}
                <p>Identity: {identity || 'Not set'}</p>
                <p>Room SID: {roomSid || 'Not available'}</p>
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
                <p>The video consultation has ended. Thank you for using Promind Psychiatry.</p>
                <button onClick={() => navigate('/dashboard')} className="back-btn">
                    Return to Dashboard
                </button>
            </div>
        </div>
    );

    const handleRecordingStart = (recording) => {
        console.log('🎬 Recording started:', recording);
        addToLog(`🎬 Recording started: ${recording.sid}`);
    };

    const handleRecordingStop = (recording) => {
        console.log('⏹️ Recording stopped:', recording);
        addToLog(`⏹️ Recording stopped: ${recording.sid}`);
    };

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