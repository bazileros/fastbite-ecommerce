const nodemailer = require('nodemailer');

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'mail.surestrat.co.za',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'noreply@surestrat.co.za',
    pass: process.env.SMTP_PASS || 'Z@lisile0611stuli',
  },
};

// Create transporter
const transporter = nodemailer.createTransporter(emailConfig);

// Type definitions
interface OrderItem {
  meal?: { name: string };
  quantity: number;
  totalPrice?: number;
}

interface Order {
  id?: string;
  _id?: string;
  items?: OrderItem[];
  total?: number;
  pickupTime?: string;
  specialInstructions?: string;
}

interface EmailTemplateData {
  order?: Order;
  resetLink?: string;
  userName?: string;
  newRole?: string;
}

// Validate email configuration
export function validateEmailConfig() {
  const { host, auth } = emailConfig;

  if (!host) {
    throw new Error('SMTP_HOST is not configured');
  }
  if (!auth.user || !auth.pass) {
    throw new Error('SMTP credentials are not configured');
  }
}

// Test email connection
export async function testEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Email connection test failed:', error);
    return false;
  }
}

// Send email function
export async function sendEmail(options: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  template?: string;
  data?: EmailTemplateData;
}): Promise<void> {
  try {
    validateEmailConfig();

    let htmlContent = options.html;
    let textContent = options.text;

    // If template is provided, generate content from template
    if (options.template && options.data) {
      const templateResult = generateEmailFromTemplate(options.template, options.data);
      htmlContent = templateResult.html;
      textContent = templateResult.text;
    }

    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'FastBite'}" <${process.env.FROM_EMAIL || 'noreply@surestrat.co.za'}>`,
      to: options.to,
      subject: options.subject,
      html: htmlContent,
      text: textContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);

  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Email sending failed');
  }
}

// Generate email content from template
function generateEmailFromTemplate(template: string, data: EmailTemplateData): { html: string; text: string } {
  switch (template) {
    case 'order-confirmation':
      if (!data.order) throw new Error('Order data is required for order-confirmation template');
      return generateOrderConfirmationEmail(data.order);
    case 'password-reset':
      if (!data.resetLink) throw new Error('Reset link is required for password-reset template');
      return generatePasswordResetEmail(data.resetLink);
    case 'welcome':
      if (!data.userName) throw new Error('User name is required for welcome template');
      return generateWelcomeEmail(data.userName);
    case 'role-change':
      if (!data.userName || !data.newRole) throw new Error('User name and new role are required for role-change template');
      return generateRoleChangeEmail(data.userName, data.newRole);
    default:
      throw new Error(`Unknown email template: ${template}`);
  }
}

// Order confirmation email template
function generateOrderConfirmationEmail(order: Order): { html: string; text: string } {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; text-align: center; }
        .order-details { margin: 20px 0; }
        .item { border-bottom: 1px solid #eee; padding: 10px 0; }
        .total { font-weight: bold; font-size: 18px; margin-top: 20px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmation</h1>
          <p>Thank you for your order!</p>
        </div>

        <div class="order-details">
          <h2>Order #${order.id || order._id}</h2>

          <div class="items">
            ${order.items?.map((item: OrderItem) => `
              <div class="item">
                <strong>${item.meal?.name || 'Unknown Item'}</strong><br>
                Quantity: ${item.quantity}<br>
                Price: R${item.totalPrice?.toFixed(2) || '0.00'}
              </div>
            `).join('') || ''}
          </div>

          <div class="total">
            Total: R${order.total?.toFixed(2) || '0.00'}
          </div>

          ${order.pickupTime ? `<p><strong>Pickup Time:</strong> ${order.pickupTime}</p>` : ''}
          ${order.specialInstructions ? `<p><strong>Special Instructions:</strong> ${order.specialInstructions}</p>` : ''}
        </div>

        <div class="footer">
          <p>If you have any questions, please contact us at ${process.env.FROM_EMAIL || 'noreply@surestrat.co.za'}</p>
          <p>© ${new Date().getFullYear()} FastBite. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Order Confirmation

    Thank you for your order!

    Order #${order.id || order._id}

    Items:
    ${order.items?.map((item: OrderItem) =>
      `- ${item.meal?.name || 'Unknown Item'} (x${item.quantity}) - R${item.totalPrice?.toFixed(2) || '0.00'}`
    ).join('\n') || ''}

    Total: R${order.total?.toFixed(2) || '0.00'}

    ${order.pickupTime ? `Pickup Time: ${order.pickupTime}` : ''}
    ${order.specialInstructions ? `Special Instructions: ${order.specialInstructions}` : ''}

    If you have any questions, please contact us at ${process.env.FROM_EMAIL || 'noreply@surestrat.co.za'}
  `;

  return { html, text };
}

// Password reset email template
function generatePasswordResetEmail(resetLink: string): { html: string; text: string } {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset Your Password</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Reset Your Password</h1>
        <p>You requested a password reset for your FastBite account.</p>
        <p>Click the button below to reset your password:</p>
        <p><a href="${resetLink}" class="button">Reset Password</a></p>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p>${resetLink}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
      </div>
    </body>
    </html>
  `;

  const text = `
    Reset Your Password

    You requested a password reset for your FastBite account.

    Click this link to reset your password: ${resetLink}

    This link will expire in 1 hour.

    If you didn't request this reset, please ignore this email.
  `;

  return { html, text };
}

// Welcome email template
function generateWelcomeEmail(userName: string): { html: string; text: string } {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to FastBite!</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 10px 20px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Welcome to FastBite, ${userName}!</h1>
        <p>Thank you for joining FastBite! We're excited to serve you delicious meals.</p>
        <p>Get started by browsing our menu and placing your first order:</p>
        <p><a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/menu" class="button">Browse Menu</a></p>
        <p>Enjoy your meal!</p>
        <p>The FastBite Team</p>
      </div>
    </body>
    </html>
  `;

  const text = `
    Welcome to FastBite, ${userName}!

    Thank you for joining FastBite! We're excited to serve you delicious meals.

    Get started by browsing our menu: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/menu

    Enjoy your meal!

    The FastBite Team
  `;

  return { html, text };
}

// Role change email template
function generateRoleChangeEmail(userName: string, newRole: string): { html: string; text: string } {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your Role Has Been Updated</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Role Update Notification</h1>
        <p>Hello ${userName},</p>
        <p>Your role in the FastBite system has been updated to: <strong>${newRole}</strong></p>
        <p>If you have any questions about your new role and permissions, please contact an administrator.</p>
        <p>Best regards,<br>The FastBite Team</p>
      </div>
    </body>
    </html>
  `;

  const text = `
    Role Update Notification

    Hello ${userName},

    Your role in the FastBite system has been updated to: ${newRole}

    If you have any questions about your new role and permissions, please contact an administrator.

    Best regards,
    The FastBite Team
  `;

  return { html, text };
}