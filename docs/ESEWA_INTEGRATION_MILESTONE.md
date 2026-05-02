# eSewa Payment Integration - Milestone Document

## Overview

This document outlines the complete integration plan for eSewa payment gateway (sandbox mode) into the Porter Management System. Payment is initiated **after journey completion** when users choose digital payment instead of cash.

**Integration Type**: eSewa Sandbox (Developer/Test Mode)  
**Payment Timing**: Post-service (after porter marks booking as COMPLETED)  
**Gateway URL**: `https://rc-epay.esewa.com.np/api/epay/main/v2/form`

---

## Current State Analysis

### ✅ Already Implemented (From Start)
- eSewa configuration file (`src/config/esewa.config.js`)
- Payment model with eSewa fields (`esewaTxnId`, `esewaMerchantCode`)
- Payment controller with basic structure (`paymentController.js`)
- Payment routes (`/core-api/payments/*`)
- PaymentMethodSelector UI component (cash vs digital choice)
- Backend endpoints: initiate, retry, success/failure callbacks, webhook

### ✅ Now Completed
- **Backend**: Signature generation fixed (HMAC-SHA256 as per eSewa official specs)
- **Backend**: Success callback properly decodes, verifies, updates records, redirects to frontend
- **Backend**: Failure callback handles missing data gracefully, redirects to failure page
- **Backend**: Webhook endpoint enhanced with idempotent updates and logging
- **Backend**: .env.example updated with all eSewa environment variables
- **Backend**: initiatePayment endpoint reviewed and product_code fixed to use env variable
- **Frontend**: Payment service layer created (`paymentService.js`)
- **Frontend**: React Query hooks created (`paymentHooks.jsx`)
- **Frontend**: EsewaPaymentRedirect component created (auto-submits form to eSewa)
- **Frontend**: PaymentSuccess page created (displays confirmation, auto-redirects to orders)
- **Frontend**: PaymentFailure page created (retry payment, fallback to cash)
- **Frontend**: Payment routes added to UserRoutes.jsx
- **Frontend**: BookingTracking.jsx updated to trigger eSewa flow for digital payments
- **Frontend**: TeamBookingTracking.jsx updated to trigger eSewa flow for digital payments

### ❌ Still Needs Implementation
- **Testing**: End-to-end testing with eSewa sandbox
- **Testing**: Edge case testing (network failures, double-clicks, etc.)
- **Optional**: Payment status indicators in Orders page
- **Optional**: Payment history view

---

## Milestone 1: Backend Payment Gateway

### Phase 1.1: eSewa Configuration Fixes

**Task 1.1.1**: Update `esewa.config.js` to match official sandbox specs

**Current Issue**: Signature generation uses simple MD5 concatenation:
```javascript
// WRONG - Current implementation
const data = `${amount}${transactionId}${productCode}${merchantCode}${merchantSecret}`;
return crypto.createHash("md5").update(data).digest("hex");
```

**Fix Required**: Use HMAC-SHA256 as per eSewa documentation:
```javascript
// CORRECT - Official eSewa spec
const message = `total_amount=${amount},transaction_uuid=${transactionId},product_code=${productCode}`;
const hmac = crypto.createHmac("sha256", merchantSecret);
return hmac.update(message).digest("base64");
```

**Deliverables**:
- [x] Fix `generateEsewaSignature()` function
- [x] Fix `verifyEsewaSignature()` function for callback verification
- [x] Update `generateEsewaPaymentData()` to return all required fields
- [x] Add proper `product_service_charge` and `product_delivery_charge` fields (set to 0)

**Reference**: https://developer.esewa.com.np/

---

**Task 1.1.2**: Update `.env.example` with eSewa environment variables

**Deliverables**:
- [x] Add to `.env.example` (ESEWA_* variables)
- [ ] Update `.env` with actual values (if not already present)
- [ ] Document how to switch to production credentials later

---

### Phase 1.2: Callback Handlers

**Task 1.2.1**: Fix `esewaSuccessCallback` in `paymentController.js`

**Current Issue**: Callback verifies signature but redirects to wrong frontend URL format.

**Required Flow**:
```
eSewa redirects to /payments/esewa/success?data=<base64_encoded_data>
  → Decode base64 data
  → Verify signature (prevent fraud)
  → Find payment by transaction_uuid
  → Update payment.status = "confirmed"
  → Update booking.paymentStatus = "confirmed"
  → Redirect to frontend: /dashboard/payment/success?bookingId=xxx&txId=xxx
```

