import type { Request, Response } from "express";
import type { AuthenticateUserRequest } from "../types/interface.js";
import {prisma} from "../config/postgresql.js";


export const userProfile = async (
  req: AuthenticateUserRequest,
  res: Response
): Promise<void> => {
  // const { id } = req.user as { id: string };
  // const user = await prisma.users.findUnique({
  //   where: {
  //     id,
  //   },
  // });
  // if (!user) {
  //   res.status(401).json({ status: false, error: "Unauthorized" });
  //   return;
  // }

  res.json({
    authenticated: true,
    user: (req as AuthenticateUserRequest).user,
  });
  return new Promise(() => {});
};
