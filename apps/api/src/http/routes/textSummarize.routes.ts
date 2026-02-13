import { FastifyInstance } from "fastify";
import { z } from "zod";
// @ts-ignore: Import may fail in some environments if the file is missing, handle this gracefully during dev
import { runTextSummarizationV2 } from "../../tasks/textSummarization/index.v2";

const BodySchema = z.object({
  text: z.string().min(1),
  style: z.enum(["short", "bullet", "executive"]).default("executive"),
  language: z.enum(["fr", "en"]).default("fr"),
});

export async function textSummarizeRoutes(app: FastifyInstance) {
    app.post('/v1/tasks/text-summarize', async (req, reply) => {
      const body = BodySchema.parse(req.body)
  
      const result = await runTextSummarizationV2({
        text: body.text,
        style: body.style,
        language: body.language,
        actor: (req as any).user, // injecté par apiKeyAuthMiddleware
      })
  
      return reply.send({
        summary: result.summary,
        usage: result.usage,
        cost: result.cost,
      })
    })
  }
  