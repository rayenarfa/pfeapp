// Email service for the application using Nodemailer
import { Order } from "../types/OrderTypes";

/**
 * Result interface for email operations
 */
export interface EmailResult {
  success: boolean;
  message: string;
}

/**
 * Call the Express backend to send an invoice email for the given order.
 * Use this for manual invoice sending from UI buttons.
 * 
 * @param order The order to generate the invoice for
 * @returns Promise that resolves when the backend responds
 */
export const sendInvoiceEmail = async (order: Order): Promise<{ success: boolean; message: string }> => {
  try {
    // Using the full URL to the Express server
    const response = await fetch('http://localhost:3001/api/send-invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ order }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Send an order confirmation email with invoice PDF attachment via Nodemailer.
 * Use this when an order is first created for automatic confirmation.
 * 
 * @param order The newly created order
 * @returns Promise that resolves with the success status
 */
export const sendOrderConfirmationEmail = async (order: Order): Promise<EmailResult> => {
  console.log(
    `[EMAIL SYSTEM] Sending order confirmation and invoice to ${order.customerEmail}...`
  );
  
  try {
    // Call our Nodemailer API endpoint
    const response = await fetch('http://localhost:3001/api/send-invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        order,
        subject: `Your SharePay Order Confirmation #${order.orderNumber}` // Custom subject
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log("[EMAIL SYSTEM] Order confirmation email sent successfully");
      return {
        success: true,
        message: `Order confirmation email sent successfully`,
      };
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error("[EMAIL SYSTEM] Failed to send order confirmation email:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
