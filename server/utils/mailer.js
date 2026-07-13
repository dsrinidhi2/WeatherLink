// server/utils/mailer.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendAlertEmail(toEmail, title, body) {
  try {
    await transporter.sendMail({
      from: `"WeatherLink Alerts" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `⛅ WeatherLink Alert: ${title}`,
      text: body || "You have a new weather alert from WeatherLink.",
      html: `
        <div style="font-family: sans-serif; padding: 16px;">
          <h2>⛅ WeatherLink Alert</h2>
          <h3>${title}</h3>
          <p>${body || ""}</p>
          <p style="color: #888; font-size: 12px;">Sent via WeatherLink CloudCrew</p>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error("EMAIL SEND ERROR:", err.message);
    return false;
  }
}

module.exports = { sendAlertEmail };