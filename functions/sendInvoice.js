import nodemailer from 'nodemailer';
import { createInvoicePdfDoc } from '../src/utils/invoiceUtils';

export async function sendInvoice(req, res) {
  try {
    const { order } = req.body;
    if (!order || !order.customerEmail) {
      return res.status(400).json({ success: false, message: 'Order data or customer email missing.' });
    }
    const doc = createInvoicePdfDoc(order);
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.VITE_EMAIL_USER,
        pass: process.env.VITE_EMAIL_PASSWORD,
      },
    });
    const formattedDate = new Date(order.date.seconds ? order.date.seconds * 1000 : order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const mailOptions = {
      from: process.env.VITE_EMAIL_USER,
      to: order.customerEmail,
      subject: `Your Invoice #INV-${order.orderNumber} for Order #${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4338ca;">Your Invoice</h1>
            <p>Order #${order.orderNumber} | ${formattedDate}</p>
          </div>
          <div style="margin-bottom: 30px;">
            <p>Dear ${order.shippingAddress.firstName} ${order.shippingAddress.lastName},</p>
            <p>Thank you for your purchase. Please find attached your invoice for order #${order.orderNumber}.</p>
          </div>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h2 style="font-size: 18px; margin-top: 0;">Order Summary</h2>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Total Amount:</strong> TND ${order.total.toFixed(2)}</p>
          </div>
          <div style="margin-bottom: 30px;">
            <p>If you have any questions regarding your order or invoice, please contact our customer support.</p>
          </div>
          <div style="text-align: center; font-size: 12px; color: #6b7280; margin-top: 40px;">
            <p>This is an automated email, please do not reply directly to this message.</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `Invoice_${order.orderNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Invoice email sent successfully' });
  } catch (error) {
    console.error('[INVOICE EMAIL ERROR]', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to send invoice email' });
  }
}
