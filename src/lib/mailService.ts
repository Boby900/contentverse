import formData from "form-data";
import Mailgun from "mailgun.js";

const mailgun = new Mailgun(formData);

// Replace with your Mailgun API key and domain from the environment variables
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY!,
});

export const sendEmail = async (recipientEmail: string) => {
  try {
    const domain = process.env.MAILGUN_DOMAIN!;

    // Default values for email parameters
    const subject = "Welcome to Contentverse!";
    const text = `Hi there!

Thank you for signing up for Contentverse. We're excited to have you on board. If you have any questions, feel free to reach out to us.

Best regards,
The Contentverse Team`;

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h1>Welcome to Contentverse!</h1>
        <p>Hi there!</p>
        <p>Thank you for signing up for Contentverse. We're excited to have you on board. If you have any questions, feel free to reach out to us.</p>
        <p>Best regards,<br>The Contentverse Team</p>
      </div>
    `;

    const response = await mg.messages.create(domain, {
      from: `<mailgun@${domain}>`,
      to: [recipientEmail],
      subject,
      text,
      html,
    });

    console.log("Email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    
    throw error;
  }
};
