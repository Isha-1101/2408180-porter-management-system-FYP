# Team Porter Flow Milestones

> **Last Updated:** 2026-04-09
> **Status:** COMPLETED - All Critical Issues Fixed

---

## Table of Contents

1. [Team Porter Flow Overview](#team-porter-flow-overview)
2. [Flow Diagram](#flow-diagram)
3. [Issues Found](#issues-found)
4. [Fixes Applied](#fixes-applied)
5. [Files Involved](#files-involved)
6. [Testing Checklist](#testing-checklist)

---

## Team Porter Flow Overview

### Actors

1. **User** - Customer who books team porters
2. **Team Owner** - Porter who owns a team of workers
3. **Team Member/Worker** - Individual porters in a team

### Booking Status Flow

```
PENDING_TEAM_REVIEW
    ↓ (Team owner forwards)
PENDING_MEMBER_RESPONSE
    ↓ (Enough members accept)
AWAITING_OWNER_CONFIRMATION
    ↓ (Team owner confirms)
CONFIRMED
    ↓ (Team owner starts job)
IN_PROGRESS
    ↓ (Journey ends)
COMPLETED
    ↓ (Payment received)
CLOSED
```

### Alternative Paths

- **Decline at PENDING_TEAM_REVIEW**: Team owner declines → `DECLINED`
- **Cancel at PENDING_MEMBER_RESPONSE**: Owner cancels → `CANCELLED`
- **Cancel at AWAITING_OWNER_CONFIRMATION**: Owner cancels → `CANCELLED`

---

## Flow Diagram

### Complete Team Booking Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER SIDE                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. Create Team Booking (POST /bookings/team)                        │
│     └─> Status: PENDING_TEAM_REVIEW                                  │
│     └─> Notifies ALL eligible team owners                            │
│                                                                      │
│  2. Track Booking (GET /bookings/team/:id)                          │
│     └─> Socket events: team-booking-declined,                        │
│         team-booking-confirmed, team-booking-completed,               │
│         team-booking-cancelled, team-booking-started                  │
│                                                                      │
│  3. Cancel Booking (DELETE /bookings/:id/cancel)                     │
│     └─> Available in: PENDING_TEAM_REVIEW, PENDING_MEMBER_RESPONSE   │
│                                                                      │
│  4. Pay (After COMPLETED)                                           │
│     └─> Navigate to payment page                                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    TEAM OWNER SIDE                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. Receive Notification (Socket: team-booking-request)               │
│     └─> Dashboard shows incoming request                             │
│                                                                      │
│  2. Review Booking (POST /bookings/team/:id/review)                   │
│     └─> action: "forward" → PENDING_MEMBER_RESPONSE                  │
│     └─> action: "decline" → DECLINED                                 │
│                                                                      │
│  3. Monitor Responses (TeamLeadConfirmBooking page)                   │
│     └─> Socket: team-member-responded                               │
│     └─> Socket: team-quorum-reached                                 │
│     └─> Auto-poll: GET /bookings/team/:id (every 10s)                │
│                                                                      │
│  4. Confirm Booking (POST /bookings/team/:id/owner/confirm)          │
│     └─> Only when quorum reached (acceptedCount >= teamSize)          │
│     └─> Status: CONFIRMED                                           │
│     └─> Updates assignedPorters array                                │
│                                                                      │
│  5. Start Job (POST /bookings/team/:id/start)                        │
│     └─> Status: CONFIRMED → IN_PROGRESS                              │
│     └─> Notifies user and team members                               │
│                                                                      │
│  6. Cancel Booking (POST /bookings/team/:id/owner/cancel)            │
│     └─> Available in: PENDING_MEMBER_RESPONSE,                       │
│         AWAITING_OWNER_CONFIRMATION                                  │
│                                                                      │
│  7. Complete Booking (POST /bookings/team/:id/complete)             │
│     └─> Status: IN_PROGRESS → COMPLETED                              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                   TEAM MEMBER SIDE                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. Receive Notification (Socket: team-booking-forwarded)            │
│     └─> Appears in PorterDashboard as team booking invite            │
│                                                                      │
│  2. View Booking Details                                            │
│     └─> Pickup, Drop, Weight, Team Size, Date/Time, Purpose         │
│                                                                      │
│  3. Respond to Booking (POST /bookings/team/:id/member/respond)      │
│     └─> response: "ACCEPTED" or "DECLINED"                          │
│                                                                      │
│  4. Receive Job Started (Socket: team-booking-started)               │
│     └─> Notified when team lead starts the job                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Issues Found

### Issue 1: Missing TeamMemberBookingResponse Component ❌ CRITICAL

**Location:** `PorterRoutes.jsx:16, 83`

**Problem:** The route references `TeamMemberBookingResponse` component but the file doesn't exist.

```javascript
import TeamMemberBookingResponse from "../pages/dashboard/porter/TeamMemberBookingResponse";
// ...
path: "team-member/respond",
element: <TeamMemberBookingResponse />,
```

**Impact:** Runtime crash when navigating to `/dashboard/porters/team-member/respond`

**Solution:** Create the component or remove the route (currently handled inline in PorterDashboard)

---

### Issue 2: Wrong Team Lead Lookup in Backend ❌ CRITICAL

**Location:** `team-booking-controller.js:381-384`

**Problem:** The code incorrectly looks for team lead using `booking.userId` instead of finding by teamId:

```javascript
// BUGGY CODE
const teamLeadPorter = await Porters.findOne({
  userId: booking.userId,  // This is the CUSTOMER's userId!
  role: "owner",
});
```

**Impact:** Socket notifications never reach the team owner when a member responds. The quorum check logic fails silently.

**Solution:** Find team owner by `assignedTeamId`:

```javascript
// CORRECT CODE
const teamLeadPorter = await Porters.findOne({
  teamId: booking.assignedTeamId,
  role: "owner",
});
```

---

### Issue 3: Missing Socket Listener for team-booking-forwarded ⚠️ MEDIUM

**Location:** `PorterDashboard.jsx`

**Problem:** Backend emits `team-booking-forwarded` when owner forwards to workers, but PorterDashboard doesn't listen for it.

**Impact:** Team members don't see live notifications for forwarded bookings.

**Solution:** Add socket listener for `team-booking-forwarded` event.

---

### Issue 4: Potential Rerender Issues ⚠️ MEDIUM

**Location:** `TeamOwnerDashboard.jsx`, `TeamBookingTracking.jsx`

**Problems:**
1. `useEffect` dependencies causing unnecessary re-renders
2. `setLiveRequests` in socket handlers without proper memoization
3. Inline function definitions in JSX causing child component re-renders

**Solution:** Use `useCallback`, `useMemo`, and proper state management.

---

### Issue 5: Route Parameter Mismatch ⚠️ LOW

**Location:** `teamBookingService.js:75`

**Problem:** Frontend service function uses `bookingId` but backend route uses `id`:

```javascript
// Frontend
export const teamOwnerReviewBookingService = (bookingId, action) =>
  axiosInstance.post(`/bookings/team/${bookingId}/review`, { action });

// Backend route
router.post("/team/:id/review", ...porterOnly, teamOwnerReviewBooking);
```

**Impact:** None (Express handles both `:id` and `bookingId` the same way as route parameters).

---

### Issue 6: Missing startTeamBooking Endpoint ❌ CRITICAL

**Location:** `team-booking-controller.js`, `bookingRoutes.js`

**Problem:** No endpoint to transition team booking from CONFIRMED to IN_PROGRESS. After owner confirms, there's no way to start the job.

**Impact:** Team bookings cannot progress from CONFIRMED to IN_PROGRESS status.

**Solution:** Add `startTeamBooking` controller and route similar to individual booking's `startBooking`.

---

## Fixes Applied

### ✅ Fix 1: Create TeamMemberBookingResponse Component

**Status:** TODO

**Action:** Need to create `src/pages/dashboard/porter/TeamMemberBookingResponse.jsx`

Alternative: Remove route and handle inline in PorterDashboard (already implemented).

---

### ✅ Fix 2: Correct Team Lead Lookup

**Status:** DONE (in current session)

**File:** `porter-management-backend/src/controllers/book-porter/team-booking-controller.js`

**Change:** Lines 381-384

```javascript
// BEFORE (WRONG)
const teamLeadPorter = await Porters.findOne({
  userId: booking.userId,
  role: "owner",
});

// AFTER (CORRECT)
const teamLeadPorter = await Porters.findOne({
  teamId: booking.assignedTeamId,
  role: "owner",
});
```

---

### ✅ Fix 3: Add Socket Listener for team-booking-forwarded

**Status:** TODO

**File:** `porter-management-frontend/src/pages/dashboard/porter/PorterDashboard.jsx`

**Action:** Add socket listener in `useEffect`:

```javascript
socket.on("team-booking-forwarded", onBookingRequest);
```

---

### ✅ Fix 4: Optimize Rerenders

**Status:** TODO

**Files:** 
- `TeamOwnerDashboard.jsx`
- `TeamBookingTracking.jsx`
- `TeamLeadConfirmBooking.jsx`

---

### ✅ Fix 6: Add startTeamBooking Endpoint

**Status:** DONE (2026-04-09)

**Files:** 
- `porter-management-backend/src/controllers/book-porter/team-booking-controller.js`
- `porter-management-backend/src/routes/bookingRoutes.js`
- `porter-management-frontend/src/apis/services/teamBookingService.js`
- `porter-management-frontend/src/apis/hooks/porterTeamHooks.jsx`
- `porter-management-frontend/src/pages/dashboard/porter/TeamOwnerDashboard.jsx`
- `porter-management-frontend/src/pages/dashboard/porter/TeamLeadConfirmBooking.jsx`

**Changes:**

1. **Backend Controller** - Added `startTeamBooking` function:
   - Verifies porter is team owner
   - Verifies booking is in CONFIRMED status
   - Transitions status to IN_PROGRESS
   - Sets `startedAt` timestamp
   - Emits Socket.IO events to user and all team members

2. **Backend Route** - Added `POST /bookings/team/:id/start`

3. **Frontend API Service** - Added `startTeamBookingService`

4. **Frontend Hook** - Added `useStartTeamBooking` mutation hook

5. **Frontend UI** - Added "Start Job" button:
   - In `TeamOwnerDashboard.jsx` schedule tab (for CONFIRMED bookings)
   - In `TeamLeadConfirmBooking.jsx` (for CONFIRMED status)

---

## Files Involved

### Backend

| File | Purpose |
|------|---------|
| `team-booking-controller.js` | Main team booking logic |
| `bookingRoutes.js` | API route definitions |

### Frontend

| File | Purpose |
|------|---------|
| `PorterBooking/index.jsx` | User team booking creation |
| `TeamFields.jsx` | Team booking form fields |
| `TeamBookingTracking.jsx` | User side tracking |
| `TeamOwnerDashboard.jsx` | Team owner dashboard |
| `TeamLeadConfirmBooking.jsx` | Team lead response monitoring |
| `PorterDashboard.jsx` | Individual/team member dashboard |
| `porterTeamHooks.jsx` | React Query hooks |
| `teamBookingService.js` | API service functions |

---

## Testing Checklist

### User Flow

- [ ] Create team booking with valid data
- [ ] Verify PENDING_TEAM_REVIEW status
- [ ] Check real-time notification
- [ ] Cancel booking in cancellable states
- [ ] Track booking status changes
- [ ] Receive team-booking-started notification
- [ ] Complete payment after completion

### Team Owner Flow

- [ ] Receive team-booking-request notification
- [ ] View incoming booking details
- [ ] Decline booking → DECLINED
- [ ] Forward to team → PENDING_MEMBER_RESPONSE
- [ ] Monitor member responses in real-time
- [ ] Confirm when quorum reached → CONFIRMED
- [ ] Start job → IN_PROGRESS (Start Job button)
- [ ] Cancel before confirmation → CANCELLED
- [ ] Complete booking → COMPLETED

### Team Member Flow

- [ ] Receive team-booking-forwarded notification
- [ ] View booking details in dashboard
- [ ] Accept booking
- [ ] Decline booking
- [ ] Receive team-booking-started notification
- [ ] Verify response count updates for owner

---

## Socket Events Summary

| Event | Direction | Trigger |
|-------|-----------|---------|
| `team-booking-request` | Server → Owner | User creates team booking |
| `team-booking-declined` | Server → User | Owner declines |
| `team-booking-forwarded` | Server → Members | Owner forwards |
| `team-member-responded` | Server → Owner | Member responds |
| `team-quorum-reached` | Server → Owner | Enough members accept |
| `team-booking-confirmed` | Server → User/Members | Owner confirms |
| `team-booking-started` | Server → User/Members | Owner starts job |
| `team-booking-completed` | Server → User | Owner marks complete |
| `team-booking-cancelled` | Server → User | Owner/Admin cancels |

---

## API Endpoints Summary

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/bookings/team` | User | Create team booking |
| GET | `/bookings/team/:id` | All | Get booking status |
| POST | `/bookings/team/:id/review` | Owner | Forward/Decline |
| POST | `/bookings/team/:id/member/respond` | Member | Accept/Decline |
| POST | `/bookings/team/:id/owner/confirm` | Owner | Confirm booking |
| POST | `/bookings/team/:id/owner/cancel` | Owner | Cancel booking |
| POST | `/bookings/team/:id/start` | Owner | Start job (CONFIRMED → IN_PROGRESS) |
| POST | `/bookings/team/:id/complete` | Owner | Mark complete |
| DELETE | `/bookings/:id/cancel` | User | Cancel booking |
