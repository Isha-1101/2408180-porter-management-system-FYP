# Team Management APIs

Complete team management workflow including creation, invitations, and team bookings.

---

## Overview

| Property | Value |
|----------|-------|
| Service File | `src/apis/services/teamBookingService.js` |
| Hooks File | `src/apis/hooks/porterTeamHooks.jsx` |
| Total Endpoints | 20+ |
| Components | 5 |
| Total Hooks | 23 |

---

## Feature Sections

### 1. Team Management (6 hooks)
### 2. Porter Recruitment - US-005 (6 hooks)
### 3. Browse Teams - User (1 hook)
### 4. Team Booking - User (2 hooks)
### 5. Team Booking - Owner (5 hooks)
### 6. Team Booking - Member (1 hook)

---

## Team Lifecycle

```
Create Team
    ↓
Invite/Request Porters
    ↓
Manage Team Members
    ↓
Browse/Book Teams
    ↓
Team Accepts/Reviews Booking
    ↓
Assign Members to Booking
    ↓
Members Respond
    ↓
Complete Booking
    ↓
Rate Team
```

---

## Section 1: Team Management

### 1. Request New Porter for Team

**Endpoint:** `POST /team-porters/register-request`

**Hook:**
```javascript
export const useRequestPorterUserRegistration = (options = {}) =>
  useMutation({
    mutationFn: (requestData) => 
      teamBookingService.registerPorterRequest(requestData),
    onSuccess: () => 
      queryClient.invalidateQueries(['teamRequests']),
    ...options
  });
```

**Request:**
```javascript
{
  teamId: string,
  porterName: string,
  porterEmail: string,
  porterPhone: string,
  skills?: string[],       // e.g., ["heavy-lifting", "stairs"]
  documents?: FileList,    // Porter documents
  availability?: string    // Days available
}
```

**Response:**
```javascript
{
  success: boolean,
  registrationId: string,
  status: 'pending',
  createdAt: timestamp
}
```

---

### 2. Get Pending Porter Requests for Team

**Endpoint:** `GET /team-porters/register-request/{teamId}`

**Hook:**
```javascript
export const useGetAllRequestedPorterByTeam = (teamId, options = {}) =>
  useQuery({
    queryKey: ['teamRequests', teamId],
    queryFn: () => 
      teamBookingService.getRequestedPorterByTeam(teamId),
    enabled: !!teamId,
    ...options
  });
```

**Response:**
```javascript
{
  success: boolean,
  requests: [
    {
      id: string,
      porterName: string,
      porterEmail: string,
      porterPhone: string,
      status: 'pending' | 'approved' | 'rejected',
      submittedAt: timestamp,
      processedAt?: timestamp
    }
  ]
}
```

---

### 3. Get Team Members

**Endpoint:** `GET /team-porters/{teamId}`

**Hook:**
```javascript
export const useGetPorterByTeam = (teamId, options = {}) =>
  useQuery({
    queryKey: ['teamMembers', teamId],
    queryFn: () => 
      teamBookingService.getPorterByTeam(teamId),
    enabled: !!teamId,
    ...options
  });
```

**Response:**
```javascript
{
  success: boolean,
  teamMembers: [
    {
      id: string,
      name: string,
      email: string,
      phone: string,
      role: 'owner' | 'lead' | 'member',
      joinedAt: timestamp,
      rating: number,
      completedBookings: number,
      status: 'active' | 'inactive'
    }
  ]
}
```

---

### 4. Get Team Dashboard Data

**Endpoint:** `GET /team-porters/dashboard`

**Hook:**
```javascript
export const useGetTeamDashboard = (options = {}) =>
  useQuery({
    queryKey: ['teamDashboard'],
    queryFn: () => teamBookingService.getTeamDashboard(),
    ...options
  });
```

**Response:**
```javascript
{
  success: boolean,
  teamInfo: {
    teamId: string,
    teamName: string,
    totalMembers: number,
    averageRating: number,
    totalBookings: number,
    monthlyEarnings: number,
    onDutyMembers: number
  }
}
```

