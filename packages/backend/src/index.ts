import 'dotenv/config'
import { buildApp } from './app'

const port = Number(process.env.PORT ?? 3001)

const app = buildApp()

app.listen({ port, host: '0.0.0.0' }, (err, address) => {
  if (err) { console.error(err); process.exit(1) }
  console.log(`veda-backend listening at ${address}`)
})
