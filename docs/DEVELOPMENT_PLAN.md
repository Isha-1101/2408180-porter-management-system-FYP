# Team Porter Development Plan

## Project Overview
**DOKO Namlo** - Porter Management System (FYP by Isha Bhatta)
Full-stack web application for managing porter (laborer/carrying service) bookings in Nepal.

## Current Branch
`team_porter` - Active development branch with uncommitted changes

## Current Status (as of 2026-04-05)

### What's Complete
- Authentication (3 roles: user, porter, admin)
- Porter Registration (multi-step form with admin approval)
- Individual Porter Booking (search, book, track, pay, rate)
- Real-time GPS Location Tracking (Socket.IO)
- Real-time Chat (individual bookings)
- Payment Processing (cash + eSewa)
- Booking Cancellation with refund logic
- Rating & Reviews
- AI Chat Assistant (Google Gemini)
- Fare Calculator
- Admin Dashboard (10 pages)
- SSE Notifications

### What's In Progress (Uncommitted Changes)
- **Team Porter Booking (porter/team side)** - Major refactor in progress
- **Team Join Requests** - New feature being built
- **Team Browsing** - New feature being built
- **Team Porter-User Chat** - Not yet integrated

### Explicit TODOs (from frontend/todo/todo.txt)
- [ ] Porter booking from teams side
- [ ] Conversation between porter and user (for teams)

## Files Being Modified (Uncommitted)

### Backend
- `porter-management-backend/index.js` - Socket.IO additions
- `porter-management-backend/src/controllers/book-porter/team-booking-controller.js` - Major refactor (849 lines changed)
- `porter-management-backend/src/controllers/porters/team/team-controller.js` - Significant additions
- `porter-management-backend/src/models/PorterBooking.js` - Team booking fields added
- `porter-management-backend/src/models/porter/Porters.js` - Updates
- `porter-management-backend/src/models/porter/porterTeam.js` - Updates
- `porter-management-backend/src/routes/bookingRoutes.js` - Route restructuring
- `porter-management-backend/src/routes/team/teamRoutes.js` - Route restructuring

### New Backend Files
- `src/controllers/porters/team/team-browse-controller.js` - Browsing teams
- `src/controllers/porters/team/team-join-request-controller.js` - Team join requests
- `src/models/TeamJoinRequest.js` - Team join request model

### Frontend
- `src/pages/dashboard/porter/TeamOwnerDashboard.jsx` - Major refactor
- `src/pages/dashboard/porter/TeamLeadConfirmBooking.jsx` - Major refactor
- `src/pages/dashboard/porter/TeamLeadSelectPorters.jsx` - Simplification
- `src/pages/dashboard/user/TeamBookingTracking.jsx` - Major refactor
- `src/pages/dashboard/porter/PorterDashboard.jsx` - Updates
- `src/pages/dashboard/user/PorterBooking/TeamFields.jsx` - Form updates
- `src/Routes/PorterRoutes.jsx` - Route updates
- `src/apis/hooks/porterTeamHooks.jsx` - React Query hooks refactor
- `src/apis/services/teamBookingService.js` - API service refactor

### New Frontend Files
- `src/pages/dashboard/porter/TeamMemberBookingResponse.jsx` - Team member response page

## Development Plan

### Phase 1: Complete Team Porter Booking Flow (HIGH PRIORITY)
**Goal:** Enable porter teams to receive, manage, and respond to team bookings

#### Tasks:
1. ✅ Review and finalize uncommitted backend changes
2. ✅ Review and finalize uncommitted frontend changes
3. ⚠️ Add missing `startTeamBooking` endpoint (CONFIRMED → IN_PROGRESS)
4. ⚠️ Add "Start Job" button to team owner UI
5. ✅ Implement team booking notification flow
6. ✅ Implement team booking status management

### Phase 2: Verify Team Porter-User Chat (HIGH PRIORITY)
**Goal:** Ensure real-time chat works for team bookings

