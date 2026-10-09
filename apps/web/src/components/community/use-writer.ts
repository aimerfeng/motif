'use client'

import { useTranslations } from 'next-intl'
import { useCallback, useState } from 'react'
import {
  BaseError,
  ContractFunctionRevertedError,
  UserRejectedRequestError,
  type Abi,
  type Address,
  type ContractFunctionArgs,
  type ContractFunctionName,
  type Hex,
  type TransactionReceipt,
} from 'viem'
import { useRouter } from '@/i18n/navigation'
import { useCommunity } from './wallet'

type Mutability = 'nonpayable' | 'payable'

export interface ContractCall<abi extends Abi, fn extends ContractFunctionName<abi, Mutability>> {
  address: Address
  abi: abi
  functionName: fn
  args: ContractFunctionArgs<abi, Mutability, fn>
}

export type WritePhase = 'idle' | 'signing' | 'pending' | 'syncing' | 'done' | 'failed'

/**
 * 发合约交易：先在本地模拟（合约会回滚时直接给出原因，不浪费 gas），再请钱包签名，等上链，
 * 然后等服务端同步到这个区块并刷新页面，用户马上能看到结果。
 */
export function useWriter() {
  const { walletClient, publicClient, refreshAccount } = useCommunity()
  const router = useRouter()
  const t = useTranslations('community.errors')
  const [phase, setPhase] = useState<WritePhase>('idle')
  const [error, setError] = useState<string | null>(null)

  const describe = useCallback(
    (cause: unknown): string => {
      if (cause instanceof BaseError) {
        if (cause.walk((e) => e instanceof UserRejectedRequestError)) return t('rejected')
        const reverted = cause.walk((e) => e instanceof ContractFunctionRevertedError)
        const name = reverted instanceof ContractFunctionRevertedError ? reverted.data?.errorName : undefined
        // 合约的自定义错误名直接对应文案键；没有翻译的错误原样显示错误名。
        const key = `contract.${name}` as Parameters<typeof t>[0]
        if (name) return t.has(key) ? t(key) : name
        return cause.shortMessage
      }
      return cause instanceof Error ? cause.message : String(cause)
    },
    [t],
  )

  const write = useCallback(
    async <const abi extends Abi, fn extends ContractFunctionName<abi, Mutability>>(call: ContractCall<abi, fn>): Promise<TransactionReceipt> => {
      if (!walletClient?.account || !publicClient) throw new Error(t('notConnected'))
      setPhase('signing')
      // viem 的泛型穿不过这个通用的辅助函数；参数已经由调用方的 ContractCall<abi, fn> 按 ABI 检查过，这里按 unknown 转交。
      const simulate = publicClient.simulateContract as (parameters: unknown) => Promise<{ request: unknown }>
      const send = walletClient.writeContract as (parameters: unknown) => Promise<Hex>
      const { request } = await simulate({ ...call, account: walletClient.account })
      const hash = await send(request)
      setPhase('pending')
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      if (receipt.status !== 'success') throw new Error(t('reverted'))
      setPhase('syncing')
      await fetch('/api/community/sync', { method: 'POST', body: JSON.stringify({ block: receipt.blockNumber.toString() }) })
      return receipt
    },
    [walletClient, publicClient, t],
  )

  /** 跑一串交易（例如先授权押金再投稿）；全部成功后刷新账户和页面。返回是否成功。 */
  const run = useCallback(
    async (steps: (helpers: { write: typeof write }) => Promise<void>): Promise<boolean> => {
      setError(null)
      try {
        await steps({ write })
      } catch (cause) {
        console.error(cause)
        setError(describe(cause))
        setPhase('failed')
        return false
      }
      // 交易已经成功；刷新账户信息失败只影响显示，不能把这次操作报成失败。
      setPhase('done')
      await refreshAccount().catch((cause: unknown) => console.error(cause))
      router.refresh()
      return true
    },
    [write, refreshAccount, router, describe],
  )

  const reset = useCallback(() => {
    setPhase('idle')
    setError(null)
  }, [])

  return { run, phase, error, busy: phase === 'signing' || phase === 'pending' || phase === 'syncing', reset, describe }
}
