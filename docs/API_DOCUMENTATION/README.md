# Frontend API Documentation

Complete documentation of all APIs integrated with the porter management system frontend.

## 📋 Table of Contents

1. [Overview](#overview)
2. [API Organization](#api-organization)
3. [Quick Links](#quick-links)
4. [Usage Patterns](#usage-patterns)
5. [Cleanup Items](#cleanup-items)

---

## Overview

This documentation covers all API integrations in the frontend (`porter-management-frontend/src/apis/`).

- **Total Active Services:** 9 files
- **Total Hooks:** 7 files
- **Total Endpoints:** ~100+
- **Framework:** React Query + Axios

### Core Infrastructure

**File:** `src/apis/axiosInstance.jsx`
- Centralized Axios configuration
- Automatic token injection via request interceptor
- 401 error handling with auto-logout
- Base URL from environment variables

---

## API Organization

APIs are organized by feature domain:

### 1. 🔐 Authentication
- **Services:** `authService.js`
- **Hooks:** `authHooks.jsx`
- **Endpoints:** 2 (login, register)
- **[View Details →](./01-authentication/README.md)**

### 2. 👤 Porter Management
- **Services:** `porterService.js`
- **Hooks:** `portersHooks.jsx`
- **Endpoints:** 10+ (profiles, vehicles, documents, analytics)
- **[View Details →](./02-porter-management/README.md)**

### 3. 📅 Individual Bookings
- **Services:** `porterBookingsService.js`
- **Hooks:** `porterBookingsHooks.jsx`
- **Endpoints:** 12+ (search, accept, reject, complete)
- **[View Details →](./03-individual-bookings/README.md)**

### 4. 👥 Team Management
- **Services:** `teamBookingService.js`
- **Hooks:** `porterTeamHooks.jsx`
- **Endpoints:** 20+ (team creation, invitations, team bookings)
- **[View Details →](./04-team-management/README.md)**

### 5. 📝 Porter Registration
- **Services:** `porterRegistration.js`
- **Hooks:** `porterRegistratioHooks.jsx` ⚠️ (typo in filename)
- **Endpoints:** 8 (multi-step registration workflow)
- **[View Details →](./05-porter-registration/README.md)**

### 6. 💰 Fare Calculation
- **Services:** `farecalculatorService.js`
- **Hooks:** `fareHooks.jsx`
- **Endpoints:** 1 (fare estimation with multiple parameters)
- **[View Details →](./06-fare-calculation/README.md)**

### 7. ⭐ Ratings & Reviews
- **Services:** `ratingService.js`
- **Hooks:** ⚠️ None (used directly in Orders.jsx - not recommended)
- **Endpoints:** 3 (submit rating, get ratings)
- **[View Details →](./07-ratings/README.md)**

### 8. 🛠️ Admin Dashboard
- **Services:** `adminService.js`
- **Hooks:** ⚠️ None (direct service calls)
- **Endpoints:** 27+ (users, registrations, bookings, analytics)
- **[View Details →](./08-admin/README.md)**

### 9. 🔄 Utilities
- **Services:** `useChangeTemporaryPassword.jsx`
- **Endpoints:** 1 (change temp password)
- **[View Details →](./09-utilities/README.md)**

---

## Quick Links

### By Use Case

- **User Books a Porter:** See [Individual Bookings](./03-individual-bookings/README.md)
- **User Books a Team:** See [Team Management](./04-team-management/README.md)
- **Porter Registration:** See [Porter Registration](./05-porter-registration/README.md)
- **Porter Accepts Booking:** See [Individual Bookings](./03-individual-bookings/README.md)
- **Team Owner Manages Team:** See [Team Management](./04-team-management/README.md)
- **Admin Views Dashboard:** See [Admin Dashboard](./08-admin/README.md)

### By Component

- See [API_DEPENDENCY_MAP.md](./API_DEPENDENCY_MAP.md) for complete component-to-API mapping

---

## Usage Patterns

### React Query Pattern (Recommended)

```javascript
// Service file (e.g., porterService.js)
export const porterService = {
  getPorters: (params) => 
    axiosInstance.get('/porters', { params })
};

// Hook file (e.g., portersHooks.jsx)
export const useGetPorters = (params, options = {}) =>
  useQuery({
    queryKey: ['porters', params],
    queryFn: () => porterService.getPorters(params),
    enabled: params?.searchText !== undefined,
    ...options
  });

// Component usage
const { data, isLoading } = useGetPorters(searchParams);
```

### React Query Mutation Pattern

```javascript
export const useCreatePorter = (options = {}) =>
  useMutation({
    mutationFn: (data) => porterService.createPorter(data),
    onSuccess: () => queryClient.invalidateQueries(['porters']),
    ...options
  });
```

### REST Polling Pattern

```javascript
// 15-second refetch for real-time updates
useQuery({
  queryKey: ['porterBookings'],
  queryFn: () => porterBookingsService.getPorterBookings(),
  refetchInterval: 15000, // 15 seconds
});
```

---

## Cleanup Items

⚠️ **CRITICAL: Remove These Files**

1. **`src/apis/services/teamSearvice.js`** (Duplicate)
   - Contains 3 endpoints already in `teamBookingService.js`
   - No usage found anywhere
   - Status: READY TO DELETE

2. **`src/apis/services/services.js`** (Unused)
   - Contains 17 unused endpoints (payments, cancellations, chat)
   - Inconsistent with axiosInstance pattern
   - Status: REVIEW NEEDED - either implement or delete

### Minor Issues

3. **`src/apis/hooks/porterRegistratioHooks.jsx`** - Filename typo
   - Should be: `porterRegistrationHooks.jsx`
   - Also has export name typo: `porterRetgistrationHooks`

4. **Rating Service** - Direct usage in Orders.jsx
   - Functions called directly without React Query wrappers
   - Should follow the pattern of other services

---

## File Structure

```
docs/API_DOCUMENTATION/
├── README.md                        (this file)
├── API_DEPENDENCY_MAP.md           (component → API mapping)
├── UNUSED_APIS.md                  (files to remove)
├── 01-authentication/
│   └── README.md
├── 02-porter-management/
│   └── README.md
├── 03-individual-bookings/
│   └── README.md
├── 04-team-management/
│   └── README.md
├── 05-porter-registration/
│   └── README.md
├── 06-fare-calculation/
│   └── README.md
├── 07-ratings/
│   └── README.md
├── 08-admin/
│   └── README.md
└── 09-utilities/
    └── README.md

src/apis/
├── axiosInstance.jsx              (core infrastructure)
├── services/
│   ├── authService.js
│   ├── porterService.js
│   ├── porterBookingsService.js
│   ├── teamBookingService.js
│   ├── porterRegistration.js
│   ├── farecalculatorService.js
│   ├── ratingService.js
│   ├── adminService.js
│   ├── teamSearvice.js           ❌ DELETE (duplicate)
│   └── services.js               ❌ DELETE (unused)
└── hooks/
    ├── authHooks.jsx
    ├── portersHooks.jsx
    ├── porterBookingsHooks.jsx
    ├── porterTeamHooks.jsx
    ├── porterRegistratioHooks.jsx ⚠️ (rename)
    ├── fareHooks.jsx
    └── useChangeTemporaryPassword.jsx
```

---

## Next Steps

1. **Review:** Open each domain folder and review the endpoints
2. **Cleanup:** See [UNUSED_APIS.md](./UNUSED_APIS.md) for files to remove
3. **Dependencies:** Check [API_DEPENDENCY_MAP.md](./API_DEPENDENCY_MAP.md) before making changes
4. **Refactor:** Consider grouping related admin endpoints by feature

---

## Notes

- All services use the centralized `axiosInstance.jsx` for consistent auth and error handling
- React Query is the primary state management for API calls
- 15-second polling interval used for real-time booking updates
- Toast notifications provided for user feedback on mutations
