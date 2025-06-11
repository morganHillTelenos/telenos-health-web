import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import './VideoCallPage.css';

const VideoCallPage = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const [appointment, setAppointment] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [duration, setDuration] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAppointment();
        simulateConnection();
    }, [appointmentId]);

    useEffect(() => {
        if (isConnected) {
            const timer = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [isConnected]);

    const loadAppointment = async () => {
        try {
            const appointmentData = await apiService.getAppointment(appointmentId);
            setAppointment(appointmentData);
        } catch (error) {
            console.error('Error loading appointment:', error);
            // Use mock data for demo
            setAppointment({
                id: appointmentId,
                patient: 'Demo Patient',
                date: new Date().toISOString().split('T')[0],
                time: '10:00',
                reason: 'Consultation'
            });
        } finally {
            setLoading(false);
        }
    };

    const simulateConnection = () => {
        // Simulate connection delay
        setTimeout(() => {
            setIsConnected(true);
        }, 2000);
    };

    const formatDuration = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleEndCall = () => {
        navigate('/calendar');
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    const toggleVideo = () => {
        setIsVideoEnabled(!isVideoEnabled);
    };

    if (loading) {
        return (
            <div className="video-call-page">
                <div className="connection-overlay">
                    <div className="connection-spinner"></div>
                    <div className="connection-text">Loading session...</div>
                </div>
            </div>
        );
    }

    if (!isConnected) {
        return (
            <div className="video-call-page">
                <div className="connection-overlay">
                    <div className="connection-spinner"></div>
                    <div className="connection-text">Connecting...</div>
                    <div className="connection-subtitle">
                        Establishing secure connection with {appointment?.patient}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="video-call-page">
            {/* Header */}
            <div className="video-header">
                <div className="video-info">
                    <h2>{appointment?.patient}</h2>
                    <div className="video-duration">{formatDuration(duration)}</div>
                </div>
                <div className="video-status">
                    <span>🔒</span>
                    Secure Session
                </div>
            </div>

            {/* Video Content */}
            <div className="video-content">
                <div className="remote-video">
                    <div className="video-placeholder-icon">👤</div>
                    <div className="video-placeholder-text">{appointment?.patient}</div>
                    <div className="video-placeholder-status">Connected</div>
                </div>

                {/* Local Video (Picture in Picture) */}
                <div className="local-video">
                    <div className="local-video-label">You</div>
                    {isVideoEnabled ? (
                        <>
                            <div className="local-video-icon">📹</div>
                            <div className="local-video-status">Camera On</div>
                        </>
                    ) : (
                        <>
                            <div className="local-video-icon">📷</div>
                            <div className="local-video-status">Camera Off</div>
                        </>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="video-controls">
                <button
                    className={`control-button ${isMuted ? 'muted' : ''}`}
                    onClick={toggleMute}
                    title={isMuted ? 'Unmute' : 'Mute'}
                >
                    {isMuted ? '🔇' : '🎤'}
                </button>

                <button
                    className={`control-button ${!isVideoEnabled ? 'video-off' : ''}`}
                    onClick={toggleVideo}
                    title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
                >
                    {isVideoEnabled ? '📹' : '📷'}
                </button>

                <button
                    className="end-call-button"
                    onClick={handleEndCall}
                    title="End call"
                >
                    END
                </button>
            </div>
        </div>
    );
};

export default VideoCallPage;