// src/hooks/useAWSRecording.js - Enhanced with debugging and fallbacks
import { useState, useCallback } from 'react';
import awsLambdaRecordingService from '../services/awsLambdaRecordingService';

export const useAWSRecording = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingSid, setRecordingSid] = useState(null);
    const [compositionSid, setCompositionSid] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [debugInfo, setDebugInfo] = useState([]);

    const addDebugInfo = (message) => {
        const timestamp = new Date().toLocaleTimeString();
        setDebugInfo(prev => [...prev.slice(-4), `${timestamp}: ${message}`]);
        console.log(`🔍 ${message}`);
    };

    const startRecording = useCallback(async (room, identity, appointmentId) => {
        try {
            setIsLoading(true);
            setError(null);
            addDebugInfo('Starting recording process...');

            // Validate room object
            if (!room || !room.sid) {
                throw new Error('Invalid room object - missing room.sid');
            }

            addDebugInfo(`Room SID: ${room.sid}`);
            addDebugInfo(`Identity: ${identity}`);
            addDebugInfo(`Appointment ID: ${appointmentId}`);

            // ✅ TRY MULTIPLE APPROACHES
            let result;

            // First try: Full parameters with Status
            try {
                addDebugInfo('Trying full parameter approach...');
                result = await awsLambdaRecordingService.startRecording({
                    roomSid: room.sid,
                    identity: identity,
                    appointmentId: appointmentId
                });
            } catch (fullError) {
                addDebugInfo(`Full approach failed: ${fullError.message}`);

                // Second try: Minimal parameters
                try {
                    addDebugInfo('Trying minimal parameter approach...');
                    result = await awsLambdaRecordingService.startRecordingMinimal({
                        roomSid: room.sid,
                        identity: identity,
                        appointmentId: appointmentId
                    });
                } catch (minimalError) {
                    addDebugInfo(`Minimal approach failed: ${minimalError.message}`);

                    // Third try: Direct Twilio approach (if you have direct access)
                    try {
                        addDebugInfo('Trying direct API call...');
                        result = await directTwilioRecordingCall(room.sid);
                    } catch (directError) {
                        addDebugInfo(`Direct approach failed: ${directError.message}`);
                        throw fullError; // Throw the original error
                    }
                }
            }

            if (result.success) {
                setIsRecording(true);
                setRecordingSid(result.recordingSid);
                setCompositionSid(result.compositionSid);
                addDebugInfo('✅ Recording started successfully!');
                return result;
            } else {
                throw new Error(result.error || 'Failed to start recording');
            }

        } catch (err) {
            const errorMessage = `Recording failed: ${err.message}`;
            addDebugInfo(`❌ ${errorMessage}`);
            setError(errorMessage);
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
            addDebugInfo('Stopping recording...');

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
                addDebugInfo('✅ Recording stopped successfully!');
                return result;
            } else {
                throw new Error(result.error || 'Failed to stop recording');
            }

        } catch (err) {
            const errorMessage = `Stop recording failed: ${err.message}`;
            addDebugInfo(`❌ ${errorMessage}`);
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [recordingSid, compositionSid]);

    // ✅ DIRECT TWILIO API CALL (FALLBACK)
    const directTwilioRecordingCall = async (roomSid) => {
        addDebugInfo('Attempting direct Twilio API call...');

        // This would need your Twilio Account SID and Auth Token
        // Usually this should be done on the backend for security
        const response = await fetch('/api/twilio-recording/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                roomSid: roomSid,
                status: 'in-progress'
            })
        });

        if (!response.ok) {
            throw new Error('Direct Twilio call failed');
        }

        return await response.json();
    };

    return {
        isRecording,
        recordingSid,
        compositionSid,
        error,
        isLoading,
        debugInfo,
        startRecording,
        stopRecording
    };
};