// src/pages/VideoCallPage.js - Fixed to use NPM imports properly
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import frontendChimeService from '../services/frontendChimeService';
import videoService from '../services/mockVideoService';

const VideoCallPage = ({ mode = 'provider' }) => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const [callStatus, setCallStatus] = useState('joining');
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [error, setError] = useState(null);
    const [meetingSession, setMeetingSession] = useState(null);
    const [participantName, setParticipantName] = useState('');
    const [shareableLink, setShareableLink] = useState('');

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const audioElementRef = useRef(null);

    useEffect(() => {
        if (appointmentId) {
            videoService.loadMeetingFromStorage(appointmentId);

            if (mode === 'provider') {
                initializeProviderCall();
            } else {
                setCallStatus('waiting_for_name');
            }
        }

        return () => {
            if (meetingSession) {
                endCall(false);
            }
        };
    }, [appointmentId, mode]);

    // Initialize audio element
    useEffect(() => {
        if (!audioElementRef.current) {
            audioElementRef.current = new Audio();
            audioElementRef.current.autoplay = true;
        }
    }, []);

    const initializeProviderCall = async () => {
        try {
            setCallStatus('joining');
            console.log('🎥 Provider starting video call...');

            const result = await videoService.createMeeting(
                appointmentId,
                'provider',
                'Dr. Smith'
            );

            if (!result.success) {
                throw new Error(result.error);
            }

            console.log('✅ Meeting created, setting up video session...');

            // Save meeting to storage
            videoService.saveMeetingToStorage(appointmentId, {
                meeting: result.meeting,
                meetingId: result.meeting.MeetingId,
                appointmentId: appointmentId,
                createdAt: new Date(),
                createdBy: 'provider',
                userName: 'Dr. Smith'
            });

            setShareableLink(result.joinUrl);

            // Use the NPM-based setup method from the service
            const session = await videoService.setupChimeSession(
                result.meeting,
                result.attendee,
                localVideoRef,
                remoteVideoRef,
                audioElementRef
            );

            setMeetingSession(session);
            setCallStatus('connected');
            console.log('✅ Video call ready!');

        } catch (error) {
            console.error('❌ Failed to initialize provider call:', error);
            setError(error.message);
            setCallStatus('error');
        }
    };

    const initializePatientCall = async () => {
        try {
            setCallStatus('joining');
            console.log('🎥 Patient joining video call...');

            const result = await videoService.joinExistingMeeting(
                appointmentId,
                'patient',
                participantName
            );

            if (!result.success) {
                throw new Error(result.error);
            }

            console.log('✅ Patient joined meeting, setting up video session...');

            // Use the NPM-based setup method from the service
            const session = await videoService.setupChimeSession(
                result.meeting,
                result.attendee,
                localVideoRef,
                remoteVideoRef,
                audioElementRef
            );

            setMeetingSession(session);
            setCallStatus('connected');
            console.log('✅ Patient video call ready!');

        } catch (error) {
            console.error('❌ Failed to initialize patient call:', error);
            setError(error.message);
            setCallStatus('error');
        }
    };

    const toggleMute = () => {
        if (meetingSession) {
            if (isAudioMuted) {
                meetingSession.audioVideo.realtimeUnmuteLocalAudio();
                console.log('🎤 Audio unmuted');
            } else {
                meetingSession.audioVideo.realtimeMuteLocalAudio();
                console.log('🔇 Audio muted');
            }
            setIsAudioMuted(!isAudioMuted);
        }
    };

    const toggleVideo = () => {
        if (meetingSession) {
            if (isVideoEnabled) {
                meetingSession.audioVideo.stopLocalVideoTile();
                console.log('📷 Video stopped');
            } else {
                meetingSession.audioVideo.startLocalVideoTile();
                console.log('📹 Video started');
            }
            setIsVideoEnabled(!isVideoEnabled);
        }
    };

    const endCall = async (shouldNavigate = true) => {
        console.log('📞 Ending call...');

        if (meetingSession) {
            meetingSession.audioVideo.stop();
            setMeetingSession(null);
        }

        if (mode === 'provider') {
            try {
                await videoService.endMeeting(appointmentId);
                console.log('✅ Meeting ended successfully');
            } catch (error) {
                console.error('Error ending meeting:', error);
            }
        }

        setCallStatus('ended');

        if (shouldNavigate) {
            setTimeout(() => {
                if (mode === 'provider') {
                    navigate('/dashboard');
                } else {
                    navigate('/');
                }
            }, 3000);
        }
    };

    const copyShareableLink = () => {
        if (shareableLink) {
            navigator.clipboard.writeText(shareableLink).then(() => {
                alert('📋 Patient join link copied to clipboard!');
            }).catch(() => {
                alert(`Share this link with your patient:\n${shareableLink}`);
            });
        }
    };

    // Patient name input screen
    if (mode === 'patient' && callStatus === 'waiting_for_name') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center">
                <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
                    <div className="text-center mb-6">
                        <div className="text-4xl mb-4">🏥</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Join Video Consultation</h1>
                        <p className="text-gray-600">Please enter your name to continue</p>
                    </div>

                    <input
                        type="text"
                        placeholder="Enter your full name"
                        value={participantName}
                        onChange={(e) => setParticipantName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === 'Enter' && participantName.trim() && initializePatientCall()}
                    />

                    <button
                        onClick={initializePatientCall}
                        disabled={!participantName.trim()}
                        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
                    >
                        Join Video Call
                    </button>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        🔒 HIPAA Compliant • 🔐 End-to-End Encrypted<br />
                        Powered by AWS Chime SDK
                    </div>
                </div>
            </div>
        );
    }

    // Loading/connecting screen
    if (callStatus === 'joining') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center">
                <div className="text-center text-white">
                    <div className="text-6xl mb-6 animate-pulse">⏳</div>
                    <h2 className="text-2xl font-bold mb-2">
                        {mode === 'provider' ? 'Starting your consultation...' : 'Connecting to your healthcare provider...'}
                    </h2>
                    <p className="text-blue-200 mb-4">Setting up secure video connection</p>
                    <div className="bg-white/10 rounded-lg p-4 max-w-md mx-4">
                        <p className="text-sm text-blue-100">
                            📦 Using NPM Chime SDK<br />
                            🔐 HIPAA Compliant Infrastructure<br />
                            {mode === 'provider' && '🔗 Patient link will be generated'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Error screen
    if (callStatus === 'error') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-purple-900 flex items-center justify-center">
                <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 text-center">
                    <div className="text-4xl mb-4">❌</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Connection Failed</h1>
                    <p className="text-gray-600 mb-6">{error}</p>

                    <div className="space-y-3">
                        <button
                            onClick={() => {
                                setCallStatus('joining');
                                setError(null);
                                if (mode === 'provider') {
                                    initializeProviderCall();
                                } else {
                                    initializePatientCall();
                                }
                            }}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            🔄 Try Again
                        </button>
                        <button
                            onClick={() => navigate(mode === 'provider' ? '/dashboard' : '/')}
                            className="w-full bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            ← Go Back
                        </button>
                    </div>

                    <div className="mt-6 text-xs text-gray-500">
                        Check browser console for detailed error information
                    </div>
                </div>
            </div>
        );
    }

    // Call ended screen
    if (callStatus === 'ended') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-blue-900 flex items-center justify-center">
                <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 text-center">
                    <div className="text-4xl mb-4">✅</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Session Ended</h1>
                    <p className="text-gray-600 mb-6">
                        Thank you for using our secure healthcare platform.
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-green-800">
                            🔒 Session was HIPAA compliant<br />
                            📊 All data secured by AWS infrastructure
                        </p>
                    </div>
                    <p className="text-sm text-gray-500">Redirecting in 3 seconds...</p>
                </div>
            </div>
        );
    }

    // Active video call interface
    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            {/* Remote video (full screen) */}
            <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
            />

            {/* Local video (picture-in-picture) */}
            <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="absolute top-4 right-4 w-48 h-36 object-cover rounded-lg border-2 border-white/30 shadow-lg"
                style={{ transform: 'scaleX(-1)' }} // Mirror local video
            />

            {/* Header with session info */}
            <div className="absolute top-4 left-4 bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
                <div className="text-sm font-medium">
                    {mode === 'provider' ? '🩺 Healthcare Provider Session' : '🧑‍💼 Patient Consultation'}
                </div>
                <div className="text-xs text-gray-300">
                    ID: {appointmentId} • NPM SDK
                </div>
            </div>

            {/* Provider controls - patient link sharing */}
            {mode === 'provider' && shareableLink && (
                <div className="absolute top-4 right-52 bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
                    <button
                        onClick={copyShareableLink}
                        className="text-sm hover:text-blue-300 transition-colors flex items-center gap-2"
                    >
                        📋 Copy Patient Link
                    </button>
                </div>
            )}

            {/* Call controls */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4">
                {/* Mute/Unmute button */}
                <button
                    onClick={toggleMute}
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-200 shadow-lg ${isAudioMuted
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30'
                        }`}
                    title={isAudioMuted ? 'Unmute' : 'Mute'}
                >
                    {isAudioMuted ? '🔇' : '🎤'}
                </button>

                {/* Video on/off button */}
                <button
                    onClick={toggleVideo}
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-200 shadow-lg ${!isVideoEnabled
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30'
                        }`}
                    title={isVideoEnabled ? 'Turn off video' : 'Turn on video'}
                >
                    {isVideoEnabled ? '📹' : '📷'}
                </button>

                {/* End call button */}
                <button
                    onClick={() => endCall()}
                    className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center text-2xl transition-all duration-200 shadow-lg"
                    title="End call"
                >
                    📞
                </button>
            </div>

            {/* Security/status indicator */}
            <div className="absolute bottom-4 right-4 bg-green-500/80 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                🔒 NPM SDK • Secure & Encrypted
            </div>

            {/* Connection status (only show if needed) */}
            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm">
                📡 Connected • {mode === 'provider' ? 'Host' : 'Guest'}
            </div>
        </div>
    );

    
};



export default VideoCallPage;