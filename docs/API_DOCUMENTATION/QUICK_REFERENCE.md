# Quick Reference Guide - API Endpoints

Fast lookup for all available API endpoints and their hooks.

---

## Authentication (2 endpoints)

| Endpoint | Method | Hook | Component |
|----------|--------|------|-----------|
| `/auth/login` | POST | `useLogin()` | Login.jsx |
| `/auth/register` | POST | `useRegister()` | Register.jsx |

---

## Porter Management (10+ endpoints)

### Profile & Registration
| Endpoint | Method | Hook | Purpose |
|----------|--------|------|---------|
| `/porters` | POST | `useCreateNewPorter()` | Register porter |
| `/porters/{id}` | GET | `useGetPorterById()` | Get porter details |
| `/porters/by-user` | GET | `useGetPorterByUser()` | Current user's porter |
| `/porters?params` | GET | `useGetPorters()` | Search porters |
| `/porters/analytics` | GET | `useGetPorterAnalytics()` | Analytics |
| `/porters/bookings/history` | GET | `useGetPorterBookingHistory()` | Booking history |

### Vehicle & Documents
| Endpoint | Method | Hook | Purpose |
|----------|--------|------|---------|
| `/porters/vehicle/save/{id}` | POST | `useCreateVechicleDetais()` | Save vehicle |
| `/porters/vehicle/get/{id}` | GET | `useGetVehicleTypes()` | Get vehicle info |
| `/porters/document/save/{id}` | POST | `useCreateDocumentDetails()` | Upload documents |
| `/porters/document/get/{id}` | GET | `useGetDocuments()` | Get documents |

### Status Management
| Endpoint | Method | Hook | Purpose |
|----------|--------|------|---------|
| `/porters/status` | PUT | `useTogglePorterStatus()` | Active/inactive |

---

## Individual Bookings (12+ endpoints)

### User Actions
| Endpoint | Method | Hook | Purpose |
|----------|--------|------|---------|
| `/bookings/search-porters/{type}` | POST | `useSearchNearByPorter()` | Find porters |
| `/bookings/individual` | POST | `useCreateIndividualBooking()` | Create booking |
| `/bookings/user?params` | GET | `useGetUserBookings()` | My bookings |
| `/bookings/{id}` | GET | `useGetBookingById()` | Booking details |
| `/bookings/{id}/cancel` | DELETE | `useCancelBooking()` | Cancel booking |

### Porter Actions
| Endpoint | Method | Hook | Purpose |
|----------|--------|------|---------|
| `/bookings/porter?params` | GET | `useGetPorterBookings()` | Pending bookings |
| `/bookings/{id}/accept` | POST | `useAcceptPorterBooking()` | Accept booking |
| `/bookings/{id}/reject` | POST | `useRejectPorterBooking()` | Reject booking |
| `/bookings/{id}/start` | POST | `useStartBooking()` | Start booking |
| `/bookings/{id}/complete` | POST | `useCompleteBooking()` | Complete booking |

---

## Team Management (20+ endpoints)

### Team Creation & Invitations
| Endpoint | Method | Hook | Purpose |
|----------|--------|------|---------|
| `/team-porters/{teamId}` | GET | `useGetPorterByTeam()` | Team members |
| `/team-porters/register-request` | POST | `useRequestPorterUserRegistration()` | Request porter |
| `/team-porters/register-request/{id}` | GET | `useGetAllRequestedPorterByTeam()` | Pending requests |
| `/team-porters/dashboard` | GET | `useGetTeamDashboard()` | Dashboard stats |
| `/team-porters/booking-history` | GET | `useGetTeamBookingHistory()` | Booking history |
| `/team-porters/pending-bookings` | GET | `useGetTeamPendingBookings()` | Pending bookings |

### Porter Recruitment (US-005)
| Endpoint | Method | Hook | Purpose |
|----------|--------|------|---------|
| `/team-porters/search-porters` | GET | `useSearchIndividualPorters()` | Search porters |
| `/team-porters/invite-porter` | POST | `useInvitePorterToTeam()` | Invite porter |
| `/team-porters/invite/{id}/respond` | POST | `useRespondToTeamInvitation()` | Respond invite |
| `/team-porters/join-requests` | GET | `useGetPendingTeamJoinRequests()` | Join requests |
| `/team-porters/my-invitations` | GET | `useGetMyPendingInvitations()` | My invites |
| `/team-porters/member/{id}` | DELETE | `useRemoveTeamMember()` | Remove member |