**Deliverables**:
- [x] Decode `data` query parameter from base64
- [x] Parse JSON: `{ transaction_code, status, total_amount, transaction_uuid, signature }`
- [x] Verify signature using `verifyEsewaSignature()`
- [x] Find payment by `esewaTxnId`
- [x] Update payment status to `confirmed` (if `status === "COMPLETE"`)
- [x] Update booking `paymentStatus` to `confirmed`
- [x] Redirect to frontend success page with booking details
- [x] Handle errors gracefully (invalid signature, payment not found)

---

**Task 1.2.2**: Fix `esewaFailureCallback` in `paymentController.js`

**Required Flow**:
```
eSewa redirects to /payments/esewa/failure?data=<base64_encoded_data>
  → Decode base64 data
  → Find payment by transaction_uuid
  → Update payment.status = "failed"
  → Store failure reason
  → Redirect to frontend: /dashboard/payment/failure?bookingId=xxx&reason=xxx
```

**Deliverables**:
- [x] Decode and parse failure data
- [x] Find payment by `esewaTxnId`
- [x] Update payment status to `failed`
- [x] Store `failureReason` (eSewa error code/message)
- [x] Update booking `paymentStatus` to `failed`
- [x] Redirect to frontend failure page with error details

---

**Task 1.2.3**: Enhance `esewaWebhook` endpoint

**Purpose**: eSewa may send server-to-server webhook notifications for payment status updates.

**Deliverables**:
- [x] Verify webhook signature
- [x] Handle idempotent updates (prevent double-processing if callback already handled)
- [x] Update payment status based on webhook data
- [x] Return `200 OK` with proper response format for eSewa
- [x] Log webhook events for debugging

---

### Phase 1.3: Payment Initiation Endpoint

**Task 1.3.1**: Review and fix `initiatePayment` endpoint

**Current State**: Already implemented but needs verification.

**Expected Request**:
```json
POST /core-api/payments/initiate
{
  "bookingId": "64f123...",
  "paymentMethod": "digital"
}
```

**Expected Response (Digital)**:
```json
{
  "success": true,
  "message": "Payment initiated successfully",
  "data": {
    "paymentId": "64f456...",
    "esewaData": {
      "amount": "150",
      "total_amount": "150",
      "transaction_uuid": "BOOK_64f123_1234567890_abc123",
      "product_code": "EPAYTEST",
      "product_service_charge": "0",
      "product_delivery_charge": "0",
      "success_url": "http://localhost:5000/core-api/payments/esewa/success",
      "failure_url": "http://localhost:5000/core-api/payments/esewa/failure",
      "signed_field_names": "total_amount,transaction_uuid,product_code",
      "signature": "base64_encoded_signature"
    },
    "gatewayUrl": "https://rc-epay.esewa.com.np/api/epay/main/v2/form"
  }
}
```

**Deliverables**:
- [x] Verify response format matches eSewa requirements
- [x] Ensure `transaction_uuid` is unique (use timestamp + random)
- [x] Validate booking exists and belongs to user
- [x] Prevent duplicate payments (check existing payment status)
- [x] Create Payment record before returning eSewa data

---

## Milestone 2: Frontend Payment Integration

### Phase 2.1: Payment Services & Hooks

**Task 2.1.1**: Create `paymentService.js`

**Location**: `porter-management-frontend/src/apis/services/paymentService.js`

**Functions**:
```javascript
// Initiate payment (cash or digital)
export const initiatePaymentService = ({ bookingId, paymentMethod })

// Get payment details by booking ID
export const getPaymentByBookingService = (bookingId)

// Retry failed eSewa payment
export const retryEsewaPaymentService = (paymentId)

// Get user payment history
export const getUserPaymentHistoryService = (userId, params)
```

**Deliverables**:
- [x] Create service file with all payment API calls
- [x] Use `axiosInstance` for authenticated requests
- [x] Handle error responses properly

---

**Task 2.1.2**: Create `paymentHooks.jsx`

**Location**: `porter-management-frontend/src/apis/hooks/paymentHooks.jsx`

