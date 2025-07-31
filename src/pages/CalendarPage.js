// src/pages/CalendarPage.js - Updated with Video Link Sharing
import React, { useState, useEffect } from 'react';
import './CalendarPage.css';

// VideoCallLinkSharing Component (inline for simplicity)
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <span>🔗</span>
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
                                <span>{copied ? '✓' : '📋'}</span>
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
                                <span>📧</span>
                                <span className="text-sm font-medium">Email</span>
                            </button>

                            <button
                                onClick={shareViaSMS}
                                className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <span>💬</span>
                                <span className="text-sm font-medium">SMS</span>
                            </button>
                        </div>
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

// Main CalendarPage Component
const CalendarPage = ({
    user,
    onNewAppointment,
    onJoinVideoCall,
    onStartVideoCall,
    onNavigateToNewAppointment
}) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('month');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // New state for video link sharing
    const [showLinkSharing, setShowLinkSharing] = useState(false);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        try {
            setLoading(true);

            // Mock appointments data with some video appointments
            const mockAppointments = [
                {
                    id: 'APT001',
                    patient: 'John Smith',
                    date: new Date().toISOString().split('T')[0],
                    time: '09:00',
                    duration: 30,
                    reason: 'Regular checkup',
                    status: 'confirmed',
                    type: 'video',
                    priority: 'normal'
                },
                {
                    id: 'APT002',
                    patient: 'Sarah Johnson',
                    date: new Date().toISOString().split('T')[0],
                    time: '10:30',
                    duration: 45,
                    reason: 'Follow-up consultation',
                    status: 'confirmed',
                    type: 'video',
                    priority: 'high'
                },
                {
                    id: 'APT003',
                    patient: 'Michael Brown',
                    date: getTomorrowDate(),
                    time: '11:15',
                    duration: 60,
                    reason: 'Specialist consultation',
                    status: 'confirmed',
                    type: 'in-person',
                    priority: 'urgent'
                }
            ];

            setAppointments(mockAppointments);
        } catch (error) {
            console.error('Error loading appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTomorrowDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    // Video call handlers
    const handleJoinVideoCall = (appointmentId) => {
        if (onJoinVideoCall && typeof onJoinVideoCall === 'function') {
            onJoinVideoCall(appointmentId);
        } else {
            console.log('🎥 Video call function not available, appointment ID:', appointmentId);
            alert('Video call functionality is currently unavailable.');
        }
    };

    const handleStartVideoCall = (appointmentId) => {
        if (onStartVideoCall && typeof onStartVideoCall === 'function') {
            onStartVideoCall(appointmentId);
        } else {
            console.log('🎥 Start video call function not available, appointment ID:', appointmentId);
            alert('Video call functionality is currently unavailable.');
        }
    };

    // New function for sharing video call link
    const handleShareVideoLink = (appointmentId) => {
        setSelectedAppointmentId(appointmentId);
        setShowLinkSharing(true);
    };

    const handleNewAppointment = () => {
        if (onNavigateToNewAppointment && typeof onNavigateToNewAppointment === 'function') {
            onNavigateToNewAppointment();
        } else {
            console.log('📅 New appointment function not available');
            alert('New appointment functionality is currently unavailable.');
        }
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days = [];
        while (startDate <= lastDay || days.length % 7 !== 0) {
            days.push(new Date(startDate));
            startDate.setDate(startDate.getDate() + 1);
        }
        return days;
    };

    const navigateMonth = (direction) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + direction);
            return newDate;
        });
    };

    const navigateDay = (direction) => {
        setSelectedDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + direction);
            return newDate.toISOString().split('T')[0];
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (time) => {
        const [hours, minutes] = time.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const getAppointmentsForDate = (date) => {
        const dateString = date.toISOString().split('T')[0];
        return appointments.filter(apt => apt.date === dateString);
    };

    const filteredAppointments = viewMode === 'day'
        ? appointments.filter(apt => apt.date === selectedDate)
        : appointments;

    const upcomingAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.date + 'T' + apt.time);
        return aptDate > new Date();
    }).sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading calendar...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                📅 Calendar
                            </h1>
                            <p className="text-gray-600 mt-1">Manage your appointments and schedule</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
                                <button
                                    className={`px-4 py-2 text-sm font-semibold transition-all duration-200 ${viewMode === 'month'
                                        ? 'bg-blue-500 text-white shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                    onClick={() => setViewMode('month')}
                                >
                                    Month
                                </button>
                                <button
                                    className={`px-4 py-2 text-sm font-semibold transition-all duration-200 ${viewMode === 'day'
                                        ? 'bg-blue-500 text-white shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                    onClick={() => setViewMode('day')}
                                >
                                    Day
                                </button>
                            </div>

                            <button
                                onClick={handleNewAppointment}
                                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                                <span className="text-lg mr-2">+</span>
                                New Appointment
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Calendar View */}
                {viewMode === 'month' ? (
                    /* Month View */
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 overflow-hidden shadow-xl mb-8">
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 flex items-center justify-between border-b border-gray-200/50">
                            <button
                                className="p-2 hover:bg-white/80 rounded-lg transition-colors duration-200 group"
                                onClick={() => navigateMonth(-1)}
                            >
                                <span className="text-xl text-gray-600 group-hover:text-gray-900 group-hover:scale-110 transition-all duration-200">‹</span>
                            </button>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </h2>
                            <button
                                className="p-2 hover:bg-white/80 rounded-lg transition-colors duration-200 group"
                                onClick={() => navigateMonth(1)}
                            >
                                <span className="text-xl text-gray-600 group-hover:text-gray-900 group-hover:scale-110 transition-all duration-200">›</span>
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-1 mb-4">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="p-3 text-center text-sm font-semibold text-gray-500 uppercase tracking-wider">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                                {getDaysInMonth(currentDate).map((day, index) => {
                                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                                    const isToday = day.toDateString() === new Date().toDateString();
                                    const isSelected = day.toISOString().split('T')[0] === selectedDate;
                                    const dayAppointments = getAppointmentsForDate(day);

                                    return (
                                        <div
                                            key={index}
                                            className={`min-h-[100px] p-2 border border-gray-100 cursor-pointer transition-all duration-200 hover:bg-blue-50 ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                                                } ${isToday ? 'bg-blue-100 border-blue-300' : ''
                                                } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                                            onClick={() => setSelectedDate(day.toISOString().split('T')[0])}
                                        >
                                            <div className={`text-sm font-semibold mb-1 ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                                                } ${isToday ? 'text-blue-600' : ''}`}>
                                                {day.getDate()}
                                            </div>
                                            {dayAppointments.slice(0, 2).map(apt => (
                                                <div key={apt.id} className="text-xs bg-blue-500 text-white rounded px-1 py-0.5 mb-1 truncate">
                                                    {apt.patient}
                                                </div>
                                            ))}
                                            {dayAppointments.length > 2 && (
                                                <div className="text-xs text-gray-500">+{dayAppointments.length - 2} more</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Day View */
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 overflow-hidden shadow-xl mb-8">
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 flex items-center justify-between border-b border-gray-200/50">
                            <button
                                className="p-2 hover:bg-white/80 rounded-lg transition-colors duration-200 group"
                                onClick={() => navigateDay(-1)}
                            >
                                <span className="text-xl text-gray-600 group-hover:text-gray-900 group-hover:scale-110 transition-all duration-200">‹</span>
                            </button>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {formatDate(selectedDate)}
                            </h2>
                            <button
                                className="p-2 hover:bg-white/80 rounded-lg transition-colors duration-200 group"
                                onClick={() => navigateDay(1)}
                            >
                                <span className="text-xl text-gray-600 group-hover:text-gray-900 group-hover:scale-110 transition-all duration-200">›</span>
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="text-center text-gray-500">
                                Day view appointments will be listed below in the appointments section
                            </div>
                        </div>
                    </div>
                )}

                {/* Appointments Section */}
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 shadow-xl">
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {viewMode === 'day' ? `Appointments for ${formatDate(selectedDate)}` : 'Upcoming Appointments'}
                                </h2>
                                <p className="text-gray-600 text-sm">
                                    {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''} scheduled
                                </p>
                            </div>
                        </div>
                    </div>

                    {filteredAppointments.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="text-6xl mb-4">📅</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No appointments scheduled</h3>
                            <p className="text-gray-600 mb-6">
                                {viewMode === 'day'
                                    ? `No appointments found for ${formatDate(selectedDate)}`
                                    : 'You have no upcoming appointments'
                                }
                            </p>
                            <button
                                onClick={handleNewAppointment}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
                            >
                                Schedule New Appointment
                            </button>
                        </div>
                    ) : (
                        <div className="p-6">
                            {filteredAppointments.map(appointment => {
                                return (
                                    <div
                                        key={appointment.id}
                                        className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6 mb-4 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                    {appointment.patient.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                                        {appointment.patient}
                                                    </h3>
                                                    <p className="text-gray-600 mb-2">{appointment.reason}</p>
                                                    <div className="flex items-center gap-4 text-sm">
                                                        <span className="flex items-center gap-1">
                                                            <span className="text-lg">🕐</span>
                                                            {formatTime(appointment.time)}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <span className="text-lg">{appointment.type === 'video' ? '🎥' : '🏥'}</span>
                                                            {appointment.type === 'video' ? 'Video Call' : 'In-Person'}
                                                        </span>
                                                        <span className="flex items-center gap-2">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                                appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {appointment.status}
                                                            </span>
                                                            <div className={`w-3 h-3 rounded-full ${appointment.status === 'confirmed' ? 'bg-green-500' :
                                                                appointment.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-400'
                                                                }`}></div>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-gray-600">
                                                Duration: {appointment.duration} minutes • Date: {formatDate(appointment.date)}
                                            </div>

                                            <div className="flex gap-3">
                                                {appointment.type === 'video' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleShareVideoLink(appointment.id)}
                                                            className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 hover:scale-105"
                                                        >
                                                            <span>🔗</span>
                                                            Share Link
                                                        </button>
                                                        <button
                                                            onClick={() => handleJoinVideoCall(appointment.id)}
                                                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 hover:scale-105 shadow-md"
                                                        >
                                                            <span>🎥</span>
                                                            Start Video Call
                                                        </button>
                                                    </>
                                                )}
                                                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105">
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Video Call Link Sharing Modal */}
            {showLinkSharing && (
                <VideoCallLinkSharing
                    appointmentId={selectedAppointmentId}
                    onClose={() => {
                        setShowLinkSharing(false);
                        setSelectedAppointmentId(null);
                    }}
                />
            )}
        </div>
    );
};

export default CalendarPage;