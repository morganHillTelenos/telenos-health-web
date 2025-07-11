// AWS Lambda Recording Service
class AWSLambdaRecordingService {
    constructor() {
        this.baseURL = process.env.REACT_APP_RECORDING_API_URL || 'https://h70cqz8rn9.execute-api.us-east-1.amazonaws.com/prod';
    }

    async startRecording({ roomSid, identity, appointmentId }) {
        try {
            console.log('🎬 Starting recording with:', { roomSid, identity, appointmentId });

            // Validate required parameters
            if (!roomSid) {
                throw new Error('roomSid is required for recording');
            }

            const response = await fetch(`${this.baseURL}/recording/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    roomSid: roomSid,
                    identity: identity || 'unknown-user',
                    appointmentId: appointmentId || 'unknown-appointment'
                })
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

            const response = await fetch(`${this.baseURL}/recording/stop`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    compositionSid: compositionSid,
                    recordingSid: recordingSid,
                    roomSid: roomSid
                })
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

export default new AWSLambdaRecordingService();