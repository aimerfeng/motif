'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  createPublicClient,
  createWalletClient,
  custom,
  getAddress,
  numberToHex,
  type Address,
  type EIP1193Provider,
  type PublicClient,
  type WalletClient,
} from 'viem'
import { chainOf, type PublicCommunityConfig } from '@/lib/community/shared'

/*
 * 钱包连接：用 EIP-6963 发现浏览器里的钱包扩展（同时装了多个也能选），没有发现时退回 window.ethereum。
 * 只依赖 viem，不接 WalletConnect 之类需要外部中继服务的方案（国内访问不稳定，也违反“不依赖外部服务”的原则）。
 */

export interface DiscoveredWallet {
  id: string
  name: string
  icon: string | null
  provider: EIP1193Provider
}

export type WalletStatus = 'loading' | 'disabled' | 'no-wallet' | 'disconnected' | 'connecting' | 'wrong-chain' | 'connected'

export interface AccountInfo {
  address: Address
  handle: string | null
  registered: boolean
  reputation: bigint
  metadataHash: `0x${string}` | null
  curator: boolean
  /** 可以下架、恢复条目（注册表的版主）。 */
  moderator: boolean
  /** 可以处理冒充、违规的资料（身份合约的版主）。 */
  profileModerator: boolean
  /** 可以暂停、恢复投稿（审核合约的版主）。 */
  pauser: boolean
  balance: bigint
  allowance: bigint
  votes: bigint
  delegate: Address
  bond: bigint
  ethBalance: bigint
}

interface CommunityContextValue {
  config: PublicCommunityConfig | null
  status: WalletStatus
  wallets: DiscoveredWallet[]
  address: Address | null
  account: AccountInfo | null
  walletClient: WalletClient | null
  publicClient: PublicClient | null
  connect: (wallet?: DiscoveredWallet) => Promise<void>
  disconnect: () => void
  switchChain: () => Promise<void>
  /** 重新读取账户信息（发完交易后调用）。 */
  refreshAccount: () => Promise<void>
}

const CommunityContext = createContext<CommunityContextValue | null>(null)

export function useCommunity(): CommunityContextValue {
  const value = useContext(CommunityContext)
  if (!value) throw new Error('useCommunity must be used inside <CommunityProvider>')
  return value
}

// 只记住上次用的是哪个钱包，方便刷新后静默恢复连接；读写失败（隐私模式等）就当没有。
const REMEMBER_KEY = 'motif.wallet'
function remembered(): string | null {
  try {
    return window.localStorage.getItem(REMEMBER_KEY)
  } catch {
    return null
  }
}
function remember(id: string | null) {
  try {
    if (id) window.localStorage.setItem(REMEMBER_KEY, id)
    else window.localStorage.removeItem(REMEMBER_KEY)
  } catch {
    // 存不下就算了，只是下次要重新点连接。
  }
}

interface AnnounceDetail {
  info: { uuid: string; name: string; icon: string; rdns: string }
  provider: EIP1193Provider
}

function useDiscoveredWallets(): DiscoveredWallet[] {
  const [wallets, setWallets] = useState<DiscoveredWallet[]>([])
  useEffect(() => {
    const found = new Map<string, DiscoveredWallet>()
    const publish = () => setWallets([...found.values()])
    const onAnnounce = (event: Event) => {
      const { info, provider } = (event as CustomEvent<AnnounceDetail>).detail
      found.set(info.rdns || info.uuid, { id: info.rdns || info.uuid, name: info.name, icon: info.icon || null, provider })
      publish()
    }
    window.addEventListener('eip6963:announceProvider', onAnnounce)
    window.dispatchEvent(new Event('eip6963:requestProvider'))
    // 老式钱包只注入 window.ethereum，不发 EIP-6963 事件。
    const timer = window.setTimeout(() => {
      const injected = (window as { ethereum?: EIP1193Provider }).ethereum
      if (found.size === 0 && injected) {
        found.set('injected', { id: 'injected', name: 'Browser wallet', icon: null, provider: injected })
        publish()
      }
    }, 300)
    return () => {
      window.removeEventListener('eip6963:announceProvider', onAnnounce)
      window.clearTimeout(timer)
    }
  }, [])
  return wallets
}

function parseAccount(json: Record<string, string | boolean | null>): AccountInfo {
  const big = (key: string) => BigInt(json[key] as string)
  return {
    address: json.address as Address,
    handle: json.handle as string | null,
    registered: json.registered as boolean,
    reputation: big('reputation'),
    metadataHash: json.metadataHash as `0x${string}` | null,
    curator: json.curator as boolean,
    moderator: json.moderator as boolean,
    profileModerator: json.profileModerator as boolean,
    pauser: json.pauser as boolean,
    balance: big('balance'),
    allowance: big('allowance'),
    votes: big('votes'),
    delegate: json.delegate as Address,
    bond: big('bond'),
    ethBalance: big('ethBalance'),
  }
}

