# Porter Management System - Backend API

A robust, scalable Node.js API server for the Porter Management System. Built with Express.js and MongoDB, featuring real-time communication, intelligent location tracking, and comprehensive service management.

## Overview

The Porter Management System Backend API serves as the core infrastructure for managing porter services, bookings, team coordination, and real-time operations. It provides RESTful endpoints and Socket.io-based real-time communication for seamless porter service management and customer interactions.

## Features

### Core API Features
- **Authentication & Authorization** - JWT-based secure authentication with role-based access control (RBAC)
- **Porter Management** - Comprehensive porter profile, registration, and team management
- **Booking System** - Full lifecycle management for individual and team bookings
- **Real-time Location Tracking** - Socket.io-based porter location tracking with location history logging
- **Fare Calculation** - Intelligent fare calculator with dynamic pricing based on distance and service type
- **Payment Processing** - Secure payment integration and transaction management
- **Rating & Review System** - Customer feedback and porter performance evaluation
- **Chat System** - Real-time messaging between customers and porters within bookings
- **Admin Dashboard API** - Analytics, system monitoring, and administrative operations
- **AI Integration** - Google Gemini AI API for smart recommendations and assistance

### Technical Capabilities
- **Real-time Communication** - Socket.io for live updates, location sharing, and instant messaging
- **Database Validation** - Express-validator for robust input validation
- **Security** - Helmet.js for HTTP security headers, CORS protection
- **Logging** - Morgan for request/response logging
- **Image Management** - Cloudinary integration for image storage and delivery
- **Email Notifications** - Nodemailer for transactional emails
- **API Documentation** - Swagger/OpenAPI integration for API documentation
- **File Upload** - Multer for secure file upload handling

## Technology Stack

### Server Framework
- **Express.js** (v5.2.1) - Fast, unopinionated web framework
- **Node.js** - JavaScript runtime

### Database & ODM
- **MongoDB** - NoSQL document database
- **Mongoose** (v9.0.1) - MongoDB object document mapper

### Authentication & Security
- **JWT (jsonwebtoken)** (v9.0.3) - Token-based authentication
- **bcryptjs** (v3.0.3) - Password hashing and encryption
- **Helmet.js** (v8.1.0) - HTTP security headers
- **CORS** (v2.8.5) - Cross-Origin Resource Sharing

### Real-time & Communication
- **Socket.io** (v4.8.1) - Real-time bidirectional communication
- **Nodemailer** (v7.0.13) - Email service for notifications

### File & Image Management
- **Multer** (v2.0.2) - File upload middleware
- **Cloudinary** (v2.8.0) - Cloud image storage and CDN

### AI & External Services
- **Google GenAI** (@google/genai v1.37.0) - AI-powered features using Gemini API
- **Axios** (v1.13.2) - HTTP client for external requests
- **Form-data** (v4.0.5) - Multipart form data handling

### Development & Logging
- **Morgan** (v1.10.1) - HTTP request logger
- **Dotenv** (v17.2.3) - Environment variable management
- **Nodemon** (v3.1.11) - Development file watcher and auto-restart

### API Documentation
- **Swagger JSDoc** (v6.2.8) - Swagger/OpenAPI documentation generator
- **Swagger UI Express** (v5.0.1) - Interactive API documentation UI

### Utilities
- **Express-validator** (v7.3.1) - Request validation middleware

## Prerequisites

Before setting up the backend, ensure you have:
- **Node.js** (v18 or higher)
- **npm** (v9+) or **yarn** (v3.2+)
- **MongoDB** (local or cloud instance via MongoDB Atlas)
- **Git**

### External Accounts Required
- **Cloudinary** - Image storage (free tier available)
- **Google Gemini API** - AI features (API key required)
- **SMTP Provider** - Email notifications (Gmail or custom SMTP)

## Installation

### 1. Clone the Repository
```bash
git clone <https://github.com/Isha-1101/2408180-porter-management-system-FYP.git>
cd 2408180-porter-management-system-FYP/porter-management-backend
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
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority

# Authentication
JWT_SECRETE=your_jwt_secret_key_here_min_32_chars

# CORS Configuration
API_URL=http://localhost:5000
CLIENT_URL_DEV=http://localhost:5173
CLIENT_URL_PROD=https://your-production-domain.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

Refer to `.env.example` for all available configuration options.

## Usage

### Development Server
Start the development server with auto-reload:
```bash
npm run dev
```
The API will be available at `http://localhost:5000`

### Production Server
Start the production server:
```bash
npm run server
```
Or use the start script:
```bash
npm start
```

