import { expect, test, type Browser, type Page } from '@playwright/test'
import { ACCOUNTS, E2E } from './support/env'
import { installMockWallet } from './support/mock-wallet'

/*
 * 社区：钱包、投稿、审核、市场、治理。链是 e2e 自己起的本地节点（见 support/start.ts），
 * 钱包是转发给本地节点的测试钱包（support/mock-wallet.ts），签名和交易都真实上链。
 * 同一条链可能被重复使用（本地复用已启动的服务），所以 slug、handle、提案标题都带本次运行的后缀。
 */

const run = Date.now().toString(36)

async function rpc(method: string, params: unknown[] = []) {
  const response = await fetch(E2E.chainUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  return ((await response.json()) as { result: unknown }).result
}

/**
 * 快进链上时间（投票延迟、投票期、时间锁）。
 * 站点两次同步链上状态至少间隔 1 秒，快进之后等这段时间过去，刷新页面时服务端才会读到新的区块时间。
 */
async function travel(seconds: number) {
  await rpc('evm_increaseTime', [seconds])
  await rpc('evm_mine')
  await new Promise((resolve) => setTimeout(resolve, 1200))
}

/** 以某个地址打开一个新页面并连上钱包。每个角色一个独立的浏览器上下文，互不影响。 */
async function asAccount(browser: Browser, account: string, path: string): Promise<Page> {
  const context = await browser.newContext({ locale: 'zh-CN' })
  await context.addInitScript(installMockWallet, { rpc: E2E.chainUrl, account })
  const page = await context.newPage()
  await page.goto(path)
  await page.getByTestId('wallet-button').click()
  await page.getByRole('button', { name: 'Motif Test Wallet' }).click()
  await expect(page.getByTestId('wallet-button')).not.toHaveText('连接钱包')
  return page
}

test('目录条目在详情页显示链上验证', async ({ page }) => {
  await page.goto('/market/border-beam')
  const badge = page.getByTestId('chain-badge')
  await expect(badge).toHaveAttribute('data-state', 'verified')
  await expect(badge).toHaveText('链上已验证 · v1')
})

test('作者投稿 Remix，两位审核员通过，作品进入市场', async ({ browser, request }) => {
  const creator = await asAccount(browser, ACCOUNTS.creator, '/community')
  await creator.getByRole('button', { name: '领取 1 ETH 和 1000 MOTIF' }).click()
  await expect(creator.getByRole('button', { name: '已到账' })).toBeVisible()

  // 资料：第一次是注册，重复运行时是改名。
  const handle = `creator-${run}`
  await creator.goto('/community/profile')
  await creator.getByTestId('profile-handle').fill(handle)
  await creator.getByTestId('profile-name').fill('E2E Creator')
  await creator.getByTestId('profile-save').click()
  await expect(creator.getByTestId('wallet-button')).toHaveText(`@${handle}`)

  // 以市场里的边框光束为底做一个 Remix。
  const source = (await (await request.get('/api/items/border-beam/source')).json()) as {
    manifest: { slug: string; title: Record<string, string>; provenance: { basedOn?: string } }
  }
  const slug = `border-beam-${run}`
  source.manifest.slug = slug
  source.manifest.title = { 'zh-CN': `社区光束 ${run}`, en: `Community beam ${run}` }
  source.manifest.provenance.basedOn = 'border-beam'

  await creator.goto('/community/submit')
  await creator.getByTestId('submit-file').setInputFiles({ name: `${slug}.motif.json`, mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(source)) })
  const report = creator.getByTestId('submit-report')
  await expect(report).toContainText('检查通过')
  await expect(report).toContainText('border-beam v1')
  await expect(report.locator('iframe')).toHaveAttribute('data-preview-state', 'mounted')
  await creator.getByTestId('submit-button').click()
  await creator.waitForURL(/\/community\/items\/\d+$/)
  const itemPath = new URL(creator.url()).pathname
  await expect(creator.getByTestId('review-panel')).toContainText('审核中')

  for (const curator of [ACCOUNTS.curatorA, ACCOUNTS.curatorB]) {
    const page = await asAccount(browser, curator, itemPath)
    await page.getByTestId('item-actions').getByRole('textbox').fill('配色和节奏都很好，默认值就好看。')
    await page.getByTestId('vote-button').click()
    // 第一票之后显示“已投票”；第二票达到法定票数，审核当场结算，投票表单消失。
    await expect(page.getByTestId('vote-button')).toBeHidden()
    await page.context().close()
  }

  await creator.reload()
  const panel = creator.getByTestId('review-panel')
  await expect(panel).toContainText('已通过')
  await expect(panel).toContainText('配色和节奏都很好')
  await expect(panel).toContainText('奖励 1,000 MOTIF')

  // 进入市场：卡片带“社区”标记、指向社区作品页；详情页能预览、链上验证通过，Skill 和 shadcn 安装都可用。
  await creator.goto(`/market?q=${run}`)
  const card = creator.getByTestId(`card-${slug}`)
  await expect(card).toContainText('社区')
  await card.getByRole('link').first().click()
  await creator.waitForURL(`**/community/works/${slug}`)
  await expect(creator.getByTestId('chain-badge')).toHaveAttribute('data-state', 'verified')
  await expect(creator.locator('iframe').first()).toHaveAttribute('data-preview-state', 'mounted')
  expect((await request.get(`/skill/motif-${slug}.md`)).status()).toBe(200)
  expect((await request.get(`/r/${slug}.json`)).status()).toBe(200)

  // 作者主页：作品和声誉。
  await creator.goto(`/community/u/${handle}`)
  await expect(creator.getByRole('heading', { level: 1 })).toHaveText('E2E Creator')
  await expect(creator.getByTestId('reputation')).toContainText('声誉')
  await expect(creator.getByRole('link', { name: new RegExp(`社区光束 ${run}`) })).toBeVisible()
  await creator.context().close()
})

