// src/pages/VideoCallPage.js - Fixed Video Elements
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff, Share, Settings, Users } from 'lucide-react';
import frontendChimeService from '../services/frontendChimeService';
import './VideoCallPage.css';

const VideoCallPage = ({ mode = 'provider' }) => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();

    // State management
    const [callStatus, setCallStatus] = useState('initializing');
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [error, setError] = useState(null);
    const [meetingSession, setMeetingSession] = useState(null);
    const [participantName, setParticipantName] = useState('');
    const [shareableLink, setShareableLink] = useState('');
    const [participants, setParticipants] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState('Connecting...');
    const [callDuration, setCallDuration] = useState(0);
    const [devices, setDevices] = useState({ audioInput: [], videoInput: [], audioOutput: [] });

    // Refs for video elements
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const audioElementRef = useRef(null);
    const callStartTime = useRef(null);

    // Initialize call on component mount - FIXED with proper timing
    useEffect(() => {
        // Wait for video elements to be mounted before initializing
        const timer = setTimeout(() => {
            initializeCall();
        }, 100);

        // Cleanup on unmount
        return () => {
            clearTimeout(timer);
            if (meetingSession) {
                endMeeting();
            }
        };
    }, [appointmentId, mode]);

    // Timer for call duration
    useEffect(() => {
        let interval;
        if (callStatus === 'connected' && callStartTime.current) {
            interval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - callStartTime.current) / 1000);
                setCallDuration(elapsed);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [callStatus]);

    // Initialize audio element
    useEffect(() => {
        if (!audioElementRef.current) {
            audioElementRef.current = new Audio();
            audioElementRef.current.autoplay = true;
        }
    }, []);

    const initializeCall = async () => {
        try {
            console.log('🎥 Initializing call with video refs:', {
                localVideo: !!localVideoRef.current,
                remoteVideo: !!remoteVideoRef.current,
                audio: !!audioElementRef.current
            });

            setCallStatus('connecting');
            setError(null);

            // Load available devices
            const availableDevices = await frontendChimeService.getDevices();
            setDevices(availableDevices);

            let result;

            if (mode === 'provider') {
                console.log('🩺 Provider starting video call...');
                setParticipantName('Dr. Provider');
                result = await frontendChimeService.createMeeting(appointmentId, 'provider', 'Dr. Provider');

                if (result.success) {
                    setShareableLink(result.joinUrl);
                }
            } else {
                console.log('👤 Patient joining video call...');
                if (!participantName) {
                    setCallStatus('waiting_for_name');
                    return;
                }
                result = await frontendChimeService.joinExistingMeeting(appointmentId, 'patient', participantName);
            }

            if (!result.success) {
                throw new Error(result.error);
            }

            console.log('✅ Meeting joined, setting up video session...');
            setConnectionStatus('Setting up video...');

            // Setup video session with proper refs
            const session = await frontendChimeService.setupChimeSession(
                result.meeting,
                result.attendee,
                localVideoRef,
                remoteVideoRef,
                audioElementRef
            );

            setMeetingSession(session);
            setCallStatus('connected');
            setConnectionStatus('Connected');
            callStartTime.current = Date.now();

            console.log('✅ Video call connected!');

        } catch (error) {
            console.error('❌ Failed to initialize call:', error);
            setError(error.message);
            setCallStatus('error');
            setConnectionStatus('Connection failed');
        }
    };

    const handleJoinAsPatient = async (name) => {
        setParticipantName(name);
        setCallStatus('connecting');

        try {
            const result = await frontendChimeService.joinExistingMeeting(appointmentId, 'patient', name);

            if (!result.success) {
                throw new Error(result.error);
            }

            const session = await frontendChimeService.setupChimeSession(
                result.meeting,
                result.attendee,
                localVideoRef,
                remoteVideoRef,
                audioElementRef
            );

            setMeetingSession(session);
            setCallStatus('connected');
            setConnectionStatus('Connected');
            callStartTime.current = Date.now();

        } catch (error) {
            console.error('❌ Failed to join as patient:', error);
            setError(error.message);
            setCallStatus('error');
        }
    };

    const toggleAudio = async () => {
        try {
            const result = await frontendChimeService.toggleAudio();
            setIsAudioMuted(result.audioMuted);
        } catch (error) {
            console.error('Error toggling audio:', error);
        }
    };

    const toggleVideo = async () => {
        try {
            const result = await frontendChimeService.toggleVideo();
            setIsVideoEnabled(result.videoEnabled);
        } catch (error) {
            console.error('Error toggling video:', error);
        }
    };

    const endMeeting = async () => {
        try {
            await frontendChimeService.endCall(appointmentId);
            setCallStatus('ended');
            setConnectionStatus('Call ended');

            // Navigate back after a short delay
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (error) {
            console.error('Error ending meeting:', error);
            // Still navigate back even if there's an error
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        }
    };

    const copyShareableLink = () => {
        navigator.clipboard.writeText(shareableLink);
        alert('Meeting link copied to clipboard!');
    };

    const formatDuration = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Render patient name input
    if (callStatus === 'waiting_for_name') {
        return (
            <div className="video-call-container">
                <div className="name-input-card">
                    <h2>Join Video Call</h2>
                    <p>Please enter your name to join the healthcare consultation</p>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const name = e.target.patientName.value.trim();
                        if (name) handleJoinAsPatient(name);
                    }}>
                        <input
                            name="patientName"
                            type="text"
                            placeholder="Enter your full name"
                            required
                            className="name-input"
                        />
                        <button type="submit" className="join-button">
                            Join Call
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Render error state
    if (callStatus === 'error') {
        return (
            <div className="video-call-container">
                <div className="error-card">
                    <h2>Connection Error</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate('/dashboard')} className="back-button">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // Render call ended state
    if (callStatus === 'ended') {
        return (
            <div className="video-call-container">
                <div className="call-ended-card">
                    <h2>Call Ended</h2>
                    <p>Thank you for using TelenosHealth</p>
                    <p>Call duration: {formatDuration(callDuration)}</p>
                    <button onClick={() => navigate('/dashboard')} className="back-button">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // Main video call interface
    return (
        <div className="video-call-container">
            {/* Header */}
            <div className="call-header">
                <div className="call-info">
                    <h3>Healthcare Video Consultation</h3>
                    <p>{connectionStatus}</p>
                    {callStatus === 'connected' && (
                        <span className="call-duration">{formatDuration(callDuration)}</span>
                    )}
                </div>

                {mode === 'provider' && shareableLink && (
                    <div className="share-section">
                        <button onClick={copyShareableLink} className="share-button">
                            <Share size={16} />
                            Share Link
                        </button>
                    </div>
                )}
            </div>

            {/* Video Grid - FIXED: No more duplicate video elements */}
            <div className="video-grid">
                {/* Remote Video (Other Participant) */}
                <div className="video-container remote-video-container">
                    <video
                        ref={remoteVideoRef}
                        className="remote-video-element"
                        autoPlay={true}
                        playsInline={true}
                        style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: '#000',
                            objectFit: 'cover'
                        }}
                    />
                    <div className="video-overlay">
                        <span className="participant-name">
                            {mode === 'provider' ? 'Patient' : 'Healthcare Provider'}
                        </span>
                    </div>
                </div>

                {/* Local Video (Your Camera) */}
                <div className="video-container local-video-container">
                    <video
                        ref={localVideoRef}
                        className="local-video-element"
                        autoPlay={true}
                        muted={true}
                        playsInline={true}
                        style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: '#000',
                            objectFit: 'cover',
                            border: '2px solid #3b82f6',
                            borderRadius: '8px'
                        }}
                    />
                    <div className="video-overlay">
                        <span className="participant-name">You ({participantName})</span>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="call-controls">
                <button
                    onClick={toggleAudio}
                    className={`control-button ${isAudioMuted ? 'muted' : ''}`}
                    title={isAudioMuted ? 'Unmute' : 'Mute'}
                >
                    {isAudioMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>

                <button
                    onClick={toggleVideo}
                    className={`control-button ${!isVideoEnabled ? 'disabled' : ''}`}
                    title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
                >
                    {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
                </button>

                <button
                    onClick={endMeeting}
                    className="control-button end-call"
                    title="End call"
                >
                    <PhoneOff size={24} />
                </button>
            </div>

            {/* Status Messages */}
            {callStatus === 'connecting' && (
                <div className="status-overlay">
                    <div className="status-message">
                        <div className="loading-spinner"></div>
                        <p>Connecting to video call...</p>
                    </div>
                </div>
            )}

            {/* Hidden audio element for remote audio */}
            <audio
                ref={audioElementRef}
                autoPlay={true}
                style={{ display: 'none' }}
            />
        </div>
    );
};

export default VideoCallPage;