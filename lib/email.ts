import { Resend } from "resend";
import nodemailer from "nodemailer";

const resend = new Resend(process.env.RESEND_API_KEY);

// =====================================
// 🔥 GLOBAL TRANSPORTER (IMPORTANT)
// =====================================
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// =====================================
// 🔥 GENERIC EMAIL (FOR CANCEL / STATUS)
// =====================================
export async function sendEmail(
  to: string,
  subject: string,
  html: string
) {
  try {
    const info = await transporter.sendMail({
      from: `"HumRahi Adventures- Booking System" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Cancellation Request status"
      html,
    });

    console.log("✅ Email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Email error:", error);
  }
}

// =====================================
// 🔥 VENDOR BOOKING EMAIL
// =====================================
export async function sendVendorEmail(vendor: any, booking: any) {
  try {
    console.log("📤 Sending email to:", vendor.contactEmail);

    await transporter.sendMail({
      from: `"HumRahi Adventures" <${process.env.EMAIL_USER}>`,
      to: vendor.contactEmail,
      subject: "New Booking Assigned 🚀",
      html: `
        <h2>New Booking Assigned</h2>
        <p><b>Customer Name:</b> ${booking.userName}</p>
        <p><b>Phone:</b> ${booking.phone}</p>
        <p><b>Date:</b> ${new Date(booking.date).toDateString()}</p>
        <p><b>Status:</b> Pending</p>
      `,
    });

    console.log("✅ Vendor Email Sent:", vendor.contactEmail);

  } catch (error) {
    console.error("❌ Vendor Email ERROR:", error);
  }
}

// =====================================
// 🔥 HOT LEAD EMAIL (NODEMAILER VERSION)
// =====================================
export async function sendHotLeadEmail(email: string) {
  try {
    console.log("📤 Sending hot lead email to:", email);

    const info = await transporter.sendMail({
      from: `"HumRahi Adventures" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Complete Your Booking 🪂",
      html: `
        <h2>You're Almost There! 🚀</h2>
        <p>You started booking but didn't complete your payment.</p>
        
        <p><b>Don't miss your adventure!</b></p>

        <a href="http://localhost:3000/checkout"
           style="
             display:inline-block;
             padding:10px 20px;
             background:#0070f3;
             color:#fff;
             text-decoration:none;
             border-radius:5px;
           ">
           Complete Booking
        </a>

        <p style="margin-top:20px;">
          Need help? Contact us anytime.
        </p>
      `,
    });

    console.log("✅ Hot Lead Email SENT:", info.messageId);

  } catch (error) {
    console.error("❌ Hot Lead Email ERROR:", error);
  }
}

