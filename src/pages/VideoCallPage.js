// In your VideoCallPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import RecordingControls from '../components/RecordingControls';

const VideoCallPage = () => {
    const { appointmentId } = useParams();
    const [room, setRoom] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [identity, setIdentity] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);

    // Generate or get user identity
    useEffect(() => {
        // Option A: Generate a unique identity
        const userIdentity = `user-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        setIdentity(userIdentity);

        // Option B: Use user from auth context (if you have authentication)
        // const { user } = useAuth();
        // setIdentity(user?.id || user?.email || 'anonymous-user');

        // Option C: Get from URL params or props
        // setIdentity(appointmentId ? `user-${appointmentId}` : 'anonymous-user');
    }, [appointmentId]);

    const joinVideoCall = async () => {
        try {
            setIsConnecting(true);
            setError(null);

            if (!identity) {
                throw new Error('User identity not set');
            }

            // Your existing video call connection logic
            const Video = (await import('twilio-video')).default;
            const roomName = `telenos-room-${appointmentId}`;

            // Get token with the identity
            const token = await getVideoToken(identity, roomName);

            // Create local tracks
            const localTracks = await Video.createLocalTracks({
                audio: true,
                video: { width: 640, height: 480, facingMode: 'user' }
            });

            // Connect to room
            const connectedRoom = await Video.connect(token, {
                name: roomName,
                tracks: localTracks
            });

            setRoom(connectedRoom);

            // Track participants
            const updateParticipants = () => {
                const participantList = Array.from(connectedRoom.participants.values());
                setParticipants(participantList);
            };

            connectedRoom.on('participantConnected', updateParticipants);
            connectedRoom.on('participantDisconnected', updateParticipants);
            updateParticipants(); // Initial update

        } catch (error) {
            console.error('Failed to join video call:', error);
            setError(error.message);
        } finally {
            setIsConnecting(false);
        }
    };

    const getVideoToken = async (identity, roomName) => {
        // Your token generation logic
        const response = await fetch(`${process.env.REACT_APP_API_GATEWAY_URL}/video/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identity, roomName })
        });

        if (!response.ok) {
            throw new Error('Failed to get video token');
        }

        const data = await response.json();
        return data.token;
    };

    return (
        <div className="video-call-page">
            <h1>Video Consultation</h1>
            <p>Appointment: {appointmentId}</p>

            {/* Video call UI */}
            <div className="video-container">
                {/* Your video elements */}
            </div>

            {/* Connection controls */}
            <div className="call-controls">
                {!room ? (
                    <button
                        onClick={joinVideoCall}
                        disabled={isConnecting || !identity}
                    >
                        {isConnecting ? 'Connecting...' : 'Join Call'}
                    </button>
                ) : (
                    <button onClick={() => room.disconnect()}>
                        End Call
                    </button>
                )}
            </div>

            {/* Recording controls - NOW WITH PROPER PROPS */}
            {room && (
                <RecordingControls
                    room={room}
                    identity={identity}              // ✅ Now properly defined
                    appointmentId={appointmentId}
                    participants={participants}
                />
            )}

            {/* Status display */}
            <div className="status">
                <p>Room: {room ? room.name : 'Not connected'}</p>
                <p>Participants: {participants.length}</p>
                <p>Identity: {identity || 'Not set'}</p>
                {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            </div>
        </div>
    );
};

export default VideoCallPage;