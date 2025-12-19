import { EventConfig } from "motia";
import connectDB from "../db/db";
import { Resend } from "resend";

export const config: EventConfig = {
  name: "send-verify-email",
  type: "event",
  subscribes: ["send-email"],
  emits: ["email-sent"],
};

export const handler = async (input: any, { state, logger, emit }: any) => {
  await connectDB();
  try {
    const { email, rawToken } = input;
    const fromEmail = process.env.RESEND_EMAIL!;
    if (!fromEmail) {
      logger.error("Missing from email");
      return;
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: email,
        subject: "Verfication email",
        html: `<div style="
  font-family: Arial, sans-serif;
  background: #f4f4f7;
  padding: 40px 0;
  color: #333;
">
  <div style="
    max-width: 480px;
    margin: auto;
    background: white;
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 6px 20px rgba(0,0,0,0.1);
  ">
    <h2 style="
      text-align: center;
      color: #4F46E5;
      margin-bottom: 20px;
      font-size: 26px;
      font-weight: bold;
    ">
      Verify Your Email ✉️
    </h2>

    <p style="font-size: 16px; line-height: 1.6;">
      Hi <strong>User</strong>,  
      <br><br>
      Tap the button below to verify your email address and complete your signup.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="http://localhost:3000/verify-email?token=${rawToken}"
        style="
          background: #4F46E5;
          color: white;
          text-decoration: none;
          padding: 14px 28px;
          font-size: 16px;
          border-radius: 8px;
          display: inline-block;
          font-weight: bold;
        "
      >
        Verify Email
      </a>
    </div>

    <p style="font-size:14px; color:#555; line-height: 1.6;">
      This link will expire in <strong>1 hour</strong>.  
      If you didn’t create an account, you can safely ignore this email.
    </p>

    <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">

    <p style="font-size:13px; text-align:center; color:#999;">
      © ${new Date().getFullYear()} YourApp. All rights reserved.
    </p>
  </div>
</div>`,
      }),
    });
    logger.info("Email sent", { email });
    if (response.ok) {
      logger.info("email sending success");
    } else {
      logger.error("email send failed");
    }

    emit({
      topic: "email-sent",
      data: {
        email,
        rawToken,
      },
    });
  } catch (error) {
    logger.error("Error sending email", { error });
  }
};