test('治理：委托、提案、投票、排队、执行，任命新的审核员', async ({ browser }) => {
  const holder = await asAccount(browser, ACCOUNTS.holder, '/community/governance')
  // 账户信息是异步读的：先等投票权显示出来，再看要不要委托（重复运行时已经委托过了）。
  await expect(holder.getByTestId('voting-power')).toBeVisible()
  const delegate = holder.getByTestId('delegate-button')
  if (await delegate.isVisible()) {
    await delegate.click()
    await expect(delegate).toBeHidden()
  }
  await expect(holder.getByTestId('voting-power')).not.toHaveText('0')
  // 提案门槛按上一秒的票数计算：先让链上时间往前走。
  await travel(2)

  const title = `任命审核员 ${run}`
  await holder.getByTestId('proposal-address').fill(ACCOUNTS.nominee)
  await holder.getByTestId('proposal-title').fill(title)
  await holder.getByTestId('propose-button').click()
  const proposal = holder.getByTestId('proposals').locator('li', { hasText: title })
  await expect(proposal).toContainText('等待投票')
  await expect(proposal).toContainText(`curation.grantRole(CURATOR_ROLE, ${ACCOUNTS.nominee})`)

  await travel(61)
  await holder.reload()
  await proposal.getByTestId('vote-for').click()
  await expect(proposal).toContainText('你已经投过票了')

  await travel(301)
  await holder.reload()
  await proposal.getByTestId('queue-button').click()
  await expect(proposal).toContainText('排队中')

  await travel(61)
  await holder.reload()
  await proposal.getByTestId('execute-button').click()
  await expect(proposal).toContainText('已执行')

  await holder.goto('/community/review')
  await expect(holder.getByRole('link', { name: `${ACCOUNTS.nominee.slice(0, 6)}…${ACCOUNTS.nominee.slice(-4)}` })).toBeVisible()
  await holder.context().close()
})
