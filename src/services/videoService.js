// src/services/videoService.js - Smart Service Switcher
import mockVideoService from './mockVideoService';
import realChimeService from './realChimeService';

class VideoServiceSwitcher {
    constructor() {
        // Check if we should use real Chime SDK
        this.useRealService = this.shouldUseRealService();

        if (this.useRealService) {
            console.log('☁️ Using Real AWS Chime SDK Service');
            this.service = realChimeService;
        } else {
            console.log('🎭 Using Mock Video Service');
            this.service = mockVideoService;
        }
    }

    shouldUseRealService() {
        // Check environment variables or localStorage flags
        const forceReal = localStorage.getItem('useRealChime') === 'true';
        const forceMock = localStorage.getItem('useMockChime') === 'true';

        if (forceMock) {
            console.log('🎭 Forced to use Mock Service (localStorage flag)');
            return false;
        }

        if (forceReal) {
            console.log('☁️ Forced to use Real Service (localStorage flag)');
            return true;
        }

        // Default: use mock in development, real in production
        const isDevelopment = process.env.NODE_ENV === 'development';
        console.log(`🔧 Environment: ${process.env.NODE_ENV}, using ${isDevelopment ? 'Mock' : 'Real'} service`);

        return !isDevelopment;
    }

    // Delegate all methods to the active service
    async createMeeting(appointmentId, userType = 'provider', userName = 'User') {
        try {
            const result = await this.service.createMeeting(appointmentId, userType, userName);

            if (result.isMock) {
                console.log('🎭 Created mock meeting for development');
            } else if (result.isReal) {
                console.log('☁️ Created real AWS Chime meeting');
            }

            return result;
        } catch (error) {
            console.error('❌ Create meeting failed:', error);

            // Fallback to mock service if real service fails
            if (this.useRealService && !this.service.isMock) {
                console.log('🔄 Falling back to mock service...');
                this.service = mockVideoService;
                this.useRealService = false;
                return await this.service.createMeeting(appointmentId, userType, userName);
            }

            throw error;
        }
    }

    async joinExistingMeeting(appointmentId, userType = 'patient', userName = 'Patient') {
        try {
            const result = await this.service.joinExistingMeeting(appointmentId, userType, userName);

            if (result.isMock) {
                console.log('🎭 Joined mock meeting for development');
            } else if (result.isReal) {
                console.log('☁️ Joined real AWS Chime meeting');
            }

            return result;
        } catch (error) {
            console.error('❌ Join meeting failed:', error);

            // Fallback to mock service if real service fails
            if (this.useRealService && !this.service.isMock) {
                console.log('🔄 Falling back to mock service...');
                this.service = mockVideoService;
                this.useRealService = false;
                return await this.service.joinExistingMeeting(appointmentId, userType, userName);
            }

            throw error;
        }
    }

    async setupChimeSession(meeting, attendee, localVideoRef, remoteVideoRef, audioElementRef) {
        return await this.service.setupChimeSession(meeting, attendee, localVideoRef, remoteVideoRef, audioElementRef);
    }

    async endMeeting(appointmentId) {
        return await this.service.endMeeting(appointmentId);
    }

    // Storage methods
    saveMeetingToStorage(appointmentId, meetingData) {
        return this.service.saveMeetingToStorage(appointmentId, meetingData);
    }

    loadMeetingFromStorage(appointmentId) {
        return this.service.loadMeetingFromStorage(appointmentId);
    }

    cleanupOldMeetings() {
        return this.service.cleanupOldMeetings();
    }

    // Utility methods
    isUsingRealService() {
        return this.useRealService;
    }

    isUsingMockService() {
        return !this.useRealService;
    }

    // Manual service switching (for testing)
    switchToRealService() {
        console.log('🔄 Manually switching to Real AWS Chime Service');
        localStorage.setItem('useRealChime', 'true');
        localStorage.removeItem('useMockChime');
        this.service = realChimeService;
        this.useRealService = true;
    }

    switchToMockService() {
        console.log('🔄 Manually switching to Mock Video Service');
        localStorage.setItem('useMockChime', 'true');
        localStorage.removeItem('useRealChime');
        this.service = mockVideoService;
        this.useRealService = false;
    }

    // Test AWS credentials
    async testAWSCredentials() {
        if (this.useRealService && this.service.testCredentials) {
            return await this.service.testCredentials();
        }
        return false;
    }
}

// Create and export the service instance
const videoService = new VideoServiceSwitcher();

// Add global debugging functions
window.videoServiceDebug = {
    switchToReal: () => videoService.switchToRealService(),
    switchToMock: () => videoService.switchToMockService(),
    testCredentials: () => videoService.testAWSCredentials(),
    currentService: () => videoService.isUsingRealService() ? 'Real AWS Chime' : 'Mock Service',
    service: videoService
};

console.log('🎥 Video Service Switcher initialized');
console.log('🔧 Debug commands available: window.videoServiceDebug');

export default videoService;