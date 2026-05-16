'use client'
import { useEffect, useState } from 'react'
import { useFreighter } from '@/hooks/useFreighter'
import { api, type Asset, type Investor } from '@/lib/api'

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const { address, error: walletError, connect, disconnect } = useFreighter()
  const [assets, setAssets] = useState<Asset[]>([])
  const [investor, setInvestor] = useState<Investor | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    api.assets.list().then(setAssets).catch(console.error)
  }, [])

  useEffect(() => {
    if (!address) return
    api.kyc.get(address).then(setInvestor).catch(() => setInvestor(null))
  }, [address])

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-2xl font-bold tracking-tight">Veda RWA Platform</h1>
        {mounted && address ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 font-mono">
              {address.slice(0, 6)}…{address.slice(-4)}
            </span>
            <button
              onClick={disconnect}
              className="text-sm px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700"
            >
              Disconnect
            </button>
          </div>
        ) : mounted ? (
          <button
            onClick={connect}
            className="px-4 py-2 rounded bg-brand text-white font-medium hover:bg-brand-dark"
          >
            Connect Freighter
          </button>
        ) : null}
      </div>

      {walletError && (
        <p className="mb-6 text-sm text-red-400">{walletError}</p>
      )}

      {/* KYC status banner */}
      {address && investor && (
        <div className={`mb-6 px-4 py-3 rounded text-sm font-medium ${
          investor.kyc_status === 'approved' && investor.aml_status === 'approved'
            ? 'bg-green-900/40 text-green-300'
            : 'bg-yellow-900/40 text-yellow-300'
        }`}>
          KYC: {investor.kyc_status} · AML: {investor.aml_status}
        </div>
      )}

      {address && !investor && (
        <div className="mb-6 px-4 py-3 rounded text-sm bg-gray-800 text-gray-400">
          Address not registered. Contact your administrator to complete KYC.
        </div>
      )}

      {/* Asset grid */}
      <h2 className="text-lg font-semibold mb-4">Available Assets</h2>
      {assets.length === 0 ? (
        <p className="text-gray-500 text-sm">No assets listed yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((a) => (
            <AssetCard key={a.id} asset={a} />
          ))}
        </div>
      )}
    </main>
  )
}

function AssetCard({ asset }: { asset: Asset }) {
  const value = (asset.total_value / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
          {asset.asset_type}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          asset.active ? 'bg-green-900/50 text-green-400' : 'bg-gray-800 text-gray-500'
        }`}>
          {asset.active ? 'Active' : 'Inactive'}
        </span>
      </div>
      <h3 className="font-semibold text-white">{asset.name}</h3>
      <p className="text-xl font-bold text-brand">{value}</p>
      <p className="text-xs text-gray-500 font-mono truncate">
        {asset.token_contract ?? 'No contract deployed'}
      </p>
    </div>
  )
}
