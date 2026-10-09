/** E2E 用独立端口，不和本地开发（3000 / 4100 / 8545）冲突。 */
export const E2E = {
  webPort: 3100,
  previewPort: 4110,
  chainPort: 8546,
  get webUrl() {
    return `http://localhost:${this.webPort}`
  },
  get previewUrl() {
    return `http://127.0.0.1:${this.previewPort}`
  },
  get chainUrl() {
    return `http://127.0.0.1:${this.chainPort}`
  },
}

/** Hardhat 本地节点的默认开发账户（公开的测试助记词，只能用于本地链）。角色见 ignition/parameters/local.json。 */
export const ACCOUNTS = {
  moderator: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  curatorA: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
  curatorB: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
  holder: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
  creator: '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
  nominee: '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
} as const
