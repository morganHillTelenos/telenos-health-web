import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { formatDate, formatTime } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import './CalendarPage.css';

const CalendarPage = () => {
    const navigate = useNavigate();
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
            const appointmentsData = await apiService.getAppointments();
            setAppointments(appointmentsData);
        } catch (error) {
            console.error('Error loading appointments:', error);
        } finally {
            setLoading(false);
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
        // For month view, show all appointments
        return appointments;
    };

    const handleDateClick = (date) => {
        const dateString = date.toISOString().split('T')[0];
        setSelectedDate(dateString);
        if (viewMode === 'month') {
            setViewMode('day');
        }
    };

    const handleAppointmentClick = (appointment) => {
        navigate(`/appointment/${appointment.id}`, { state: { appointment } });
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

    const days = getDaysInMonth(currentDate);
    const filteredAppointments = getFilteredAppointments();

    if (loading) {
        return (
            <div className="page-loading">
                <LoadingSpinner size="large" text="Loading calendar..." />
            </div>
        );
    }

    return (
        <div className="calendar-page">
            <div className="container">
                {/* Header */}
                <div className="calendar-header">
                    <h1 className="calendar-title">Calendar</h1>
                    <div className="view-toggle">
                        <button
                            className={`toggle-btn ${viewMode === 'month' ? 'active' : ''}`}
                            onClick={() => setViewMode('month')}
                        >
                            Month
                        </button>
                        <button
                            className={`toggle-btn ${viewMode === 'day' ? 'active' : ''}`}
                            onClick={() => setViewMode('day')}
                        >
                            Day
                        </button>
                    </div>
                </div>

                {/* Calendar View */}
                {viewMode === 'month' ? (
                    <div className="calendar-container">
                        {/* Month Navigation */}
                        <div className="month-header">
                            <button className="nav-btn" onClick={() => navigateMonth(-1)}>
                                ‹
                            </button>
                            <h2 className="month-title">
                                {currentDate.toLocaleDateString('en-US', {
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </h2>
                            <button className="nav-btn" onClick={() => navigateMonth(1)}>
                                ›
                            </button>
                        </div>

                        {/* Calendar Grid */}
                        <div className="calendar-grid">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="calendar-header-cell">
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
                                        className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleDateClick(day)}
                                    >
                                        <div className="day-number">{day.getDate()}</div>
                                        {dayAppointments.map((apt, idx) => (
                                            <div
                                                key={idx}
                                                className="appointment-indicator"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAppointmentClick(apt);
                                                }}
                                            >
                                                {apt.time} - {apt.patient}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="day-view">
                        <div className="day-header">
                            <button className="nav-btn" onClick={() => navigateDay(-1)}>
                                ‹
                            </button>
                            <h2 className="day-title">
                                {new Date(selectedDate).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </h2>
                            <button className="nav-btn" onClick={() => navigateDay(1)}>
                                ›
                            </button>
                        </div>
                    </div>
                )}

                {/* Appointments Section */}
                <div className="appointments-section">
                    <div className="appointments-header">
                        <h2 className="appointments-title">
                            {viewMode === 'day' ? `Appointments for ${formatDate(selectedDate)}` : 'All Appointments'}
                        </h2>
                        <button
                            className="add-appointment-btn"
                            onClick={() => navigate('/appointments/new')}
                        >
                            + New Appointment
                        </button>
                    </div>

                    {filteredAppointments.length === 0 ? (
                        <div className="empty-appointments">
                            <div className="empty-appointments-icon">📅</div>
                            <h3 className="empty-appointments-title">No appointments scheduled</h3>
                            <p className="empty-appointments-subtitle">
                                {viewMode === 'day' ? 'for this day' : 'yet'}
                            </p>
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate('/appointments/new')}
                            >
                                Schedule First Appointment
                            </button>
                        </div>
                    ) : (
                        <div className="appointments-grid">
                            {filteredAppointments.map((appointment) => (
                                <div
                                    key={appointment.id}
                                    className="appointment-card"
                                    onClick={() => handleAppointmentClick(appointment)}
                                >
                                    <div className="appointment-header">
                                        <div className="appointment-time">
                                            {formatTime(appointment.time)}
                                        </div>
                                        <div className="appointment-badges">
                                            {appointment.videoCallEnabled && (
                                                <span className="badge badge-video">📹 Video</span>
                                            )}
                                            {appointment.hipaaCompliant && (
                                                <span className="badge badge-hipaa">🔒 HIPAA</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="appointment-content">
                                        <h3 className="patient-name">{appointment.patient}</h3>
                                        {appointment.reason && (
                                            <p className="appointment-reason">{appointment.reason}</p>
                                        )}
                                    </div>

                                    <div className="appointment-actions">
                                        {appointment.videoCallEnabled && (
                                            <button
                                                className="join-video-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/video-call/${appointment.id}`);
                                                }}
                                            >
                                                Join Video
                                            </button>
                                        )}
                                        <button className="view-details-btn">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;