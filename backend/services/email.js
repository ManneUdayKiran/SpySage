const nodemailer = require("nodemailer");

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER;
const EMAIL_TO = process.env.EMAIL_TO;
const adminEmail = process.env.ADMIN_EMAIL; // Set this in your .env file

const transporter = nodemailer.createTransport({
  service: "gmail", // or your email provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendWeeklyDigest(changes, userEmail) {
  if (!userEmail) {
    console.error("No user email provided for digest");
    return;
  }

  // Determine if this is hourly or weekly based on changes timeframe
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const recentChanges = changes.filter(
    (c) => new Date(c.detectedAt) >= oneHourAgo
  );

  const isHourlyDigest = recentChanges.length > 0;
  const subject = isHourlyDigest
    ? "Hourly Competitor Updates"
    : "Weekly Competitor Change Digest";

  let text = `Here are the competitor changes${
    isHourlyDigest ? " from the past hour" : " from the past week"
  }:\n\n`;
  if (changes.length === 0) {
    text += "No changes detected.";
  } else {
    changes.forEach((change, idx) => {
      text += `${idx + 1}. Competitor: ${
        change.competitor?.name || ""
      }\n   Summary: ${change.summary}\n   URL: ${change.url}\n   Detected: ${
        change.detectedAt ? new Date(change.detectedAt).toLocaleString() : ""
      }\n\n`;
    });
  }
  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: userEmail,
      subject,
      text,
    });
    console.log(
      `${
        isHourlyDigest ? "Hourly" : "Weekly"
      } digest email sent to ${userEmail}`
    );
  } catch (err) {
    console.error("Email sending error:", err.message);
  }
}

async function sendAdminNotification(subject, text) {
  if (!adminEmail) {
    console.error("ADMIN_EMAIL not set in environment.");
    return;
  }
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject,
      text,
    });
    console.log("Admin notification sent:", subject);
  } catch (err) {
    console.error("Failed to send admin notification:", err);
  }
}

module.exports = { sendWeeklyDigest, sendAdminNotification };
