import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to, subject, html) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Yumify <onboarding@resend.dev>",
      to,
      subject,
      html, // Send HTML instead of plain text
    });

    if (error) {
      console.error("EMAIL ERROR:", error);
      throw new Error(error.message);
    }

    console.log("Email sent successfully:", data?.id);

    return data;
  } catch (error) {
    console.error("EMAIL ERROR:", error.message);
    throw error;
  }
};