#### Tasks:
1. ✅ Verify ChatBox is integrated in TeamBookingTracking.jsx
2. ⚠️ Test chat with team booking flow
3. ⚠️ Ensure all team members can participate in chat

### Phase 3: Complete Team Join Requests (MEDIUM PRIORITY)
**Goal:** Allow porters to request joining existing teams

#### Tasks:
1. ✅ Backend complete (controller, model, routes)
2. ✅ Frontend hooks complete
3. ⚠️ Add admin approval workflow (model has field but no admin controller)
4. ⚠️ Add frontend UI for join requests (if not exists)

### Phase 4: Complete Team Browsing (MEDIUM PRIORITY)
**Goal:** Allow users to browse available teams

#### Tasks:
1. ✅ Backend complete (controller + route)
2. ✅ Frontend hook complete (useBrowseAvailableTeams)
3. ⚠️ Add frontend browse UI page (if not exists)

### Phase 5: Testing & Polish (LOW PRIORITY)
**Goal:** Ensure everything works correctly

#### Tasks:
1. Manual testing of all flows
2. Fix bugs and edge cases
3. Add error handling and validation
4. Update PROJECT_DOCUMENTATION.md

## Architecture Decisions

### Team Booking Flow
```
User creates team booking request
    ↓
Team lead receives notification
    ↓
Team lead accepts/rejects
    ↓
If accepted, team members receive notification
    ↓
Team members accept/reject participation
    ↓
If enough members accept → Booking confirmed
    ↓
Real-time tracking + chat during job
    ↓
Payment + Rating after completion
```

### Team Join Request Flow
```
Porter submits join request to team
    ↓
Team owner receives notification
    ↓
Team owner approves/rejects
    ↓
If approved → Porter becomes team member
    ↓
Porter can now participate in team bookings
```

## Key Technical Notes

### Socket.IO Events (Team Booking)
- `team-booking-request` - New booking request to team lead
- `team-booking-response` - Team lead response
- `team-member-notification` - Notify team members
- `team-member-response` - Member accept/reject
- `team-location-update` - Live location during job

### Database Models
- `PorterBooking.js` - Extended with team booking fields
- `porterTeam.js` - Team composition and settings
- `TeamJoinRequest.js` - Join request tracking

### API Endpoints (Team Booking)
- `POST /api/bookings/team` - Create team booking
- `GET /api/bookings/team/:id` - Get team booking details
- `PUT /api/bookings/team/:id/status` - Update booking status
- `POST /api/teams/:id/join-request` - Request to join team
- `GET /api/teams/browse` - Browse available teams

## Detailed Code Review (2026-04-05)

### Backend - Team Booking Controller (team-booking-controller.js)
**Status:** ✅ COMPLETE - Well-implemented with 775 lines

**Functions implemented:**
1. `createTeamBooking` - Creates booking, finds eligible teams, sends Socket.IO notifications
2. `teamOwnerReviewBooking` - Owner can forward to team or decline
3. `teamMemberRespondToBooking` - Team members accept/decline forwarded bookings
4. `teamOwnerConfirmBooking` - Owner confirms after quorum reached
5. `teamOwnerCancelBooking` - Owner cancels pending bookings
6. `teamOwnerMarkComplete` - Owner marks IN_PROGRESS → COMPLETED
7. `getTeamBookingStatus` - Get booking status with member response stats

**Flow implemented:**
```
User creates booking → PENDING_TEAM_REVIEW
  ↓ (notifies eligible teams via Socket.IO)
Team owner reviews → forward or decline
  ↓ (if forward)
PENDING_MEMBER_RESPONSE → notifies team members
  ↓ (members respond)
If acceptedCount >= teamSize → AWAITING_OWNER_CONFIRMATION
  ↓ (owner confirms)
CONFIRMED → marks porters as busy
  ↓ (owner starts job - needs IN_PROGRESS route)
IN_PROGRESS → (owner marks complete)
COMPLETED → frees porters, updates stats
```

