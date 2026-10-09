import { mkdir, readFile, writeFile } from 'node:fs/promises'

/**
 * 把编译产物里的 ABI 导出成 src/generated/abi.ts（带 as const，viem 能据此推断类型）。
 * ABI 以 Solidity 源码为准，这份文件只是搬运；站点不需要装 Hardhat、不需要编译合约就能用。
 * `--check`：只比较不写入，供 pnpm test 发现忘了重新导出的情况。
 */
const CONTRACTS = ['MotifToken', 'MotifGovernor', 'MotifTimelock', 'MotifIdentity', 'MotifRegistry', 'MotifCuration']

const ROOT = new URL('../', import.meta.url)
const TARGET = new URL('src/generated/abi.ts', ROOT)

async function render(): Promise<string> {
  const blocks: string[] = []
  for (const name of CONTRACTS) {
    const artifact = JSON.parse(await readFile(new URL(`artifacts/contracts/${name}.sol/${name}.json`, ROOT), 'utf8')) as {
      abi: unknown
    }
    const id = `${name.charAt(0).toLowerCase()}${name.slice(1)}Abi`
    blocks.push(`export const ${id} = ${JSON.stringify(artifact.abi, null, 2)} as const\n`)
  }
  return [
    '// 由 scripts/export-abi.ts 从 Hardhat 编译产物生成，不要手改。改了合约之后运行 `pnpm --filter @motif/contracts abi`。',
    '',
    ...blocks,
  ].join('\n')
}

const next = await render()
if (process.argv.includes('--check')) {
  const current = await readFile(TARGET, 'utf8').catch(() => '')
  if (current !== next) {
    console.error('src/generated/abi.ts is out of date; run `pnpm --filter @motif/contracts abi`.')
    process.exitCode = 1
  }
} else {
  await mkdir(new URL('./', TARGET), { recursive: true })
  await writeFile(TARGET, next)
  console.log(`wrote ${CONTRACTS.length} ABIs to src/generated/abi.ts`)
}
