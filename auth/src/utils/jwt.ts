import jwt from "jsonwebtoken";

export const generateJWT = (id: string | null): string => {
  if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES_IN || !id) {
    throw new Error("JwT not exist");
  }
  //@ts-ignore
  const token = jwt.sign({ userId: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token;
};
