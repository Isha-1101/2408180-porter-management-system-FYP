# Individual Bookings APIs

Complete booking workflow for users booking individual porters.

---

## Overview

| Property | Value |
|----------|-------|
| Service File | `src/apis/services/porterBookingsService.js` |
| Hooks File | `src/apis/hooks/porterBookingsHooks.jsx` |
| Total Endpoints | 12+ |
| Components | 6 (Booking, Tracking, Dashboard, etc.) |
| Real-time | ✅ YES (15s polling) |

---

## Complete Booking Lifecycle

```
Search Porters
    ↓
Select Porter & Calculate Fare
    ↓
Create Booking
    ↓
Porter Accepts/Rejects
    ↓
Start Booking
    ↓
Complete Booking
    ↓
Rate & Review
```

---

## User-Facing Endpoints

### 1. Search Nearby Porters

**Endpoint:** `POST /bookings/search-porters/{bookingType}`

**Hook:**
```javascript
export const useSearchNearByPorter = (options = {}) =>
  useMutation({
    mutationFn: (searchData) => 
      porterBookingsService.searchNearbyPorters(searchData),
    ...options
  });
```

**Request:**
```javascript
{
  bookingType: 'individual' | 'package-delivery' | 'house-shifting',
  location: {
    latitude: number,
    longitude: number
  },
  portersRequired: number,    // How many porters needed
  filters?: {
    maxDistance?: number,     // km
    minRating?: number,       // 1-5
    serviceType?: string
  }
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
      rating: number,
      reviewsCount: number,
      distance: number,        // km from location
      availability: boolean,
      avatar: string,
      completedBookings: number,
      pricePerHour: number
    }
  ]
}
```

**Usage:**
```javascript
const { mutate: searchPorters } = useSearchNearByPorter({
  onSuccess: (data) => {
    setPorters(data.porters);
  }
});

const handleSearch = (location) => {
  searchPorters({
    bookingType: 'individual',
    location,
    portersRequired: 2
  });
};
```

---

### 2. Create Individual Booking

**Endpoint:** `POST /bookings/individual`

**Hook:**
```javascript
export const useCreateIndividualBooking = (options = {}) =>
  useMutation({
    mutationFn: (bookingData) => 
      porterBookingsService.createIndividualBooking(bookingData),
    onSuccess: () => 
      queryClient.invalidateQueries(['userBookings']),
    ...options
  });
```

**Request:**
```javascript
{
  porterId: string,
  bookingType: 'individual' | 'package-delivery' | 'house-shifting',
  startLocation: {
    latitude: number,
    longitude: number,
    address: string
  },
  endLocation: {
    latitude: number,
    longitude: number,
    address: string
  },
  estimatedDistance: number,  // km
  estimatedFare: number,      // Based on fare calculator
  scheduledTime?: string,     // ISO datetime (for future bookings)
  description: string,        // Booking details
  numberOfFloors?: number,    // For house shifting
  hasLift?: boolean,          // For house shifting
  numberOfTrips?: number,     // For package delivery
  weight?: number             // kg for package delivery
}
```

**Response:**
```javascript
{
  success: boolean,
  bookingId: string,
  status: 'pending',           // Initial status
  fare: number,
  estimatedDuration: number,   // minutes
  porter: {
    id: string,
    name: string,
    phone: string,
    rating: number
  },
  createdAt: timestamp
}
```

**Usage:**
```javascript
const { mutate: createBooking } = useCreateIndividualBooking({
  onSuccess: (data) => {
    toast.success('Booking created! Waiting for porter response...');
    navigate(`/booking/${data.bookingId}`);
  },
  onError: (error) => {
    toast.error(error.response?.data?.message);
  }
});

const handleBookingSubmit = (bookingData) => {
  createBooking(bookingData);
};
```

---

### 3. Get User's Bookings

**Endpoint:** `GET /bookings/user?params`

**Hook:**
```javascript
export const useGetUserBookings = (params, options = {}) =>
  useQuery({
    queryKey: ['userBookings', params],
    queryFn: () => porterBookingsService.getUserBookings(params),
    enabled: !!params,
    refetchInterval: 15000,  // Polling every 15 seconds
    ...options
  });
```

**Query Parameters:**
```javascript
{
  page?: number,              // Default: 1
  limit?: number,             // Default: 10
  status?: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled',
  sortBy?: 'recent' | 'oldest' | 'rating',
  startDate?: string,         // ISO date
  endDate?: string            // ISO date
}
```

