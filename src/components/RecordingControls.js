// src/components/RecordingControls.js
import React from 'react';
import { useAWSRecording } from '../hooks/useAWSRecording';

const RecordingControls = ({
    appointmentId,
    roomSid,
    onRecordingStart,
    onRecordingStop
}) => {
    const {
        isRecording,
        recordingSid,
        recordingStatus,
        error,
        loading,
        startRecording,
        stopRecording,
        clearError
    } = useAWSRecording(appointmentId, roomSid);

    const handleStartRecording = async () => {
        try {
            clearError();
            const recording = await startRecording({
                track: 'AudioVideoMixed',
                format: 'webm',
                mode: 'composed'
            });

            if (onRecordingStart) {
                onRecordingStart(recording);
            }
        } catch (err) {
            console.error('Recording start failed:', err);
        }
    };

    const handleStopRecording = async () => {
        try {
            clearError();
            const recording = await stopRecording();

            if (onRecordingStop) {
                onRecordingStop(recording);
            }
        } catch (err) {
            console.error('Recording stop failed:', err);
        }
    };

    return (
        <div className="recording-controls">
            {/* Recording Status Indicator */}
            <div className="recording-status">
                {isRecording && (
                    <div className="recording-indicator">
                        <span className="recording-dot pulsing"></span>
                        <span>Recording ({recordingStatus})</span>
                        {recordingSid && (
                            <span className="recording-id">ID: {recordingSid.slice(-8)}</span>
                        )}
                    </div>
                )}
            </div>

            {/* Recording Buttons */}
            <div className="recording-buttons">
                {!isRecording ? (
                    <button
                        onClick={handleStartRecording}
                        disabled={!roomSid || !appointmentId || loading}
                        className="btn-start-recording"
                    >
                        {loading ? '⏳' : '🔴'} Start Recording
                    </button>
                ) : (
                    <button
                        onClick={handleStopRecording}
                        disabled={loading}
                        className="btn-stop-recording"
                    >
                        {loading ? '⏳' : '⏹️'} Stop Recording
                    </button>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <div className="recording-error">
                    ❌ {error}
                    <button onClick={clearError} className="error-close">✕</button>
                </div>
            )}

            {/* Info Display */}
            {roomSid && (
                <div className="recording-info">
                    <small>Room: {roomSid.slice(-8)} | Appointment: {appointmentId}</small>
                </div>
            )}
        </div>
    );
};

export default RecordingControls;