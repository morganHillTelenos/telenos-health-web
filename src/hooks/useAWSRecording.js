import { useState, useCallback } from 'react';
import awsLambdaRecordingService from '../services/awsLambdaRecordingService';

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

            // Validate room object
            if (!room || !room.sid) {
                throw new Error('Invalid room object - missing room.sid');
            }

            const result = await awsLambdaRecordingService.startRecording({
                roomSid: room.sid,
                identity: identity,
                appointmentId: appointmentId
            });

            if (result.success) {
                setIsRecording(true);
                setRecordingSid(result.recordingSid);
                setCompositionSid(result.compositionSid);
                console.log('✅ Recording started:', result);
                return result;
            } else {
                throw new Error(result.error || 'Failed to start recording');
            }

        } catch (err) {
            console.error('❌ Start recording error:', err);
            setError(err.message);
            setIsRecording(false);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const stopRecording = useCallback(async (room) => {
        try {
            setIsLoading(true);
            setError(null);

            if (!recordingSid && !compositionSid) {
                throw new Error('No active recording to stop');
            }

            const result = await awsLambdaRecordingService.stopRecording({
                compositionSid: compositionSid,
                recordingSid: recordingSid,
                roomSid: room?.sid
            });

            if (result.success) {
                setIsRecording(false);
                setRecordingSid(null);
                setCompositionSid(null);
                console.log('✅ Recording stopped:', result);
                return result;
            } else {
                throw new Error(result.error || 'Failed to stop recording');
            }

        } catch (err) {
            console.error('❌ Stop recording error:', err);
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [recordingSid, compositionSid]);

    return {
        isRecording,
        recordingSid,
        compositionSid,
        error,
        isLoading,
        startRecording,
        stopRecording
    };
};