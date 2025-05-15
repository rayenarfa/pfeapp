// This file has been intentionally emptied.
// Email sending functionality has been removed from the application.

import emailjs from "@emailjs/browser";
import { Order } from "../types/OrderTypes";
import { auth } from "../config/firebase/firebaseConfig";

// EmailJS service ID, template ID, and public key from environment variables
// Create these in the EmailJS dashboard (https://dashboard.emailjs.com)
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID; // EmailJS service ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID; // EmailJS template ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY; // EmailJS public key

// Check if all keys are available to prevent runtime errors
if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
  console.error('EmailJS configuration is missing. Check your .env.local file.');
}

/**
 * Formats the purchased gift card keys into a readable email format
 * For EmailJS template variables
 *
 * @param order The order containing gift card keys
 * @returns A formatted data object for the EmailJS template
 */
export const formatEmailData = (order: Order, recipientEmail?: string) => {
  // Format items into a string for the email template
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
          <strong>${item.name}</strong><br>
          ${item.brand} - ${item.category}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">
          TND ${item.price.toFixed(2)}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-weight: bold; font-size: 16px; text-align: center; background-color: #f7fafc;">
          ${item.giftCardKey}
        </td>
      </tr>
    `
    )
    .join("");

  // Get recipient name from the shipping address
  const recipientName = `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`;

  // Set the email to send to - either the provided recipient email or the order customer email
  const toEmail = recipientEmail || order.customerEmail;

  // Return an object with template parameters for EmailJS
  return {
    to_email: toEmail,
    to_name: recipientName,
    order_number: order.orderNumber,
    order_date: order.date.toDate().toLocaleDateString(),
    order_total: order.total.toFixed(2),
    items_html: itemsHtml,
    is_gift: !!recipientEmail, // Flag if this is a gift email (recipient different from buyer)
  };
};

/**
 * Result interface for email operations
 */
interface EmailResult {
  success: boolean;
  message: string;
}

/**
 * Send an email with gift card keys using EmailJS
 * If the shipping email is different from the user's email, send to both
 *
 * @param order The order containing gift card keys
 * @returns Promise that resolves when the email(s) are sent
 */
export const sendGiftCardEmail = async (order: Order): Promise<EmailResult> => {
  console.log(
    `[EMAIL SYSTEM] Preparing gift card notification for ${order.customerEmail}...`
  );

  try {
    const currentUser = auth.currentUser;
    const buyerEmail = currentUser?.email;

    // If buyer email exists and is different from shipping email, send to both
    const isSendingToMultipleRecipients =
      buyerEmail &&
      buyerEmail !== order.shippingAddress.email &&
      order.shippingAddress.email !== order.customerEmail;

    // First send to the recipient (the shipping address email)
    const recipientEmailData = formatEmailData(order);
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, recipientEmailData, PUBLIC_KEY);

    // If needed, also send a copy to the buyer
    if (isSendingToMultipleRecipients && buyerEmail) {
      console.log(`[EMAIL SYSTEM] Also sending copy to buyer (${buyerEmail})`);

      // Create a special version for the buyer
      const buyerEmailData = formatEmailData(order, buyerEmail);
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, buyerEmailData, PUBLIC_KEY);
    }

    console.log("[EMAIL SYSTEM] Email notification(s) sent successfully");

    return {
      success: true,
      message: `Email notification(s) sent successfully`,
    };
  } catch (error) {
    console.error("[EMAIL SYSTEM] Failed to send email notification:", error);
    return {
      success: false,
      message: `Failed to send email: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};