### Team Booking - User
| Endpoint | Method | Hook | Purpose |
|----------|--------|------|---------|
| `/team-porters/browse` | GET | `useBrowseAvailableTeams()` | Find teams |
| `/bookings/team` | POST | `useCreateTeamBooking()` | Book team |
| `/bookings/team/{id}` | GET | `useGetTeamBookingStatus()` | Booking status |

### Team Booking - Owner
| Endpoint | Method | Hook | Purpose |
|----------|--------|------|---------|
| `/bookings/team/{id}/review` | POST | `useTeamOwnerReviewBooking()` | Review booking |
| `/bookings/team/{id}/owner/confirm` | POST | `useTeamOwnerConfirmBooking()` | Confirm booking |
| `/bookings/team/{id}/owner/cancel` | POST | `useTeamOwnerCancelBooking()` | Cancel booking |
| `/bookings/team/{id}/start` | POST | `useStartTeamBooking()` | Start booking |
| `/bookings/team/{id}/complete` | POST | `useCompleteTeamBooking()` | Complete booking |

### Team Booking - Member
| Endpoint | Method | Hook | Purpose |
|----------|--------|------|---------|
| `/bookings/team/{id}/member/respond` | POST | `useTeamMemberRespond()` | Respond to booking |

---

## Porter Registration (8 endpoints)

| Endpoint | Method | Hook | Purpose |
|----------|--------|------|---------|
| `/porter-registration/start` | POST | (in hooks) | Start registration |
| `/porter-registration/{id}/basic-info` | PUT | (in hooks) | Save basic info |
| `/porter-registration/{id}/vehicle` | PUT | (in hooks) | Save vehicle |
| `/porter-registration/{id}/documents` | PUT | (in hooks) | Upload documents |
| `/porter-registration/{id}/submit` | POST | (in hooks) | Submit for approval |
| `/porter-registration/{id}` | GET | (in hooks) | Get registration |
| `/porter-registration/user` | GET | (in hooks) | User's registration |
| `/porter-registration/update-contact` | PATCH | (in hooks) | Update contact |

**Hook Object:** `porterRetgistrationHooks` (exported from porterRegistratioHooks.jsx)

---

## Fare Calculation (1 endpoint)

| Endpoint | Method | Hook | Purpose |
|----------|--------|------|---------|
| `/fare-calculator?params` | GET | `useFareCalculator()` | Calculate fare |

**Parameters:**
- `no_of_floor`: Number of floors
- `has_lift`: Has lift (boolean)
- `no_of_trips`: Number of trips
- `weightKg`: Weight in kg
- `vehicleType`: Type of vehicle
- `distanceKm`: Distance in km

---

## Ratings & Reviews (3 endpoints)

| Endpoint | Method | Hook | Usage | Purpose |
|----------|--------|------|-------|---------|
| `/ratings` | POST | ❌ Direct call | Orders.jsx | Submit rating |
| `/ratings/porter/{id}` | GET | ❌ Direct call | Orders.jsx | Get porter ratings |
| `/ratings/booking/{id}` | GET | ❌ Direct call | Orders.jsx | Check if rated |

⚠️ **Note:** These should be wrapped in hooks - see [Ratings documentation](./07-ratings/README.md)

---

## Admin Dashboard (27+ endpoints)

### Users & Registrations
| Endpoint | Method | Service Call | Purpose |
|----------|--------|--------------|---------|
| `/auth/get-users` | GET | `adminService.getUsers()` | Get all users |
| `/auth/banned-user/{id}` | PUT | `adminService.banUser()` | Ban user |
| `/auth/unbanned-user/{id}` | PUT | `adminService.unbanUser()` | Unban user |
| `/auth/delete-user/{id}` | PUT | `adminService.deleteUser()` | Delete user |
| `/admin/registrations` | GET | `adminService.getAllPorterRegistrations()` | All registrations |
| `/porter-registration/{id}/approve` | POST | `adminService.approveRegistration()` | Approve |
| `/porter-registration/{id}/reject` | POST | `adminService.rejectRegistration()` | Reject |

### Analytics
| Endpoint | Method | Service Call | Purpose |
|----------|--------|--------------|---------|
| `/admin/stats` | GET | `adminService.getBasicStats()` | Basic stats |
| `/admin/analytics/comprehensive` | GET | `adminService.getComprehensiveStats()` | Full analytics |
| `/admin/analytics/trends` | GET | `adminService.getBookingTrends()` | Booking trends |
| `/admin/analytics/distribution` | GET | `adminService.getBookingDistribution()` | Distribution |