**Response:**
```javascript
{
  success: boolean,
  bookings: [
    {
      id: string,
      porterId: string,
      porterName: string,
      status: string,
      startLocation: { latitude, longitude, address },
      endLocation: { latitude, longitude, address },
      fare: number,
      createdAt: timestamp,
      startedAt?: timestamp,
      completedAt?: timestamp,
      rating?: number,          // If rated
      review?: string
    }
  ],
  pagination: {
    currentPage: number,
    totalPages: number,
    totalBookings: number
  }
}
```

**Usage in Orders.jsx:**
```javascript
const { data: bookingsData, isLoading } = useGetUserBookings({
  status: 'completed',
  limit: 10
});

return bookingsData?.bookings.map(booking => (
  <BookingCard key={booking.id} booking={booking} />
));
```

---

### 4. Get Single Booking Details

**Endpoint:** `GET /bookings/{bookingId}`

**Hook:**
```javascript
export const useGetBookingById = (bookingId, options = {}) =>
  useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => porterBookingsService.getBookingById(bookingId),
    enabled: !!bookingId,
    refetchInterval: 10000,  // Polling every 10 seconds
    ...options
  });
```

**Response:**
```javascript
{
  success: boolean,
  booking: {
    id: string,
    userId: string,
    porterId: string,
    status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled',
    startLocation: { latitude, longitude, address },
    endLocation: { latitude, longitude, address },
    fare: number,
    porter: {
      id: string,
      name: string,
      phone: string,
      rating: number,
      avatar: string,
      vehicle: {
        type: string,
        registration: string
      }
    },
    estimatedDuration: number,  // minutes
    actualDuration?: number,
    createdAt: timestamp,
    acceptedAt?: timestamp,
    startedAt?: timestamp,
    completedAt?: timestamp,
    cancellationReason?: string,
    currentLocation?: {          // Real-time during journey
      latitude: number,
      longitude: number,
      updatedAt: timestamp
    }
  }
}
```

**Usage in BookingTracking:**
```javascript
const { data: booking, isLoading } = useGetBookingById(bookingId);

return (
  <>
    <PorterCard porter={booking?.porter} />
    <RouteMap 
      start={booking?.startLocation}
      end={booking?.endLocation}
      current={booking?.currentLocation}
    />
    <StatusTimeline booking={booking} />
  </>
);
```

---

### 5. Cancel Booking (User)

**Endpoint:** `DELETE /bookings/{bookingId}/cancel`

**Hook:**
```javascript
export const useCancelBooking = (options = {}) =>
  useMutation({
    mutationFn: ({ bookingId, reason }) => 
      porterBookingsService.cancelBooking(bookingId, reason),
    onSuccess: () => 
      queryClient.invalidateQueries(['userBookings']),
    ...options
  });
```

**Request:**
```javascript
{
  reason: string  // Cancellation reason
}
```

**Response:**
```javascript
{
  success: boolean,
  message: string,
  booking: {
    id: string,
    status: 'cancelled',
    cancelledAt: timestamp,
    cancellationReason: string,
    refund?: number
  }
}
```

**Usage:**
```javascript
const { mutate: cancelBooking } = useCancelBooking({
  onSuccess: () => {
    toast.success('Booking cancelled');
  }
});

const handleCancel = (reason) => {
  cancelBooking({ bookingId, reason });
};
```

---

## Porter-Facing Endpoints

### 6. Get Porter's Pending Bookings

**Endpoint:** `GET /bookings/porter?params`

**Hook:**
```javascript
export const useGetPorterBookings = (params, options = {}) =>
  useQuery({
    queryKey: ['porterBookings', params],
    queryFn: () => porterBookingsService.getPorterBookings(params),
    refetchInterval: 15000,  // Polling every 15 seconds
    ...options
  });
```

**Query Parameters:**
```javascript
{
  status?: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled',
  page?: number,
  limit?: number,
  sortBy?: 'recent' | 'fare'
}
```

**Response:**
```javascript
{
  success: boolean,
  bookings: [
    {
      id: string,
      userId: string,
      userName: string,
      userRating: number,
      status: 'pending',
      startLocation: { address, latitude, longitude },
      endLocation: { address, latitude, longitude },
      fare: number,
      description: string,
      createdAt: timestamp
    }
  ]
}
```

**Usage in PorterDashboard:**
```javascript
const { data: bookingsData } = useGetPorterBookings({
  status: 'pending'
});

return bookingsData?.bookings.map(booking => (
  <BookingRequestCard key={booking.id} booking={booking} />
));
```

