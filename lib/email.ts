// import { Resend } from "resend";
import nodemailer from "nodemailer";

// const resend = new Resend(process.env.RESEND_API_KEY);

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
      subject,
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

    const info = await transporter.sendMail({
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

// =====================================
// 🔥 BOOKING CONFIRMATION EMAIL (NEW)
// Sent to all travelers after payment
// =====================================
export async function sendBookingConfirmationEmail({
  to,
  travelerName,
  packageName,
  bookingDate,
  totalAmount,
  travelers,
  activities,
  leadTraveler,
  bookingGroupId,
  razorpayPaymentId,
}: {
  to: string;
  travelerName: string;
  packageName: string;
  bookingDate: Date | string;
  totalAmount: number;
  travelers: any[];
  activities: any[];
  leadTraveler: any;
  bookingGroupId: string;
  razorpayPaymentId: string;
}) {
  try {
    const formattedDate = new Date(bookingDate).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Build activity rows
    const activityRows = activities
      .map((a, i) => {
        const date = new Date(a.activityDate).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
        return `
          <tr>
            <td style="padding:10px 8px;border-bottom:1px solid #1a1a1a;color:#9ca3af;font-size:13px;">Day ${i + 1}</td>
            <td style="padding:10px 8px;border-bottom:1px solid #1a1a1a;color:#fff;font-weight:600;font-size:13px;">${a.activityName}</td>
            <td style="padding:10px 8px;border-bottom:1px solid #1a1a1a;color:#f59e0b;font-size:13px;">${a.vendorName}</td>
            <td style="padding:10px 8px;border-bottom:1px solid #1a1a1a;color:#6b7280;font-size:13px;">${date}</td>
            <td style="padding:10px 8px;border-bottom:1px solid #1a1a1a;color:#6b7280;font-size:12px;">${a.vendorPhone || "—"}</td>
          </tr>
        `;
      })
      .join("");

    // Build traveler rows
    const travelerRows = travelers
      .map(
        (t) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #1a1a1a;color:#fff;font-size:13px;">${t.fullName}</td>
          <td style="padding:8px;border-bottom:1px solid #1a1a1a;color:#9ca3af;font-size:13px;">${t.phone || "—"}</td>
          <td style="padding:8px;border-bottom:1px solid #1a1a1a;color:#9ca3af;font-size:13px;">${t.email || "—"}</td>
          <td style="padding:8px;border-bottom:1px solid #1a1a1a;color:#9ca3af;font-size:13px;">${t.age || "—"} yrs · ${t.gender || "—"}</td>
        </tr>
      `
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#000;font-family:'Helvetica Neue',Arial,sans-serif;">
        <div style="max-width:600px;margin:32px auto;background:#0d0d0d;border:1px solid #1a1a1a;border-radius:16px;overflow:hidden;">

          <!-- Header -->
          <div style="background:linear-gradient(135deg,#1a0f00,#0d0d0d);padding:32px 32px 24px;border-bottom:1px solid #1a1a1a;">
            <p style="color:#f59e0b;font-size:12px;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px;">HumRahi Adventures</p>
            <h1 style="color:#fff;font-size:28px;margin:0 0 8px;font-weight:800;">Booking Confirmed! 🎉</h1>
            <p style="color:#6b7280;margin:0;font-size:14px;">Your adventure is locked in. Get ready!</p>
          </div>

          <div style="padding:32px;">

            <!-- Greeting -->
            <p style="color:#e5e7eb;font-size:16px;margin:0 0 24px;">
              Hi <strong style="color:#f59e0b;">${travelerName}</strong>, your booking for
              <strong>${packageName}</strong> on <strong>${formattedDate}</strong> is confirmed.
            </p>

            <!-- Booking Meta -->
            <div style="background:#1a1a1a;border-radius:10px;padding:16px;margin-bottom:24px;">
              <table style="width:100%;">
                <tr>
                  <td>
                    <p style="color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 4px;">Booking ID</p>
                    <p style="color:#f59e0b;font-size:13px;font-family:monospace;margin:0;">${bookingGroupId.slice(0, 12).toUpperCase()}</p>
                  </td>
                  <td>
                    <p style="color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 4px;">Payment ID</p>
                    <p style="color:#9ca3af;font-size:13px;font-family:monospace;margin:0;">${razorpayPaymentId}</p>
                  </td>
                  <td>
                    <p style="color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 4px;">Total Paid</p>
                    <p style="color:#10b981;font-size:18px;font-weight:800;margin:0;">₹${totalAmount.toLocaleString("en-IN")}</p>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Activity Itinerary -->
            <h2 style="color:#f59e0b;font-size:16px;margin:0 0 12px;text-transform:uppercase;letter-spacing:2px;">📅 Your Itinerary</h2>
            <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
              <thead>
                <tr style="background:#1a1a1a;">
                  <th style="padding:10px 8px;text-align:left;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Day</th>
                  <th style="padding:10px 8px;text-align:left;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Activity</th>
                  <th style="padding:10px 8px;text-align:left;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Vendor</th>
                  <th style="padding:10px 8px;text-align:left;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Date</th>
                  <th style="padding:10px 8px;text-align:left;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Contact</th>
                </tr>
              </thead>
              <tbody>${activityRows}</tbody>
            </table>

            <!-- Travelers -->
            <h2 style="color:#f59e0b;font-size:16px;margin:0 0 12px;text-transform:uppercase;letter-spacing:2px;">🧳 Travelers (${travelers.length})</h2>
            <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
              <thead>
                <tr style="background:#1a1a1a;">
                  <th style="padding:8px;text-align:left;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Name</th>
                  <th style="padding:8px;text-align:left;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Phone</th>
                  <th style="padding:8px;text-align:left;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Email</th>
                  <th style="padding:8px;text-align:left;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Age / Gender</th>
                </tr>
              </thead>
              <tbody>${travelerRows}</tbody>
            </table>

            <!-- Lead Contact -->
            <div style="background:#111;border:1px solid #1a1a1a;border-radius:10px;padding:16px;margin-bottom:24px;">
              <p style="color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">Lead Contact</p>
              <p style="color:#fff;font-weight:600;margin:0 0 4px;">${leadTraveler.name}</p>
              <p style="color:#9ca3af;font-size:13px;margin:0 0 2px;">${leadTraveler.phone}</p>
              <p style="color:#9ca3af;font-size:13px;margin:0;">${leadTraveler.email}</p>
            </div>

            <p style="color:#4b5563;font-size:12px;text-align:center;margin:0;">
              For support, reply to this email or contact HumRahi Adventures.<br/>
              Please carry a printed or digital copy of this confirmation on the day of your activity.
            </p>

          </div>

          <!-- Footer -->
          <div style="background:#0a0a0a;padding:16px 32px;border-top:1px solid #1a1a1a;text-align:center;">
            <p style="color:#374151;font-size:11px;margin:0;">© ${new Date().getFullYear()} HumRahi Adventures · All rights reserved</p>
          </div>

        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"HumRahi Adventures" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Booking Confirmed — ${packageName} 🎉`,
      html,
    });

    console.log("✅ Confirmation email sent to:", to);

  } catch (error) {
    console.error("❌ Confirmation email error:", error);
  }
}