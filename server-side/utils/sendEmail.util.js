import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to, subject, html) => {
  console.log("========== EMAIL DEBUG ==========");
  console.log("TO:", to);
  console.log("SUBJECT:", subject);
  console.log("FROM:", process.env.EMAIL);
  console.log("send from nodemailer");
  try {
    const info = await transporter.sendMail({
      from: `"Yumify" <${process.env.EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent successfully:", info.messageId);

    return info;
  } catch (error) {
    console.error("EMAIL ERROR:", error.message);
    throw error;
  }
};
