import type { FastifyInstance } from 'fastify';
import type { ActorContext } from './actorContext.js';

export async function registerOAuthCallbacks(app: FastifyInstance) {
  app.get('/auth/google/callback', async (request, reply) => {
    const token =
      await app.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(
        request
      );

    const userInfo = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${token.token.access_token}`
        }
      }
    ).then(res => res.json());

    const actor: ActorContext = {
      actorId: `google:${userInfo.id}`,
      email: userInfo.email,
      provider: 'google',
      role: 'user',
      plan: 'free'
    };

    // TEMPORAIRE : retour direct
    return reply.send(actor);
  });
}
