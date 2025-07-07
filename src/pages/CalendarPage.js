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

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days = [];
        const currentDay = new Date(startDate);

        for (let i = 0; i < 42; i++) {
            days.push(new Date(currentDay));
            currentDay.setDate(currentDay.getDate() + 1);
        }

        return days;
    };

    const getAppointmentsForDate = (date) => {
        const dateString = date.toISOString().split('T')[0];
        return appointments.filter(apt => apt.date === dateString);
    };

    const getFilteredAppointments = () => {
        if (viewMode === 'day') {
            return appointments.filter(apt => apt.date === selectedDate);
        }
        return appointments.sort((a, b) => {
            if (a.date === b.date) {
                return a.time.localeCompare(b.time);
            }
            return new Date(a.date) - new Date(b.date);
        });
    };

    const handleDateClick = (date) => {
        const dateString = date.toISOString().split('T')[0];
        setSelectedDate(dateString);
        if (viewMode === 'month') {
            setViewMode('day');
        }
    };

    const navigateMonth = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + direction);
        setCurrentDate(newDate);
    };

    const navigateDay = (direction) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + direction);
        setSelectedDate(newDate.toISOString().split('T')[0]);
    };

    const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return 'from-red-500 to-red-600';
            case 'high': return 'from-orange-500 to-orange-600';
            default: return 'from-blue-500 to-blue-600';
        }
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'urgent': return { bg: 'bg-red-100', text: 'text-red-700', label: 'URGENT' };
            case 'high': return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'HIGH' };
            default: return null;
        }
    };

    const days = getDaysInMonth(currentDate);
    const filteredAppointments = getFilteredAppointments();

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-blue-300 rounded-full animate-spin animation-delay-150"></div>
                    </div>
                    <div className="text-slate-700 font-semibold text-lg">Loading calendar...</div>
                    <div className="text-slate-500 text-sm mt-2">Preparing your schedule</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Enhanced Header */}
            <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 px-6 py-6 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                                <span className="text-white text-xl">📅</span>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Calendar</h1>
                                <p className="text-gray-600 text-sm font-medium">
                                    Manage your appointments and schedule
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* View Toggle */}
                            <div className="flex bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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

                            {/* New Appointment Button */}
                            <button
                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 hover:scale-105 shadow-lg"
                                onClick={onNavigateToNewAppointment}
                            >
                                <span>+</span>
                                New Appointment
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {viewMode === 'month' ? (
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 overflow-hidden shadow-xl mb-8">
                        {/* Month Navigation */}
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 flex items-center justify-between border-b border-gray-200/50">
                            <button
                                className="p-2 hover:bg-white/80 rounded-lg transition-colors duration-200 group"
                                onClick={() => navigateMonth(-1)}
                            >
                                <span className="text-xl text-gray-600 group-hover:text-gray-900 group-hover:scale-110 transition-all duration-200">‹</span>
                            </button>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {currentDate.toLocaleDateString('en-US', {
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </h2>
                            <button
                                className="p-2 hover:bg-white/80 rounded-lg transition-colors duration-200 group"
                                onClick={() => navigateMonth(1)}
                            >
                                <span className="text-xl text-gray-600 group-hover:text-gray-900 group-hover:scale-110 transition-all duration-200">›</span>
                            </button>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 text-center font-semibold text-gray-700 border-b border-gray-200/50">
                                    {day}
                                </div>
                            ))}

                            {days.map((day, index) => {
                                const dayAppointments = getAppointmentsForDate(day);
                                const isToday = day.toDateString() === new Date().toDateString();
                                const isSelected = day.toISOString().split('T')[0] === selectedDate;
                                const isCurrentMonth = day.getMonth() === currentDate.getMonth();

                                return (
                                    <div
                                        key={index}
                                        className={`min-h-[120px] p-3 border-b border-r border-gray-200/50 cursor-pointer transition-all duration-200 group ${!isCurrentMonth
                                            ? 'bg-gray-50/50 text-gray-400'
                                            : isToday
                                                ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
                                                : isSelected
                                                    ? 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'
                                                    : 'bg-white hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50'
                                            }`}
                                        onClick={() => handleDateClick(day)}
                                    >
                                        <div className={`text-sm font-semibold mb-2 ${isToday ? 'text-blue-700' : isSelected ? 'text-purple-700' : ''}`}>
                                            {day.getDate()}
                                        </div>
                                        {dayAppointments.map((apt, aptIndex) => (
                                            <div
                                                key={aptIndex}
                                                className={`text-xs p-1 mb-1 rounded text-white truncate ${apt.type === 'video' ? 'bg-blue-500' : 'bg-green-500'}`}
                                            >
                                                {formatTime(apt.time)} - {apt.patient}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
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
                    </div>
                )}

                {/* Appointments List */}
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 overflow-hidden shadow-xl">
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200/50">
                        <h3 className="text-xl font-bold text-gray-900">
                            {viewMode === 'day' ? 'Today\'s Appointments' : 'Upcoming Appointments'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''} scheduled
                        </p>
                    </div>

                    {filteredAppointments.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">📅</span>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-700 mb-2">No appointments scheduled</h4>
                            <p className="text-gray-500 mb-6">
                                {viewMode === 'day' ? 'No appointments for this day.' : 'You have no upcoming appointments.'}
                            </p>
                            <button
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                                onClick={onNavigateToNewAppointment}
                            >
                                Schedule Appointment
                            </button>
                        </div>
                    ) : (
                        <div className="p-6">
                            {filteredAppointments.map((appointment) => {
                                const priorityBadge = getPriorityBadge(appointment.priority);
                                return (
                                    <div
                                        key={appointment.id}
                                        className="bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200/50 p-6 mb-4 last:mb-0 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] group"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center">
                                                <div className={`w-12 h-12 bg-gradient-to-r ${getPriorityColor(appointment.priority)} rounded-xl flex items-center justify-center mr-4 shadow-md group-hover:scale-110 transition-transform duration-200`}>
                                                    <span className="text-white text-xl">
                                                        {appointment.type === 'video' ? '🎥' : '🏥'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-bold text-gray-900 mb-1">{appointment.patient}</h4>
                                                    <p className="text-gray-600 text-sm font-medium">{appointment.reason}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {priorityBadge && (
                                                    <span className={`${priorityBadge.bg} ${priorityBadge.text} px-3 py-1 rounded-full text-xs font-bold tracking-wide`}>
                                                        {priorityBadge.label}
                                                    </span>
                                                )}
                                                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${appointment.type === 'video' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                                    {appointment.type === 'video' ? 'Video Call' : 'In-Person'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center text-gray-600 text-sm">
                                                <span className="mr-4">⏰ {formatTime(appointment.time)}</span>
                                                <span className="mr-4">⏱️ {appointment.duration} min</span>
                                                <div className="flex items-center">
                                                    <span className="mr-2">Status:</span>
                                                    <div className={`w-3 h-3 rounded-full mr-1 ${appointment.status === 'confirmed' ? 'bg-green-500' :
                                                        appointment.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-400'
                                                        }`}></div>
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
                                                        onClick={() => onJoinVideoCall(appointment.id)}
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