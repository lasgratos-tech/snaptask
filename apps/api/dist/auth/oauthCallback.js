export async function registerOAuthCallbacks(app) {
    app.get('/auth/google/callback', async (request, reply) => {
        const token = await app.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${token.token.access_token}`
            }
        }).then(res => res.json());
        const actor = {
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
//# sourceMappingURL=oauthCallback.js.map