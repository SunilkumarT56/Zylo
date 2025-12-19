import { authMiddleware } from "../middlewares/auth.middlewares";
import { ApiRouteConfig, Handlers } from "motia";

export const config: ApiRouteConfig = {
  name: "logout",
  type: "api",
  path: "/logout",
  method: "POST",
  emits: [],
  middleware: [authMiddleware],
};

export const handler = async (req: any, { emit, logger, user }: any) => {
  try {
    return {
      status: 200,
      headers: {
        "Set-Cookie": `token=; Path=/; HttpOnly; Secure; SameSite=Lax`,
      },
      body: {
        success: true,
        message: "Logout successful",
        user: user.email,
      },
    };
  } catch (err) {
    logger.error("Logout error", err);
    return {
      status: 500,
      body: { success: false, message: "Internal server error" },
    };
  }
};