**Hooks**:
```javascript
// Mutation: Initiate payment
export const useInitiatePayment()

// Query: Get payment by booking ID
export const useGetPaymentByBooking(bookingId)

// Mutation: Retry eSewa payment
export const useRetryEsewaPayment()

// Query: Get user payment history
export const useGetUserPaymentHistory(userId, params)
```

**Deliverables**:
- [x] Create hooks file with React Query mutations/queries
- [x] Add toast notifications for success/error
- [x] Invalidate relevant queries on mutation success
- [x] Handle loading states

---

### Phase 2.2: Payment UI Components

**Task 2.2.1**: Create `EsewaPaymentRedirect.jsx`

**Location**: `porter-management-frontend/src/components/payment/EsewaPaymentRedirect.jsx`

**Purpose**: Auto-submit hidden form to eSewa gateway URL.

**Behavior**:
1. Component receives eSewa form data via location state or URL params
2. Renders hidden form with all required fields
3. Auto-submits form on mount (redirects user to eSewa payment page)
4. Shows loading spinner while redirecting
5. Handles missing data gracefully

**Implementation**:
```jsx
<form action={gatewayUrl} method="POST" id="esewa-payment-form">
  <input type="hidden" name="amount" value={esewaData.amount} />
  <input type="hidden" name="tax_amount" value="0" />
  <input type="hidden" name="total_amount" value={esewaData.total_amount} />
  <input type="hidden" name="transaction_uuid" value={esewaData.transaction_uuid} />
  <input type="hidden" name="product_code" value={esewaData.product_code} />
  <input type="hidden" name="product_service_charge" value="0" />
  <input type="hidden" name="product_delivery_charge" value="0" />
  <input type="hidden" name="success_url" value={esewaData.success_url} />
  <input type="hidden" name="failure_url" value={esewaData.failure_url} />
  <input type="hidden" name="signed_field_names" value="total_amount,transaction_uuid,product_code" />
  <input type="hidden" name="signature" value={esewaData.signature} />
</form>
```

**Deliverables**:
- [x] Create component with auto-submit logic
- [x] Add loading state UI
- [x] Handle error case (missing form data)
- [x] Use `useEffect` to trigger form submission on mount

---

**Task 2.2.2**: Update `PaymentMethodSelector.jsx`

**Current State**: Only saves payment method choice and redirects to orders page.

**Required Changes**:
```
User selects "Cash" → Save method → Redirect to orders (existing flow)
User selects "eSewa (Digital)" → Call initiatePayment API → Redirect to EsewaPaymentRedirect
```

**Deliverables**:
- [ ] Import `useInitiatePayment` hook
- [ ] Update `handleConfirm` for digital payments:
  - Call `initiatePayment({ bookingId, paymentMethod: "digital" })`
  - On success: Navigate to `/dashboard/payment/esewa-redirect` with form data
  - On error: Show toast error message
- [ ] Keep cash payment flow unchanged
- [ ] Add loading state during API call
- [ ] Disable form while processing

---

**Task 2.2.3**: Create `PaymentSuccess.jsx`

**Location**: `porter-management-frontend/src/pages/dashboard/user/PaymentSuccess.jsx`

**Purpose**: Display payment success confirmation after eSewa redirect.

**Features**:
- Success animation/icon
- Transaction details (transaction code, amount, booking ID)
- Booking summary
- "View My Orders" button (redirects to orders with rating prompt)
- Auto-redirect to orders after 10 seconds (optional)

**Data Source**: URL query params or backend redirect data:
```
/dashboard/payment/success?bookingId=xxx&transactionCode=xxx&amount=xxx
```

**Deliverables**:
- [x] Create page component
- [x] Fetch booking/payment details if needed
- [x] Display success message with transaction info
- [x] Add navigation buttons
- [x] Add auto-redirect to orders after 10 seconds with rating prompt

---

**Task 2.2.4**: Create `PaymentFailure.jsx`

**Location**: `porter-management-frontend/src/pages/dashboard/user/PaymentFailure.jsx`

**Purpose**: Display payment failure message with retry options.

**Features**:
- Failure icon/message
- Error details (if available)
- "Retry Payment" button (calls retry API, redirects to eSewa)
- "Pay with Cash" fallback button (updates payment method to cash)
- "View My Orders" button

**Data Source**: URL query params:
```
/dashboard/payment/failure?bookingId=xxx&reason=xxx
```

