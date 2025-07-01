// src/pages/VideoCallPage.js - Updated with Real Twilio
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTwilioVideo } from '../hooks/useTwilioVideo';
import { authService } from '../services/auth';
import './VideoCallPage.css';

const VideoCallPage = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Check if this is a provider-initiated call
    const isProviderStart = location.pathname.includes('/start/');

    const {
        room,
        participants,
        participantCount,
        isConnecting,
        isConnected,
        error,
        isAudioMuted,
        isVideoMuted,
        connectToRoom,
        disconnectFromRoom,
        toggleAudio,
        toggleVideo,
        generateRoomName,
        generateIdentity
    } = useTwilioVideo();

    const [callState, setCallState] = useState('waiting'); // 'waiting', 'name-input', 'connecting', 'connected', 'ended'
    const [participantName, setParticipantName] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [roomName, setRoomName] = useState('');
    const [identity, setIdentity] = useState('');

    // Initialize user and room info
    useEffect(() => {
        const initializeCall = async () => {
            try {
                if (authService.isAuthenticated()) {
                    const user = await authService.getCurrentUser();
                    setCurrentUser(user);

                    // Generate room name and identity
                    const generatedRoomName = generateRoomName(appointmentId);
                    const userType = isProviderStart ? 'provider' : 'patient';
                    const generatedIdentity = generateIdentity(userType, user.id);

                    setRoomName(generatedRoomName);
                    setIdentity(generatedIdentity);
                    setParticipantName(user.name || user.email);

                    // For providers, skip name input and go straight to waiting
                    if (isProviderStart) {
                        setCallState('waiting');
                    } else {
                        setCallState('name-input');
                    }
                }
            } catch (error) {
                console.error('Error initializing call:', error);
            }
        };

        initializeCall();
    }, [appointmentId, isProviderStart, generateRoomName, generateIdentity]);

    // Handle joining the call
    const handleJoinCall = async () => {
        try {
            setCallState('connecting');
            await connectToRoom(identity, roomName);
            setCallState('connected');
        } catch (error) {
            console.error('Failed to join call:', error);
            setCallState('error');
        }
    };

    // Handle ending the call
    const handleEndCall = () => {
        disconnectFromRoom();
        setCallState('ended');
    };

    // Handle going back to calendar
    const handleBackToCalendar = () => {
        navigate('/calendar');
    };

    // Handle name form submission
    const handleNameSubmit = (e) => {
        e.preventDefault();
        if (participantName.trim()) {
            const updatedIdentity = generateIdentity('patient', participantName.trim());
            setIdentity(updatedIdentity);
            setCallState('waiting');
        }
    };

    // Copy room link to clipboard
    const copyRoomLink = async () => {
        const roomLink = `${window.location.origin}/video-call/${appointmentId}`;
        try {
            await navigator.clipboard.writeText(roomLink);
            alert('Room link copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy link:', err);
        }
    };

    // Render different states
    const renderContent = () => {
        switch (callState) {
            case 'name-input':
                return (
                    <div className="name-input-screen">
                        <div className="name-input-content">
                            <h2>Enter Your Name</h2>
                            <p>Please enter your name to join the video consultation</p>
                            <form onSubmit={handleNameSubmit} className="name-form">
                                <input
                                    type="text"
                                    value={participantName}
                                    onChange={(e) => setParticipantName(e.target.value)}
                                    placeholder="Your full name"
                                    className="name-input"
                                    required
                                />
                                <button type="submit" className="join-call-btn">
                                    Continue to Waiting Room
                                </button>
                            </form>
                        </div>
                    </div>
                );

            case 'waiting':
                return (
                    <div className="join-screen">
                        <div className="join-content">
                            <div className="video-icon">🎥</div>
                            <h2>Ready to Join Video Call</h2>

                            <div className="provider-info">
                                <p><strong>Appointment:</strong> #{appointmentId}</p>
                                <p><strong>Participant:</strong> {participantName}</p>
                                <p><strong>Room:</strong> {roomName}</p>
                            </div>

                            {isProviderStart && (
                                <div className="shareable-link-section">
                                    <label>Share this link with your patient:</label>
                                    <div className="link-container">
                                        <input
                                            type="text"
                                            value={`${window.location.origin}/video-call/${appointmentId}`}
                                            readOnly
                                            className="shareable-link"
                                        />
                                        <button onClick={copyRoomLink} className="copy-btn">
                                            Copy
                                        </button>
                                    </div>
                                </div>
                            )}

                            <button onClick={handleJoinCall} className="join-btn" disabled={isConnecting}>
                                {isConnecting ? 'Connecting...' : 'Join Video Call'}
                            </button>

                            <div className="security-info">
                                🔒 This call is secure and HIPAA compliant. Your video and audio are encrypted end-to-end.
                            </div>
                        </div>
                    </div>
                );

            case 'connecting':
                return (
                    <div className="loading-screen">
                        <div className="loading-content">
                            <div className="loading-spinner"></div>
                            <h2>Connecting to Video Call</h2>
                            <p>Please wait while we connect you to the room...</p>
                        </div>
                    </div>
                );

            case 'connected':
                return (
                    <div className="in-call-screen">
                        <div className="in-call-content">
                            <div className="call-icon">📹</div>
                            <h2>Video Call Active</h2>
                            <p><strong>Room:</strong> {room?.name}</p>
                            <p><strong>Participants:</strong> {participantCount + 1}</p>
                            <p><strong>Your Identity:</strong> {identity}</p>

                            {participants.length > 0 && (
                                <div className="participants-list">
                                    <h3>Connected Participants:</h3>
                                    {participants.map(participant => (
                                        <p key={participant.sid}>👤 {participant.identity}</p>
                                    ))}
                                </div>
                            )}

                            <div className="call-controls">
                                <button
                                    onClick={toggleAudio}
                                    className={`control-btn ${isAudioMuted ? 'muted' : ''}`}
                                >
                                    {isAudioMuted ? '🔇' : '🎤'}
                                </button>
                                <button
                                    onClick={toggleVideo}
                                    className={`control-btn ${isVideoMuted ? 'muted' : ''}`}
                                >
                                    {isVideoMuted ? '📹' : '📷'}
                                </button>
                                <button onClick={handleEndCall} className="end-call-btn">
                                    End Call
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 'ended':
                return (
                    <div className="call-ended-screen">
                        <div className="call-ended-content">
                            <div className="call-ended-icon">✅</div>
                            <h2>Call Ended</h2>
                            <p>Thank you for using TelenosHealth video consultation.</p>
                            <button onClick={handleBackToCalendar} className="back-btn">
                                Back to Calendar
                            </button>
                        </div>
                    </div>
                );

            case 'error':
                return (
                    <div className="error-screen">
                        <div className="error-content">
                            <div className="error-icon">⚠️</div>
                            <h2>Connection Error</h2>
                            <p>{error || 'Failed to connect to video call'}</p>
                            <button onClick={() => setCallState('waiting')} className="back-btn">
                                Try Again
                            </button>
                            <button onClick={handleBackToCalendar} className="back-btn">
                                Back to Calendar
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="video-call-page">
            <div className="video-header">
                <h1>Video Consultation</h1>
                <div className="appointment-id">Appointment: {appointmentId}</div>
            </div>

            <div className="video-container">
                {renderContent()}
            </div>
        </div>
    );
};

export default VideoCallPage;