**Issues found:**
- ❌ No route to transition CONFIRMED → IN_PROGRESS (missing `startTeamBooking` endpoint)
- ❌ Individual booking has `/individual/:id/start` but team booking lacks `/team/:id/start`
- ⚠️ Team booking controller doesn't handle IN_PROGRESS status transition

### Backend - Team Controller (team-controller.js)
**Status:** ✅ COMPLETE - 207 lines

**Functions implemented:**
1. `getPorterByTeamId` - Get all porters in a team
2. `getTeamDashboard` - Dashboard stats for team owner
3. `getTeamBookingHistory` - Booking history with optional status filter
4. `getTeamPendingBookings` - Get all PENDING_TEAM_REVIEW bookings

### Backend - Team Join Request Controller (team-join-request-controller.js)
**Status:** ✅ COMPLETE - 426 lines

**Functions implemented:**
1. `searchIndividualPorters` - Search porters not in teams
2. `invitePorterToTeam` - Send invitation to individual porter
3. `respondToTeamInvitation` - Porter accepts/declines invitation
4. `getPendingTeamJoinRequests` - Get join requests for team owner
5. `getMyPendingInvitations` - Get pending invitations for porter
6. `removeTeamMember` - Remove member from team

### Backend - Team Browse Controller (team-browse-controller.js)
**Status:** ✅ COMPLETE - 58 lines

**Functions implemented:**
1. `browseAvailableTeams` - Browse active teams with member counts

### Backend - Routes (bookingRoutes.js + teamRoutes.js)
**Status:** ✅ MOSTLY COMPLETE

**Team booking routes registered:**
- POST `/bookings/team` - Create team booking ✅
- GET `/bookings/team/:id` - Get booking status ✅
- POST `/bookings/team/:id/review` - Owner review ✅
- POST `/bookings/team/:id/member/respond` - Member respond ✅
- POST `/bookings/team/:id/owner/confirm` - Owner confirm ✅
- POST `/bookings/team/:id/owner/cancel` - Owner cancel ✅
- POST `/bookings/team/:id/complete` - Mark complete ✅
- POST `/bookings/team/:id/start` - **❌ MISSING** (needed for IN_PROGRESS)

**Team management routes registered:**
- GET `/team-porters/:teamId` - Get porters by team ✅
- GET `/team-porters/dashboard` - Team dashboard ✅
- GET `/team-porters/booking-history` - Booking history ✅
- GET `/team-porters/pending-bookings` - Pending bookings ✅
- GET `/team-porters/join-requests` - Join requests ✅
- GET `/team-porters/search-porters` - Search porters ✅
- POST `/team-porters/invite-porter` - Invite porter ✅
- POST `/team-porters/invite/:requestId/respond` - Respond to invite ✅
- GET `/team-porters/my-invitations` - My invitations ✅
- DELETE `/team-porters/member/:porterId` - Remove member ✅
- GET `/team-porters/browse` - Browse teams ✅

### Backend - Models
**Status:** ✅ COMPLETE

- `PorterBooking.js` - Has all team booking fields (memberResponses, assignedTeamId, assignedPorters, etc.)
- `TeamBookingSelection.js` - Tracks which porters selected for team booking
- `TeamJoinRequest.js` - Tracks join requests with admin approval flow
- `PorterTeam.js` - Team model (existing)
- `Porters.js` - Porter model (existing)

### Frontend - Team Owner Dashboard (TeamOwnerDashboard.jsx)
**Status:** ✅ COMPLETE - 677 lines

**Features:**
- 3 tabs: Requests, My Schedule, My Team
- Real-time Socket.IO notifications for team-booking-request
- Forward/Decline actions on booking requests
- Stats display (members, active jobs, completed)
- Team member list with contact info

### Frontend - Team Member Response (TeamMemberBookingResponse.jsx)
**Status:** ✅ COMPLETE - 306 lines

**Features:**
- Shows booking details forwarded by team lead
- Accept/Decline buttons
- Team response progress tracker
- Real-time status updates

### Frontend - Team Lead Confirm Booking (TeamLeadConfirmBooking.jsx)
**Status:** ✅ NEEDS REVIEW (255 lines changed)

