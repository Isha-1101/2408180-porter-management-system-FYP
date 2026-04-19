# API Dependency Map

Complete mapping of which components use which APIs. Use this before deleting or modifying any API.

---

## 📊 Quick Stats

| Category | Count |
|----------|-------|
| Total Components Using APIs | 20+ |
| Total Service Files | 9 active (+ 2 unused) |
| Total Hooks Files | 7 |
| Admin Components | 10 |
| Porter Components | 7 |
| User Components | 6 |

---

## Component → API Mapping

### 🔐 Authentication Pages

#### **Login.jsx**
```
Location: src/pages/authPages/Login.jsx
APIs Used:
  ├── authService.login()
  └── Hook: useLogin (from authHooks.jsx)
Purpose: User login
Endpoints: POST /auth/login
```

#### **Register.jsx** (implied from git status)
```
Location: src/pages/authPages/Register.jsx
APIs Used:
  ├── authService.register()
  └── Hook: useRegister (from authHooks.jsx)
Purpose: User registration
Endpoints: POST /auth/register
```

---

### 👤 Porter Management Pages

#### **PorterDashboard.jsx**
```
Location: src/pages/dashboard/porter/PorterDashboard.jsx
APIs Used:
  ├── porterBookingsService.getPorterBookings() [15s polling]
  ├── porterBookingsService.acceptBooking()
  ├── porterBookingsService.rejectBooking()
  ├── Hook: useGetPorterBookings
  ├── Hook: useAcceptPorterBooking
  └── Hook: useRejectPorterBooking
Purpose: Display pending bookings, allow acceptance/rejection
Endpoints: 
  - GET /bookings/porter?params [POLLING]
  - POST /bookings/individual/{id}/accept
  - POST /bookings/individual/{id}/reject
Real-time: YES (15-second refetch)
```

#### **PorterProfile.jsx**
```
Location: src/pages/dashboard/porter/PorterProfile.jsx
APIs Used:
  ├── porterService.getPorterByUser()
  ├── porterService.createVehicleDetails()
  ├── porterService.createDocumentDetails()
  ├── porterService.getDocuments()
  ├── porterRegistration.updateContact()
  └── Multiple hooks from portersHooks.jsx
Purpose: Manage porter profile, vehicle, and documents
Endpoints:
  - GET /porters/by-user
  - POST /porters/vehicle/save/{id}
  - POST /porters/document/save/{id}
  - GET /porters/document/get/{id}
  - PATCH /porter-registration/update-contact
```

#### **PorterRegister.jsx**
```
Location: src/pages/dashboard/porter/PorterRegister.jsx
APIs Used:
  ├── porterRegistrationService
  └── All hooks from porterRegistratioHooks.jsx (⚠️ typo)
Purpose: Multi-step registration workflow
Endpoints:
  - POST /porter-registration/start
  - PUT /porter-registration/{id}/basic-info
  - PUT /porter-registration/{id}/vehicle
  - PUT /porter-registration/{id}/documents
  - POST /porter-registration/{id}/submit
Type: Multi-step form
```

#### **PorterAnalytics.jsx**
```
Location: src/pages/dashboard/porter/PorterAnalytics.jsx
APIs Used:
  ├── porterService.getPorterAnalytics()
  └── Hook: useGetPorterAnalytics
Purpose: Display porter's analytics and statistics
Endpoints: GET /porters/analytics
```

#### **PorterBookingHistory.jsx**
```
Location: src/pages/dashboard/porter/PorterBookingHistory.jsx
APIs Used:
  ├── porterService.getPorterBookingHistory()
  └── Hook: useGetPorterBookingHistory
Purpose: Show porter's booking history with pagination
Endpoints: GET /porters/bookings/history?status=X&page=Y
```

#### **AcceptedBookingDetails.jsx**
```
Location: src/pages/dashboard/porter/AcceptedBookingDetails.jsx
APIs Used:
  ├── porterBookingsService.getBookingById()
  ├── porterBookingsService.startBooking()
  ├── porterBookingsService.completeBooking()
  └── Multiple hooks from porterBookingsHooks.jsx
Purpose: Display active booking and manage progress
Endpoints:
  - GET /bookings/{id}
  - POST /bookings/{id}/start
  - POST /bookings/{id}/complete
```

