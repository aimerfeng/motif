import { expect, test } from '@playwright/test'

test('Skills 页面列出通用 skill，并能展开 SKILL.md', async ({ page }) => {
  await page.goto('/skills')
  const library = page.getByTestId('skill-library')
  await expect(library.getByRole('article')).toHaveCount(8)

  const design = library.getByRole('article').filter({ hasText: 'motif-design' })
  await expect(design.getByRole('button', { name: 'npx skills add aimerfeng/motif --skill motif-design' })).toBeVisible()
  await design.getByRole('button', { name: '查看内容' }).click()
  await expect(design.locator('pre')).toContainText('name: motif-design')
})
