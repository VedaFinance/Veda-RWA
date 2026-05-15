const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export type Asset = {
  id: string
  asset_id: string
  name: string
  asset_type: string
  total_value: number
  token_contract: string | null
  active: boolean
}

export type Investor = {
  id: string
  stellar_address: string
  email: string
  kyc_status: 'pending' | 'approved' | 'rejected'
  aml_status: 'pending' | 'approved' | 'rejected'
}

export const api = {
  assets: {
    list: () => get<Asset[]>('/assets'),
    get: (id: string) => get<Asset>(`/assets/${id}`),
  },
  kyc: {
    get: (address: string) => get<Investor>(`/kyc/${address}`),
    register: (stellar_address: string, email: string) =>
      fetch(`${BASE}/kyc/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stellar_address, email }),
      }).then((r) => r.json()),
  },
  stellar: {
    account: (address: string) => get<{ id: string; balances: unknown[] }>(`/stellar/account/${address}`),
  },
}
