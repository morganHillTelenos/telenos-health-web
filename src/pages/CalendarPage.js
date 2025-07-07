import React from 'react';
const { useState, useEffect } = React;

const CalendarPage = ({ onNavigateToNewAppointment, onJoinVideoCall, onStartVideoCall }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [viewMode, setViewMode] = useState('month');
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        try {
            setLoading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));

            const mockAppointments = [
                {
                    id: '1',
                    patient: 'Michael Chen',
                    patientId: '1',
                    date: new Date().toISOString().split('T')[0],
                    time: '14:00',
                    duration: 30,
                    reason: 'Follow-up consultation',
                    status: 'confirmed',
                    type: 'video',
                    priority: 'normal'
                },
                {
                    id: '2',
                    patient: 'Sarah Williams',
                    patientId: '2',
                    date: new Date().toISOString().split('T')[0],
                    time: '15:30',
                    duration: 45,
                    reason: 'Annual checkup',
                    status: 'confirmed',
                    type: 'in-person',
                    priority: 'normal'
                },
                {
                    id: '3',
                    patient: 'Robert Johnson',
                    patientId: '3',
                    date: getTomorrowDate(),
                    time: '10:00',
                    duration: 30,
                    reason: 'Medication review',
                    status: 'pending',
                    type: 'video',
                    priority: 'high'
                },
                {
                    id: '4',
                    patient: 'Emily Davis',
                    patientId: '4',
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

    // Default handlers in case props are not passed
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
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 hover:scale-105"
                            >
                                <span className="text-lg">+</span>
                                New Appointment
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
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
                                                } ${isToday ? 'ring-2 ring-blue-500' : ''} ${isSelected ? 'bg-blue-100' : ''
                                                }`}
                                            onClick={() => setSelectedDate(day.toISOString().split('T')[0])}
                                        >
                                            <div className={`text-sm font-medium mb-1 ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                                                } ${isToday ? 'text-blue-600 font-bold' : ''}`}>
                                                {day.getDate()}
                                            </div>

                                            {dayAppointments.slice(0, 2).map(appointment => (
                                                <div
                                                    key={appointment.id}
                                                    className={`text-xs p-1 mb-1 rounded truncate ${appointment.type === 'video'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-green-100 text-green-800'
                                                        }`}
                                                    title={`${appointment.time} - ${appointment.patient}`}
                                                >
                                                    {appointment.time} {appointment.patient.split(' ')[0]}
                                                </div>
                                            ))}

                                            {dayAppointments.length > 2 && (
                                                <div className="text-xs text-gray-500">
                                                    +{dayAppointments.length - 2} more
                                                </div>
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
                                                        <span className="flex items-center gap-1">
                                                            <span className="text-lg">⚡</span>
                                                            {appointment.priority}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-gray-700">Status:</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-sm px-3 py-1 rounded-full font-medium ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                                appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {appointment.status}
                                                        </span>
                                                        <div className={`w-3 h-3 rounded-full ${appointment.status === 'confirmed' ? 'bg-green-500' :
                                                                appointment.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-400'
                                                            }`}></div>
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
                                                    <button
                                                        onClick={() => handleJoinVideoCall(appointment.id)}
                                                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 hover:scale-105 shadow-md"
                                                    >
                                                        <span>🎥</span>
                                                        Start Video Call
                                                    </button>
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
        </div>
    );
};

export default CalendarPage;