export function CommunityProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<PublicCommunityConfig | null>(null)
  const [configState, setConfigState] = useState<'loading' | 'ready' | 'disabled'>('loading')
  const wallets = useDiscoveredWallets()
  const [active, setActive] = useState<DiscoveredWallet | null>(null)
  const [address, setAddress] = useState<Address | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [account, setAccount] = useState<AccountInfo | null>(null)
  const restoring = useRef(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/community/config')
      .then((response) => response.json() as Promise<{ enabled: boolean } & PublicCommunityConfig>)
      .then((json) => {
        if (cancelled) return
        if (!json.enabled) {
          setConfigState('disabled')
          return
        }
        setConfig({ chainId: json.chainId, chainName: json.chainName, rpcUrl: json.rpcUrl, contracts: json.contracts, local: json.local })
        setConfigState('ready')
      })
      .catch(() => {
        if (!cancelled) setConfigState('disabled')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const attach = useCallback(async (wallet: DiscoveredWallet, request: 'eth_accounts' | 'eth_requestAccounts') => {
    const accounts = (await wallet.provider.request({ method: request })) as string[]
    if (accounts.length === 0) return false
    setActive(wallet)
    setAddress(getAddress(accounts[0]!))
    setChainId(Number(await wallet.provider.request({ method: 'eth_chainId' })))
    remember(wallet.id)
    return true
  }, [])

  // 刷新页面后，如果上次连过同一个钱包，用 eth_accounts 静默恢复（不弹窗）。
  useEffect(() => {
    if (restoring.current || active || wallets.length === 0) return
    const id = remembered()
    const wallet = id ? wallets.find((entry) => entry.id === id) : undefined
    if (!wallet) return
    restoring.current = true
    attach(wallet, 'eth_accounts').catch(() => remember(null))
  }, [wallets, active, attach])

  // 钱包里切换账户或网络时跟着变。
  useEffect(() => {
    if (!active) return
    const provider = active.provider
    const onAccounts = (accounts: string[]) => {
      if (accounts.length === 0) {
        setActive(null)
        setAddress(null)
        remember(null)
      } else setAddress(getAddress(accounts[0]!))
    }
    const onChain = (id: string) => setChainId(Number(id))
    provider.on('accountsChanged', onAccounts)
    provider.on('chainChanged', onChain)
    return () => {
      provider.removeListener('accountsChanged', onAccounts)
      provider.removeListener('chainChanged', onChain)
    }
  }, [active])

  const connect = useCallback(
    async (wallet?: DiscoveredWallet) => {
      const target = wallet ?? wallets[0]
      if (!target) return
      setConnecting(true)
      try {
        await attach(target, 'eth_requestAccounts')
      } finally {
        setConnecting(false)
      }
    },
    [wallets, attach],
  )

  const disconnect = useCallback(() => {
    setActive(null)
    setAddress(null)
    setAccount(null)
    remember(null)
  }, [])

  const switchChain = useCallback(async () => {
    if (!active || !config) return
    const hexId = numberToHex(config.chainId)
    try {
      await active.provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: hexId }] })
    } catch (error) {
      // 4902：钱包里还没有这个网络，先添加。
      if ((error as { code?: number }).code !== 4902) throw error
      await active.provider.request({
        method: 'wallet_addEthereumChain',
        params: [{ chainId: hexId, chainName: config.chainName, rpcUrls: [config.rpcUrl], nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 } }],
      })
    }
    setChainId(Number(await active.provider.request({ method: 'eth_chainId' })))
  }, [active, config])

  const latestAddress = useRef<Address | null>(null)
  useEffect(() => {
    latestAddress.current = address
  }, [address])
  const refreshAccount = useCallback(async () => {
    if (!address || configState !== 'ready') return
    const response = await fetch(`/api/community/accounts/${address}`, { cache: 'no-store' })
    if (!response.ok) return
    const info = parseAccount((await response.json()) as Record<string, string | boolean | null>)
    // 响应回来之前钱包里已经换了账户：这是旧账户的数据，丢掉。
    if (latestAddress.current === address) setAccount(info)
  }, [address, configState])

  useEffect(() => {
    setAccount(null)
    void refreshAccount()
  }, [refreshAccount])

  const onRightChain = config !== null && chainId === config.chainId
  const clients = useMemo(() => {
    if (!active || !address || !config || !onRightChain) return { walletClient: null, publicClient: null }
    const chain = chainOf(config)
    const transport = custom(active.provider)
    // 等交易回执时的轮询间隔：本地链每笔交易立即出块，按公链的默认值（4 秒）等太慢。
    const pollingInterval = config.local ? 250 : 2000
    return {
      walletClient: createWalletClient({ account: address, chain, transport, pollingInterval }),
      publicClient: createPublicClient({ chain, transport, pollingInterval }),
    }
  }, [active, address, config, onRightChain])

  const status: WalletStatus =
    configState === 'loading'
      ? 'loading'
      : configState === 'disabled'
        ? 'disabled'
        : connecting
          ? 'connecting'
          : address
            ? onRightChain
              ? 'connected'
              : 'wrong-chain'
            : wallets.length === 0
              ? 'no-wallet'
              : 'disconnected'

  const value: CommunityContextValue = {
    config,
    status,
    wallets,
    address,
    account,
    ...clients,
    connect,
    disconnect,
    switchChain,
    refreshAccount,
  }
  return <CommunityContext value={value}>{children}</CommunityContext>
}