**Deliverables**:
- [x] Create page component
- [x] Display failure message with error details
- [x] Implement retry payment flow
- [x] Implement fallback to cash payment
- [x] Add navigation buttons

---

### Phase 2.3: Routing & Integration

**Task 2.3.1**: Add payment routes to `UserRoutes.jsx`

**Location**: `porter-management-frontend/src/Routes/UserRoutes.jsx`

**Routes to Add**:
```javascript
{
  path: "payment",
  children: [
    {
      path: "success",
      element: <PaymentSuccess />,
    },
    {
      path: "failure",
      element: <PaymentFailure />,
    },
    {
      path: "esewa-redirect",
      element: <EsewaPaymentRedirect />,
    },
  ],
}
```

**Deliverables**:
- [x] Import new payment page components
- [x] Add route definitions
- [ ] Test route navigation

---

**Task 2.3.2**: Update `BookingTracking.jsx`

**Location**: `porter-management-frontend/src/pages/dashboard/user/BookingTracking.jsx`

**Current Issue**: `handlePaymentMethodSelect` just saves method and redirects to orders.

**Required Changes**:
```javascript
const handlePaymentMethodSelect = async (paymentMethod) => {
  if (paymentMethod === "cash") {
    // Existing flow: save method → redirect to orders
    await axiosInstance.post(`/bookings/individual/${bookingId}/update-payment-method`, { paymentMethod });
    navigate("/dashboard/orders", { state: { promptRatingFor: ... } });
  } else if (paymentMethod === "digital") {
    // NEW flow: initiate payment → redirect to eSewa
    const response = await initiatePayment({ bookingId, paymentMethod: "digital" });
    navigate("/dashboard/payment/esewa-redirect", {
      state: {
        esewaData: response.data.esewaData,
        gatewayUrl: response.data.gatewayUrl,
        bookingId,
      },
    });
  }
};
```

**Deliverables**:
- [x] Import `useInitiatePayment` hook
- [x] Update `handlePaymentMethodSelect` to handle digital payments
- [x] Pass eSewa form data via navigation state
- [ ] Test complete flow on BookingTracking page

---

**Task 2.3.3**: Update `TeamBookingTracking.jsx`

**Location**: `porter-management-frontend/src/pages/dashboard/user/TeamBookingTracking.jsx`

**Required Changes**: Same as `BookingTracking.jsx` — update `handlePaymentMethodSelect` to trigger eSewa payment for digital option.

**Deliverables**:
- [x] Import `useInitiatePayment` hook
- [x] Update `handlePaymentMethodSelect` for team bookings
- [ ] Test complete flow on TeamBookingTracking page

---

## Milestone 3: Testing & Polish

### Phase 3.1: End-to-End Testing

**Task 3.1.1**: Test complete payment flow with eSewa sandbox

**Test Scenarios**:

| # | Scenario | Expected Result |
|---|----------|-----------------|
| 1 | Complete booking → Select eSewa → Pay successfully | Payment confirmed, booking updated, redirected to success page |
| 2 | Complete booking → Select eSewa → Cancel on eSewa | Payment failed, redirected to failure page, can retry |
| 3 | Complete booking → Select eSewa → Insufficient funds | Payment failed, error shown, can retry or switch to cash |
| 4 | Failed payment → Click "Retry Payment" | New transaction generated, redirected to eSewa again |
| 5 | Failed payment → Click "Pay with Cash" | Payment method updated to cash, redirected to orders |
| 6 | Complete booking → Select Cash | Payment method saved, redirected to orders (existing flow) |
| 7 | Duplicate payment attempt | Prevented by backend validation |

**eSewa Sandbox Test Credentials**:
- Get test accounts from: https://developer.esewa.com.np/
- Use sandbox mobile number and PIN for testing
- Test with various amounts (NPR 1, NPR 100, NPR 1000)

**Deliverables**:
- [ ] Test all scenarios listed above
- [ ] Document any issues found
- [ ] Fix bugs identified during testing
- [ ] Verify payment records in database
- [ ] Verify booking status updates correctly

---

**Task 3.1.2**: Test edge cases

**Edge Cases**:
- Network failure during eSewa redirect
- User closes browser during payment (webhook should still update)
- Double-click on payment button (prevent duplicate submissions)
- Payment status sync if webhook arrives before user returns
- Booking already paid (prevent duplicate payment)
- Invalid signature in callback (security test)

