import "dotenv/config";
import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: process.env.SMTP_ENDPOINT,
  port: 587,
  secure: false, // upgrade later with STARTTLS
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendEmail(to: string, sub: string, text: string) {
  const mailOptions = {
    from: `"Deepak's Zapier" < ${process.env.SMTP_EMAIL} >`,
    to,
    subject: `${sub} from Deepak's Zapier`,
    text,
  };

  // Send the email
  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error("Error sending email:", error);
    }
    console.log("Email sent:", info.response);
  });
}
