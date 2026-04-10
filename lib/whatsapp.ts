import Twilio from "twilio";

const client = Twilio(
  process.env.TWILIO_SID!,
  process.env.TWILIO_AUTH!
);

export async function sendWhatsApp(phone: string, message: string) {
  try {
    // 1️⃣ Remove "whatsapp:" if already present
    let cleanPhone = phone.replace("whatsapp:", "").trim();

    // 2️⃣ Remove spaces
    cleanPhone = cleanPhone.replace(/\s+/g, "");

    // 3️⃣ Ensure "+" present
    if (!cleanPhone.startsWith("+")) {
      cleanPhone = "+" + cleanPhone;
    }

    console.log("📱 FINAL PHONE:", cleanPhone);

    const res = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP,
      to: `whatsapp:${cleanPhone}`,
      body: message,
    });

    console.log("✅ WhatsApp sent:", res.sid);

    return true; // 🔥 SUCCESS
  } catch (error) {
    console.error("❌ WhatsApp error:", error);
    return false; // 🔥 FAILURE
  }
}
