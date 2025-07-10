// src/hooks/useAWSRecording.js
import { useState, useCallback } from 'react';
import { awsLambdaRecordingService } from '../services/awsLambdaRecordingService';

export const useAWSRecording = (appointmentId, roomSid) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingSid, setRecordingSid] = useState(null);
    const [recordingStatus, setRecordingStatus] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const startRecording = useCallback(async (options = {}) => {
        if (!roomSid || !appointmentId) {
            throw new Error('Room SID and Appointment ID are required');
        }

        try {
            setError(null);
            setLoading(true);

            console.log('🎬 Starting recording...');
            const recording = await awsLambdaRecordingService.startRecording(
                roomSid,
                appointmentId,
                options
            );

            setRecordingSid(recording.sid);
            setIsRecording(true);
            setRecordingStatus('started');

            console.log('✅ Recording started successfully');
            return recording;

        } catch (err) {
            console.error('❌ Failed to start recording:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [roomSid, appointmentId]);

    const stopRecording = useCallback(async () => {
        if (!recordingSid) {
            throw new Error('No active recording to stop');
        }

        try {
            setError(null);
            setLoading(true);

            console.log('⏹️ Stopping recording...');
            const recording = await awsLambdaRecordingService.stopRecording(recordingSid);

            setIsRecording(false);
            setRecordingStatus('stopped');

            console.log('✅ Recording stopped successfully');
            return recording;

        } catch (err) {
            console.error('❌ Failed to stop recording:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [recordingSid]);

    const getRecordingInfo = useCallback(() => {
        if (!recordingSid) return null;
        return awsLambdaRecordingService.getActiveRecording(recordingSid);
    }, [recordingSid]);

    return {
        // Recording state
        isRecording,
        recordingSid,
        recordingStatus,
        error,
        loading,

        // Recording actions
        startRecording,
        stopRecording,
        getRecordingInfo,

        // Utility functions
        clearError: () => setError(null)
    };
};