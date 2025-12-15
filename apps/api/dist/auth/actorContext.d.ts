export type ActorContext = {
    actorId: string;
    email?: string;
    provider: 'google' | 'apple';
    role: 'user' | 'admin';
    plan: 'free' | 'paid';
};
