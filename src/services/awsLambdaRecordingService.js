// src/services/awsLambdaRecordingService.js - Clean version with proper exports
class AWSLambdaRecordingService {
    constructor() {
        this.baseURL = process.env.REACT_APP_RECORDING_API_URL || 'https://h70cqz8rn9.execute-api.us-east-1.amazonaws.com/prod';
    }

    async startRecording({ roomSid, identity, appointmentId }) {
        try {
            // ✅ ADD THESE DEBUG LINES at the very top
            console.log('🔍 SERVICE DEBUG - Received roomSid:', roomSid);
            console.log('🔍 SERVICE DEBUG - Expected roomSid:', 'RMceb13506451702c18bf4b1039bfd3004');
            console.log('🔍 SERVICE DEBUG - SID Match:', roomSid === 'RMceb13506451702c18bf4b1039bfd3004');

            console.log('🎬 Starting recording with:', { roomSid, identity, appointmentId });
            // ... rest of function
            // Validate required parameters
            if (!roomSid) {
                throw new Error('roomSid is required for recording');
            }

            // ✅ FIXED: Include the Status parameter that Twilio requires
            const requestBody = {
                roomSid: roomSid,
                identity: identity || 'unknown-user',
                appointmentId: appointmentId || 'unknown-appointment',
                Status: 'in-progress'  // This was missing before!
            };

            console.log('📤 Request body:', requestBody);

            const response = await fetch(`${this.baseURL}/recording/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Recording start response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Recording start failed:', errorText);
                throw new Error(`Recording start failed: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            console.log('✅ Recording started successfully:', result);

            return {
                success: true,
                compositionSid: result.compositionSid,
                recordingSid: result.recordingSid,
                status: result.status,
                roomSid: result.roomSid
            };

        } catch (error) {
            console.error('❌ Recording start error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async stopRecording({ compositionSid, recordingSid, roomSid }) {
        try {
            console.log('🛑 Stopping recording:', { compositionSid, recordingSid, roomSid });

            if (!compositionSid && !recordingSid) {
                throw new Error('Either compositionSid or recordingSid is required');
            }

            const requestBody = {
                compositionSid: compositionSid,
                recordingSid: recordingSid,
                roomSid: roomSid,
                Status: 'completed'  // Add status for stop as well
            };

            console.log('📤 Stop request body:', requestBody);

            const response = await fetch(`${this.baseURL}/recording/stop`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Recording stop failed:', errorText);
                throw new Error(`Recording stop failed: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            console.log('✅ Recording stopped successfully:', result);

            return {
                success: true,
                ...result
            };

        } catch (error) {
            console.error('❌ Recording stop error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// ✅ PROPER DEFAULT EXPORT
const recordingService = new AWSLambdaRecordingService();
export default recordingService;