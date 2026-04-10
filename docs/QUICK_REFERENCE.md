# Team Porter - Quick Reference

## Current Branch
`team_porter` (uncommitted changes)

## What's Working
- ✅ Team booking creation (user side)
- ✅ Team owner receives notifications
- ✅ Team owner can forward/decline bookings
- ✅ Team members can accept/decline forwarded bookings
- ✅ Auto-detection when quorum reached
- ✅ Team owner can confirm booking
- ✅ Team owner can cancel booking
- ✅ Team owner can mark complete
- ✅ Real-time Socket.IO notifications
- ✅ Team join requests (invite/respond)
- ✅ Team browsing
- ✅ Team dashboard with stats
- ✅ Team member management
- ✅ Chat integrated in tracking page

## What's Missing
- ❌ **Start Job endpoint** (CONFIRMED → IN_PROGRESS)
- ❌ Admin approval for team join requests
- ❌ Team browse UI page (backend + hooks exist)

## Key Files
- Backend controller: `porter-management-backend/src/controllers/book-porter/team-booking-controller.js`
- Team management: `porter-management-backend/src/controllers/porters/team/team-controller.js`
- Join requests: `porter-management-backend/src/controllers/porters/team/team-join-request-controller.js`
- Team browse: `porter-management-backend/src/controllers/porters/team/team-browse-controller.js`
- Routes: `porter-management-backend/src/routes/bookingRoutes.js` + `team/teamRoutes.js`
- Frontend owner dashboard: `porter-management-frontend/src/pages/dashboard/porter/TeamOwnerDashboard.jsx`
- Frontend member response: `porter-management-frontend/src/pages/dashboard/porter/TeamMemberBookingResponse.jsx`
- Frontend tracking: `porter-management-frontend/src/pages/dashboard/user/TeamBookingTracking.jsx`
- Hooks: `porter-management-frontend/src/apis/hooks/porterTeamHooks.jsx`
- Services: `porter-management-frontend/src/apis/services/teamBookingService.js`

## Team Booking Status Flow
```
PENDING_TEAM_REVIEW → (owner forwards) → PENDING_MEMBER_RESPONSE
  → (quorum reached) → AWAITING_OWNER_CONFIRMATION
  → (owner confirms) → CONFIRMED
  → (owner starts) → IN_PROGRESS **[MISSING ENDPOINT]**
  → (owner completes) → COMPLETED
  → (payment) → CLOSED
```

## Socket.IO Events
- `team-booking-request` - New booking to team owner
- `team-booking-forwarded` - Booking forwarded to members
- `team-member-responded` - Member response notification
- `team-quorum-reached` - Enough members accepted
- `team-booking-confirmed` - Booking confirmed
- `team-booking-declined` - Booking declined
- `team-booking-cancelled` - Booking cancelled
- `team-booking-completed` - Job completed
- `team-join-invitation` - Team join invitation
- `team-invitation-response` - Invitation response
- `team-member-removed` - Member removed from team

## API Endpoints
### Team Booking
- POST `/api/bookings/team` - Create booking
- GET `/api/bookings/team/:id` - Get status
- POST `/api/bookings/team/:id/review` - Owner review (forward/decline)
- POST `/api/bookings/team/:id/member/respond` - Member respond
- POST `/api/bookings/team/:id/owner/confirm` - Owner confirm
- POST `/api/bookings/team/:id/owner/cancel` - Owner cancel
- POST `/api/bookings/team/:id/complete` - Mark complete
- **POST `/api/bookings/team/:id/start` - Start job [MISSING]**

### Team Management
- GET `/api/team-porters/dashboard` - Team dashboard
- GET `/api/team-porters/booking-history` - Booking history
- GET `/api/team-porters/pending-bookings` - Pending bookings
- GET `/api/team-porters/browse` - Browse teams

### Team Join Requests
- GET `/api/team-porters/search-porters` - Search porters
- POST `/api/team-porters/invite-porter` - Invite porter
- POST `/api/team-porters/invite/:requestId/respond` - Respond to invite
- GET `/api/team-porters/join-requests` - Join requests
- GET `/api/team-porters/my-invitations` - My invitations
- DELETE `/api/team-porters/member/:porterId` - Remove member
