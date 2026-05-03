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
 *
 * Reference: https://nestnepal.com/blog/esewa-payment-integration-in-nodejs/
 */
export const generateEsewaSignature = (
  amount,
  transactionId,
  productCode
) => {
  const normalizedAmount = normalizeAmount(amount);
  const code = productCode || esewaConfig.merchantCode;
  const message = `total_amount=${normalizedAmount},transaction_uuid=${transactionId},product_code=${code}`;
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
  productCode = null,
  productName = "Porter Service"
) => {
  const normalizedAmount = normalizeAmount(amount);
  const code = productCode || esewaConfig.merchantCode;
  const signature = generateEsewaSignature(normalizedAmount, transactionId, code);

  return {
    amount: normalizedAmount,
    tax_amount: "0",
    total_amount: normalizedAmount,
    transaction_uuid: transactionId,
    product_code: code,
    product_name: productName,
    product_service_charge: "0",
    product_delivery_charge: "0",
    success_url: esewaConfig.successUrl,
    failure_url: esewaConfig.failureUrl,
    signed_field_names: "total_amount,transaction_uuid,product_code",
    signature,
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
 *     transaction_code: "0008040",
 *     signature: "abc123...",
 *     signed_field_names: "transaction_code,status,total_amount,..."
 *   }
 */
export const decodeEsewaResponse = (dataParam) => {
  if (!dataParam) {
    throw new Error("Missing 'data' param in eSewa callback");
  }

  try {
    const decoded = Buffer.from(dataParam, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch {
    throw new Error("Failed to decode eSewa response payload");
  }
};

/**
 * Verify eSewa signature on callback
 * Used for success/failure callback and webhook verification
 *
 * eSewa includes `signed_field_names` in the response which specifies
 * which fields were used to generate the signature. We must use the same
 * fields and order when verifying.
 */
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

  const hmac = crypto.createHmac("sha256", esewaConfig.merchantSecret);
  const generatedSignature = hmac.update(message).digest("base64");

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
