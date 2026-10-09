/**
 * 端到端测试用的浏览器钱包：一个 EIP-1193 provider，通过 EIP-6963 公告给页面。
 * 本地 Hardhat 节点的开发账户是解锁的，签名和发交易直接转给节点（personal_sign、eth_sendTransaction），
 * 不需要私钥。只用于本地测试链。
 */
export function installMockWallet({ rpc, account }: { rpc: string; account: string }) {
  let current = account
  let id = 0
  const listeners: Record<string, ((value: unknown) => void)[]> = {}
  const call = async (method: string, params: unknown[]) => {
    const response = await fetch(rpc, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: ++id, method, params }) })
    const json = (await response.json()) as { result?: unknown; error?: { code: number; message: string; data?: unknown } }
    if (json.error) throw Object.assign(new Error(json.error.message), { code: json.error.code, data: json.error.data })
    return json.result
  }
  const provider = {
    request: async ({ method, params = [] }: { method: string; params?: unknown[] }) => {
      if (method === 'eth_requestAccounts' || method === 'eth_accounts') return [current]
      if (method === 'wallet_switchEthereumChain' || method === 'wallet_addEthereumChain') return null
      return call(method, params)
    },
    on: (event: string, listener: (value: unknown) => void) => {
      ;(listeners[event] ??= []).push(listener)
    },
    removeListener: (event: string, listener: (value: unknown) => void) => {
      listeners[event] = (listeners[event] ?? []).filter((entry) => entry !== listener)
    },
  }
  // 测试里切换账户：模拟用户在钱包里换了一个地址。
  ;(window as unknown as { __motifWallet: { use: (address: string) => void } }).__motifWallet = {
    use(address: string) {
      current = address
      for (const listener of listeners.accountsChanged ?? []) listener([address])
    },
  }
  const info = { uuid: 'motif-test-wallet', name: 'Motif Test Wallet', icon: '', rdns: 'dev.motif.test-wallet' }
  const announce = () => window.dispatchEvent(new CustomEvent('eip6963:announceProvider', { detail: Object.freeze({ info, provider }) }))
  window.addEventListener('eip6963:requestProvider', announce)
  announce()
}
