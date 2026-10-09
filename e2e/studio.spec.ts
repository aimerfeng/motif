import { expect, test, type Page } from '@playwright/test'

/** 收集页面上的错误；Studio 的整条链路（流式事件、预览回报、编辑器）都不该在控制台留下错误。 */
function watchErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(String(error)))
  return errors
}

const previewMounted = (page: Page) => expect(page.locator('iframe').first()).toHaveAttribute('data-preview-state', 'mounted')

test('从市场条目进入工作台：agent 改坏、自己修好、调参，再应用为默认值并能用 shadcn 安装', async ({ page, request }) => {
  const errors = watchErrors(page)
  await page.goto('/market/border-beam')
  await page.getByTestId('open-in-studio').click()
  await expect(page).toHaveURL(/\/studio\/[a-z0-9]{12}$/)
  const id = page.url().split('/').pop()!
  await expect(page.getByTestId('studio-title')).toHaveText('边框光束')
  await previewMounted(page)

  await page.getByTestId('studio-prompt').fill('把光束换成青色')
  await page.getByRole('button', { name: '发送' }).click()
  const transcript = page.getByTestId('studio-transcript')
  await expect(transcript.getByText('完成', { exact: true })).toBeVisible()
  // 脚本先把组件改坏（编译出错，工具行标红），再改回来。
  await expect(transcript.locator('details[data-state="error"]')).toHaveCount(1)
  await expect(page.getByTestId('studio-status')).toContainText('编译通过')
  await previewMounted(page)
  await expect(page.getByTestId('tune-panel').getByLabel('光头颜色').last()).toHaveValue('#22d3ee')

  await page.getByRole('button', { name: '应用为默认值' }).click()
  await expect(page.getByTestId('code-editor')).toContainText("colorFrom: '#22d3ee'")
  await expect(page.getByRole('button', { name: '应用为默认值' })).toBeDisabled()

  const registry = await request.get(`/r/s/${id}.json`)
  expect(registry.ok()).toBe(true)
  expect((await registry.json()).files[0].content).toContain("colorFrom: '#22d3ee'")
  expect(errors).toEqual([])
})

test('回到某一轮之前的版本，回退本身也能撤销', async ({ page, request }) => {
  const created = await request.post('/api/studio/sessions', { data: { base: 'border-beam' } })
  const { id } = (await created.json()) as { id: string }
  await page.goto(`/studio/${id}`)
  await previewMounted(page)
  const headColor = page.getByTestId('tune-panel').getByLabel('光头颜色').last()
  const original = await headColor.inputValue()

  await page.getByTestId('studio-prompt').fill('换个颜色')
  await page.getByRole('button', { name: '发送' }).click()
  await expect(page.getByTestId('studio-transcript').getByText('完成', { exact: true })).toBeVisible()
  await expect(headColor).toHaveValue('#22d3ee')

  await page.getByRole('button', { name: '回到这一步之前' }).click()
  await expect(page.getByTestId('studio-reverted')).toBeVisible()
  await expect(headColor).toHaveValue(original)

  await page.getByRole('button', { name: '撤销这次回退' }).click()
  await expect(headColor).toHaveValue('#22d3ee')
})

test('手动保存出错的代码时列出问题，修好后恢复', async ({ page, request }) => {
  const created = await request.post('/api/studio/sessions', { data: {} })
  const { id } = (await created.json()) as { id: string }
  const session = await (await request.get(`/api/studio/sessions/${id}`)).json()
  const broken = { ...session.item, files: { ...session.item.files, 'effect.tsx': `${session.item.files['effect.tsx']}\nexport const = 1\n` } }
  expect((await request.put(`/api/studio/sessions/${id}/item`, { data: { item: broken } })).ok()).toBe(true)

  await page.goto(`/studio/${id}`)
  await expect(page.getByTestId('studio-title')).toHaveText('新效果')
  await expect(page.getByTestId('studio-status')).toContainText('问题')
  await page.getByRole('tab', { name: /问题/ }).click()
  await expect(page.getByTestId('studio-problems')).toContainText('compile')

  expect((await request.put(`/api/studio/sessions/${id}/item`, { data: { item: session.item } })).ok()).toBe(true)
  await page.reload()
  await expect(page.getByTestId('studio-status')).toContainText('编译通过')
  await previewMounted(page)
})

test('工作台首页带着第一句话开始，进入会话后自动发送', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/studio')
  await page.getByTestId('studio-home-prompt').fill('做一个柔和的背景')
  await page.getByTestId('studio-home-start').click()
  await expect(page).toHaveURL(/\/studio\/[a-z0-9]{12}$/)
  await expect(page.getByTestId('studio-transcript').getByText('做一个柔和的背景')).toBeVisible()
  await expect(page.getByTestId('studio-transcript').getByText('完成', { exact: true })).toBeVisible()

  // 回到首页能在「最近的会话」里找到它。
  await page.goto('/studio')
  await expect(page.getByRole('link', { name: /新效果/ })).toBeVisible()
  expect(errors).toEqual([])
})