---

### 5. Get Team Booking History

**Endpoint:** `GET /team-porters/booking-history?status=X`

**Hook:**
```javascript
export const useGetTeamBookingHistory = (params, options = {}) =>
  useQuery({
    queryKey: ['teamBookingHistory', params],
    queryFn: () => 
      teamBookingService.getTeamBookingHistory(params),
    ...options
  });
```

---

### 6. Get Team Pending Bookings

**Endpoint:** `GET /team-porters/pending-bookings`

**Hook:**
```javascript
export const useGetTeamPendingBookings = (options = {}) =>
  useQuery({
    queryKey: ['teamPendingBookings'],
    queryFn: () => 
      teamBookingService.getTeamPendingBookings(),
    ...options
  });
```

---

## Section 2: Porter Recruitment - US-005

### 1. Search Individual Porters

**Endpoint:** `GET /team-porters/search-porters?params`

**Hook:**
```javascript
export const useSearchIndividualPorters = (searchParams, options = {}) =>
  useQuery({
    queryKey: ['searchPorters', searchParams],
    queryFn: () => 
      teamBookingService.searchIndividualPorters(searchParams),
    enabled: !!searchParams?.searchText,
    ...options
  });
```

**Query Parameters:**
```javascript
{
  searchText?: string,      // Name or location
  minRating?: number,       // 1-5
  maxDistance?: number,     // km
  availability?: string,    // Days
  skills?: string[]         // Filter by skills
}
```

**Response:**
```javascript
{
  success: boolean,
  porters: [
    {
      id: string,
      name: string,
      email: string,
      phone: string,
      rating: number,
      completedBookings: number,
      location: string,
      distance: number,        // km
      skills: string[],
      availability: string,
      isTeamMember: boolean    // Already in team?
    }
  ]
}
```

---

### 2. Invite Porter to Team

**Endpoint:** `POST /team-porters/invite-porter`

**Hook:**
```javascript
export const useInvitePorterToTeam = (options = {}) =>
  useMutation({
    mutationFn: (inviteData) => 
      teamBookingService.invitePorterToTeam(inviteData),
    onSuccess: () => 
      queryClient.invalidateQueries(['teamMembers']),
    ...options
  });
```

**Request:**
```javascript
{
  porterId: string,
  teamId: string,
  message?: string,        // Personalized invitation message
  role?: 'member' | 'lead' // Role in team
}
```

**Response:**
```javascript
{
  success: boolean,
  invitationId: string,
  status: 'pending',
  sentAt: timestamp
}
```

---

### 3. Respond to Team Invitation

**Endpoint:** `POST /team-porters/invite/{requestId}/respond`

**Hook:**
```javascript
export const useRespondToTeamInvitation = (options = {}) =>
  useMutation({
    mutationFn: ({ invitationId, response }) => 
      teamBookingService.respondToTeamInvitation(invitationId, response),
    onSuccess: () => 
      queryClient.invalidateQueries(['myTeams']),
    ...options
  });
```

**Request:**
```javascript
{
  response: 'accept' | 'reject',
  message?: string  // Optional response message
}
```

---

### 4. Get Pending Team Join Requests

**Endpoint:** `GET /team-porters/join-requests`

**Hook:**
```javascript
export const useGetPendingTeamJoinRequests = (teamId, options = {}) =>
  useQuery({
    queryKey: ['joinRequests', teamId],
    queryFn: () => 
      teamBookingService.getPendingJoinRequests(teamId),
    enabled: !!teamId,
    ...options
  });
```

---

### 5. Get Porter's Pending Invitations

**Endpoint:** `GET /team-porters/my-invitations`

**Hook:**
```javascript
export const useGetMyPendingInvitations = (options = {}) =>
  useQuery({
    queryKey: ['myInvitations'],
    queryFn: () => 
      teamBookingService.getMyPendingInvitations(),
    ...options
  });
```

