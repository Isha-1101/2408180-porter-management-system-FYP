# Unused & Duplicate APIs - Cleanup Guide

This document identifies APIs that should be removed from the project.

---

## 🔴 CRITICAL: Duplicate Service File

### File: `src/apis/services/teamSearvice.js`

**Status:** ❌ **DELETE IMMEDIATELY**

**Note:** Filename has a typo: "Searvice" instead of "Service"

#### What it contains:
```javascript
export const teamSearchAPI = {
  registerPorterRequest: (teamId, requestData) => 
    axiosInstance.post(`/team-porters/register-request`, requestData),
  
  getRequestedPorterByTeam: (teamId) => 
    axiosInstance.get(`/team-porters/register-request/${teamId}`),
  
  getPorterByTeam: (teamId) => 
    axiosInstance.get(`/team-porters/${teamId}`)
};
```

#### Why it's redundant:
- All 3 endpoints are fully implemented in `teamBookingService.js`
- Provides identical functionality with same endpoints
- Creates confusion about which service to use

#### Usage analysis:
- **ZERO FILES** import or use this service
- Verified with: `grep -r "teamSearvice" src/`
- Result: No matches found

#### What to do:
1. Delete file: `src/apis/services/teamSearvice.js`
2. Use `teamBookingService.js` instead (it has all the same functionality)

---

## 🟠 UNUSED: Generic Services File

### File: `src/apis/services/services.js`

**Status:** ⚠️ **REVIEW NEEDED - Either Remove or Implement**

#### What it contains:

**1. Payment API (7 endpoints):**
```javascript
paymentAPI: {
  processPayment(paymentData),
  verifyPayment(transactionId),
  getPaymentHistory(params),
  refundPayment(paymentId),
  getPaymentMethods(),
  updatePaymentMethod(methodId, data),
  getInvoice(bookingId)
}
```

**2. Cancellation API (4 endpoints):**
```javascript
cancellationAPI: {
  cancelBooking(bookingId, reason),
  getCancellationHistory(params),
  getCancellationReasons(),
  requestCancellation(bookingId, data)
}
```

**3. Chat API (6 endpoints):**
```javascript
chatAPI: {
  sendMessage(conversationId, message),
  getConversation(conversationId),
  getConversations(userId),
  markAsRead(conversationId),
  deleteConversation(conversationId),
  createConversation(participants)
}
```

#### Issues with this file:

1. **Not used anywhere:** Zero imports found in codebase
   ```bash
   grep -r "from.*services.js" src/
   grep -r "import.*services" src/
   # Result: No matches
   ```

2. **Inconsistent patterns:**
   - Uses raw Axios instead of `axiosInstance`
   - Manually sets Authorization header (anti-pattern)
   - Uses localStorage directly (inconsistent with auth.store)

3. **No corresponding hooks:** Missing React Query wrapper hooks

#### Current status of features:

| Feature | Status | Notes |
|---------|--------|-------|
| Payments | ⚠️ Defined but not implemented | Endpoints exist in file, but no UI/hooks |
| Cancellations | ✅ Partially implemented | Some cancellation logic exists in `porterBookingsService.js` |
| Chat | ❌ Not implemented | No real-time messaging features visible |

#### What to do:

**Option A: Delete it** (Recommended if features not needed)
```bash
rm src/apis/services/services.js
```

**Option B: Implement it properly** (If features are planned)
1. Create hooks files:
   - `src/apis/hooks/paymentHooks.jsx`
   - `src/apis/hooks/cancellationHooks.jsx`
   - `src/apis/hooks/chatHooks.jsx`
2. Move to separate service files following the pattern
3. Use `axiosInstance` instead of raw axios
4. Add to this documentation

---

## 🟡 MINOR: Direct API Usage (Not Following Pattern)

### File: `src/pages/dashboard/user/Orders.jsx`

**Issue:** Rating service functions used directly without React Query

#### Current usage:
```javascript
import { submitRating, getBookingRating } from '../../../apis/services/ratingService';

// Direct calls without hooks
await submitRating(bookingId, ratingData);
const rating = await getBookingRating(bookingId);
```

#### Should be:
```javascript
import { useSubmitRating, useGetBookingRating } from '../../../apis/hooks/ratingHooks';

const submitRatingMutation = useSubmitRating();
const { data: rating } = useGetBookingRating(bookingId);
```

