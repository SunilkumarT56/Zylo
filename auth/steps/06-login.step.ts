import { ApiRouteConfig, Handlers } from "motia";
import User from "../db/mongoose/User.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import connectDB from "../db/db";

export const config: ApiRouteConfig = {
  name: "signin",
  type: "api",
  path: "/login",
  method: "POST",
  emits: ["user-logged-in"],
};

export const handler: Handlers["signin"] = async (
  req: any,
  { emit, state }: any
) => {
  try {
    await connectDB();
    const { email, password } = req.body;
    if (!email || !password) {
      return {
        status: 400,
        body: { success: false, message: "Email and password are required" },
      };
    }
    const user = await User.findOne({ email });
    if (!user) {
      return {
        status: 400,
        body: { success: false, message: "User not found" },
      };
    }
    if (!user.emailVerified) {
      return {
        status: 400,
        body: {
          success: false,
          message: "email is not verified",
        },
      };
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return {
        status: 400,
        body: { success: false, message: "Invalid password" },
      };
    }
    const token: string = jwt.sign(
      { email, userId: user._id.toString() },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN as any }
    );
    await state.set(`user:${email}`, "signin", { email, userId: user._id });
    emit({
      topic: "user-logged-in",
      data: {
        email,
        userId: user._id,
      },
    });
    return {
      status: 200,
      headers: {
        "Set-Cookie": `token=${token}; HttpOnly; Path=/; Max-Age=${process.env.JWT_EXPIRES_IN} ; SameSite=Lax; Secure;`,
      },
      body: { success: true, message: "User logged in successfully" },
    };
  } catch (error) {
    console.error("Error in signin handler:", error);
  }
};
