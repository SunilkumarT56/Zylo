import { createClient, type RedisClientType } from 'redis';
export const redisClient: RedisClientType = createClient();
redisClient.on('error', (err: Error) => console.log('Redis Client Error', err));
redisClient.on('ready', () => console.log('Redis Client Ready'));