**Response:**
```javascript
{
  success: boolean,
  invitations: [
    {
      id: string,
      teamId: string,
      teamName: string,
      teamOwner: string,
      role: 'member' | 'lead',
      message: string,
      receivedAt: timestamp
    }
  ]
}
```

---

### 6. Remove Team Member

**Endpoint:** `DELETE /team-porters/member/{porterId}`

**Hook:**
```javascript
export const useRemoveTeamMember = (options = {}) =>
  useMutation({
    mutationFn: (porterId) => 
      teamBookingService.removeTeamMember(porterId),
    onSuccess: () => 
      queryClient.invalidateQueries(['teamMembers']),
    ...options
  });
```

---

## Section 3: Browse Teams - User

### Browse Available Teams

**Endpoint:** `GET /team-porters/browse?portersRequired=X`

**Hook:**
```javascript
export const useBrowseAvailableTeams = (params, options = {}) =>
  useQuery({
    queryKey: ['availableTeams', params],
    queryFn: () => 
      teamBookingService.browseAvailableTeams(params),
    enabled: !!params?.portersRequired,
    ...options
  });
```

**Query Parameters:**
```javascript
{
  portersRequired: number,  // Min porters needed
  minRating?: number,       // Minimum team rating
  maxDistance?: number,     // km from location
  location?: {
    latitude: number,
    longitude: number
  }
}
```

**Response:**
```javascript
{
  success: boolean,
  teams: [
    {
      id: string,
      teamName: string,
      totalMembers: number,
      rating: number,
      reviewsCount: number,
      availableMembers: number,
      description: string,
      avatar: string,
      pricePerMember: number,
      distance: number
    }
  ]
}
```

---

## Section 4: Team Booking - User

### 1. Create Team Booking

**Endpoint:** `POST /bookings/team`

**Hook:**
```javascript
export const useCreateTeamBooking = (options = {}) =>
  useMutation({
    mutationFn: (bookingData) => 
      teamBookingService.createTeamBooking(bookingData),
    onSuccess: () => 
      queryClient.invalidateQueries(['userBookings']),
    ...options
  });
```

**Request:**
```javascript
{
  teamId: string,
  bookingType: 'individual' | 'package-delivery' | 'house-shifting',
  startLocation: { latitude, longitude, address },
  endLocation: { latitude, longitude, address },
  portersRequired: number,
  estimatedDistance: number,    // km
  estimatedFare: number,
  description: string,
  numberOfFloors?: number,
  hasLift?: boolean,
  numberOfTrips?: number,
  weight?: number               // kg
}
```

**Response:**
```javascript
{
  success: boolean,
  bookingId: string,
  status: 'pending_team_review',
  teamId: string,
  teamName: string,
  estimatedFare: number,
  createdAt: timestamp
}
```

---

### 2. Get Team Booking Status

**Endpoint:** `GET /bookings/team/{bookingId}`

**Hook:**
```javascript
export const useGetTeamBookingStatus = (bookingId, options = {}) =>
  useQuery({
    queryKey: ['teamBooking', bookingId],
    queryFn: () => 
      teamBookingService.getTeamBookingStatus(bookingId),
    enabled: !!bookingId,
    refetchInterval: 10000,  // 10s polling
    ...options
  });
```

**Response:**
```javascript
{
  success: boolean,
  booking: {
    id: string,
    status: 'pending_team_review' | 'assigned' | 'in-progress' | 'completed' | 'cancelled',
    team: {
      id: string,
      name: string,
      members: [{id, name, phone}]
    },
    assignedMembers: [
      {
        id: string,
        name: string,
        status: 'assigned' | 'accepted' | 'rejected' | 'in-progress'
      }
    ],
    currentLocation?: { latitude, longitude },
    fare: number,
    startedAt?: timestamp,
    completedAt?: timestamp
  }
}
```

---

## Section 5: Team Booking - Owner

### 1. Review Booking (Approve/Reject)

**Endpoint:** `POST /bookings/team/{bookingId}/review`

