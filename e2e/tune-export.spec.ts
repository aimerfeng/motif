import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'
import { strFromU8, unzipSync } from 'fflate'

const SLUG = 'border-beam'

test('调参实时生效，写进分享链接和代码', async ({ page }) => {
  await page.goto(`/market/${SLUG}`)
  const frame = page.locator('iframe[title="边框光束"]')
  await expect(frame).toHaveAttribute('data-preview-state', 'mounted')

  const panel = page.getByTestId('tune-panel')
  await panel.getByLabel('光束长度').fill('300')
  await expect(page).toHaveURL(/#v=/)
  await expect(page.getByTestId('code-view')).toContainText('size: 300,')
  await expect(frame).toHaveAttribute('data-preview-state', 'mounted')

  // 刷新后从链接还原。
  await page.reload()
  await expect(page.getByTestId('code-view')).toContainText('size: 300,')

  // 预设覆盖当前值；重置回到默认。
  await panel.getByTestId('presets').getByRole('button', { name: '极光' }).click()
  await expect(page.getByTestId('code-view')).toContainText("colorFrom: '#34f5c5',")
  await panel.getByRole('button', { name: '重置' }).click()
  await expect(page.getByTestId('code-view')).toContainText('size: 160,')
  await expect(page).not.toHaveURL(/#v=/)
})

test('下载的项目和 Skill 带着调好的参数', async ({ page }) => {
  await page.goto(`/market/${SLUG}`)
  await page.getByTestId('tune-panel').getByLabel('绕一圈用时').fill('4.5')

  await page.getByRole('tab', { name: '安装' }).click()
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByTestId('download-starter').click()])
  expect(download.suggestedFilename()).toBe(`motif-${SLUG}.zip`)
  const files = unzipSync(new Uint8Array(await readFile(await download.path())))
  const component = strFromU8(files[`motif-${SLUG}/src/components/motif/${SLUG}/border-beam.tsx`]!)
  expect(component).toContain('duration: 4.5,')
  expect(component).toContain("from '../../../lib/motif-runtime'")
  expect(Object.keys(files)).toContain(`motif-${SLUG}/.claude/skills/motif-${SLUG}/SKILL.md`)

  await page.getByRole('tab', { name: 'Skill' }).click()
  const preview = page.getByTestId('skill-preview')
  await expect(preview).toContainText(`name: motif-${SLUG}`)
  await expect(preview).toContainText('| `duration` | 4.5 | 7 |')
})

test('shadcn registry 按链接里的参数生成组件', async ({ request }) => {
  const runtime = await request.get('/r/motif-runtime.json')
  expect(runtime.ok()).toBe(true)
  expect((await runtime.json()).type).toBe('registry:lib')

  // {"size":222} 的 base64url。
  const response = await request.get(`/r/${SLUG}.json?v=eyJzaXplIjoyMjJ9`)
  expect(response.ok()).toBe(true)
  const json = await response.json()
  expect(json.name).toBe(SLUG)
  expect(json.files[0].content).toContain('size: 222,')
  expect(json.registryDependencies[0]).toMatch(/\/r\/motif-runtime\.json$/)

  // 超出范围的值被丢弃，回到默认。
  const invalid = await request.get(`/r/${SLUG}.json?v=eyJzaXplIjo5OTk5fQ`)
  expect((await invalid.json()).files[0].content).toContain('size: 160,')
})