### Bookings
| Endpoint | Method | Service Call | Purpose |
|----------|--------|--------------|---------|
| `/admin/bookings` | GET | `adminService.getAllBookings()` | All bookings |
| `/admin/bookings/live` | GET | `adminService.getLiveBookings()` | Active bookings |
| `/admin/bookings/{id}` | GET | `adminService.getBookingDetails()` | Booking details |
| `/admin/bookings/{id}/status` | PUT | `adminService.updateBookingStatus()` | Update status |

### Cancellations
| Endpoint | Method | Service Call | Purpose |
|----------|--------|--------------|---------|
| `/admin/cancellations` | GET | `adminService.getCancellationRecords()` | Cancellations |
| `/admin/cancellations/stats` | GET | `adminService.getCancellationStats()` | Cancellation stats |

### Payments
| Endpoint | Method | Service Call | Purpose |
|----------|--------|--------------|---------|
| `/admin/payments` | GET | `adminService.getPaymentRecords()` | Payment records |
| `/admin/payments/revenue` | GET | `adminService.getRevenueStats()` | Revenue stats |
| `/admin/payments/{id}/verify` | PUT | `adminService.verifyPayment()` | Verify payment |

### Porters
| Endpoint | Method | Service Call | Purpose |
|----------|--------|--------------|---------|
| `/admin/porters` | GET | `adminService.getAllPorters()` | All porters |
| `/admin/porters/{id}/detail` | GET | `adminService.getPorterDetails()` | Porter details |
| `/admin/porters/performance` | GET | `adminService.getPorterPerformance()` | Performance |
| `/admin/porters/stats` | GET | `adminService.getPorterStats()` | Porter stats |

### System
| Endpoint | Method | Service Call | Purpose |
|----------|--------|--------------|---------|
| `/admin/activity-feed` | GET | `adminService.getActivityFeed()` | Activity logs |
| `/admin/system-health` | GET | `adminService.getSystemHealth()` | System health |

---

## Utilities (1 endpoint)

| Endpoint | Method | Hook | Component |
|----------|--------|------|-----------|
| `/auth/change-temp-password` | PUT | `useChangeTemporaryPassword()` | Post-registration |

---

## Unused Endpoints (DELETE THESE)

### teamSearvice.js (❌ Delete - Duplicate)
```javascript
// All endpoints duplicated in teamBookingService.js:
// POST /team-porters/register-request
// GET /team-porters/register-request/{teamId}
// GET /team-porters/{teamId}
```

### services.js (❌ Delete or Refactor)
```javascript
// Unused payment endpoints
POST /payments/process
POST /payments/verify/{transactionId}
GET /payments/history
POST /payments/{paymentId}/refund
GET /payments/methods
PUT /payments/methods/{methodId}
GET /payments/invoices/{bookingId}

// Unused chat endpoints
POST /chat/messages
GET /chat/conversations/{id}
GET /chat/conversations
PUT /chat/conversations/{id}/read
DELETE /chat/conversations/{id}
POST /chat/conversations

// Partially used cancellation endpoints
GET /cancellations/history (unused)
GET /cancellations/reasons (unused)
POST /cancellations/request (unused)
```

---

## Common Query Parameters

### Pagination
```javascript
page: number        // Page number (1-based)
limit: number       // Items per page (default: 10)
```

### Sorting
```javascript
sortBy: string      // Field to sort by
sortOrder: 'asc' | 'desc'
```

### Date Filtering
```javascript
startDate: string   // ISO date format
endDate: string     // ISO date format
```

### Status Filtering
```javascript
status: string      // Various depending on resource
```

### Location Filtering
```javascript
latitude: number
longitude: number
maxDistance: number // in km
```

---

## Standard Response Format

### Success
```javascript
{
  success: true,
  data: { /* resource */ },
  message?: string
}
```

### Error
```javascript
{
  success: false,
  message: string,
  error?: string
}
```

---

## HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 500 | Server Error | Backend error |

---

## Hook Usage Pattern

```javascript
// Query Hook
const { data, isLoading, error } = useQueryHook(params);

// Mutation Hook
const { mutate, isPending, isError } = useMutationHook({
  onSuccess: () => { /* handle success */ },
  onError: () => { /* handle error */ }
});
mutate(data);
```

---

## Related Documents

- **Full Details:** See individual domain READMEs (01-09)
- **Cleanup Guide:** [UNUSED_APIS.md](./UNUSED_APIS.md)
- **Dependencies:** [API_DEPENDENCY_MAP.md](./API_DEPENDENCY_MAP.md)
- **Summary:** [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- **Main:** [README.md](./README.md)

---

**Last Updated:** 2026-04-10
**Format:** All endpoints at a glance for quick lookup