---

### 👥 Team-Related Pages

#### **TeamOwnerDashboard.jsx**
```
Location: src/pages/dashboard/porter/TeamOwnerDashboard.jsx
APIs Used:
  ├── teamBookingService (multiple endpoints)
  └── All 23 hooks from porterTeamHooks.jsx
Purpose: Complete team management
Endpoints: 20+ endpoints for team operations
Features:
  - View team members
  - Manage invitations
  - Handle team bookings
  - View booking history
```

#### **TeamMemberBookingResponse.jsx**
```
Location: src/pages/dashboard/porter/TeamMemberBookingResponse.jsx
APIs Used:
  ├── Hook: useTeamMemberRespond
  └── teamBookingService.respondToTeamBooking()
Purpose: Team member accepts/rejects bookings
Endpoints: POST /bookings/team/{id}/member/respond
```

#### **TeamLeadConfirmBooking.jsx**
```
Location: src/pages/dashboard/porter/TeamLeadConfirmBooking.jsx
APIs Used:
  ├── Hook: useTeamOwnerReviewBooking
  ├── Hook: useTeamOwnerConfirmBooking
  └── teamBookingService
Purpose: Team lead reviews and confirms bookings
Endpoints:
  - POST /bookings/team/{id}/review
  - POST /bookings/team/{id}/owner/confirm
```

#### **TeamCreation.jsx**
```
Location: src/pages/dashboard/team/TeamCreation.jsx
APIs Used:
  ├── teamBookingService (registration/creation endpoints)
  └── Hooks from porterTeamHooks.jsx
Purpose: Create and manage teams
Endpoints: POST /team-porters/register-request
```

---

### 📦 User Booking Pages

#### **PorterBooking/index.jsx** (Main booking page)
```
Location: src/pages/dashboard/user/PorterBooking/index.jsx
APIs Used:
  ├── porterBookingsService.searchNearbyPorters()
  ├── porterBookingsService.createIndividualBooking()
  ├── farecalculatorService.calculateFare()
  ├── Hook: useSearchNearByPorter
  ├── Hook: useCreateIndividualBooking
  └── Hook: useFareCalculator
Purpose: Core booking flow - search, fare calculation, booking creation
Endpoints:
  - POST /bookings/search-porters/{type}
  - POST /bookings/individual
  - GET /fare-calculator?params
Real-time: YES (fare updates as user changes inputs)
```

#### **PorterBooking/TeamFields.jsx**
```
Location: src/pages/dashboard/user/PorterBooking/TeamFields.jsx
APIs Used:
  ├── Hook: useBrowseAvailableTeams
  ├── Hook: useCreateTeamBooking
  └── teamBookingService
Purpose: User books a team of porters
Endpoints:
  - GET /team-porters/browse?portersRequired=X
  - POST /bookings/team
```

#### **BookingConfirmation.jsx**
```
Location: src/pages/dashboard/user/BookingConfirmation.jsx
APIs Used:
  ├── porterBookingsService.getBookingById()
  └── Hook: useGetBookingById
Purpose: Confirm booking details before submission
Endpoints: GET /bookings/{id}
```

#### **BookingTracking.jsx** (Individual booking)
```
Location: src/pages/dashboard/user/BookingTracking.jsx
APIs Used:
  ├── porterBookingsService.getBookingById() [10s polling]
  ├── porterBookingsService.cancelBooking()
  ├── Hook: useGetBookingById
  └── Hook: useCancelBooking
Purpose: Track individual booking in real-time
Endpoints:
  - GET /bookings/{id}
  - DELETE /bookings/{id}/cancel
Real-time: YES (10-second polling)
```

#### **TeamBookingTracking.jsx**
```
Location: src/pages/dashboard/user/TeamBookingTracking.jsx
APIs Used:
  ├── Hook: useGetTeamBookingStatus
  └── teamBookingService
Purpose: Track team booking status
Endpoints: GET /bookings/team/{id}
Real-time: YES (10-second polling)
```