#### What to do:
1. Create `src/apis/hooks/ratingHooks.jsx` with:
   ```javascript
   export const useSubmitRating = () =>
     useMutation({
       mutationFn: (data) => ratingService.submitRating(data),
       onSuccess: () => queryClient.invalidateQueries(['ratings'])
     });

   export const useGetBookingRating = (bookingId) =>
     useQuery({
       queryKey: ['rating', bookingId],
       queryFn: () => ratingService.getBookingRating(bookingId),
       enabled: !!bookingId
     });
   ```
2. Update `Orders.jsx` to use the hooks

---

## 🔵 MINOR: Filename Typos

### File: `src/apis/hooks/porterRegistratioHooks.jsx`

**Issue:** Typo in filename - "Registratio" instead of "Registration"

#### Also has export name typo:
```javascript
export const porterRetgistrationHooks = {
  // exports...
};
```

Should be:
```javascript
export const porterRegistrationHooks = {
  // exports...
};
```

#### What to do:
1. Rename file: `porterRegistrationHooks.jsx`
2. Update export name: `porterRegistrationHooks`
3. Search and update all imports:
   ```bash
   grep -r "porterRegistratioHooks" src/
   grep -r "porterRetgistrationHooks" src/
   ```
4. Fix the imports in all files that use it

---

## Unused Endpoints Analysis

### In `services.js`:

#### Payment API endpoints (NOT CALLED ANYWHERE):
- `POST /payments/process` - Process payment
- `POST /payments/verify/{transactionId}` - Verify payment
- `GET /payments/history` - Get payment history
- `POST /payments/{paymentId}/refund` - Refund payment
- `GET /payments/methods` - Get payment methods
- `PUT /payments/methods/{methodId}` - Update payment method
- `GET /payments/invoices/{bookingId}` - Get invoice

#### Cancellation API endpoints (PARTIALLY USED):
- `POST /cancellations/{bookingId}` - ✅ Used in porterBookingsService
- `GET /cancellations/history` - ❌ Unused
- `GET /cancellations/reasons` - ❌ Unused
- `POST /cancellations/request` - ❌ Unused

#### Chat API endpoints (NOT IMPLEMENTED):
- `POST /chat/messages` - Send message
- `GET /chat/conversations/{id}` - Get conversation
- `GET /chat/conversations` - Get all conversations
- `PUT /chat/conversations/{id}/read` - Mark as read
- `DELETE /chat/conversations/{id}` - Delete conversation
- `POST /chat/conversations` - Create conversation

---

## Cleanup Checklist

### Priority 1 - DELETE (Safe & Ready)
- [ ] Delete `src/apis/services/teamSearvice.js`
  - Command: `rm src/apis/services/teamSearvice.js`
  - Risk: NONE (zero usage)

### Priority 2 - DELETE OR IMPLEMENT (Review First)
- [ ] Decide on `src/apis/services/services.js`
  - If removing: `rm src/apis/services/services.js`
  - If keeping: Create corresponding hooks and fix patterns

### Priority 3 - REFACTOR (Code Quality)
- [ ] Create proper hooks for `ratingService.js`
- [ ] Update `Orders.jsx` to use rating hooks
- [ ] Rename `porterRegistratioHooks.jsx` → `porterRegistrationHooks.jsx`
- [ ] Update all imports of registration hooks

---

## Verification Commands

Use these commands to verify cleanup is safe:

```bash
# Check if teamSearvice.js is imported anywhere
grep -r "teamSearvice" src/

# Check if services.js is imported anywhere
grep -r "from.*services.js" src/
grep -r "import.*services['\"]" src/

# Check rating service imports
grep -r "ratingService" src/

# Check registration hooks imports
grep -r "porterRegistratioHooks" src/
grep -r "porterRetgistrationHooks" src/
```

---

## Impact Assessment

| File | Safe to Delete | Components Affected | Risk |
|------|---------------|--------------------|------|
| teamSearvice.js | ✅ Yes | NONE | 0% |
| services.js | ⚠️ Conditional | NONE (currently) | 0% if deleted |
| ratingService hooks | ❌ No | Orders.jsx | 20% |
| Registration typo | ❌ No | Registration pages | 10% |

---

## Notes

- All identified issues are LOW RISK to fix
- No active features depend on the unused/duplicate APIs
- Cleanup will improve code maintainability and reduce confusion
- Estimated time to cleanup: 30 minutes
