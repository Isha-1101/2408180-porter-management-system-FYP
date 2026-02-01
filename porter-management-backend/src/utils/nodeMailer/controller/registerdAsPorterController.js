import MailerTransporter from "../../../config/nodemailer-config.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatePath = path.join(
  __dirname,
  "../../../utils/nodeMailer/emailtemplates",
  "RegisteredAsPorter.html",
);
let htmlTemplate = fs.readFileSync(templatePath, "utf-8");

const registeredAsPorterMailController = async (toEmail, porterName) => {
  const customizedHtml = htmlTemplate.replace("{{name}}", porterName);
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: "Approval as Porter",
      html: customizedHtml,
    };
    await MailerTransporter.sendMail(mailOptions);
    console.log("Approval email sent successfully");
  } catch (error) {
    console.error("Error sending approval email:", error);
  }
};

export default registeredAsPorterMailController;