#### **Orders.jsx**
```
Location: src/pages/dashboard/user/Orders.jsx
APIs Used:
  ├── porterBookingsService.getUserBookings()
  ├── ratingService.submitRating() ⚠️ [DIRECT - not hook]
  ├── ratingService.getBookingRating() ⚠️ [DIRECT - not hook]
  └── Hook: useGetUserBookings
Purpose: View completed orders and submit ratings
Endpoints:
  - GET /bookings/user?params
  - POST /ratings
  - GET /ratings/booking/{id}
Issue: Rating calls don't use React Query hooks
```

---

### 🛠️ Admin Pages

#### **AdminDashboardOverview.jsx**
```
Location: src/pages/dashboard/admin/AdminDashboardOverview.jsx
APIs Used:
  ├── adminService.getComprehensiveStats()
  ├── adminService.getSystemHealth()
  └── Direct service calls (no hooks)
Purpose: Dashboard overview with stats
Endpoints:
  - GET /admin/analytics/comprehensive
  - GET /admin/system-health
```

#### **AdminAnalytics.jsx**
```
Location: src/pages/dashboard/admin/AdminAnalytics.jsx
APIs Used:
  ├── adminService.getBookingTrends()
  ├── adminService.getBookingDistribution()
  ├── adminService.getRevenueStats()
  ├── adminService.getCancellationStats()
  └── Direct service calls (no hooks)
Purpose: Detailed analytics charts and graphs
Endpoints:
  - GET /admin/analytics/trends?params
  - GET /admin/analytics/distribution
  - GET /admin/payments/revenue
  - GET /admin/cancellations/stats
```

#### **AdminBookingsMonitor.jsx**
```
Location: src/pages/dashboard/admin/AdminBookingsMonitor.jsx
APIs Used:
  ├── adminService.getAllBookings()
  ├── adminService.getLiveBookings()
  ├── adminService.getBookingDetails()
  └── Direct service calls
Purpose: Monitor all bookings in system
Endpoints:
  - GET /admin/bookings?params
  - GET /admin/bookings/live
  - GET /admin/bookings/{id}
```

#### **AdminCancellationsMonitor.jsx**
```
Location: src/pages/dashboard/admin/AdminCancellationsMonitor.jsx
APIs Used:
  ├── adminService.getCancellationRecords()
  ├── adminService.getCancellationStats()
  └── Direct service calls
Purpose: Track cancellations
Endpoints:
  - GET /admin/cancellations?params
  - GET /admin/cancellations/stats
```

#### **AdminPaymentsMonitor.jsx**
```
Location: src/pages/dashboard/admin/AdminPaymentsMonitor.jsx
APIs Used:
  ├── adminService.getPaymentRecords()
  ├── adminService.verifyPayment()
  └── Direct service calls
Purpose: Manage and verify payments
Endpoints:
  - GET /admin/payments?params
  - PUT /admin/payments/{id}/verify
```

#### **AdminPorterPerformance.jsx**
```
Location: src/pages/dashboard/admin/AdminPorterPerformance.jsx
APIs Used:
  ├── adminService.getPorterPerformance()
  └── Direct service calls
Purpose: View porter performance metrics
Endpoints: GET /admin/porters/performance?params
```

#### **PorterRegistrations.jsx**
```
Location: src/pages/dashboard/admin/PorterRegistrations.jsx
APIs Used:
  ├── adminService.getAllPorterRegistrations()
  ├── adminService.approveRegistration()
  ├── adminService.rejectRegistration()
  └── Direct service calls
Purpose: Review and approve porter registrations
Endpoints:
  - GET /admin/registrations
  - POST /porter-registration/{id}/approve
  - POST /porter-registration/{id}/reject
```

#### **PorterManagement.jsx**
```
Location: src/pages/dashboard/admin/PorterManagement.jsx
APIs Used:
  ├── adminService.getAllPorters()
  ├── adminService.getPorterDetails()
  └── Direct service calls
Purpose: Manage porter accounts
Endpoints:
  - GET /admin/porters
  - GET /admin/porters/{id}/detail
```