### Frontend - Team Lead Select Porters (TeamLeadSelectPorters.jsx)
**Status:** ✅ NEEDS REVIEW (321 lines removed - simplified)

### Frontend - Team Booking Tracking (TeamBookingTracking.jsx)
**Status:** ✅ COMPLETE - 421 lines

**Features:**
- Shows booking flow stages visually
- Real-time Socket.IO updates
- Chat integration (ChatBox component)
- Cancel booking capability
- Member response stats display

### Frontend - React Query Hooks (porterTeamHooks.jsx)
**Status:** ✅ COMPLETE - 348 lines

**Hooks implemented:**
- Team management hooks (dashboard, booking history, pending bookings)
- Join request hooks (search, invite, respond, remove member)
- Browse teams hook
- Team booking hooks (create, status, review, confirm, cancel, complete, member respond)

### Frontend - API Service (teamBookingService.js)
**Status:** ✅ COMPLETE - 91 lines

**Services implemented:**
- All team management endpoints
- All join request endpoints
- All team booking endpoints

### Frontend - Routes (PorterRoutes.jsx)
**Status:** ✅ COMPLETE

**Routes registered:**
- `/porters/team-owner` - TeamOwnerDashboard
- `/porters/team-lead/select-porters` - TeamLeadSelectPorters
- `/porters/team-lead/confirm-booking` - TeamLeadConfirmBooking
- `/porters/team-member/respond` - TeamMemberBookingResponse

## Critical Issues to Fix

### 1. Missing IN_PROGRESS Transition (HIGH PRIORITY)
**Problem:** No endpoint to transition team booking from CONFIRMED → IN_PROGRESS
**Impact:** Team cannot start the job after confirmation
**Fix needed:**
- Add `startTeamBooking` controller function in `team-booking-controller.js`
- Add route `POST /bookings/team/:id/start` in `bookingRoutes.js`
- Similar to individual booking's `startBooking` in `individual-booking-controller.js`

### 2. Team Chat Integration (HIGH PRIORITY)
**Problem:** Chat exists for individual bookings but team booking chat needs verification
**Status:** TeamBookingTracking.jsx includes ChatBox component, but need to verify:
- Chat room joining uses bookingId (works for both individual and team)
- Messages are properly scoped to team bookings
- All team members can participate in chat

### 3. Team Booking Start Flow (MEDIUM PRIORITY)
**Problem:** After owner confirms, booking goes to CONFIRMED but no way to start
**Fix needed:**
- Add "Start Job" button in TeamOwnerDashboard or TeamLeadConfirmBooking
- Call the new `/team/:id/start` endpoint
- Emit Socket.IO event to user that job has started

### 4. Admin Approval for Team Join Requests (MEDIUM PRIORITY)
**Problem:** TeamJoinRequest model has `adminApprovalStatus` field but no admin controller
**Fix needed:**
- Admin endpoints to approve/reject join requests
- Admin UI to view pending join requests
- Socket.IO notification to porter when admin approves

## Progress Tracking

### 2026-04-05
- Created docs directory with development plan
- Reviewed codebase and identified current state
- Identified 19 modified files and 4 new untracked files
- **Completed detailed code review of all uncommitted changes**
- **Found:** Team booking flow is 95% complete, missing only IN_PROGRESS transition
- **Found:** Team join request feature is complete (backend + frontend hooks)
- **Found:** Team browsing feature is complete (backend + frontend hooks)
- **Found:** Team chat is integrated in TeamBookingTracking.jsx
- **Next:** Add missing `/team/:id/start` endpoint and verify chat works for team bookings

## Notes
- Project uses JavaScript (not TypeScript despite types being installed)
- No tests exist yet - manual testing only
- Frontend: React 19 + Vite 7 + Tailwind CSS v4 + shadcn/ui
- Backend: Node.js + Express.js v5 + MongoDB + Socket.IO
- Deployment: Vercel (frontend), Node.js backend, MongoDB Atlas
