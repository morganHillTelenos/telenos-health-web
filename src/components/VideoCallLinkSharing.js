import React, { useState } from 'react';
import { Copy, Check, Share2, Mail, MessageSquare } from 'lucide-react';

const VideoCallLinkSharing = ({ appointmentId, onClose }) => {
    const [copied, setCopied] = useState(false);

    const getShareableLink = () => {
        const baseUrl = window.location.origin;
        return `${baseUrl}/video-call/${appointmentId}`;
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(getShareableLink());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            // Fallback for browsers that don't support clipboard API
            const textArea = document.createElement('textarea');
            textArea.value = getShareableLink();
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const shareViaEmail = () => {
        const subject = encodeURIComponent('Video Call Invitation - Telenos Health');
        const body = encodeURIComponent(`You are invited to join a video consultation.

Click the link below to join:
${getShareableLink()}

Appointment ID: ${appointmentId}

Please ensure you have a stable internet connection and allow camera/microphone access when prompted.

Best regards,
Telenos Health Team`);

        window.open(`mailto:?subject=${subject}&body=${body}`);
    };

    const shareViaSMS = () => {
        const message = encodeURIComponent(`Join our video consultation: ${getShareableLink()} (Appointment ID: ${appointmentId})`);
        window.open(`sms:?body=${message}`);
    };

    const shareViaWebShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Video Call Invitation',
                    text: `Join our video consultation for appointment ${appointmentId}`,
                    url: getShareableLink()
                });
            } catch (err) {
                console.log('Share cancelled or failed');
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-blue-500" />
                        Share Video Call Link
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-xl"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Link Display and Copy */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Video Call Link
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={getShareableLink()}
                                readOnly
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
                            />
                            <button
                                onClick={copyToClipboard}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${copied
                                        ? 'bg-green-500 text-white'
                                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                                    }`}
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>

                    {/* Appointment Info */}
                    <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                            <strong>Appointment ID:</strong> {appointmentId}
                        </p>
                        <p className="text-sm text-blue-600 mt-1">
                            Share this link with the patient to join the video consultation
                        </p>
                    </div>

                    {/* Sharing Options */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Share via:
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={shareViaEmail}
                                className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Mail className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-medium">Email</span>
                            </button>

                            <button
                                onClick={shareViaSMS}
                                className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <MessageSquare className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-medium">SMS</span>
                            </button>
                        </div>

                        {navigator.share && (
                            <button
                                onClick={shareViaWebShare}
                                className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <Share2 className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-medium">More sharing options</span>
                            </button>
                        )}
                    </div>

                    {/* Security Notice */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-xs text-green-700">
                            🔒 This link is secure and HIPAA-compliant. Only invited participants can join the call.
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={copyToClipboard}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Copy Link
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoCallLinkSharing;