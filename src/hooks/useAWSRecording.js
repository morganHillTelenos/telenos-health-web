// src/hooks/useAWSRecording.js - Fixed import and error handling
import { useState, useCallback } from 'react';
import recordingService from '../services/awsLambdaRecordingService';

export const useAWSRecording = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingSid, setRecordingSid] = useState(null);
    const [compositionSid, setCompositionSid] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const startRecording = useCallback(async (room, identity, appointmentId) => {
        try {
            setIsLoading(true);
            setError(null);

            console.log('🎬 Starting recording with room:', room);
            console.log('🆔 Identity:', identity);
            console.log('📅 Appointment ID:', appointmentId);

            // Validate room object
            if (!room || !room.sid) {
                throw new Error('Invalid room object - missing room.sid');
            }

            // Call the recording service
            const result = await recordingService.startRecording({
                roomSid: room.sid,
                identity: identity,
                appointmentId: appointmentId
            });

            console.log('📡 Recording service result:', result);

            if (result.success) {
                setIsRecording(true);
                setRecordingSid(result.recordingSid);
                setCompositionSid(result.compositionSid);
                console.log('✅ Recording started successfully:', result);
                return result;
            } else {
                throw new Error(result.error || 'Failed to start recording');
            }

        } catch (err) {
            console.error('❌ Start recording error:', err);
            const errorMessage = `Recording start failed: ${err.message}`;
            setError(errorMessage);
            setIsRecording(false);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const stopRecording = useCallback(async (room) => {
        try {
            setIsLoading(true);
            setError(null);

            console.log('🛑 Stopping recording...');
            console.log('📝 Recording SID:', recordingSid);
            console.log('🎬 Composition SID:', compositionSid);

            if (!recordingSid && !compositionSid) {
                throw new Error('No active recording to stop - missing recording/composition SID');
            }

            const result = await recordingService.stopRecording({
                compositionSid: compositionSid,
                recordingSid: recordingSid,
                roomSid: room?.sid
            });

            if (result.success) {
                setIsRecording(false);
                setRecordingSid(null);
                setCompositionSid(null);
                console.log('✅ Recording stopped successfully:', result);
                return result;
            } else {
                throw new Error(result.error || 'Failed to stop recording');
            }

        } catch (err) {
            console.error('❌ Stop recording error:', err);
            const errorMessage = `Recording stop failed: ${err.message}`;
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [recordingSid, compositionSid]);

    // Reset error function
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        isRecording,
        recordingSid,
        compositionSid,
        error,
        isLoading,
        startRecording,
        stopRecording,
        clearError
    };
};