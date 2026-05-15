import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { sql } from '../db/client'

const RegisterBody = z.object({
  stellar_address: z.string().min(56).max(56),
  email: z.string().email(),
})

const StatusBody = z.object({
  stellar_address: z.string(),
  kyc_status: z.enum(['pending', 'approved', 'rejected']),
  aml_status: z.enum(['pending', 'approved', 'rejected']),
})

export async function kycRoutes(app: FastifyInstance) {
  // Register a new investor
  app.post('/register', async (req, reply) => {
    const body = RegisterBody.parse(req.body)
    const [investor] = await sql`
      INSERT INTO investors (stellar_address, email)
      VALUES (${body.stellar_address}, ${body.email})
      ON CONFLICT (stellar_address) DO NOTHING
      RETURNING *
    `
    if (!investor) return reply.code(409).send({ error: 'Address already registered' })
    return investor
  })

  // Get KYC status for an address
  app.get<{ Params: { address: string } }>('/:address', async (req, reply) => {
    const [investor] = await sql`
      SELECT * FROM investors WHERE stellar_address = ${req.params.address}
    `
    if (!investor) return reply.code(404).send({ error: 'Not found' })
    return investor
  })

  // Admin: update KYC/AML status
  app.patch('/status', async (req, reply) => {
    await req.jwtVerify()
    const body = StatusBody.parse(req.body)
    const [updated] = await sql`
      UPDATE investors
      SET kyc_status = ${body.kyc_status},
          aml_status = ${body.aml_status},
          updated_at = now()
      WHERE stellar_address = ${body.stellar_address}
      RETURNING *
    `
    if (!updated) return reply.code(404).send({ error: 'Not found' })
    return updated
  })
}
