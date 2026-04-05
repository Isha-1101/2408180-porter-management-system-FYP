# DOKO Namlo — Porter Management System

> **Final Year Project (FYP)** | [GitHub Repository](https://github.com/Isha-1101/2408180-porter-management-system-FYP)  
> **Author:** Isha Bhatta (Isha-1101)

A full-stack web application for managing porter (laborer/carrying service) bookings. It connects users who need carrying/transportation services with individual porters and porter teams.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Directory Structure](#directory-structure)
4. [User Stories & Booking Flow](#user-stories--booking-flow)
5. [API Endpoints](#api-endpoints)
6. [Database Models](#database-models)
7. [Authentication & Authorization](#authentication--authorization)
8. [Real-Time Architecture](#real-time-architecture)
9. [Frontend Architecture](#frontend-architecture)
10. [Environment Setup](#environment-setup)
11. [Running the Project](#running-the-project)
12. [Deployment](#deployment)

---

## Project Overview

DOKO Namlo is a porter management platform that handles the complete lifecycle of porter bookings:

- **User registration** and authentication (3 roles: user, porter, admin)
- **Porter registration** with multi-step form and admin approval
- **Individual porter booking** — search, select, confirm, track, pay
- **Team porter booking** — book entire teams for larger jobs
- **Real-time location tracking** via Socket.IO
- **Real-time chat** between users and porters per booking
- **Payment processing** — cash or eSewa (Nepal digital payment)
- **Booking cancellation** with refund logic and daily limits
- **Rating & reviews** after completed bookings
- **AI chat assistant** powered by Google Gemini
- **Fare calculator** based on distance, weight, floors, vehicle type

---

## Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| Node.js + Express.js v5 | HTTP server & REST API |
| MongoDB + Mongoose v9 | Database & ODM |
| JWT + bcryptjs | Authentication & password hashing |
| Socket.IO v4 | Real-time: location tracking, chat |
| Server-Sent Events (SSE) | Real-time booking notifications |
| Multer | File upload handling |
| Cloudinary | Cloud image/document storage |
| eSewa SDK | Payment gateway (Nepal) |
| Google Gemini AI (`@google/genai`) | AI chat assistant |
| Nodemailer (Gmail) | Email notifications |
| Helmet | HTTP security headers |
| Morgan | HTTP request logging |
| Swagger | API documentation |
| express-validator | Request validation |

### Frontend

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 7 | Build tool |
| React Router v7 | Client-side routing |
| Zustand (+ persist) | Global state (localStorage) |
| TanStack React Query v5 | Server state & data fetching |
| Axios | HTTP client with auth interceptor |
| Tailwind CSS v4 | Utility-first styling |
| shadcn/ui (Radix UI) | Accessible UI components |
| Lucide React | Icon library |
| Framer Motion | Animations |
| Leaflet + React-Leaflet | Interactive maps |
| React Hook Form | Form handling |
| React Hot Toast | Notifications |
| Socket.IO Client | Real-time communication |
| Day.js | Date formatting |

---

## Directory Structure

```
porter-management-system-FYP/
├── package.json                          # Root: concurrently runs both servers
│
├── porter-management-backend/
│   ├── index.js                          # Entry: HTTP server + Socket.IO
│   ├── app.js                            # Express app: middleware + routes
│   ├── .env.example                      # Environment template
│   └── src/
│       ├── config/                       # db, cloudinary, esewa, gemini, nodemailer, swagger
│       ├── controllers/
│       │   ├── authController.js         # Register, login, ban, delete, stats
│       │   ├── porterController.js       # Porter CRUD, status toggle
│       │   ├── LocationController.js     # Location logging
│       │   ├── paymentController.js      # Payment initiation, eSewa callbacks
│       │   ├── cancellationController.js # Cancellation + refund logic
│       │   ├── chatController.js         # Chat history
│       │   ├── chatEnhancedController.js # Send messages, file upload, read receipts
│       │   ├── rating.controller.js      # Submit/get ratings
│       │   ├── sse-controller.js         # SSE connection handlers
│       │   ├── Ai/porterChat.js          # Gemini AI chat
│       │   ├── book-porter/
│       │   │   ├── individual-booking-controller.js
│       │   │   ├── team-booking-controller.js
│       │   │   └── porter-booking-controller.js
│       │   ├── calcuate-fare/calculatefare.controller.js
│       │   ├── porters/
│       │   │   ├── porterRegistration.controller.js
│       │   │   └── team/
│       │   └── chat/porter-user-chat.js
│       ├── middlewares/
│       │   ├── authMiddleware.js         # JWT verification
│       │   ├── roleMiddleware.js         # Role-based authorization
│       │   ├── porterMiddleware.js       # Attaches porterId to req.user
│       │   ├── uploadFile.js             # Multer upload config
│       │   └── validate.js               # Validator result checker
│       ├── models/
│       │   ├── User.js
│       │   ├── PorterBooking.js
│       │   ├── Payment.js
│       │   ├── CancellationLog.js
│       │   ├── PortersReview.js
│       │   ├── Message.js
│       │   ├── MessageReceipt.js
│       │   ├── LocationLogs.js
│       │   ├── BookingNotification.js
│       │   ├── BookintgPorterRequest.js
│       │   ├── TeamBookingSelection.js
│       │   ├── porter/
│       │   │   ├── Porters.js
│       │   │   ├── porterTeam.js
│       │   │   ├── porter-registration.js
│       │   │   ├── porter-basic-info.js
│       │   │   ├── porter-vehicle-info.js
│       │   │   └── porter-document-info.js
│       │   └── vehicleTypes.js / documentTypes.js
│       ├── routes/                       # All route definitions
│       ├── utils/                        # generateToken, helper, socketInstance, sse-service, seeder
│       ├── validator/                    # porter-booking-validator, fare-calculator-validator
│       └── scripts/seed-admin.js         # Admin user seeder
│
└── porter-management-frontend/
    ├── index.html                        # "DOKO Namlo" app entry
    ├── vite.config.js
    ├── tailwind.config.js
    ├── components.json                   # shadcn/ui config
    ├── vercel.json                       # Vercel SPA rewrites
    └── src/
        ├── main.jsx                      # React 19 entry
        ├── App.jsx                       # ReactQueryProvider + MainRoute + Toaster
        ├── Routes/
        │   ├── MainRoute.jsx             # BrowserRouter with role-based routing
        │   ├── PublicRoute.jsx           # Landing, Login, Register
        │   ├── ProtectedRoute.jsx        # Auth guard + role redirect
        │   ├── UserRoutes.jsx            # User dashboard routes
        │   ├── PorterRoutes.jsx          # Porter dashboard routes
        │   └── AdminRoutes.jsx           # Admin dashboard routes
        ├── pages/
        │   ├── LandingPage.jsx
        │   ├── authPages/                # Login, Register, ChangeTemporaryPassword
        │   └── dashboard/
        │       ├── user/
        │       │   ├── PorterBooking/    # index, BookingMap, LocationInputs, VehicleSelector, PurposeFields, PorterList
        │       │   ├── Orders.jsx
        │       │   ├── BookingConfirmation.jsx
        │       │   ├── BookingTracking.jsx
        │       │   ├── Payment.jsx
        │       │   └── BookingSuccess.jsx
        │       ├── porter/
        │       │   ├── PorterDashboard.jsx
        │       │   ├── PorterRegister.jsx
        │       │   ├── PorterPending.jsx
        │       │   ├── AcceptedBookingDetails.jsx
        │       │   └── TeamOwnerDashboard.jsx
        │       └── admin/
        │           ├── AdminDashboardOverview.jsx
        │           ├── UserManagement.jsx
        │           ├── PorterRegistrations.jsx
        │           └── PorterManagement.jsx
        ├── components/
        │   ├── chat/ChatBox.jsx          # Real-time chat per booking
        │   ├── EnhancedChat.jsx
        │   ├── BookingCancellation.jsx
        │   ├── PaymentMethodSelector.jsx
        │   ├── PaymentStatus.jsx
        │   ├── Map/UserMap.jsx           # Leaflet map component
        │   └── ui/                       # shadcn/ui primitives
        ├── apis/
        │   ├── axiosInstance.jsx         # Axios with auth interceptor
        │   ├── services/                 # Individual service modules
        │   └── hooks/                    # React Query hooks
        ├── store/
        │   ├── auth.store.js             # Zustand auth (persisted)
        │   └── porter.store.js           # Zustand porter state
        ├── guards/                       # AdminGuard, PorterGuards, PorterTeamGuard
        ├── hooks/                        # useSSENotifications, use-porter
        ├── utils/                        # sse, socket, haversine, osrm, reverseGeocode
        └── providers/react-query-provider.jsx
```

---

## User Stories & Booking Flow

### Individual Booking Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    INDIVIDUAL BOOKING FLOW                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  USER SIDE                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────────────┐     │
│  │ 1. Search    │───>│ 2. Select    │───>│ 3. Confirm        │     │
│  │    Porters   │    │    Porter    │    │    Booking        │     │
│  │              │    │              │    │                   │     │
│  │ • From/To    │    │ • View list  │    │ • Review details  │     │
│  │ • hasVehicle │    │ • See fare   │    │ • Create booking  │     │
│  │ • Purpose    │    │ • Book now   │    │ • Go to tracking  │     │
│  └──────────────┘    └──────────────┘    └───────────────────┘     │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────────────┐     │
│  │ 7. Payment   │<───│ 6. Complete  │<───│ 5. Track Journey  │     │
│  │    Method    │    │    Journey   │    │    (Live Map)     │     │
│  │              │    │              │    │                   │     │
│  │ • Cash/Digi  │    │ • Porter     │    │ • See porter      │     │
│  │ • Pay now    │    │   marks done │    │   coming (map)    │     │
│  └──────────────┘    └──────────────┘    └───────────────────┘     │
│         │                      ▲                      ▲            │
│         ▼                      │                      │            │
│  ┌──────────────┐              │                      │            │
│  │ 8. Booking   │              │                      │            │
│  │    History   │              │                      │            │
│  │              │              │                      │            │
│  │ • View all   │              │                      │            │
│  │ • Rate       │              │                      │            │
│  │   porter     │              │                      │            │
│  └──────────────┘              │                      │            │
│                                │                      │            │
│  PORTER SIDE                   │                      │            │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────────────┐     │
│  │ 4a. Receive  │───>│ 4b. Accept/  │───>│ 4c. View Booking  │     │
│  │    Request   │    │    Decline   │    │    Details        │     │
│  │              │    │              │    │                   │     │
│  │ • Socket/SSE │    │ • Accept →   │    │ • Customer info   │     │
│  │ • Dashboard  │    │   CONFIRMED  │    │ • Pickup/Drop     │     │
│  │ • Live badge │    │ • Decline →  │    │ • Weight/Vehicle  │     │
│  └──────────────┘    │   EXPIRED    │    │ • Chat with user  │     │
│                      └──────────────┘    └───────────────────┘     │
│                                │                      │            │
│                                ▼                      ▼            │
│                       ┌──────────────┐    ┌───────────────────┐     │
│                       │ 4d. Start    │───>│ 4e. Complete      │     │
│                       │    Journey   │    │    Journey        │     │
│                       │              │    │                   │     │
│                       │ • IN_PROGRESS│    │ • COMPLETED       │     │
│                       │ • Emit loc.  │    │ • Reset status    │     │
│                       │ • User sees  │    │ • User selects    │     │
│                       │   on map     │    │   payment method  │     │
│                       └──────────────┘    └───────────────────┘     │
│                                                                     │
│  CANCELLATION (both sides)                                          │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ • User can cancel anytime before COMPLETED                  │    │
│  │ • Porter can cancel but limited to 3/day                    │    │
│  │ • Refund logic: digital=auto, cash=admin approval           │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  CHAT (after booking accepted)                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ • Per-booking chat between user and assigned porter         │    │
│  │ • Text messages + file uploads (images/PDFs)               │    │
│  │ • Typing indicators + read receipts                        │    │
│  │ • Available in CONFIRMED and IN_PROGRESS states            │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

### Search Flow Detail

**Step 1: Search Porters**

The user fills out the booking form with:

| Field | Condition | Required |
|---|---|---|
| From (pickup location) | Always | Yes |
| To (drop location) | Always | Yes |
| hasVehicle (toggle) | Always | Yes (default: false) |
| Vehicle Type | If hasVehicle = true | Yes (bike/van/mini-truck/truck) |
| Purpose | If hasVehicle = false | Yes (transportation/delivery) |
| Weight (kg) | If hasVehicle = false | Yes (min 5kg) |
| Number of Trips | If hasVehicle = false | Yes |
| Number of Floors | If purpose = transportation | Yes |
| Has Lift | If purpose = transportation | Yes (toggle) |

**Step 2: View Porter List**

After search, nearby porters are displayed sorted by distance. Each porter card shows:
- Name, photo, rating
- Distance from pickup
- Vehicle info (if applicable)
- Price estimate
- "Book Now" button

**Step 3: Confirm Booking**

Review page shows:
- Route (pickup → dropoff)
- Selected porter details
- Weight, vehicle details
- Total price
- Confirm button → creates booking with status `WAITING_PORTER`

**Step 4: Porter Receives & Responds**

- Porter dashboard receives real-time notification via Socket.IO + SSE
- Porter can **Accept** (booking → `CONFIRMED`) or **Decline** (request → `REJECTED`)
- On accept: all other pending requests for this booking expire

**Step 5: User Tracks Journey**

- Real-time status steps: Waiting → Confirmed → In Progress → Completed
- Live map shows porter location (emitted every 5 seconds via Socket.IO)
- Chat available once porter is assigned
- Cancel button available in WAITING_PORTER and CONFIRMED states

**Step 6: Porter Manages Journey**

- **Start Journey**: Sets status to `IN_PROGRESS`, begins emitting GPS location
- **Complete Journey**: Sets status to `COMPLETED`, resets porter to available

**Step 7: Payment**

After completion, user selects payment method:
- **Cash**: Pay directly to porter
- **Digital**: Redirect to eSewa payment gateway

**Step 8: Booking History**

- User can view all past bookings in Orders page
- Filter by status (All, Active, Completed, Cancelled)
- Rate porters (1-5 stars + comment) for completed bookings
- Click to track active bookings

---

## API Endpoints

### Base URL: `/core-api`

#### Authentication (`/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register new user |
| POST | `/auth/login` | Public | Login with phone + password |
| PUT | `/auth/change-temp-password` | Authenticated | Change temporary password |
| PUT | `/auth/delete-user/:id` | Authenticated | Soft-delete user (30-day grace) |
| PUT | `/auth/banned-user/:id` | Admin | Ban/unban user |
| GET | `/auth/get-users` | Admin/User | Get all users (admin) or current user |
| GET | `/auth/switch-to-porter` | Authenticated | Switch user to porter role |

#### Porters (`/porters`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/porters/` | Authenticated | Get all porters |
| GET | `/porters/by-user` | Porter | Get current porter details |
| GET | `/porters/by-id/:id` | Porter | Get porter by ID |
| PUT | `/porters/status` | Porter | Toggle online/offline |

#### Porter Registration (`/porter-registration`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/porter-registration/start` | Porter | Start/resume registration |
| PUT | `/porter-registration/:id/basic-info` | Porter | Save basic info + photo |
| PUT | `/porter-registration/:id/vehicle` | Porter | Save vehicle info |
| PUT | `/porter-registration/:id/documents` | Porter | Save license documents |
| GET | `/porter-registration/user` | Porter | Get registration by user |
| GET | `/porter-registration/:id` | Porter | Get full registration |
| POST | `/porter-registration/:id/submit` | Porter | Submit for approval |
| POST | `/porter-registration/:id/approve` | Admin | Approve registration |

#### Bookings (`/bookings`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/bookings/search-porters/:bookingType` | User | Search nearby porters |
| POST | `/bookings/create-booking-with-selected-porter/:bookingType` | User | Book specific porter |
| POST | `/bookings/individual` | User | Create individual booking |
| POST | `/bookings/individual/:id/accept` | Porter | Accept individual booking |
| POST | `/bookings/individual/:id/reject` | Porter | Reject individual booking |
| POST | `/bookings/individual/:id/complete` | Porter | Complete booking |
| POST | `/bookings/individual/:id/start` | Porter | Start journey (IN_PROGRESS) |
| POST | `/bookings/individual/:id/confirm-and-search` | User | Confirm payment & search |
| POST | `/bookings/individual/:id/update-payment-method` | User | Update payment after completion |
| POST | `/bookings/team` | User | Create team booking |
| POST | `/bookings/team/:id/team-lead/accept` | Porter | Team lead accepts |
| POST | `/bookings/team/:id/team-lead/reject` | Porter | Team lead rejects |
| POST | `/bookings/team/:id/team-lead/confirm` | Porter | Team lead confirms |
| POST | `/bookings/team/:id/porter/:porterId/respond` | Porter | Team member responds |
| POST | `/bookings/team/:id/complete` | Porter | Complete team booking |
| GET | `/bookings/team/:id/selection` | Porter | Get selection status |
| GET | `/bookings/user` | User | Get user's bookings |
| GET | `/bookings/porter` | Porter | Get porter's bookings |
| GET | `/bookings/:id` | Authenticated | Get booking details |
| DELETE | `/bookings/:id/cancel` | User | Cancel booking |

#### Payments (`/payments`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/payments/initiate` | Authenticated | Initiate payment |
| GET | `/payments/:bookingId` | Authenticated | Get payment by booking |
| POST | `/payments/:paymentId/verify-cash` | Admin | Verify cash payment |
| POST | `/payments/:paymentId/retry-esewa` | Authenticated | Retry eSewa payment |
| GET | `/payments/esewa/success` | Public | eSewa success callback |
| GET | `/payments/esewa/failure` | Public | eSewa failure callback |
| POST | `/payments/esewa/webhook` | Public | eSewa webhook |

#### Cancellations (`/cancellations`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/cancellations/:bookingId/cancel` | Authenticated | Cancel booking |
| GET | `/cancellations/remaining` | Authenticated | Get remaining cancellations today |
| GET | `/cancellations/user/:userId/history` | Authenticated | User cancellation history |
| GET | `/cancellations/porter/:porterId/history` | Authenticated | Porter cancellation history |
| POST | `/cancellations/:id/approve-refund` | Admin | Approve cash refund |
| POST | `/cancellations/:id/reject-refund` | Admin | Reject cash refund |

#### Chat (`/chat`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/chat/:bookingId` | Authenticated | Get chat history |
| POST | `/chat/:bookingId/message` | Authenticated | Send text message |
| POST | `/chat/:bookingId/upload` | Authenticated | Upload file message |
| PUT | `/chat/:messageId/read` | Authenticated | Mark as read |
| GET | `/chat/:bookingId/unread-count` | Authenticated | Get unread count |
| DELETE | `/chat/:messageId` | Authenticated | Delete message |

#### Ratings (`/ratings`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/ratings/` | User | Submit rating |
| GET | `/ratings/porter/:porterId` | Authenticated | Get porter ratings |
| GET | `/ratings/booking/:bookingId` | Authenticated | Check if already rated |

#### Other

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/fare-calculator/` | User | Calculate fare |
| POST | `/ask-questions/porter-management/chat` | Authenticated | AI chat (Gemini) |
| GET | `/bookings/sse/user` | User | SSE notifications (user) |
| GET | `/bookings/sse/porter` | Porter | SSE notifications (porter) |
| POST | `/location/log` | Public | Log porter location (REST) |
| GET | `/admin/stats` | Admin | Dashboard statistics |
| GET | `/admin/registrations` | Admin | All porter registrations |
| POST | `/admin/registrations/:id/reject` | Admin | Reject registration |

---

## Database Models

### Core Models

**User** (`users`)
- `name`, `email` (unique), `phone` (unique), `password` (hashed)
- `role`: user | porter | admin
- `isActive`, `isBanned`, `isDeleted`, `deletedAt`, `isTempPassword`
- `teamId`, `registerdBy` (self | porter_team), `remarks`

**Porters** (`porters`)
- `userId` (ref User), `registrationId`, `porterType` (individual | team)
- `teamId` (ref PorterTeam), `role` (owner | worker)
- `canAcceptBooking`, `status` (active | pending | inactive | banned)
- `isVerified`, `currentStatus` (online | offline | busy | assigned)
- `maxWeightKg`, `location` (GeoJSON 2dsphere), `lastLocationUpdatedAt`, `maxDistance`

**PorterBooking** (`porterbookings`)
- `userId`, `bookingType` (individual | team)
- `pickup` {address, lat, lng}, `drop` {address, lat, lng}
- `weightKg`, `radiusKm`, `hasVehicle`, `vehicleType`
- `noOfFloors`, `hasLift`, `no_of_trips`, `purpose_of_booking`
- `status`: SEARCHING → WAITING_PORTER → CONFIRMED → IN_PROGRESS → COMPLETED
- `assignedPorterId`, `assignedTeamId`, `assignedPorters[]`
- `totalPrice`, `paymentMethod` (cash | digital), `paymentStatus`
- `cancelledBy`, `cancellationReason`, `completedAt`

**PorterTeam** (`porterteams`)
- `ownerId` (ref User), `isActive`, `noOfMember`, `noOfAvailableMember`

**PorterRegistration** (`porterregistrations`)
- `userId`, `registrationId` (unique), `status` (draft | submitted | approved | rejected)
- `currentStep`, `steps` {basicInfo, vehicle, documents}, `rejectionReason`

**PorterBasicInfo** (`porterbasicinfos`)
- `registrationId`, `fullName`, `phone`, `address`, `identityType`, `identityNumber`
- `registrationIdDocument[]`, `porterPhoto`, `experienceYears`

**PorterVehicle** (`portervehicles`)
- `registrationId`, `hasVehicle`, `vehicleNumber`, `vehicleCategory` (bike | van | mini-truck | truck), `capacity`

**PorterDocument** (`porterdocuments`)
- `registrationId`, `licenseNumber`, `porterLicenseDocument`

**Payment** (`payments`)
- `bookingId` (unique), `userId`, `amount`, `method` (cash | digital)
- `status`, `esewaTxnId`, `esewaMerchantCode`, `failureReason`
- `verifiedAt`, `verifiedBy`, `retryCount`, `lastRetryAt`

**CancellationLog** (`cancellationlogs`)
- `bookingId`, `userId`, `cancelledBy` (user | porter), `reason`
- `refundAmount`, `refundStatus`, `paymentMethod`, `refundTxnId`
- `approvedBy`, `approvedAt`, `rejectionReason`

**PorterRating/Review** (`porter_reviews`)
- `bookingId`, `userId`, `porterId`, `rating` (1-5), `comment`

**Message** (`messages`)
- `bookingId`, `senderId`, `senderModel` (User | Porters | PorterTeam)
- `text`, `fileUrl`, `fileName`, `fileType`, `fileSize`

**MessageReceipt** (`messagereceipts`)
- `messageId`, `bookingId`, `readBy`, `readerModel`, `readAt`

**LocationLogs** (`location_logs`)
- `porterId`, `teamId`, `latitude`, `longitude`, `timestamp`

**BookingNotification** (`bookingnotifications`)
- `bookingId`, `recipientId`, `recipientRole`, `notificationType`
- `title`, `message`, `data`, `isRead`, `readAt`

**BookingPorterRequest** (`bookingporterrequests`)
- `bookingId`, `porterId`, `teamId`, `distanceKm`
- `notificationType` (DIRECT | TEAM_LEAD | TEAM_MEMBER), `isTeamLead`
- `status` (PENDING | ACCEPTED | REJECTED | EXPIRED)
- `requestedAt`, `respondedAt`

**TeamBookingSelection** (`teambookingselections`)
- `bookingId`, `teamId`, `teamLeadId`
- `selectedPorters[]` {porterId, status, respondedAt}
- `teamLeadConfirmed`, `confirmedAt`

---

## Authentication & Authorization

### Flow

1. **Registration** → bcrypt hash (10 rounds) → JWT token (30-day expiry)
2. **Login** → phone + password → checks: exists, not deleted, not banned, password match → JWT
3. **Temporary Password** → Porter team members get auto-generated temp password → forced change on first login
4. **Token Verification** → `authenticate` middleware extracts Bearer token → attaches decoded user to `req.user`
5. **Role Authorization** → `authorizeRole` middleware checks `req.user.role`
6. **Porter ID Attachment** → `attachPorterId` middleware looks up Porter document → attaches `porterId`, `teamId`, `porterRole`

### Frontend Auth

- Zustand store with `persist` middleware → stores `user`, `access_token`, `isAuthenticated` in localStorage
- Axios interceptor automatically attaches token to all requests
- 401 responses → clear localStorage → redirect to login

---

## Real-Time Architecture

### Socket.IO Events

| Event | Direction | Purpose |
|---|---|---|
| `join-porter-room` | Client → Server | Porter joins their room |
| `porter-location` | Client → Server | Porter emits GPS coordinates |
| `porter-location-update` | Client → Server | Porter emits location for specific booking |
| `booking-request` | Server → Client | New booking request to porter |
| `booking-confirmed` | Server → Client | Booking accepted by porter |
| `booking-in-progress` | Server → Client | Journey started |
| `booking-completed` | Server → Client | Journey completed |
| `booking-cancelled` | Server → Client | Booking cancelled |

### Server-Sent Events (SSE)

| Endpoint | Role | Events |
|---|---|---|
| `/bookings/sse/user` | User | `booking-confirmed`, `booking-status-update`, `booking-cancelled`, `booking-completed` |
| `/bookings/sse/porter` | Porter | `new-booking-request`, `booking-cancelled` |

---

## Frontend Architecture

### Routing

```
/                           → LandingPage
/login                      → Login
/register                   → Register
/change-temporary-password  → ChangeTemporaryPassword
/dashboard                  → ProtectedRoute (role-based redirect)
  ├── user routes
  │   ├── /dashboard/booking          → PorterBooking (search form)
  │   ├── /dashboard/booking/confirmation → BookingConfirmation
  │   ├── /dashboard/booking/tracking     → BookingTracking
  │   ├── /dashboard/booking/team-tracking → TeamBookingTracking
  │   ├── /dashboard/booking/payment      → Payment
  │   ├── /dashboard/booking/success      → BookingSuccess
  │   ├── /dashboard/orders               → Orders (history)
  │   ├── /dashboard/profile              → UserProfile
  │   └── /dashboard/settings             → Settings
  ├── porter routes
  │   ├── /dashboard/porters              → PorterDashboard (or register/pending guard)
  │   ├── /dashboard/porters/register     → PorterRegister
  │   ├── /dashboard/porters/pending      → PorterPending
  │   ├── /dashboard/porters/accepted-booking → AcceptedBookingDetails
  │   ├── /dashboard/porters/team-owner   → TeamOwnerDashboard
  │   ├── /dashboard/porters/team-lead/confirm-booking → TeamLeadConfirmBooking
  │   └── /dashboard/porters/profile      → PorterProfile
  └── admin routes
      ├── /dashboard/admin                → AdminDashboardOverview
      ├── /dashboard/admin/users          → UserManagement
      ├── /dashboard/admin/registrations  → PorterRegistrations
      └── /dashboard/admin/porters        → PorterManagement
```

### State Management

- **Zustand** for auth state (persisted to localStorage)
- **React Query** for server state (auto-refetch, caching, mutations)
- **Socket.IO** for real-time updates
- **SSE** for server-pushed notifications

### Key Components

- **DashboardLayout** — Sidebar + navbar + notifications + user menu
- **UserMap** — Leaflet map with pickup/dropoff/porter markers
- **ChatBox** — Real-time chat per booking (Socket.IO)
- **PaymentMethodSelector** — Cash vs digital payment selection
- **BookingCancellation** — Cancellation flow with reason
- **FareEstimateBreakdown** — Dynamic fare calculation display

---

## Environment Setup

### Backend `.env`

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=mongodb+srv://...
JWT_SECRETE=your_jwt_secret
API_URL=http://localhost:5000
CLIENT_URL_DEV=http://localhost:5173
CLIENT_URL_PROD=https://your-frontend.vercel.app
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
GEMINI_API_KEY=...
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ESEWA_MERCHANT_CODE=EPAYTEST
ESEWA_MERCHANT_SECRET=...
ESEWA_GATEWAY_URL=https://rc-epay.esewa.com.np/api/epay/main/v2/form
ESEWA_SUCCESS_URL=http://localhost:5000/core-api/payments/esewa/success
ESEWA_FAILURE_URL=http://localhost:5000/core-api/payments/esewa/failure
ESEWA_WEBHOOK_URL=http://localhost:5000/core-api/payments/esewa/webhook
MAX_CANCELLATIONS_PER_DAY=3
CANCELLATION_FREE_UNTIL_MINS=0
REFUND_AUTO_PROCESS=false
```

### Frontend `.env`

```env
VITE_API_BASE_URL_DEV=http://localhost:5000/core-api
VITE_API_BASE_URL_PROD=http://localhost:5000/core-api
VITE_SOCKET_URL=http://localhost:5000
VITE_NODE_ENV=development
VITE_CLOUDINARY_CLOUD_NAME=...
```

---

## Running the Project

```bash
# Install all dependencies (root)
npm install

# Run both frontend + backend concurrently
npm run dev

# Run backend only
npm run dev:server

# Run frontend only
npm run dev:client

# Seed admin user
cd porter-management-backend && node src/scripts/seed-admin.js

# Seed sample data
npm run data:import

# Destroy all data
npm run data:destroy
```

---

## Deployment

- **Frontend:** Vercel (SPA with client-side routing rewrites via `vercel.json`)
- **Backend:** Node.js server (port 5000)
- **Database:** MongoDB Atlas (cloud-hosted)

---

## Fare Calculation

### Without Vehicle (Labour-based)

| Component | Rate |
|---|---|
| Base labour | Rs. 100 |
| Weight (≤5kg) | Rs. 20 |
| Weight (>5kg) | Rs. 20 + Rs. 2/kg extra |
| Distance (≤5km) | Rs. 30 |
| Distance (>5km) | Rs. 30 + Rs. 10/km extra |
| Floor charge | Rs. 5/floor |
| Trip charge | Rs. 5/trip (after first) |
| No-lift surcharge | Rs. 50 (if floors > 0 and no lift) |

### With Vehicle

| Component | Bike | Van | Mini-Truck | Truck |
|---|---|---|---|---|
| Vehicle charge | Rs. 50 | Rs. 100 | Rs. 350 | Rs. 350 |
| Max weight | 200kg | 500kg | 800kg | 2000kg |
| Distance (≤5km) | Rs. 30 | Rs. 30 | Rs. 30 | Rs. 30 |
| Distance (>5km) | +Rs. 10/km | +Rs. 10/km | +Rs. 10/km | +Rs. 10/km |
