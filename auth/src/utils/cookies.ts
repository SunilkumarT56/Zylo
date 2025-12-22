import type { Request, Response } from "express";

export const cookieSender = (
  req: Request,
  res: Response,
  key: string,
  value: any
): void => {
  res.cookie(key, value, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: parseInt(process.env.COOKIE_MAX_AGE!, 10),
  });
};