**Deliverables**:
- [ ] Test all edge cases
- [ ] Add error boundaries where needed
- [ ] Ensure idempotent operations
- [ ] Add logging for debugging

---

### Phase 3.2: UI/UX Improvements

**Task 3.2.1**: Add loading states and error handling

**Deliverables**:
- [ ] Loading spinners during API calls
- [ ] Error messages for network failures
- [ ] Retry buttons for failed operations
- [ ] Skeleton loaders for payment details

---

**Task 3.2.2**: Add payment status indicators in Orders page

**Location**: `porter-management-frontend/src/pages/dashboard/user/Orders.jsx`

**Deliverables**:
- [ ] Show payment status badge on each booking (Pending, Confirmed, Failed)
- [ ] Differentiate cash vs digital payments visually
- [ ] Add "Pay Now" button for completed bookings with pending payment

---

**Task 3.2.3**: Add payment history view (Optional Enhancement)

**Deliverables**:
- [ ] Create payment history page (uses `/payments/user/:userId/history`)
- [ ] Show all transactions with status, method, amount
- [ ] Add filters (status, date range, method)
- [ ] Link to booking details from payment history

---

## Technical Reference

### eSewa Sandbox Configuration

| Parameter | Value |
|-----------|-------|
| Merchant Code | `EPAYTEST` |
| Merchant Secret | `8gBm/:&EnhH.1/q` |
| Gateway URL | `https://rc-epay.esewa.com.np/api/epay/main/v2/form` |
| Signature Method | HMAC-SHA256 (base64 encoded) |
| Signed Fields | `total_amount,transaction_uuid,product_code` |

### API Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/core-api/payments/initiate` | ✅ | Initiate payment (cash/digital) |
| GET | `/core-api/payments/:bookingId` | ✅ | Get payment details |
| POST | `/core-api/payments/:paymentId/retry-esewa` | ✅ | Retry failed eSewa payment |
| GET | `/core-api/payments/esewa/success` | ❌ | eSewa success callback |
| GET | `/core-api/payments/esewa/failure` | ❌ | eSewa failure callback |
| POST | `/core-api/payments/esewa/webhook` | ❌ | eSewa webhook handler |
| GET | `/core-api/payments/user/:userId/history` | ✅ | User payment history |

### Payment Status Flow

```
Booking COMPLETED
  → User selects payment method
    → Cash: status = "pending" → Admin verifies → "verified"
    → Digital: status = "pending" → User pays on eSewa
      → Success: status = "confirmed"
      → Failure: status = "failed" → User retries → "pending" → ...
```

### Required Form Fields for eSewa

| Field | Description | Example |
|-------|-------------|---------|
| `amount` | Product/service amount | `150` |
| `tax_amount` | Tax amount | `0` |
| `total_amount` | Total (amount + tax + charges) | `150` |
| `transaction_uuid` | Unique transaction ID | `BOOK_64f123_1234567890_abc` |
| `product_code` | Merchant code | `EPAYTEST` |
| `product_service_charge` | Service charge | `0` |
| `product_delivery_charge` | Delivery charge | `0` |
| `success_url` | Success callback URL | `http://localhost:5000/.../success` |
| `failure_url` | Failure callback URL | `http://localhost:5000/.../failure` |
| `signed_field_names` | Fields used in signature | `total_amount,transaction_uuid,product_code` |
| `signature` | HMAC-SHA256 signature | `base64_encoded_signature` |

---

## File Structure Changes

### Backend (porter-management-backend)

```
src/
├── config/
│   └── esewa.config.js              # ✅ UPDATE - Fix signature generation
├── controllers/
│   └── paymentController.js         # ✅ UPDATE - Fix callbacks
├── models/
│   └── Payment.js                   # ✅ NO CHANGE - Already has eSewa fields
├── routes/
│   └── paymentRoutes.js             # ✅ NO CHANGE - Routes already defined
└── .env.example                     # ✅ UPDATE - Add eSewa env vars
```

### Frontend (porter-management-frontend)

