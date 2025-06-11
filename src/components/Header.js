
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ user, onLogout }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) => location.pathname === path;

    const handleLogoClick = () => {
        if (user) {
            navigate('/dashboard');
        } else {
            navigate('/');
        }
    };

    return (
        <header className="header">
            <div className="header-container">
                <div className="header-logo" onClick={handleLogoClick}>
                    <div className="logo-icon">🏥</div>
                    <span>TelenosHealth</span>
                </div>

                {user && (
                    <nav className="header-nav">
                        <Link
                            to="/dashboard"
                            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/patients"
                            className={`nav-link ${isActive('/patients') ? 'active' : ''}`}
                        >
                            Patients
                        </Link>
                        <Link
                            to="/calendar"
                            className={`nav-link ${isActive('/calendar') ? 'active' : ''}`}
                        >
                            Calendar
                        </Link>
                    </nav>
                )}

                <div className="header-actions">
                    {user ? (
                        <div className="user-menu">
                            <span className="user-name">Dr. {user.name || 'Provider'}</span>
                            <button className="btn btn-secondary" onClick={onLogout}>
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="btn btn-secondary">
                                Sign In
                            </Link>
                            <button className="btn btn-primary" onClick={() => navigate('/login')}>
                                Get Started
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;