// server/utils/mailer.js
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendAlertEmail(toEmail, title, body) {
  try {
    await resend.emails.send({
      from: "WeatherLink Alerts <onboarding@resend.dev>",
      to: toEmail,
      subject: `⛅ WeatherLink Alert: ${title}`,
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