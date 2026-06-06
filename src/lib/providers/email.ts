import { MessageProvider, MessagePayload } from "./types";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

export const emailProvider: MessageProvider = {
  name: "email",
  async send(payload: MessagePayload) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || "noreply@gabinetedigital.com.br",
        to: payload.to,
        subject: payload.subject,
        text: payload.body,
        html: payload.html || payload.body.replace(/\n/g, "<br>"),
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
};