```
src/
├── apis/
│   ├── services/
│   │   └── paymentService.js        # 🆕 CREATE - Payment API functions
│   └── hooks/
│       └── paymentHooks.jsx         # 🆕 CREATE - React Query hooks
├── components/
│   ├── PaymentMethodSelector.jsx    # ✅ UPDATE - Handle digital payment flow
│   └── payment/
│       └── EsewaPaymentRedirect.jsx # 🆕 CREATE - Auto-submit form to eSewa
├── pages/
│   └── dashboard/user/
│       ├── PaymentSuccess.jsx       # 🆕 CREATE - Payment success page
│       ├── PaymentFailure.jsx       # 🆕 CREATE - Payment failure page
│       ├── BookingTracking.jsx      # ✅ UPDATE - Use new payment flow
│       └── TeamBookingTracking.jsx  # ✅ UPDATE - Use new payment flow
└── Routes/
    └── UserRoutes.jsx               # ✅ UPDATE - Add payment routes
```

---

## Completion Status

**Last Updated**: 2026-05-02  
**Overall Progress**: ~85% Complete

### Milestone 1: Backend Payment Gateway ✅ COMPLETED (100%)
- [x] Phase 1.1: eSewa Configuration Fixes
- [x] Phase 1.2: Callback Handlers
- [x] Phase 1.3: Payment Initiation Endpoint

### Milestone 2: Frontend Payment Integration ✅ COMPLETED (100%)
- [x] Phase 2.1: Payment Services & Hooks
- [x] Phase 2.2: EsewaPaymentRedirect Component
- [x] Phase 2.2: PaymentSuccess Page
- [x] Phase 2.2: PaymentFailure Page
- [x] Phase 2.3: Routing & Integration
- [x] Phase 2.3: Update BookingTracking
- [x] Phase 2.3: Update TeamBookingTracking

### Milestone 3: Testing & Polish ❌ PENDING (0%)
- [ ] Phase 3.1: End-to-End Testing
- [ ] Phase 3.2: UI/UX Improvements

---

## Implementation Progress

### ✅ Week 1: Backend Foundation (COMPLETED)
1. [x] Fix eSewa signature generation (Task 1.1.1)
2. [x] Update .env.example (Task 1.1.2)
3. [x] Fix success callback (Task 1.2.1)
4. [x] Fix failure callback (Task 1.2.2)
5. [x] Enhance webhook endpoint (Task 1.2.3)
6. [x] Review initiatePayment endpoint (Task 1.3.1)

### ✅ Week 2: Frontend Integration (COMPLETED)
7. [x] Create payment service (Task 2.1.1)
8. [x] Create payment hooks (Task 2.1.2)
9. [x] Create EsewaPaymentRedirect component (Task 2.2.1)
10. [ ] Update PaymentMethodSelector (Task 2.2.2) - *Not needed - flow handled in tracking pages*
11. [x] Create PaymentSuccess page (Task 2.2.3)
12. [x] Create PaymentFailure page (Task 2.2.4)

### ✅ Week 3: Routing & Integration (COMPLETED)
13. [x] Add payment routes (Task 2.3.1)
14. [x] Update BookingTracking (Task 2.3.2)
15. [x] Update TeamBookingTracking (Task 2.3.3)

### 🔄 Week 4: Testing & Polish (PENDING)
16. [ ] Test complete payment flow (Task 3.1.1)
17. [ ] Test edge cases (Task 3.1.2)
18. [ ] Add loading states (Task 3.2.1)
19. [ ] Add payment status in Orders (Task 3.2.2)
20. [ ] Optional: Payment history page (Task 3.2.3)

---

## Success Criteria

- ✅ User can complete a booking and choose eSewa payment
- ✅ User is redirected to eSewa sandbox payment page
- ✅ Successful payment updates booking and payment status
- ✅ Failed payment allows retry or fallback to cash
- ✅ All callbacks are signature-verified (security)
- ✅ Payment records are created and tracked correctly
- ✅ UI shows appropriate success/failure messages
- ✅ Orders page reflects payment status
- ✅ No duplicate payments possible
- ✅ All edge cases handled gracefully

---

## References

- eSewa Developer Portal: https://developer.esewa.com.np/
- eSewa Integration Guide: https://nestnepal.com/blog/esewa-payment-integration-in-nodejs/
- eSewa API Documentation: https://developer.esewa.com.np/#/api

---

**Last Updated**: 2026-05-02  
**Status**: Ready for Implementation  
**Priority**: High
