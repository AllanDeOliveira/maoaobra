import cors from '@fastify/cors';
import { fromNodeHeaders } from 'better-auth/node';
import Fastify from 'fastify';
import { auth } from './auth';
import { sql } from './db';
import { env } from './env';

export function buildApp() {
  const app = Fastify({ logger: env.NODE_ENV !== 'test' });

  app.register(cors, {
    origin: env.APP_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Repassa /api/auth/* ao Better Auth convertendo a requisição do Fastify em Fetch Request
  app.route({
    method: ['GET', 'POST'],
    url: '/api/auth/*',
    async handler(request, reply) {
      const response = await auth.handler(
        new Request(new URL(request.url, env.BETTER_AUTH_URL), {
          method: request.method,
          headers: fromNodeHeaders(request.headers),
          body: request.body ? JSON.stringify(request.body) : undefined,
        }),
      );
      reply.status(response.status);
      for (const [key, value] of response.headers) reply.header(key, value);
      return reply.send(response.body ? await response.text() : null);
    },
  });

  app.get('/health', async () => {
    await sql`select 1`;
    return { ok: true };
  });

  app.get('/me', async (request, reply) => {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
    if (!session) return reply.status(401).send({ error: 'unauthorized' });
    const { id, name, phoneNumber, role } = session.user;
    return { id, name, phoneNumber, role };
  });

  return app;
}
