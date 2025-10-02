'use server';

import * as nodemailer from 'nodemailer';

// =============================================================================
// EMAIL SERVER ACTIONS
// =============================================================================

// Generic email sending action
export async function sendEmail(data: {
  to: string;
  subject: string;
  template: string;
  data?: Record<string, unknown>;
}) {
  // Email configuration
  const emailConfig = {
    host: process.env.SMTP_HOST || 'mail.surestrat.co.za',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'noreply@surestrat.co.za',
      pass: process.env.SMTP_PASS || 'Z@lisile0611stuli',
    },
  };

  // Create transporter
  const transporter = nodemailer.createTransport(emailConfig);

  try {
    // Generate content from template
    let htmlContent = '';
    let textContent = '';

    // Simple template handling
    if (data.template === 'order-confirmation' && data.data?.order) {
      const order = data.data.order as { id?: string; _id?: string; total?: number };
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Order Confirmation</title>
        </head>
        <body>
          <h1>Order Confirmation</h1>
          <p>Thank you for your order!</p>
          <p>Order #${order.id || order._id}</p>
          <p>Total: R${order.total?.toFixed(2) || '0.00'}</p>
        </body>
        </html>
      `;
      textContent = `Order Confirmation\nThank you for your order!\nOrder #${order.id || order._id}\nTotal: R${order.total?.toFixed(2) || '0.00'}`;
    } else if (data.template === 'welcome' && data.data?.userName) {
      const userName = data.data.userName as string;
      htmlContent = `<h1>Welcome ${userName}!</h1><p>Thank you for joining FastBite!</p>`;
      textContent = `Welcome ${userName}!\nThank you for joining FastBite!`;
    } else {
      const message = (data.data?.message as string) || 'Email content';
      htmlContent = message;
      textContent = message;
    }

    const mailOptions = {
      from: `"FastBite" <${process.env.FROM_EMAIL || 'noreply@surestrat.co.za'}>`,
      to: data.to,
      subject: data.subject,
      html: htmlContent,
      text: textContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Failed to send email");
  }
}