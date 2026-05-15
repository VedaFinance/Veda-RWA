import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { kycRoutes } from './routes/kyc'
import { assetsRoutes } from './routes/assets'
import { stellarRoutes } from './routes/stellar'

export function buildApp() {
  const app = Fastify({ logger: true })

  app.register(cors, { origin: true })
  app.register(jwt, { secret: process.env.JWT_SECRET! })

  app.register(kycRoutes, { prefix: '/kyc' })
  app.register(assetsRoutes, { prefix: '/assets' })
  app.register(stellarRoutes, { prefix: '/stellar' })

  app.get('/health', async () => ({ status: 'ok' }))

  return app
}
