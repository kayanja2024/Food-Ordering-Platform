const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Email transporter
const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Twilio client (optional in development / when not configured)
let twilioClient = null;
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, NODE_ENV } = process.env;
try {
  if (
    TWILIO_ACCOUNT_SID &&
    TWILIO_AUTH_TOKEN &&
    /^AC/.test(String(TWILIO_ACCOUNT_SID))
  ) {
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  } else {
    if (NODE_ENV === 'production') {
      throw new Error('Twilio is not configured correctly in production. Set TWILIO_ACCOUNT_SID (starts with AC) and TWILIO_AUTH_TOKEN.');
    } else {
      console.warn(
        'Twilio not configured. SMS sending will be skipped in this environment.'
      );
    }
  }
} catch (err) {
  console.warn('Failed to initialize Twilio client. SMS will be skipped.', err.message);
  twilioClient = null;
}

// Send email
const sendEmail = async (to, subject, html, text = '') => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
      text
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

// Send SMS
const sendSMS = async (to, message) => {
  try {
    if (!twilioClient) {
      console.log('[DEV] Twilio disabled. Skipping SMS:', { to, message });
      return { sid: 'mocked-dev-sid', to, body: message };
    }

    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });

    console.log('SMS sent:', result.sid);
    return result;
  } catch (error) {
    console.error('SMS sending failed:', error);
    throw error;
  }
};

// Send OTP
const sendOTP = async (phone, otp) => {
  const message = `Your verification code is: ${otp}. Valid for 10 minutes.`;
  return await sendSMS(phone, message);
};

// Send order confirmation
const sendOrderConfirmation = async (user, order) => {
  const emailHtml = `
    <h2>Order Confirmation</h2>
    <p>Dear ${user.firstName} ${user.lastName},</p>
    <p>Your order has been confirmed!</p>
    <p><strong>Order Number:</strong> ${order.orderNumber}</p>
    <p><strong>Total Amount:</strong> ${order.totalAmount}</p>
    <p><strong>Status:</strong> ${order.status}</p>
    <p>We'll notify you when your order is ready for delivery.</p>
  `;

  const smsMessage = `Order confirmed! Order #${order.orderNumber}. Total: ${order.totalAmount}. Status: ${order.status}`;

  try {
    await sendEmail(user.email, 'Order Confirmation', emailHtml);
    await sendSMS(user.phone, smsMessage);
  } catch (error) {
    console.error('Order confirmation notification failed:', error);
  }
};

// Send payment confirmation
const sendPaymentConfirmation = async (user, order) => {
  const emailHtml = `
    <h2>Payment Confirmation</h2>
    <p>Dear ${user.firstName} ${user.lastName},</p>
    <p>Your payment has been received!</p>
    <p><strong>Order Number:</strong> ${order.orderNumber}</p>
    <p><strong>Amount Paid:</strong> ${order.totalAmount}</p>
    <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
    <p>Thank you for your order!</p>
  `;

  const smsMessage = `Payment received! Order #${order.orderNumber}. Amount: ${order.totalAmount}. Method: ${order.paymentMethod}`;

  try {
    await sendEmail(user.email, 'Payment Confirmation', emailHtml);
    await sendSMS(user.phone, smsMessage);
  } catch (error) {
    console.error('Payment confirmation notification failed:', error);
  }
};

// Send delivery update
const sendDeliveryUpdate = async (user, order, status) => {
  const statusMessages = {
    preparing: 'Your order is being prepared',
    ready: 'Your order is ready for delivery',
    out_for_delivery: 'Your order is out for delivery',
    delivered: 'Your order has been delivered'
  };

  const message = statusMessages[status] || `Your order status has been updated to: ${status}`;

  const emailHtml = `
    <h2>Order Update</h2>
    <p>Dear ${user.firstName} ${user.lastName},</p>
    <p>${message}</p>
    <p><strong>Order Number:</strong> ${order.orderNumber}</p>
    <p><strong>Status:</strong> ${status}</p>
  `;

  const smsMessage = `Order #${order.orderNumber}: ${message}`;

  try {
    await sendEmail(user.email, 'Order Update', emailHtml);
    await sendSMS(user.phone, smsMessage);
  } catch (error) {
    console.error('Delivery update notification failed:', error);
  }
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  const emailHtml = `
    <h2>Welcome to Our Food Ordering Platform!</h2>
    <p>Dear ${user.firstName} ${user.lastName},</p>
    <p>Thank you for registering with us. We're excited to serve you delicious food!</p>
    <p>You can now:</p>
    <ul>
      <li>Browse our menu</li>
      <li>Place orders</li>
      <li>Track your deliveries</li>
      <li>Save your favorite addresses</li>
    </ul>
    <p>Happy ordering!</p>
  `;

  try {
    await sendEmail(user.email, 'Welcome to Our Platform', emailHtml);
  } catch (error) {
    console.error('Welcome email failed:', error);
  }
};

module.exports = {
  sendEmail,
  sendSMS,
  sendOTP,
  sendOrderConfirmation,
  sendPaymentConfirmation,
  sendDeliveryUpdate,
  sendWelcomeEmail
}; 