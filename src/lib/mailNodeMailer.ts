import nodemailer from 'nodemailer';

// Create a reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'bobyt2265@gmail.com', // Replace with your Gmail address
    pass: 'asmb gsit wjom ojde', // Replace with your Gmail app password (or regular password if 2FA is off)
  },
});

export async function sendEmailAlert(ip: string) {
  const mailOptions = {
    from: 'bobyt2265@gmail.com', // Sender address
    to: 'bobytiwari310@gmail.com', // List of recipients
    subject: 'ALERT: Too Many Failed Requests 💀⚡', // Subject line
    text: `The IP address ${ip} has exceeded the threshold of failed requests. Please investigate the issue.`, // Plain text body
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}
