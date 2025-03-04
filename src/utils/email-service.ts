import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(
  to: string,
  subject: string,
  text: string,

): Promise<void> {
  try {
    const { data, error } = await resend.emails.send({
      from: "Contentverse <noreply@bobytiwari.tech>",
      to: to,
      subject: subject,
      html: text,
    });
    console.log({data,error})
    if (error) {
      Response.json({ error }, { status: 500 });
      return;
    }

    Response.json(data);
  } catch (error) {
    Response.json({ error }, { status: 500 });
    return;
  }
}
