import { EventConfig, Handlers } from "motia";
import User from "../db/mongoose/User.model";
import connectDB from "../db/db";

export const config: EventConfig = {
  name: "store-user-db",
  type: "event",
  subscribes: ["store-user-db"],
  emits: [],
};

export const handler: Handlers["store-user-db"] = async (
  input: any,
  { state, logger }: any
) => {
  try {
    await connectDB();

    const { email } = input;
    const userObj = await state.get(`user:${email}`, "signup");

    if (!userObj) {
      logger.error("Store user: No signup data found");
      return;
    }
    const user = new User(userObj);
    await user.save();

    logger.info("User stored successfully:", { email, id: user._id });
  } catch (error) {
    logger.error("Error storing user", { error });
  }
};