### Database Seeding
Seed the database with sample data:
```bash
npm run data:import
```

### Database Cleanup
Remove all seeded data:
```bash
npm run data:destroy
```

## API Endpoints

### Authentication Routes (`/core-api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /refresh-token` - Refresh JWT token

### Porter Routes (`/core-api/porter`)
- `GET /` - Get all porters
- `GET /:id` - Get porter details
- `POST /` - Create new porter
- `PUT /:id` - Update porter information
- `DELETE /:id` - Delete porter

### Porter Registration (`/core-api/porter-registration`)
- `POST /` - Submit porter registration application
- `GET /status/:id` - Check registration status
- `PUT /:id` - Update registration

### Booking Routes (`/core-api/bookings`)
- `POST /` - Create new booking
- `GET /` - Get all bookings
- `GET /:id` - Get booking details
- `PUT /:id` - Update booking status
- `DELETE /:id` - Cancel booking

### Team Routes (`/core-api/teams`)
- `POST /` - Create team
- `GET /` - List teams
- `GET /:id` - Get team details
- `POST /:id/members` - Add team member
- `DELETE /:id/members/:memberId` - Remove team member

### Fare Calculator (`/core-api/fare-calculator`)
- `POST /calculate` - Calculate fare based on parameters

### Ratings & Reviews (`/core-api/ratings`)
- `POST /` - Submit rating/review
- `GET /porter/:porterId` - Get porter ratings
- `GET /booking/:bookingId` - Get booking rating

### Payments (`/core-api/payments`)
- `POST /` - Process payment
- `GET /:id` - Get payment details
- `PUT /:id` - Update payment status

### Location (`/core-api/locations`)
- `GET /all` - Get all porter locations
- `POST /update` - Update porter location (primarily via Socket.io)
- `GET /logs/:porterId` - Get location history

### Chat Routes (`/core-api/chat`)
- `GET /booking/:bookingId` - Get booking chat messages
- `POST /` - Send message (primarily via Socket.io)

### Admin Routes (`/core-api/admin`)
- `GET /dashboard` - Get admin dashboard statistics
- `GET /porters` - Manage porters
- `GET /bookings` - Manage bookings
- `POST /approve/:id` - Approve applications

### AI Routes (`/core-api/ai`)
- `POST /suggestions` - Get AI suggestions
- `POST /recommend` - Get recommendations

## Project Structure

```
porter-management-backend/
├── src/
│   ├── config/
│   │   └── db.js              # Database connection configuration
│   ├── controllers/           # Request handlers
│   │   ├── auth/
│   │   ├── porter/
│   │   ├── booking/
│   │   ├── team/
│   │   ├── admin/
│   │   ├── chat/
│   │   ├── payment/
│   │   ├── rating/
│   │   ├── ai/
│   │   └── ...
│   ├── models/               # MongoDB schemas
│   │   ├── porter/
│   │   │   ├── Porters.js
│   │   │   ├── porterTeam.js
│   │   │   ├── porter-registration.js
│   │   │   └── ...
│   │   ├── Booking.js
│   │   ├── Message.js
│   │   ├── Payment.js
│   │   ├── PortersReview.js
│   │   ├── LocationLogs.js
│   │   └── ...
│   ├── routes/               # API route definitions
│   │   ├── authRoutes.js
│   │   ├── porterRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── admin/
│   │   ├── team/
│   │   └── ...
│   ├── middlewares/          # Custom middleware
│   │   ├── auth.js           # JWT verification
│   │   ├── multerErrorHandler.js
│   │   ├── errorHandler.js
│   │   └── ...
│   ├── utils/               # Utility functions
│   │   ├── socketInstance.js # Socket.io singleton
│   │   ├── cloudinary.js
│   │   ├── email.js
│   │   └── ...
│   ├── validator/           # Request validation schemas
│   │   ├── auth.validator.js
│   │   ├── porter.validator.js
│   │   └── ...
│   └── scripts/             # Database scripts
│       └── seeder.js        # Seed data scripts
├── index.js                 # Server entry point with Socket.io
├── app.js                   # Express app configuration
├── .env                     # Environment variables (not committed)
├── .env.example             # Environment template
├── package.json
└── README.md
```

## Configuration Files

### Express App Configuration
- `app.js` - Express application setup, middleware, routes
- `index.js` - HTTP server and Socket.io initialization

### Database
- `src/config/db.js` - MongoDB connection and initialization

### Security & Middleware
- `src/middlewares/auth.js` - JWT authentication middleware
- `src/middlewares/multerErrorHandler.js` - File upload error handling
- `src/middlewares/errorHandler.js` - Global error handling

