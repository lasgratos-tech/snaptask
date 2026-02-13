import 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      apiKey: string
      owner: string
    }
  }
}
