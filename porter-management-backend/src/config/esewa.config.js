// /**
//  * eSewa Configuration and Integration
//  * Handles payment gateway initialization and utility functions
//  * 
//  * Sandbox Credentials:
//  * - Merchant Code: EPAYTEST
//  * - Merchant Secret: 8gBm/:&EnhH.1/q
//  * - Gateway URL: https://rc-epay.esewa.com.np/api/epay/main/v2/form
//  * 
//  * Reference: https://developer.esewa.com.np/
//  */

// import crypto from "crypto";

// export const esewaConfig = {
//   merchantCode: process.env.ESEWA_MERCHANT_CODE || "EPAYTEST",
//   merchantSecret: process.env.ESEWA_MERCHANT_SECRET || "8gBm/:&EnhH.1/q",
//   gatewayUrl: process.env.ESEWA_GATEWAY_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
//   successUrl: process.env.ESEWA_SUCCESS_URL || "http://localhost:5000/core-api/payments/esewa/success",
//   failureUrl: process.env.ESEWA_FAILURE_URL || "http://localhost:5000/core-api/payments/esewa/failure",
//   webhookUrl: process.env.ESEWA_WEBHOOK_URL || "http://localhost:5000/core-api/payments/esewa/webhook",
// };

// /**
//  * Generate eSewa signature for payment request
//  * Uses HMAC-SHA256 as per eSewa official specification
//  * 
//  * Signature = HMAC-SHA256(
//  *   "total_amount={amount},transaction_uuid={uuid},product_code={code}",
//  *   merchant_secret
//  * ) base64 encoded
//  */
// export const generateEsewaSignature = (amount, transactionId, productCode = "EPAYTEST") => {
//   const message = `total_amount=${amount},transaction_uuid=${transactionId},product_code=${productCode}`;
//   const hmac = crypto.createHmac("sha256", esewaConfig.merchantSecret);
//   const signature = hmac.update(message).digest("base64");
//   return signature;
// };

// /**
//  * Generate eSewa payment form data
//  * Returns all required fields for eSewa payment form submission
//  */
// export const generateEsewaPaymentData = (amount, transactionId, productCode = "EPAYTEST", productName = "Porter Service") => {
//   console.log({ amount, transactionId, productCode })
//   const signature = generateEsewaSignature(amount, transactionId, productCode);
//   console.log({ signature })
//   return {
//     amount: amount.toString(),
//     failure_url: esewaConfig.failureUrl,
//     product_code: productCode,
//     product_name: productName,
//     product_service_charge: "0",
//     product_delivery_charge: "0",
//     signed_field_names: "total_amount,transaction_uuid,product_code",
//     signature,
//     success_url: esewaConfig.successUrl,
//     tax_amount: "0",
//     total_amount: amount.toString(),
//     transaction_uuid: transactionId,
//   };
// };

// /**
//  * Verify eSewa signature on callback
//  * Used for success/failure callback and webhook verification
//  * 
//  * eSewa sends signature in the response data
//  * We regenerate signature from the response fields and compare
//  */
// export const verifyEsewaSignature = (responseData, signature) => {
//   const { total_amount, transaction_uuid, product_code } = responseData;
//   console.log({ total_amount, transaction_uuid, product_code })

//   const generatedSignature = generateEsewaSignature(total_amount, transaction_uuid, product_code);
//   console.log({ generatedSignature, signature })
//   console.log(generatedSignature === signature)
//   return generatedSignature === signature;

// };

// /**
//  * Generate unique transaction ID
//  * Format: BOOK_{bookingId}_{timestamp}_{random}
//  * Max length: 40 characters (eSewa limit)
//  */
// export const generateTransactionId = (bookingId) => {
//   const timestamp = Date.now().toString();
//   const random = Math.random().toString(36).substring(2, 8);
//   return `BOOK_${bookingId}_${timestamp}_${random}`.substring(0, 40);
// };




/**
 * eSewa Configuration and Integration
 * Handles payment gateway initialization and utility functions
 *
 * Sandbox Credentials:
 * - Merchant Code: EPAYTEST
 * - Merchant Secret: 8gBm/:&EnhH.1/q
 * - Gateway URL: https://rc-epay.esewa.com.np/api/epay/main/v2/form
 *
 * Reference: https://developer.esewa.com.np/
 */

import crypto from "crypto";

export const esewaConfig = {
  merchantCode: process.env.ESEWA_MERCHANT_CODE || "EPAYTEST",
  merchantSecret: process.env.ESEWA_MERCHANT_SECRET || "8gBm/:&EnhH.1/q",
  gatewayUrl:
    process.env.ESEWA_GATEWAY_URL ||
    "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
  successUrl:
    process.env.ESEWA_SUCCESS_URL ||
    "http://localhost:5000/core-api/payments/esewa/success",
  failureUrl:
    process.env.ESEWA_FAILURE_URL ||
    "http://localhost:5000/core-api/payments/esewa/failure",
  webhookUrl:
    process.env.ESEWA_WEBHOOK_URL ||
    "http://localhost:5000/core-api/payments/esewa/webhook",
};

/**
 * Normalize amount string
 * eSewa returns amounts formatted with commas (e.g. "1,000.0")
 * This strips commas so signature generation is consistent
 */
