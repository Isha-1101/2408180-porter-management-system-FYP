# Porter Management System - Frontend

A modern, responsive web application for managing porter services, bookings, and team coordination. Built with React and Vite for optimal performance and developer experience.

## Overview

The Porter Management System Frontend is a comprehensive client-side application designed to streamline porter service management, booking operations, and team coordination. It provides intuitive interfaces for customers to book porters, manage services, and track bookings in real-time.

## Features

### Core Functionality
- **User Authentication** - Secure login and registration system with JWT-based authentication
- **Porter Booking Management** - Schedule and manage individual porter bookings with real-time updates
- **Team Bookings** - Coordinate multiple porters for larger tasks and events
- **Fare Calculator** - Dynamic fare calculation based on distance, service type, and complexity
- **Real-time Tracking** - Live location tracking using integrated maps (Leaflet)
- **Rating & Reviews** - Customer feedback system for porter performance evaluation
- **Admin Dashboard** - Comprehensive analytics and system management capabilities

### User Experience
- Responsive Design - Optimized for desktop, tablet, and mobile devices
- Real-time Notifications - Socket.io integration for instant updates
- Smooth Animations - Framer Motion for polished UI transitions
- Data Visualization - Chart.js integration for analytics and insights
- Form Validation - React Hook Form with comprehensive validation rules
- State Management - Zustand for efficient client-side state management

## Technology Stack

### Frontend Framework
- **React** (v19.2.0) - UI library with modern features
- **Vite** (v7.2.4) - Next-generation build tool with Hot Module Replacement (HMR)

### UI & Styling
- **Tailwind CSS** (v4.1.17) - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible component library
- **Lucide React** - Modern icon library
- **Framer Motion** - Animation library for smooth interactions

### State & Data Management
- **Zustand** - Lightweight state management
- **React Query** (@tanstack/react-query v5.90.12) - Server state management and caching
- **Axios** - Promise-based HTTP client
- **React Hook Form** - Performant form state management

### Additional Libraries
- **React Router** (v7.10.1) - Client-side routing
- **Socket.io Client** - Real-time communication
- **Leaflet & React Leaflet** - Map integration for location tracking
- **Chart.js & React ChartJS 2** - Data visualization
- **Day.js** - Date and time manipulation
- **React Hot Toast** - Toast notifications
- **Class Variance Authority** - Type-safe CSS variable management

### Development Tools
- **ESLint** - Code quality and style enforcement
- **Vite Plugins** - React plugin for fast refresh

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** (v7+) or **yarn** (v1.22+)

## Installation

### 1. Clone the Repository
```bash
git clone <https://github.com/Isha-1101/2408180-porter-management-system-FYP.git>
cd 2408180-porter-management-system-FYP/porter-management-frontend
```

### 2. Install Dependencies
```bash
npm install
```
Or with yarn:
```bash
yarn install
```

### 3. Environment Configuration
Create a `.env` file in the project root with the following variables:
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

Refer to `.env.example` for a complete list of required environment variables.

## Usage

### Development Server
Start the development server with hot module replacement:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

### Production Build
Create an optimized production build:
```bash
npm run build
```

### Preview Build
Preview the production build locally:
```bash
npm run preview
```

### Linting
Run ESLint to check code quality:
```bash
npm run lint
```

## Project Structure

```
src/
├── apis/
│   ├── services/          # API service modules
│   │   ├── authService.js
│   │   ├── porterService.js
│   │   ├── porterBookingsService.js
│   │   ├── teamBookingService.js
│   │   ├── ratingService.js
│   │   ├── farecalculatorService.js
│   │   └── adminService.js
│   ├── hooks/             # Custom React hooks for API calls
│   │   ├── authHooks.jsx
│   │   ├── portersHooks.jsx
│   │   ├── porterBookingsHooks.jsx
│   │   ├── ratingHooks.jsx
│   │   └── fareHooks.jsx
│   └── axiosInstance.jsx  # Configured Axios instance
├── providers/
│   └── react-query-provider.jsx  # React Query configuration
├── components/            # Reusable UI components
├── pages/                 # Page components and layouts
├── store/                 # Zustand state management
├── utils/                 # Utility functions and helpers
├── main.jsx              # Application entry point
└── App.jsx               # Root component

public/                   # Static assets

config files:
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── eslint.config.js     # ESLint configuration
├── jsconfig.json        # JavaScript configuration
└── components.json      # Component configuration
```

## Configuration Files

### Vite Configuration
- `vite.config.js` - Build tool configuration with React plugin support

### Styling
- `tailwind.config.js` - Tailwind CSS customization and theme configuration
- `components.json` - Component library settings

### Code Quality
- `eslint.config.js` - Linting rules and configuration
- `jsconfig.json` - JavaScript runtime configuration

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint checks |

## Key Features Implementation

### Authentication
Uses JWT-based authentication with axios interceptors for automatic token refresh and request/response handling.

### Real-time Updates
Socket.io integration enables real-time notifications for booking status, porter location, and system events.

### State Management
Zustand store for global UI state and React Query for server state, ensuring efficient data synchronization.

### Responsive Design
Fully responsive layout built with Tailwind CSS breakpoints, ensuring optimal experience across all devices.

## Performance Optimizations

- **Code Splitting** - Automatic with Vite and React Router
- **Tree Shaking** - Unused code removal during build
- **Lazy Loading** - Components loaded on demand
- **Image Optimization** - Cloudinary integration for image delivery
- **Caching Strategy** - React Query caching for efficient API calls

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Build Issues
If you encounter build issues, try:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Development Server Not Starting
Ensure port 5173 is available or configure a different port in `vite.config.js`

### Environment Variables Not Loading
Verify `.env` file exists in the root directory and variables are prefixed with `VITE_`

## Contributing

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit your changes (`git commit -m 'Add AmazingFeature'`)
3. Push to the branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Support

For issues, questions, or contributions, please reach out to the development team or open an issue in the repository.

---

**Version:** 0.0.1  
**Last Updated:** May 2026  
**Built for efficient porter management**
