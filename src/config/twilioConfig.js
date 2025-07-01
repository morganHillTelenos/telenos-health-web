// src/config/twilioConfig.js - Twilio Video Configuration

export const twilioConfig = {
    // You'll need to get these from your Twilio Console
    accountSid: process.env.REACT_APP_TWILIO_ACCOUNT_SID,
    apiKey: process.env.REACT_APP_TWILIO_API_KEY,
    apiSecret: process.env.REACT_APP_TWILIO_API_SECRET,

    // Video room settings
    roomType: 'group', // 'go', 'peer-to-peer', 'group', or 'group-large'
    maxParticipants: 4,

    // Audio/Video settings
    video: {
        width: 640,
        height: 480,
        frameRate: 24,
        facingMode: 'user' // 'user' for front camera, 'environment' for back
    },
    audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
    }
};

// Validate configuration
export const validateTwilioConfig = () => {
    const missing = [];

    if (!twilioConfig.accountSid) missing.push('REACT_APP_TWILIO_ACCOUNT_SID');
    if (!twilioConfig.apiKey) missing.push('REACT_APP_TWILIO_API_KEY');
    if (!twilioConfig.apiSecret) missing.push('REACT_APP_TWILIO_API_SECRET');

    if (missing.length > 0) {
        console.warn('Missing Twilio environment variables:', missing);
        return false;
    }

    return true;
  };