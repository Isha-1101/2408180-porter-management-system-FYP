# Porter Team Management & Booking Flow

This document outlines the entire lifecycle of a Team in the Porter Management System, covering team formation, how customers book teams, and how team members are coordinated to complete jobs.

## 1. Team Formation & Management

### Creating a Team
A porter registers as a **Team Owner**. This creates a `PorterTeam` record and a `Porters` record where `role: "owner"` and `porterType: "team"`.

### Recruiting Members (The Invite Flow)
Team Owners cannot arbitrarily add members. They must invite existing independent porters.
1. **Search**: The Team Owner looks up active individual porters by name/phone.
2. **Invite**: The Team Owner sends an invitation. The backend creates a `TeamJoinRequest` record with status `PENDING`.
3. **Response**: The individual porter checks their dashboard ("My Invitations"). If they accept, the backend updates their `Porters` record:
   - `porterType` changes from `"individual"` to `"team"`
   - `teamId` is set to the owner's team
   - `role` is set to `"worker"`
   - The team's `noOfMember` count is incremented.

## 2. Customer Team Booking Flow

When a customer needs multiple porters for a large job (e.g. house shifting), they invoke the Team Booking Flow.

### Phase 1: Request & Eligibility
1. **User Request**: The customer specifies pickup/drop coordinates and the **number of porters required** (`teamSize`).
2. **Eligibility Check**: The backend queries `PorterTeam` for active teams where `noOfMember >= teamSize`.
3. **Broadcasting**: A `PorterBooking` is created with status `PENDING_TEAM_REVIEW`. Using Socket.IO, all eligible Team Owners receive a `team-booking-request` notification.

### Phase 2: Team Owner Triage
Any eligible Team Owner can tap into the request.
- **Decline**: Owner drops the request.
- **Forward**: If the owner wants the job, they "forward" it to their team.
  - The booking status updates to `PENDING_MEMBER_RESPONSE`.
  - The backend creates a `TeamBookingSelection` record to track which workers are looped in.
  - Each active "worker" in that specific team receives a `team-booking-forwarded` notification.

### Phase 3: Team Members Vote (Quorum)
The "forward" action asks the team members to commit.
1. Each member reviews the job and clicks **Accept** or **Decline**.
2. **Quorum Reached**: As soon as the number of "Accepted" members equals the `teamSize` requested by the customer, the booking status automatically shifts to `AWAITING_OWNER_CONFIRMATION`.
3. The Team Owner receives a `team-quorum-reached` notification indicating they have the manpower to fulfill the job.

### Phase 4: Final Confirmation
The Team Owner makes the final call.
- The owner confirms the booking.
- Status changes to `CONFIRMED`.
- **Locking**: The backend locks the accepted workers so they can't take other jobs (`canAcceptBooking: false`, `currentStatus: "busy"`).
- The customer and the assigned workers are notified that the booking is securely confirmed. *Any other eligible teams who got the original broadcast will no longer be able to accept it.*

## 3. Job Execution & Completion

1. **Starting the Job**: When the team arrives at the pickup, the Team Owner triggers `startTeamBooking`.
   - Booking status becomes `IN_PROGRESS`.
   - Customer is notified.
2. **Completion**: Once the drop-off is complete:
   - Team Owner triggers `teamOwnerMarkComplete`.
   - Booking status becomes `COMPLETED`.
   - Team `totalActiveJobs` decreases, `totalCompletedJobs` increases.
   - Assigned workers are "unlocked" and put back to `online` status.
   - Customer is prompted for payment processing.

---

### Key Takeaways
- **Delegated Authority**: The Team Owner acts as the manager. Customers book the *Team*, not the members. The Owner routes the job internally.
- **Democratic Polling**: Even though the Owner accepts the job, they need strict confirmation (Opt-In) from their members to prevent forced assignments.
- **Real-Time Synergy**: Socket.IO is the backbone of this flow. Every micro-status change (`PENDING_TEAM_REVIEW` -> `PENDING_MEMBER_RESPONSE` -> `AWAITING_OWNER_CONFIRMATION` -> `CONFIRMED`) instantly triggers a UI update via WebSockets.
