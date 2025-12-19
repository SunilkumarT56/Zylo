import { ApiMiddleware } from "motia";
import jwt from "jsonwebtoken";

function parseCookies(cookieHeader: string | undefined) {
  if (!cookieHeader) return {};

  return Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [key, value] = c.trim().split("=");
      return [key, decodeURIComponent(value)];
    })
  );
}

export const authMiddleware: ApiMiddleware = async (req, ctx, next) => {
  const cookies = parseCookies(req.headers.cookie as string);

  const token = cookies.token;
  if (!token) {
    return {
      status: 401,
      body: { success: false, message: "Missing auth token" },
    };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    if (!decoded) {
      return {
        status: 401,
        body: { success: false, message: "Invalid or expired token" },
      };
    }
    //@ts-ignore
    ctx.user = decoded;

    return await next();
  } catch (err: any) {
    console.error("JWT verify error:", err.message);

    return {
      status: 401,
      body: { success: false, message: "Invalid or expired token" },
    };
  }
};
