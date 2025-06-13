
import React from 'react';
import { useState, useEffect } from 'react';
import LandingPage from "../src/pages/LandingPage"; 
import HealthcareDashboard from "../src/pages/HealthcareDashboard"; 
// Main App Component
const App = () => {
  const [currentView, setCurrentView] = useState('landing');

  const handleEnterDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  if (currentView === 'dashboard') {
    return (
      <div>
        {/* Back to Landing Button */}
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={handleBackToLanding}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium border border-slate-300 flex items-center gap-2 transition-colors"
          >
            ← Back to Landing
          </button>
        </div>
        <HealthcareDashboard />
      </div>
    );
  }

  return <LandingPage onEnterDashboard={handleEnterDashboard} />;
};

export default App;
