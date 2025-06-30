// 2. Add this service to generate patient links
// Create src/services/patientLinks.js

class PatientLinkService {
    // Generate a secure patient join link
    static generatePatientLink(appointmentId, patientInfo = {}) {
        const baseUrl = window.location.origin;
        const patientToken = this.generateSecureToken(appointmentId, patientInfo);

        return {
            simple: `${baseUrl}/join/${appointmentId}`,
            secure: `${baseUrl}/join/${appointmentId}/${patientToken}`,
            qrCode: this.generateQRCodeData(`${baseUrl}/join/${appointmentId}`)
        };
    }

    // Generate a secure token for the patient
    static generateSecureToken(appointmentId, patientInfo) {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const data = `${appointmentId}-${timestamp}-${randomString}`;

        // In production, use proper JWT or encryption
        return btoa(data).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
    }

    // Generate QR code data
    static generateQRCodeData(url) {
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    }

    // Validate patient token (basic validation)
    static validatePatientToken(appointmentId, token) {
        try {
            // In production, implement proper validation
            return token && token.length === 16;
        } catch (error) {
            return false;
        }
    }
}

export default PatientLinkService;
  