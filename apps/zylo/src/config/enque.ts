import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import dotenv from "dotenv";
dotenv.config();

export const sqs = new SQSClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_KEY!
  }
});

export async function enqueueEvent(event : string ) {
  const params = {
    QueueUrl: process.env.SQS_URL,
    MessageBody: JSON.stringify(event),
  };

  await sqs.send(new SendMessageCommand(params));
}