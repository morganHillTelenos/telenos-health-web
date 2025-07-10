import { awsLambdaRecordingService } from './services/awsLambdaRecordingService';

// Test the recording service directly
const testRecording = async () => {
    try {
        console.log('Testing recording service...');

        const fakeRoomSid = 'RM1234567890abcdef1234567890abcdef';
        const appointmentId = '1';

        const recording = await awsLambdaRecordingService.startRecording(
            fakeRoomSid,
            appointmentId
        );

        console.log('Recording started:', recording);

        // Wait 5 seconds then stop
        setTimeout(async () => {
            const stopped = await awsLambdaRecordingService.stopRecording(recording.sid);
            console.log('Recording stopped:', stopped);
        }, 5000);

    } catch (error) {
        console.error('Test failed:', error);
    }
};

