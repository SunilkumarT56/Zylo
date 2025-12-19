import { ApiRouteConfig, Handlers } from "motia";
import connectDB from "../db/db";
import User from "../db/mongoose/User.model";
import EmailVerification from "../db/mongoose/Email.model";
import crypto from "crypto";
import jwt from "jsonwebtoken";

export const config: ApiRouteConfig = {
  name: "verify-the-user",
  type: "api",
  path: "/verify-email",
  method: "POST",
  emits: [],
};

export const handler: Handlers["verify-the-user"] = async (
  req: any,
  { emit, logger }: any
) => {
  try {
    await connectDB();

    const token = req.body.token;
    logger.info("Verify email", token );
    console.log(token);
    if (!token) {
      return {
        status: 400,
        body: { success: false, message: "Token missing" },
      };
    }
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    logger.info("Token hash", { tokenHash });

    const record = await EmailVerification.findOne({ tokenHash });
    logger.info("Email verification token found", { record });
    if (!record) {
      return {
        status: 400,
        body: { success: false, message: "Invalid verification token" },
      };
    }

    if (record.expiresAt < new Date()) {
      return {
        status: 400,
        body: { success: false, message: "Token expired" },
      };
    }

    if (record.usedAt) {
      return {
        status: 400,
        body: { success: false, message: "Token already used" },
      };
    }

    record.usedAt = new Date();
    await record.save();

    const user = await User.findByIdAndUpdate(record.userId, {
      emailVerified: true,
    });
    //@ts-ignore
    const jwtToken: string = jwt.sign(
      { email: user?.email, userId: user?._id.toString() },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN! }
    );
    return {
      status: 200,
      headers: {
        "Set-Cookie": `token=${jwtToken}; HttpOnly; Path=/; Max-Age=${process.env.JWT_EXPIRES_IN} ; SameSite=Lax; Secure;`,
      },
      body: {
        success: true,
        message: "Email verified successfully",
      },
    };
  } catch (err) {
    logger.error("Verify email error", err);
    return {
      status: 500,
      body: { success: false, message: "Internal server error" },
    };
  }
};
