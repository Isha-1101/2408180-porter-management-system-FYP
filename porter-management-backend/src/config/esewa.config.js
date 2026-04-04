/**
 * eSewa Configuration and Integration
 * Handles payment gateway initialization and utility functions
 */

import crypto from "crypto";

export const esewaConfig = {
  merchantCode: process.env.ESEWA_MERCHANT_CODE || "EPAYTEST",
  merchantSecret: process.env.ESEWA_MERCHANT_SECRET || "8gBm/:&EnhH.1/q",
  gatewayUrl: process.env.ESEWA_GATEWAY_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
  successUrl: process.env.ESEWA_SUCCESS_URL || "http://localhost:5000/core-api/payments/esewa/success",
  failureUrl: process.env.ESEWA_FAILURE_URL || "http://localhost:5000/core-api/payments/esewa/failure",
  webhookUrl: process.env.ESEWA_WEBHOOK_URL || "http://localhost:5000/core-api/payments/esewa/webhook",
};

/**
 * Generate eSewa signature for payment request
 * Signature = md5(total_amount + transaction_uuid + product_code + merchant_code + merchant_secret)
 */
export const generateEsewaSignature = (amount, transactionId, productCode = "PORTERS") => {
  const data = `${amount}${transactionId}${productCode}${esewaConfig.merchantCode}${esewaConfig.merchantSecret}`;
  return crypto.createHash("md5").update(data).digest("hex");
};

/**
 * Generate eSewa payment form data
 */
export const generateEsewaPaymentData = (amount, transactionId, productCode = "PORTERS", productName = "Porter Service") => {
  const signature = generateEsewaSignature(amount, transactionId, productCode);

  return {
    amount: amount.toString(),
    failure_url: esewaConfig.failureUrl,
    product_code: productCode,
    product_name: productName,
    signed_field_names: "total_amount,transaction_uuid,product_code",
    signature,
    success_url: esewaConfig.successUrl,
    tax_amount: "0",
    total_amount: amount.toString(),
    transaction_uuid: transactionId,
  };
};

/**
 * Verify eSewa signature on callback
 * Used for webhook verification
 */
export const verifyEsewaSignature = (data, signature) => {
  const { total_amount, transaction_uuid, product_code } = data;
  const generatedSignature = generateEsewaSignature(total_amount, transaction_uuid, product_code);
  return generatedSignature === signature;
};

/**
 * Generate unique transaction ID
 */
export const generateTransactionId = (bookingId) => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8);
  return `BOOK_${bookingId}_${timestamp}_${random}`.substring(0, 40);
};
