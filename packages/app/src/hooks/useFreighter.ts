'use client'
import { useState, useCallback } from 'react'
import {
  isConnected,
  getPublicKey,
  signTransaction,
} from '@stellar/freighter-api'

export function useFreighter() {
  const [address, setAddress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const connect = useCallback(async () => {
    setError(null)
    try {
      const connected = await isConnected()
      if (!connected) {
        setError('Freighter not installed')
        return
      }
      const pubKey = await getPublicKey()
      setAddress(pubKey)
    } catch (e) {
      setError(String(e))
    }
  }, [])

  const disconnect = useCallback(() => setAddress(null), [])

  return { address, error, connect, disconnect, signTransaction }
}
