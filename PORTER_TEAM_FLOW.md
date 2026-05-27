# Team Porter Management: Adding Members Flow

This document outlines the end-to-end flow for a Team Owner to add Individual Porters to their team.

## Overview
A **Team Porter** (Owner) can recruit **Individual Porters** (Workers) to join their team. Once a porter joins a team, they transition from an individual entity to a team member, allowing them to participate in team-based bookings.

---

## 1. Prerequisites
- **Team Owner:** Must be a registered Porter with the role `owner`.
- **Target Porter:** Must be a registered Individual Porter with `status: "active"`, `isVerified: true`, and currently not linked to any other team (`teamId: null`).

---

## 2. Step-by-Step Flow

### Phase A: Recruitment (Team Owner Side)
1. **Search for Porters:**
   - The Team Owner uses the "Search Porters" feature.
   - The system filters for active, verified, individual porters who are available for hire.
   - *Backend Endpoint:* `GET /api/bookings/team/search-porters?name=...&phone=...`

2. **Send Invitation:**
   - The Team Owner selects a porter and clicks "Invite to Team".
   - A `TeamJoinRequest` record is created in the database with status `PENDING`.
   - *Backend Endpoint:* `POST /api/bookings/team/invite` (Body: `{ porterId }`)

3. **Real-time Notification:**
   - The target porter receives a real-time notification via Socket.io or SSE about the new team invitation.

### Phase B: Acceptance (Porter Side)
1. **Review Invitations:**
   - The Individual Porter navigates to their "Team Invitations" section in the dashboard.
   
2. **Respond to Invitation:**
   - The porter can either **Accept** or **Decline** the request.
   - *Backend Endpoint:* `POST /api/bookings/team/respond/:requestId` (Body: `{ action: "ACCEPTED" | "DECLINED", reason?: string }`)

### Phase C: Finalization (System Side)
If the Porter **Accepts**:
- **Role Update:** The porter's role is changed from `individual` (default) to `worker`.
- **Team Linking:** The porter's `teamId` is updated to point to the new team.
- **Team Roster:** The porter is added to the `members` array of the `PorterTeam` document.
- **Capacity Update:** The team's `noOfMember` and `noOfAvailableMember` counts are incremented.

If the Porter **Declines**:
- **Status Update:** The `TeamJoinRequest` status is set to `DECLINED`.
- **Notification:** The Team Owner is notified that the porter has declined.

---

## 3. Booking Impact
Once a porter is part of a team:
- **Flexible Availability:** They can still receive and accept "Individual" booking requests when they are `online` and not busy with a team job.
- **Team-Driven Priority:** They also receive "Team" booking requests forwarded by their Team Owner.
- **Exclusion Rule:** Only porters registered as `porterType: "team"` (the team entity/owner) are excluded from being searched for individual jobs. Individual workers (`porterType: "individual"`) remain searchable across both types as long as their `currentStatus` is `online`.

## 4. Technical Reference

### Relevant Models
- `Porters`: Stores the individual porter's role (`owner`/`worker`) and `teamId`.
- `PorterTeam`: Stores the team metadata and the list of `members`.
- `TeamJoinRequest`: Manages the lifecycle of an invitation.

### Key Controllers
- `team-join-request-controller.js`: Handles searching, inviting, and responding.
- `team-controller.js`: Handles team-specific management actions.
