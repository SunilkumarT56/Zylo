import { ApiRouteConfig, Handlers } from "motia";
import { authMiddleware } from "../middlewares/auth.middlewares";

export const config: ApiRouteConfig = {
  name: "protected-route",
  type: "api",
  path: "/protected",
  method: "GET",
  emits: [],
  middleware: [authMiddleware],
};

export const handler: Handlers["protected-route"] = async (
  req: any,
  { emit, logger, user }: any
) => {
  try {
    return {
      status: 200,
      body: {
        success: true,
        message: "Protected route accessed successfullyyyy",
        user: user.email,
      },
    };
  } catch (err) {
    logger.error("Protected route error", err);
    return {
      status: 500,
      body: { success: false, message: "Internal server error" },
    };
  }
};
