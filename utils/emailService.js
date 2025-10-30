const nodemailer = require('nodemailer');

// Create transporter
// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_PORT,
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


// Send order confirmation email (regular order, not custom order)
const sendOrderConfirmation = async (order, customer) => {
  console.log("SEND ORDER CONFIRMATION:",process.env.EMAIL_USER)
  // Add the debug lines here:
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  console.log("EMAIL_PASS is defined:", !!process.env.EMAIL_PASS);
  console.log("EMAIL_HOST:", process.env.EMAIL_HOST);
  console.log("EMAIL_PORT:", process.env.EMAIL_PORT);
  try {
    const mailOptions = {
      // from: "warmdelights11@gmail.com",
      from: process.env.EMAIL_USER,
      to: customer.email,
      subject: `Order Confirmation - ${order.orderId}`,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      ... [original order email HTML here] ...
      </div>
      `,
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent to:', customer.email);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};

// Send custom order confirmation email to customer AND admin
const sendCustomOrderConfirmation = async (customOrder) => {
  try {
    // 1. Customer confirmation
    // Add the debug lines here:
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("EMAIL_PASS is defined:", !!process.env.EMAIL_PASS);
    console.log("EMAIL_HOST:", process.env.EMAIL_HOST);
    console.log("EMAIL_PORT:", process.env.EMAIL_PORT);
    
    const customerMailOptions = {
      // from: "warmdelights11@gmail.com",
      from: process.env.EMAIL_USER,
      to: customOrder.email,
      subject: 'Custom Order Request Received',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #FF7B54; margin: 0;">Warm Delights</h2>
            <p style="color: #666; margin: 5px 0;">Fresh, Delicious, Sweet, Tasty</p>
          </div>
          <h3 style="color: #333; border-bottom: 2px solid #FF7B54; padding-bottom: 10px;">Custom Order Request Received</h3>
          <p>Hello ${customOrder.name},</p>
          <p>Thank you for your custom order request! We're excited to bring your vision to life.</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #333;">Request Details:</h4>
            <p><strong>Size:</strong> ${customOrder.size || 'Not specified'}</p>
            <p><strong>Flavor:</strong> ${customOrder.flavor || 'Not specified'}</p>
            <p><strong>Design Notes:</strong> ${customOrder.designNotes || 'Not specified'}</p>
            <p><strong>Status:</strong> ${customOrder.status}</p>
          </div>
          <p>Our team will review your request and contact you within 24 hours to discuss the details and provide a quote.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <h4 style="color: #333; margin-bottom: 10px;">Contact Information</h4>
            <p>If you have any questions, please contact us:</p>
            <p>📞 Phone: <a href="tel:8847306427">8847306427</a></p>
            <p>📧 Email: <a href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a></p>
            <p>📱 WhatsApp: <a href="https://wa.me/918847306427">8847306427</a></p>
            <p>📷 Instagram: <a href="https://instagram.com/__.warmdelights.__">@__.warmdelights.__</a></p>
          </div>
          <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
            <p>Warm Delights Bakery • Operating Hours: 9AM to 9PM, 7 days a week</p>
          </div>
        </div>
      `,
    };
    await transporter.sendMail(customerMailOptions);
    console.log('Custom order confirmation email sent to customer:', customOrder.email);

    // 2. Admin/bakery mailbox
    const adminMailOptions = {
      // from: "warmdelights11@gmail.com",
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'New Custom Order Received',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2>New Custom Order Received</h2>
          <p><b>Name:</b> ${customOrder.name}</p>
          <p><b>Email:</b> ${customOrder.email}</p>
          <p><b>Phone:</b> ${customOrder.phone}</p>
          <p><b>Size:</b> ${customOrder.size || 'Not specified'}</p>
          <p><b>Flavor:</b> ${customOrder.flavor || 'Not specified'}</p>
          <p><b>Design Notes:</b> ${customOrder.designNotes || 'Not specified'}</p>
          <p><b>Status:</b> ${customOrder.status}</p>
          ${customOrder.referenceImage ? `<p><b>Reference Image:</b> ${customOrder.referenceImage}</p>` : ""}
          <p>Check the admin dashboard for further details.</p>
        </div>
      `
    };
    await transporter.sendMail(adminMailOptions);
    console.log('Custom order notification email sent to Warm Delights mailbox:', process.env.EMAIL_USER);

  } catch (error) {
    console.error('Error sending custom order confirmation emails:', error);
    throw error;
  }
};

module.exports = {
  sendOrderConfirmation,
  sendCustomOrderConfirmation,
};
