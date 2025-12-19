import { EventConfig, Handlers } from "motia";
import connectDB from "../db/db";
import EmailVerification from "../db/mongoose/Email.model";

export const config: EventConfig = {
  name: "store-email-token",
  type: "event",
  subscribes: ["store-email-token"],
  emits: ["send-email"],
};

export const handler: Handlers["store-email-token"] = async (
  input: any,
  { state, logger, emit }: any
) => {
  try {
    await connectDB();

    const { email } = input;

    const emailTokenObj = await state.get(`emailToken:${email}`, "signup");

    if (!emailTokenObj) {
      logger.error("Email token: Missing data");
      return;
    }

    const { tokenHash, expiresAt, ipAddress, userAgent, rawToken, userId } = emailTokenObj;

    const record = new EmailVerification({
      userId: userId, 
      tokenHash,
      expiresAt,
      usedAt: null,
      ipAddress,
      userAgent,
    });

    await record.save();

    logger.info("Email verification token stored", { email });

    emit({
      topic: "send-email",
      data: {
        email,
        rawToken,
        userId,
      },
    });
  } catch (error) {
    logger.error("Error storing email token", { error });
  }
};