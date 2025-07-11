import React from 'react';
import { useAWSRecording } from '../hooks/useAWSRecording';

const RecordingControls = ({ room, identity, appointmentId, participants = [] }) => {
    const {
        isRecording,
        error,
        isLoading,
        startRecording,
        stopRecording
    } = useAWSRecording();

    const handleStartRecording = async () => {
        try {
            console.log('🎬 Handle start recording clicked');
            console.log('Room object:', room);
            console.log('Participants:', participants);

            // Validate room
            if (!room) {
                alert('No room available. Please join the video call first.');
                return;
            }

            if (!room.sid) {
                alert('Room is not properly initialized. Please refresh and try again.');
                return;
            }

            // Check participant count
            if (participants.length < 2) {
                alert(`Recording requires at least 2 participants. Currently: ${participants.length}`);
                return;
            }

            await startRecording(room, identity, appointmentId);
            console.log('✅ Recording started successfully');

        } catch (error) {
            console.error('❌ Failed to start recording:', error);
            alert(`Failed to start recording: ${error.message}`);
        }
    };

    const handleStopRecording = async () => {
        try {
            console.log('🛑 Handle stop recording clicked');
            await stopRecording(room);
            console.log('✅ Recording stopped successfully');

        } catch (error) {
            console.error('❌ Failed to stop recording:', error);
            alert(`Failed to stop recording: ${error.message}`);
        }
    };

    const canRecord = room && room.sid && participants.length >= 2;

    return (
        <div style={{ margin: '10px 0' }}>
            {!isRecording ? (
                <button
                    onClick={handleStartRecording}
                    disabled={!canRecord || isLoading}
                    style={{
                        backgroundColor: canRecord ? '#ef4444' : '#6b7280',
                        color: 'white',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: canRecord ? 'pointer' : 'not-allowed',
                        opacity: canRecord ? 1 : 0.5
                    }}
                >
                    {isLoading ? 'Starting...' : 'Start Recording'}
                </button>
            ) : (
                <button
                    onClick={handleStopRecording}
                    disabled={isLoading}
                    style={{
                        backgroundColor: '#dc2626',
                        color: 'white',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    {isLoading ? 'Stopping...' : 'Stop Recording'}
                </button>
            )}

            {/* Status indicators */}
            <div style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
                {!room && <p>⚠️ No room available</p>}
                {room && !room.sid && <p>⚠️ Room not initialized</p>}
                {room && room.sid && <p>✅ Room: {room.sid}</p>}
                <p>Participants: {participants.length}/2 minimum</p>
                {error && <p style={{ color: 'red' }}>❌ Error: {error}</p>}
                {isRecording && <p style={{ color: 'green' }}>🔴 Recording in progress</p>}
            </div>
        </div>
    );
};

export default RecordingControls;