const normalizeAmount = (amount) =>
  amount.toString().replace(/,/g, "");

/**
 * Generate eSewa signature for payment request
 * Uses HMAC-SHA256 as per eSewa official specification
 *
 * Signature = HMAC-SHA256(
 *   "total_amount={amount},transaction_uuid={uuid},product_code={code}",
 *   merchant_secret
 * ) base64 encoded
 */
export const generateEsewaSignature = (
  amount,
  transactionId,
  productCode = "EPAYTEST"
) => {
  const normalizedAmount = normalizeAmount(amount);
  const message = `total_amount=${normalizedAmount},transaction_uuid=${transactionId},product_code=${productCode}`;
  const hmac = crypto.createHmac("sha256", esewaConfig.merchantSecret);
  const signature = hmac.update(message).digest("base64");
  return signature;
};

/**
 * Generate eSewa payment form data
 * Returns all required fields for eSewa payment form submission
 */
export const generateEsewaPaymentData = (
  amount,
  transactionId,
  productCode = "EPAYTEST",
  productName = "Porter Service"
) => {
  const normalizedAmount = normalizeAmount(amount);
  const signature = generateEsewaSignature(normalizedAmount, transactionId, productCode);

  return {
    amount: normalizedAmount,
    failure_url: esewaConfig.failureUrl,
    product_code: productCode,
    product_name: productName,
    product_service_charge: "0",
    product_delivery_charge: "0",
    signed_field_names: "total_amount,transaction_uuid,product_code",
    signature,
    success_url: esewaConfig.successUrl,
    tax_amount: "0",
    total_amount: normalizedAmount,
    transaction_uuid: transactionId,
  };
};

/**
 * Decode eSewa callback response
 *
 * eSewa encodes the entire response payload as a base64 JSON string
 * in the `data` query parameter on both success and failure callbacks.
 *
 * Example callback URL:
 *   /esewa/success?data=eyJ0b3RhbF9hbW91bnQiOiIxLDAwMC4wIiwgLi4ufQ==
 *
 * Decoded JSON shape:
 *   {
 *     total_amount: "1,000.0",
 *     transaction_uuid: "BOOK_123_...",
 *     product_code: "EPAYTEST",
 *     status: "COMPLETE",
 *     signature: "abc123...",
 *     ...
 *   }
 */
export const decodeEsewaResponse = (req) => {
  const { data } = req.query;

  if (!data) {
    throw new Error("Missing 'data' param in eSewa callback");
  }

  try {
    const decoded = Buffer.from(data, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch {
    throw new Error("Failed to decode eSewa response payload");
  }
};

/**
 * Verify eSewa signature on callback
 * Used for success/failure callback and webhook verification
 *
 * FIX: eSewa returns total_amount formatted with commas e.g. "1,000.0"
 * We normalize it before regenerating the signature so it matches
 * the value we originally signed during payment initiation.
 */
// export const verifyEsewaSignature = (responseData, signature) => {
//   const { total_amount, transaction_uuid, product_code } = responseData;
//   console.log("[eSewa] Full responseData:", JSON.stringify(responseData, null, 2));


//   console.log("[eSewa] Fields used:");
//   console.log("  total_amount    :", JSON.stringify(total_amount));
//   console.log("  transaction_uuid:", JSON.stringify(transaction_uuid));
//   console.log("  product_code    :", JSON.stringify(product_code));


//   // Normalize: strip commas eSewa adds to formatted amounts
//   const normalizedAmount = normalizeAmount(total_amount);

//   const message = `total_amount=${normalizedAmount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;

//   console.log("[eSewa] Verifying signature for message:", message);

//   const generatedSignature = generateEsewaSignature(
//     normalizedAmount,
//     transaction_uuid,
//     product_code
//   );

//   const isValid = generatedSignature === signature;
//   console.log("[eSewa] Generated:", generatedSignature);
//   console.log("[eSewa] Received: ", signature);
//   console.log("[eSewa] Match:    ", isValid);

//   return isValid;
// };


export const verifyEsewaSignature = (responseData, signature) => {
  const { signed_field_names } = responseData;

  if (!signed_field_names) {
    console.error("[eSewa] No signed_field_names in response");
    return false;
  }

  // Build message from exactly the fields eSewa specifies, in that order
  const message = signed_field_names
    .split(",")
    .map((field) => `${field}=${responseData[field]}`)
    .join(",");

  console.log("[eSewa] signed_field_names:", signed_field_names);
  console.log("[eSewa] Exact message string:", message);

  const hmac = crypto.createHmac("sha256", esewaConfig.merchantSecret);
  const generatedSignature = hmac.update(message).digest("base64");

  console.log("[eSewa] Generated:", generatedSignature);
  console.log("[eSewa] Received: ", signature);
  console.log("[eSewa] Match:    ", generatedSignature === signature);

  return generatedSignature === signature;
};

/**
 * Generate unique transaction ID
 * Format: BOOK_{bookingId}_{timestamp}_{random}
 * Max length: 40 characters (eSewa limit)
 */
export const generateTransactionId = (bookingId) => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8);
  return `BOOK_${bookingId}_${timestamp}_${random}`.substring(0, 40);
};
