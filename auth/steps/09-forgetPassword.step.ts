import { ApiRouteConfig } from "motia";

export const config: ApiRouteConfig = {
  name: "forget-password",
  type: "api",
  path: "/forget-password",
  method: "POST",
  emits: [],
};

export const handler = async (
  req: any,
  { emit, logger }: any
) => {
  return {
    status: 200,
    body: { success: true, message: "Forget password endpoint" },
  };
};
