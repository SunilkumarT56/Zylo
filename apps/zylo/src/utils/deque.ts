import { createClient } from 'redis';
import { Resend } from 'resend';

const redisClient = createClient();
redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('ready', () => console.log('Redis Client Ready'));

await redisClient.connect();

const resend = new Resend('re_xxxxxxxxx');

(async function () {
  while (true) {
    const { Token, Email, Role } = await redisClient.hGetAll('invite');
    if (!Token || !Email) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      continue;
    }
    const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: ['sunilbe2006@gmail.com'],
      subject: `invite email for ${Role}`,
      html: `<a herf=" https://untolerative-len-rumblingly.ngrok-free.dev/user/invites?token="${Token}">Click here</a>`,
    });

    if (error) {
      return console.error({ error });
    }

    console.log({ data });
  }
})();
