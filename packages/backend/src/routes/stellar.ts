import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { Keypair, Networks, TransactionBuilder, BASE_FEE, Operation, Asset } from '@stellar/stellar-sdk'
import StellarSdk from '@stellar/stellar-sdk'
import { sql } from '../db/client'

const HORIZON_URL = process.env.STELLAR_HORIZON_URL!
const NETWORK = process.env.STELLAR_NETWORK === 'mainnet' ? Networks.PUBLIC : Networks.TESTNET

function getServer() {
  return new StellarSdk.Horizon.Server(HORIZON_URL)
}

const TransferBody = z.object({
  from: z.string(),
  to: z.string(),
  asset_code: z.string(),
  asset_issuer: z.string(),
  amount: z.string(),
})

export async function stellarRoutes(app: FastifyInstance) {
  // Check if an address is funded on Stellar
  app.get<{ Params: { address: string } }>('/account/:address', async (req, reply) => {
    try {
      const server = getServer()
      const account = await server.loadAccount(req.params.address)
      return { id: account.id, balances: account.balances }
    } catch {
      return reply.code(404).send({ error: 'Account not found or not funded' })
    }
  })

  // Admin: submit a signed transfer on behalf of the platform
  app.post('/transfer', async (req, reply) => {
    await req.jwtVerify()

    const body = TransferBody.parse(req.body)
    const adminSecret = process.env.STELLAR_ADMIN_SECRET!
    const adminKeypair = Keypair.fromSecret(adminSecret)

    // Verify both parties are KYC approved before submitting
    const [fromInvestor] = await sql`
      SELECT kyc_status, aml_status FROM investors WHERE stellar_address = ${body.from}
    `
    if (!fromInvestor || fromInvestor.kyc_status !== 'approved' || fromInvestor.aml_status !== 'approved') {
      return reply.code(403).send({ error: 'Sender not KYC/AML approved' })
    }

    const [toInvestor] = await sql`
      SELECT kyc_status, aml_status FROM investors WHERE stellar_address = ${body.to}
    `
    if (!toInvestor || toInvestor.kyc_status !== 'approved' || toInvestor.aml_status !== 'approved') {
      return reply.code(403).send({ error: 'Recipient not KYC/AML approved' })
    }

    const server = getServer()
    const sourceAccount = await server.loadAccount(adminKeypair.publicKey())
    const asset = new Asset(body.asset_code, body.asset_issuer)

    const tx = new TransactionBuilder(sourceAccount, { fee: BASE_FEE, networkPassphrase: NETWORK })
      .addOperation(Operation.payment({ destination: body.to, asset, amount: body.amount }))
      .setTimeout(30)
      .build()

    tx.sign(adminKeypair)
    const result = await server.submitTransaction(tx)

    return { hash: result.hash }
  })
}
