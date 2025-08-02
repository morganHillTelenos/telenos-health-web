// src/components/RecordingControls.js - Fixed Participant Count
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
            console.log('🔍 RECORDING DEBUG - Room object:', room);
            console.log('🔍 RECORDING DEBUG - Room SID:', room?.sid);
            console.log('🔍 RECORDING DEBUG - Expected SID:', 'RMceb13506451702c18bf4b1039bfd3004');
            console.log('🔍 RECORDING DEBUG - Room properties:', Object.keys(room || {}));

            console.log('🎬 Handle start recording clicked');
    

            // Validate room
            if (!room) {
                alert('No room available. Please join the video call first.');
                return;
            }

            if (!room.sid) {
                alert('Room is not properly initialized. Please refresh and try again.');
                return;
            }

            // ✅ FIXED: Calculate total participants (local + remote)
            const totalParticipants = participants.length + 1; // +1 for local participant (you)
            console.log(`Total participants: ${totalParticipants} (${participants.length} remote + 1 local)`);

            if (totalParticipants < 2) {
                alert(`Recording requires at least 2 participants. Currently: ${totalParticipants} (you + ${participants.length} others)`);
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

    // ✅ FIXED: Include local participant in count
    const totalParticipants = participants.length + 1; // +1 for local participant
    const canRecord = room && room.sid && totalParticipants >= 2;

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

            {/* ✅ UPDATED STATUS INDICATORS */}
            <div style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
                {!room && <p>⚠️ No room available</p>}
                {room && !room.sid && <p>⚠️ Room not initialized</p>}
                {room && room.sid && <p>✅ Room: {room.sid}</p>}
                <p>
                    Participants: {totalParticipants}/2 minimum
                    (You + {participants.length} others)
                </p>
                <p>Identity: {identity || 'Not set'}</p>
                {error && <p style={{ color: 'red' }}>❌ Error: {error}</p>}
                {isRecording && <p style={{ color: 'green' }}>🔴 Recording in progress</p>}

                {/* ✅ DEBUG INFO */}
                <details style={{ marginTop: '10px', fontSize: '10px' }}>
                    <summary>Debug Info</summary>
                    <p>Room SID: {room?.sid || 'None'}</p>
                    <p>Room Name: {room?.name || 'None'}</p>
                    <p>Remote Participants: {participants.length}</p>
                    <p>Can Record: {canRecord ? 'Yes' : 'No'}</p>
                    <p>Room Object: {room ? 'Available' : 'Missing'}</p>
                    {participants.length > 0 && (
                        <div>
                            <p>Participant List:</p>
                            {participants.map((p, i) => (
                                <p key={i}>- {p.identity || p.sid}</p>
                            ))}
                        </div>
                    )}
                </details>
            </div>
        </div>
    );
};

export default RecordingControls;