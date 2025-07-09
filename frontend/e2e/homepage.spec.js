import { test, expect } from "@playwright/test"

test.describe("Homepage", () => {
  test("should load and display main elements", async ({ page }) => {
    await page.goto("/")

    // 检查页面标题
    await expect(page).toHaveTitle(/RAG Audit/)

    // 检查主要导航元素
    await expect(page.locator("h1")).toContainText("RAG Audit")

    // 检查卡片元素
    await expect(page.locator('[data-testid="analysis-card"]')).toBeVisible()
    await expect(page.locator('[data-testid="upload-card"]')).toBeVisible()
    await expect(page.locator('[data-testid="chat-card"]')).toBeVisible()

    // 检查健康状态指示器
    await expect(page.locator('[data-testid="health-status"]')).toBeVisible()
  })

  test("should navigate to analysis page", async ({ page }) => {
    await page.goto("/")

    // 点击分析卡片
    await page.click('[data-testid="analysis-card"] button')

    // 验证导航到分析页面
    await expect(page).toHaveURL("/analyze")
    await expect(page.locator("h1")).toContainText("智能合约安全分析")
  })

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto("/")

    // 检查移动端布局
    await expect(page.locator(".grid")).toHaveClass(/grid-cols-1/)
  })
})
