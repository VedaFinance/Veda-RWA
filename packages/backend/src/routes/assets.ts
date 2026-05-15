import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { sql } from '../db/client'

const CreateAsset = z.object({
  asset_id: z.string(),
  name: z.string(),
  asset_type: z.string(),
  total_value: z.number().int().positive(),
  token_contract: z.string().optional(),
})

export async function assetsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    return sql`SELECT * FROM assets WHERE active = true ORDER BY created_at DESC`
  })

  app.get<{ Params: { id: string } }>('/:id', async (req, reply) => {
    const [asset] = await sql`SELECT * FROM assets WHERE asset_id = ${req.params.id}`
    if (!asset) return reply.code(404).send({ error: 'Not found' })
    return asset
  })

  app.post('/', async (req, reply) => {
    await req.jwtVerify()
    const body = CreateAsset.parse(req.body)
    const [asset] = await sql`
      INSERT INTO assets ${sql(body)}
      RETURNING *
    `
    return reply.code(201).send(asset)
  })

  app.patch<{ Params: { id: string } }>('/:id/value', async (req, reply) => {
    await req.jwtVerify()
    const { total_value } = z.object({ total_value: z.number().int().positive() }).parse(req.body)
    const [asset] = await sql`
      UPDATE assets SET total_value = ${total_value} WHERE asset_id = ${req.params.id} RETURNING *
    `
    if (!asset) return reply.code(404).send({ error: 'Not found' })
    return asset
  })
}