**Hook:**
```javascript
export const useTeamOwnerReviewBooking = (options = {}) =>
  useMutation({
    mutationFn: ({ bookingId, decision, assignedMembers }) => 
      teamBookingService.reviewTeamBooking(bookingId, decision, assignedMembers),
    onSuccess: () => 
      queryClient.invalidateQueries(['teamPendingBookings']),
    ...options
  });
```

**Request:**
```javascript
{
  decision: 'approve' | 'reject',
  assignedMembers?: [
    {
      memberId: string,
      role: 'lead' | 'member'
    }
  ],
  message?: string  // Rejection reason if rejecting
}
```

---

### 2. Confirm Booking

**Endpoint:** `POST /bookings/team/{bookingId}/owner/confirm`

**Hook:**
```javascript
export const useTeamOwnerConfirmBooking = (options = {}) =>
  useMutation({
    mutationFn: (bookingId) => 
      teamBookingService.confirmTeamBooking(bookingId),
    onSuccess: () => 
      queryClient.invalidateQueries(['teamBooking']),
    ...options
  });
```

---

### 3. Cancel Booking (Owner)

**Endpoint:** `POST /bookings/team/{bookingId}/owner/cancel`

**Hook:**
```javascript
export const useTeamOwnerCancelBooking = (options = {}) =>
  useMutation({
    mutationFn: ({ bookingId, reason }) => 
      teamBookingService.cancelTeamBooking(bookingId, reason),
    onSuccess: () => 
      queryClient.invalidateQueries(['teamBooking']),
    ...options
  });
```

---

### 4. Start Booking

**Endpoint:** `POST /bookings/team/{bookingId}/start`

**Hook:**
```javascript
export const useStartTeamBooking = (options = {}) =>
  useMutation({
    mutationFn: (bookingId) => 
      teamBookingService.startTeamBooking(bookingId),
    ...options
  });
```

---

### 5. Complete Booking

**Endpoint:** `POST /bookings/team/{bookingId}/complete`

**Hook:**
```javascript
export const useCompleteTeamBooking = (options = {}) =>
  useMutation({
    mutationFn: (bookingId) => 
      teamBookingService.completeTeamBooking(bookingId),
    ...options
  });
```

---

## Section 6: Team Booking - Member

### Respond to Booking Assignment

**Endpoint:** `POST /bookings/team/{bookingId}/member/respond`

**Hook:**
```javascript
export const useTeamMemberRespond = (options = {}) =>
  useMutation({
    mutationFn: ({ bookingId, response, memberId }) => 
      teamBookingService.respondToTeamBooking(bookingId, response, memberId),
    onSuccess: () => 
      queryClient.invalidateQueries(['memberBookings']),
    ...options
  });
```

**Request:**
```javascript
{
  response: 'accept' | 'reject',
  memberId: string,
  reason?: string  // If rejecting
}
```

---

## Team Booking States

```
pending_team_review
    ↓ ↖ (reject)
  assigned
    ↓
  in-progress
    ↓
  completed
    ↓
  rated

* Can be cancelled at any stage
```

---

## Key Features

### Team Owner Workflow
1. Create team
2. Invite porters
3. Manage team members
4. Review incoming bookings
5. Assign team members
6. Confirm and manage bookings

### Team Member Workflow
1. Receive invitations to teams
2. Accept/reject team invitations
3. Accept/reject booking assignments
4. Work on assignments

### User (Team Booker) Workflow
1. Browse available teams
2. Create team booking
3. Track booking status
4. Rate team after completion

---

## Related Components

- **TeamOwnerDashboard.jsx** - Team management
- **TeamCreation.jsx** - Create teams
- **TeamLeadConfirmBooking.jsx** - Review/confirm bookings
- **TeamMemberBookingResponse.jsx** - Member responses
- **TeamBookingTracking.jsx** - User tracking
- **PorterBooking/TeamFields.jsx** - User books team

---

## Related Documents

- [03-individual-bookings/README.md](../03-individual-bookings/README.md) - Individual booking
- [API_DEPENDENCY_MAP.md](../API_DEPENDENCY_MAP.md) - Component mapping
