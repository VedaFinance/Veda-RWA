import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useFreighter } from './useFreighter'

vi.mock('@stellar/freighter-api', () => ({
  isConnected: vi.fn(),
  getPublicKey: vi.fn(),
  signTransaction: vi.fn(),
}))

import { isConnected, getPublicKey } from '@stellar/freighter-api'

const mockIsConnected = vi.mocked(isConnected)
const mockGetPublicKey = vi.mocked(getPublicKey)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useFreighter', () => {
  it('connect sets address on success', async () => {
    mockIsConnected.mockResolvedValue(true)
    mockGetPublicKey.mockResolvedValue('GABC123')

    const { result } = renderHook(() => useFreighter())

    await act(async () => { await result.current.connect() })

    expect(result.current.address).toBe('GABC123')
    expect(result.current.error).toBeNull()
  })

  it('connect sets error if Freighter not installed', async () => {
    mockIsConnected.mockResolvedValue(false)

    const { result } = renderHook(() => useFreighter())

    await act(async () => { await result.current.connect() })

    expect(result.current.address).toBeNull()
    expect(result.current.error).toBe('Freighter not installed')
  })

  it('disconnect clears address', async () => {
    mockIsConnected.mockResolvedValue(true)
    mockGetPublicKey.mockResolvedValue('GABC123')

    const { result } = renderHook(() => useFreighter())

    await act(async () => { await result.current.connect() })
    expect(result.current.address).toBe('GABC123')

    act(() => { result.current.disconnect() })
    expect(result.current.address).toBeNull()
  })
})
