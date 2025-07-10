// src/services/awsLambdaRecordingService.js
import { getCurrentUser } from 'aws-amplify/auth';

export class AWSLambdaRecordingService {
    constructor() {
        // Replace with YOUR API Gateway URL from AWS Console
        this.apiBaseUrl = 'https://h70cqz8rn9.execute-api.us-east-1.amazonaws.com/prod';
        this.activeRecordings = new Map();
    }

    async startRecording(roomSid, appointmentId, options = {}) {
        try {
            console.log('🎬 Starting recording via AWS Lambda...');

            const response = await fetch(`${this.apiBaseUrl}/recording/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    roomSid,
                    appointmentId,
                    options: {
                        track: options.track || 'AudioVideoMixed',
                        format: options.format || 'webm',
                        mode: options.mode || 'composed',
                        ...options
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to start recording');
            }

            const result = await response.json();

            // Store locally for state management
            this.activeRecordings.set(result.recording.sid, {
                recordingSid: result.recording.sid,
                roomSid,
                appointmentId,
                status: 'started',
                startTime: new Date().toISOString(),
                ...options
            });

            console.log('✅ Recording started:', result.recording.sid);
            return result.recording;

        } catch (error) {
            console.error('❌ Error starting recording:', error);
            throw error;
        }
    }

    async stopRecording(recordingSid) {
        try {
            console.log('⏹️ Stopping recording via AWS Lambda...');

            const response = await fetch(`${this.apiBaseUrl}/recording/stop`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ recordingSid })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to stop recording');
            }

            const result = await response.json();

            // Update local storage
            const recording = this.activeRecordings.get(recordingSid);
            if (recording) {
                recording.status = 'stopped';
                recording.endTime = new Date().toISOString();
            }

            console.log('✅ Recording stopped:', recordingSid);
            return result.recording;

        } catch (error) {
            console.error('❌ Error stopping recording:', error);
            throw error;
        }
    }

    async getRecordingStatus(recordingSid) {
        // For now, return local status
        // Later you could add an API endpoint to check Twilio status
        const recording = this.activeRecordings.get(recordingSid);
        return recording ? recording.status : 'unknown';
    }

    getActiveRecording(recordingSid) {
        return this.activeRecordings.get(recordingSid);
    }

    getAllActiveRecordings() {
        return Array.from(this.activeRecordings.values());
    }

    clearRecordingData(recordingSid) {
        this.activeRecordings.delete(recordingSid);
    }
}

export const awsLambdaRecordingService = new AWSLambdaRecordingService();