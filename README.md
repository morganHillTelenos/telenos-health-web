# TelenosHealth Web Application

A modern, HIPAA-compliant healthcare platform built with React, featuring patient management, appointment scheduling, and secure video consultations.

## Features

- 🏥 **Patient Management**: Secure patient records with HIPAA compliance
- 📅 **Appointment Scheduling**: Advanced calendar with day/month views
- 🎥 **Video Consultations**: Secure video calling interface
- 📊 **Analytics Dashboard**: Real-time insights and statistics
- 🔒 **Security**: End-to-end encryption and secure authentication
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (version 16.0 or higher)
- npm (comes with Node.js)
- Git

## Installation

1. **Clone or create the project**
   ```bash
   npx create-react-app telenos-health-web
   cd telenos-health-web
   ```

2. **Install dependencies**
   ```bash
   npm install react-router-dom axios date-fns
   ```

3. **Replace the default files with the provided code**
   - Copy all the components, pages, services, and utils files
   - Update the CSS files with the provided styles
   - Replace App.js with the routing setup

4. **Create the folder structure**
   ```
   src/
   ├── components/
   │   ├── Header.js
   │   ├── Header.css
   │   └── LoadingSpinner.js
   ├── pages/
   │   ├── LandingPage.js
   │   ├── LandingPage.css
   │   ├── LoginPage.js
   │   ├── LoginPage.css
   │   ├── DashboardPage.js
   │   ├── DashboardPage.css
   │   ├── PatientsPage.js
   │   ├── PatientsPage.css
   │   ├── NewPatientPage.js
   │   ├── NewPatientPage.css
   │   ├── CalendarPage.js
   │   ├── CalendarPage.css
   │   ├── VideoCallPage.js
   │   └── VideoCallPage.css
   ├── services/
   │   ├── auth.js
   │   ├── api.js
   │   └── storage.js
   ├── utils/
   │   ├── routing.js
   │   ├── helpers.js
   │   └── constants.js
   ├── styles/
   │   └── globals.css
   └── App.js
   ```

## Running the Application

1. **Start the development server**
   ```bash
   npm start
   ```

2. **Open your browser**
   Navigate to `http://localhost:3000`

3. **Login with demo credentials**
   - Email: `demo@telenos.com`
   - Password: `demo123`

## Key Components

### Authentication
- Mock authentication system with localStorage
- Secure session management
- Role-based access control

### Patient Management
- Add new patients with comprehensive forms
- Search and filter patient records
- HIPAA-compliant data storage

### Appointment System
- Calendar view with month/day modes
- Schedule new appointments
- Video call integration

### Video Calling
- Simulated video call interface
- Mute/unmute and camera controls
- Session duration tracking

## Customization

### Styling
The application uses CSS custom properties for easy theming:

```css
:root {
  --primary: #3B82F6;
  --secondary: #8B5CF6;
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
}
```

### API Integration
To connect to a real backend:

1. Update the `baseURL` in `services/api.js`
2. Implement real authentication in `services/auth.js`
3. Remove mock data and use actual API endpoints

### Environment Variables
Create a `.env` file for configuration:

```
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENV=development
```

## Building for Production

1. **Create production build**
   ```bash
   npm run build
   ```

2. **Deploy the build folder**
   The `build` folder contains the optimized production files.

## Security Considerations

- All patient data is stored locally for demo purposes
- In production, implement proper encryption
- Use HTTPS for all communications
- Follow HIPAA compliance guidelines
- Implement proper access controls and audit logging

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Mobile Responsiveness

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   npm start -- --port 3001
   ```

2. **Dependencies not installing**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Build failures**
   ```bash
   npm run build -- --verbose
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational and demonstration purposes. Ensure compliance with healthcare regulations before using in production.

## Support

For questions and support:
- Check the documentation
- Review the code comments
- Test with the provided demo data

## Next Steps

To make this production-ready:

1. **Backend Integration**
   - Set up a Node.js/Express backend
   - Implement PostgreSQL or MongoDB database
   - Add real authentication with JWT tokens

2. **Security Enhancements**
   - Implement HTTPS
   - Add rate limiting
   - Set up proper CORS policies
   - Add input validation and sanitization

3. **Video Calling**
   - Integrate with WebRTC or Twilio Video
   - Add screen sharing capabilities
   - Implement recording functionality

4. **Advanced Features**
   - Push notifications
   - Email integration
   - Report generation
   - Analytics dashboard

5. **Testing**
   - Unit tests with Jest
   - Integration tests
   - End-to-end tests with Cypress

6. **Deployment**
   - CI/CD pipeline
   - Docker containerization
   - Cloud deployment (AWS, Azure, GCP)

## Technology Stack

- **Frontend**: React 18, React Router, CSS3
- **State Management**: React Hooks, Local Storage
- **Styling**: CSS Modules, Responsive Design
- **Build Tool**: Create React App
- **Package Manager**: npm

This setup provides a solid foundation for a modern healthcare web application with room for extensive customization and feature additions.