## Socket.io Events

### Real-time Communication

#### Location Events
- `join-porter-room` - Porter joins their notification room
- `join-user-room` - User joins their notification room
- `porter-location` - Porter sends location update
- `get-porter-locations` - Request all porter locations
- `all-porter-locations` - Broadcast all porter locations
- `porter-location-update` - Broadcast single porter location update

#### Chat Events
- `join-chat` - Join booking chat room
- `send-message` - Send chat message
- `receive-message` - Receive new message
- `typing-start` - User typing indicator start
- `typing-stop` - User typing indicator stop
- `message-read` - Mark message as read
- `message-read-receipt` - Broadcast read receipt

## Database Models

### Key Collections

#### Porters
Main porter profile with location and status information.

#### Users
Customer/user accounts.

#### Bookings
Booking records linking customers with porters.

#### Messages
Real-time chat messages within bookings.

#### Payments
Payment transaction records.

#### Ratings
Customer reviews and ratings for porters.

#### LocationLogs
Historical location data for analytics and tracking.

#### Teams
Porter team associations and management.

## Development Workflow

### Add New Endpoint
1. Create controller in `src/controllers/`
2. Define route in `src/routes/`
3. Add validation in `src/validator/`
4. Register route in `app.js`
5. Test with API client (Postman, Insomnia)

### Add New Model
1. Create schema in `src/models/`
2. Define indexes and methods
3. Use in controllers via Mongoose

### Add Middleware
1. Create in `src/middlewares/`
2. Apply to routes or globally in `app.js`

## Performance Optimizations

- **Connection Pooling** - Mongoose handles MongoDB connection pooling
- **Request Logging** - Morgan middleware for performance insights
- **Security Headers** - Helmet.js for security optimization
- **CORS Optimization** - Configured for specific origins only
- **Pagination** - Implement pagination for large datasets
- **Database Indexing** - Indexes on frequently queried fields

## Error Handling

The API implements comprehensive error handling:
- **400** - Bad Request (validation errors)
- **401** - Unauthorized (authentication required)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **500** - Internal Server Error

All errors follow a consistent response format with error codes and messages.

## Security Best Practices

- ✅ JWT for stateless authentication
- ✅ bcryptjs for password hashing
- ✅ Helmet.js for security headers
- ✅ CORS for cross-origin protection
- ✅ Input validation via express-validator
- ✅ Environment variables for sensitive data
- ✅ Multer file upload validation
- ✅ Rate limiting (recommended to implement)

## Deployment

### Prerequisites
- Node.js hosting (Heroku, Railway, Render, VPS)
- MongoDB Atlas or self-hosted MongoDB
- Environment variables configured

### Deploy Steps
1. Push code to repository
2. Configure environment variables on hosting platform
3. Run `npm install`
4. Start server: `npm start`

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure MongoDB Atlas credentials
- [ ] Set production CORS origins
- [ ] Enable HTTPS
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

## Troubleshooting

### Database Connection Error
```
Check DATABASE_URL in .env
Verify MongoDB Atlas IP whitelist includes your IP
Ensure database user has correct permissions
```

### Socket.io Connection Issues
```
Verify CORS origins match CLIENT_URL_DEV/PROD
Check firewall/network settings
Ensure Socket.io client version compatibility
```

### Email Not Sending
```
Verify EMAIL_USER and EMAIL_PASS are correct
Enable "Less secure app access" if using Gmail
Check SMTP configuration
```

### File Upload Errors
```
Verify Cloudinary credentials
Check file size limits in Multer configuration
Ensure proper MIME type validation
```

## API Documentation

Interactive API documentation is available at `/api-docs` when the server is running (if Swagger integration is enabled).

### Generate API Docs
```bash
npm run docs  # If documentation generation script exists
```

## Contributing

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit changes (`git commit -m 'Add AmazingFeature'`)
3. Push to branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

## Code Standards

- Use ES6+ modules
- Follow existing code structure
- Add comments for complex logic
- Validate all user inputs
- Handle errors gracefully
- Write descriptive variable names

## Testing

To add tests:
```bash
npm test  # If test script is configured
```

## Monitoring & Logging

The server logs:
- HTTP requests (Morgan)
- Database operations
- Socket.io connections
- API errors
- System events

View logs in console or configure external logging (e.g., ELK stack).

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Support

For technical support, bugs, or feature requests, please open an issue in the repository or contact the development team.

---

**Version:** 1.0.0  
**Last Updated:** May 2026  
**Maintained by:** Porter Management Development Team  
**Built for seamless porter service management**
