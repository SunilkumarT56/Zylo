import { createClient } from 'redis';
import { AsyncHandler } from './asyncHandler.js';

const redisClient = createClient();
redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('ready', () => console.log('Redis Client Ready'));

await redisClient.connect();

const sendEmail = async () => {
  while (true) {
    const {Email , Token} = await redisClient.hGetAll('invite');
    if (!Email || !Token) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      continue;
    }
    // TODO Send email with token as a parameter 

  }
};


await sendEmail();
