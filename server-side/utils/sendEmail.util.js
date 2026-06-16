import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },

      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    // Verify SMTP connection
    
    console.log("Before transporter.verify()");
    await transporter.verify();
    console.log("After transporter.verify()");

    console.log("SMTP connection verified");

    const info = await transporter.sendMail({
      from: `"Yumify" <${process.env.EMAIL}>`,
      to,
      subject,
      text,
    });

    console.log("Email sent successfully:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("EMAIL ERROR:", error.message);

    throw error;
  }
};