---

### 7. Accept Booking

**Endpoint:** `POST /bookings/individual/{bookingId}/accept`

**Hook:**
```javascript
export const useAcceptPorterBooking = (options = {}) =>
  useMutation({
    mutationFn: (bookingId) => 
      porterBookingsService.acceptBooking(bookingId),
    onSuccess: () => 
      queryClient.invalidateQueries(['porterBookings']),
    ...options
  });
```

**Response:**
```javascript
{
  success: boolean,
  message: string,
  booking: {
    id: string,
    status: 'accepted',
    acceptedAt: timestamp,
    user: {
      name: string,
      phone: string,
      location: { latitude, longitude }
    }
  }
}
```

**Usage:**
```javascript
const { mutate: acceptBooking } = useAcceptPorterBooking({
  onSuccess: () => {
    toast.success('Booking accepted!');
  }
});

handleAcceptClick = (bookingId) => {
  acceptBooking(bookingId);
};
```

---

### 8. Reject Booking

**Endpoint:** `POST /bookings/individual/{bookingId}/reject`

**Hook:**
```javascript
export const useRejectPorterBooking = (options = {}) =>
  useMutation({
    mutationFn: ({ bookingId, reason }) => 
      porterBookingsService.rejectBooking(bookingId, reason),
    onSuccess: () => 
      queryClient.invalidateQueries(['porterBookings']),
    ...options
  });
```

**Request:**
```javascript
{
  reason?: string  // Why rejecting (optional)
}
```

---

### 9. Start Booking

**Endpoint:** `POST /bookings/individual/{bookingId}/start`

**Hook:**
```javascript
export const useStartBooking = (options = {}) =>
  useMutation({
    mutationFn: (bookingId) => 
      porterBookingsService.startBooking(bookingId),
    onSuccess: () => 
      queryClient.invalidateQueries(['booking']),
    ...options
  });
```

**Response:**
```javascript
{
  success: boolean,
  booking: {
    id: string,
    status: 'in-progress',
    startedAt: timestamp
  }
}
```

---

### 10. Complete Booking

**Endpoint:** `POST /bookings/individual/{bookingId}/complete`

**Hook:**
```javascript
export const useCompleteBooking = (options = {}) =>
  useMutation({
    mutationFn: (bookingId) => 
      porterBookingsService.completeBooking(bookingId),
    onSuccess: () => 
      queryClient.invalidateQueries(['userBookings']),
    ...options
  });
```

**Response:**
```javascript
{
  success: boolean,
  booking: {
    id: string,
    status: 'completed',
    completedAt: timestamp,
    actualDuration: number,  // minutes
    fare: number
  }
}
```

---

## Booking States & Transitions

```
        pending
         ↓ ↖ (reject)
      accepted
         ↓
    in-progress
         ↓
      completed → (can rate & review)
         
pending/accepted/in-progress → cancelled (anytime)
```

---

## Real-time Features

### Polling Implementation

```javascript
// Components using 15s polling
useQuery({
  refetchInterval: 15000,  // 15 seconds
  refetchIntervalInBackground: true,  // Continue polling when tab inactive
});
```

### Active Subscriptions

- PorterDashboard: Polls for new pending bookings
- BookingTracking: Polls for booking status and porter location updates
- TeamBookingTracking: Similar polling for team bookings

---

## Error Handling

| Status | Message | When |
|--------|---------|------|
| 400 | Booking already accepted/rejected | Porter action twice |
| 400 | Booking not found | Invalid booking ID |
| 400 | Cannot cancel completed booking | User cancels old booking |
| 409 | Another porter accepted this | Race condition |
| 500 | Server error | Backend issue |

---

## Related Components

- **PorterBooking/index.jsx** - Booking creation
- **BookingConfirmation.jsx** - Confirmation
- **BookingTracking.jsx** - User tracking
- **PorterDashboard.jsx** - Porter accepting/rejecting
- **AcceptedBookingDetails.jsx** - Porter working on booking
- **Orders.jsx** - Completed bookings & ratings

---

## Related Documents

- [02-porter-management/README.md](../02-porter-management/README.md) - Porter profiles
- [06-fare-calculation/README.md](../06-fare-calculation/README.md) - Fare estimation
- [07-ratings/README.md](../07-ratings/README.md) - Booking ratings
- [API_DEPENDENCY_MAP.md](../API_DEPENDENCY_MAP.md) - Component mapping
