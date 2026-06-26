import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true only for port 465
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS, // Google App Password
  },

  connectionTimeout: 10000, // 10 sec
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// Verify SMTP connection when server starts
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP VERIFY ERROR:", error);
  } else {
    console.log("SMTP SERVER READY");
  }
});

export const sendEmail = async (to, subject, html) => {
  console.log("========== EMAIL DEBUG ==========");
  console.log("TO:", to);
  console.log("SUBJECT:", subject);
  console.log("FROM:", process.env.EMAIL);
  console.log("Sending with Nodemailer...");

  try {
    const info = await Promise.race([
      transporter.sendMail({
        from: `"Yumify" <${process.env.EMAIL}>`,
        to,
        subject,
        html,
      }),

      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Email sending timeout")), 15000),
      ),
    ]);

    console.log("Email sent successfully:", info.messageId);

    return info;
  } catch (error) {
    console.error("EMAIL ERROR:", error);
    throw error;
  }
};