#### **UserManagement.jsx**
```
Location: src/pages/dashboard/admin/UserManagement.jsx
APIs Used:
  ├── adminService.getUsers()
  ├── adminService.banUser()
  ├── adminService.unbanUser()
  ├── adminService.deleteUser()
  └── Direct service calls
Purpose: Manage user accounts
Endpoints:
  - GET /auth/get-users
  - PUT /auth/banned-user/{id}
  - PUT /auth/unbanned-user/{id}
  - PUT /auth/delete-user/{id}
```

#### **AdminActivityFeed.jsx**
```
Location: src/pages/dashboard/admin/AdminActivityFeed.jsx
APIs Used:
  ├── adminService.getActivityFeed()
  └── Direct service calls
Purpose: View system activity logs
Endpoints: GET /admin/activity-feed?params
```

---

### 🎨 Shared/Common Components

#### **FareEstimate.jsx**
```
Location: src/pages/dashboard/user/PorterBooking/FareEstimate.jsx
APIs Used:
  ├── farecalculatorService.calculateFare()
  └── Hook: useFareCalculator
Purpose: Display fare estimate based on booking parameters
Endpoints: GET /fare-calculator?params
Used by:
  - PorterBooking/index.jsx
  - Potentially other booking forms
Real-time: YES (updates as user adjusts parameters)
```

---

## API Endpoint Coverage

### By Service

| Service | Total Endpoints | Components Using | Usage Rate |
|---------|-----------------|------------------|-----------|
| authService | 2 | 2 | 100% ✅ |
| porterService | 10 | 5 | 100% ✅ |
| porterBookingsService | 12 | 6 | 100% ✅ |
| teamBookingService | 20+ | 5 | 100% ✅ |
| porterRegistration | 8 | 3 | 100% ✅ |
| farecalculatorService | 1 | 2 | 100% ✅ |
| ratingService | 3 | 1 | 66% ⚠️ (not in hooks) |
| adminService | 27+ | 10 | 100% ✅ |
| **teamSearvice** | **3** | **0** | **0%** ❌ (DELETE) |
| **services.js** | **17** | **0** | **0%** ❌ (DELETE) |

---

## Real-time Features

Components using polling for real-time updates:

| Component | Endpoint | Interval |
|-----------|----------|----------|
| PorterDashboard.jsx | GET /bookings/porter | 15s |
| BookingTracking.jsx | GET /bookings/{id} | 10s |
| TeamBookingTracking.jsx | GET /bookings/team/{id} | 10s |

---

## Notes for Safe Modification

✅ **Safe to modify:**
- `farecalculatorService` - only used in FareEstimate
- `ratingService` - only used in Orders.jsx

⚠️ **High dependency:**
- `porterBookingsService` - used by 6 components
- `teamBookingService` - core to team feature (5 components)
- `adminService` - used by 10 admin components

❌ **Do not delete:**
- Any active service file except `teamSearvice.js` and `services.js`
- Any hook file

---

## Import Patterns

### Hooks Pattern (Recommended)
```javascript
import { useGetPorters } from '../../../apis/hooks/portersHooks';
const { data, isLoading } = useGetPorters(params);
```

### Direct Service Pattern (Used in Admin)
```javascript
import { adminService } from '../../../apis/services/adminService';
const stats = await adminService.getComprehensiveStats();
```

---

## Migration Path for Admin APIs

**Current state:** Admin components use direct service calls (no hooks)
**Recommended:** Create adminHooks.jsx with React Query wrappers

This would:
1. Improve consistency with other API patterns
2. Provide caching and refetch capabilities
3. Better TypeScript support (if migrating)
4. Reduce boilerplate in components

---

## FAQ

**Q: Can I delete teamSearvice.js?**
A: Yes, immediately. Zero usage, duplicate functionality.

**Q: Should I remove services.js?**
A: Only if payment/cancellation/chat features won't be implemented. Otherwise, refactor it.

**Q: Do I need to create hooks for rating service?**
A: Yes - Orders.jsx is calling directly without React Query, which breaks caching/refetch patterns.

**Q: What about the registration typos?**
A: Must fix. The typo in export name might cause issues with refactoring tools.

---

## Related Documents

- [README.md](./README.md) - API organization overview
- [UNUSED_APIS.md](./UNUSED_APIS.md) - Detailed cleanup guide
- Individual domain READMEs in subdirectories
