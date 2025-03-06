import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);
export default async function sendWelcomeEmail(email: string) {
    try {
        const emailResponse = await resend.emails.send({
            from: "Contentverse <noreply@bobytiwari.tech>", // Replace with your verified domain
            to: email,
            subject: 'Welcome to the Contentverse!',
            html: `
                <p>Hi 👋 ${email.split("@")[0]},</p>
                <p>Welcome to the Contentverse😃 We're thrilled to have you join our community.</p>
                <p>Explore our platform and discover amazing content.</p>
                <p>Best regards,<br>The Contentverse Team</p>
            `,
        });
        console.log('Welcome email sent:', emailResponse);
    } catch (error) {
        console.error('Error sending welcome email:', error);
    }
}