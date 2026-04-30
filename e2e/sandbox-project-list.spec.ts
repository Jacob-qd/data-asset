import { test, expect } from '@playwright/test';

test.describe('沙箱开发环境页面测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/sandbox/ide', { timeout: 20000, waitUntil: 'domcontentloaded' });
    await page.locator('h1').waitFor({ timeout: 15000 });
  });

  test('页面标题和基本结构', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('沙箱开发环境');
    await expect(page.locator('button:has-text("新建环境")')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });

  test('搜索功能', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="搜索环境名称..."]');
    await searchInput.fill('金融');
    await expect(page.locator('table tbody tr').first()).toBeVisible();
    
    await searchInput.fill('不存在的');
    await expect(page.locator('table tbody tr')).toHaveCount(0);
  });

  test('Tab切换', async ({ page }) => {
    await page.locator('button[role="tab"]:has-text("我的环境")').click();
    await expect(page.locator('table')).toBeVisible();
    
    await page.locator('button[role="tab"]:has-text("参与的环境")').click();
    await expect(page.locator('table')).toBeVisible();
  });

  test('新建环境对话框', async ({ page }) => {
    await page.locator('button:has-text("新建环境")').click();
    await expect(page.locator('text=新建沙箱环境')).toBeVisible();
    
    // 验证表单字段
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog.locator('text=环境名称').first()).toBeVisible();
    await expect(dialog.locator('text=所属领域').first()).toBeVisible();
    await expect(dialog.locator('text=资源配置').first()).toBeVisible();
    
    // 取消
    await page.locator('button:has-text("取消")').click();
    await expect(page.locator('text=新建沙箱环境')).not.toBeVisible();
  });

  test('环境详情对话框', async ({ page }) => {
    // 点击第一个环境的名称
    await page.locator('table tbody tr:first-child td:nth-child(2) span').click();
    
    // 验证详情对话框
    await expect(page.locator('text=环境详情')).toBeVisible();
    await expect(page.locator('text=资源配置')).toBeVisible();
    
    // 关闭
    await page.locator('button:has-text("关闭")').last().click();
  });

  test('进入IDE按钮', async ({ page }) => {
    // 点击第一个环境的进入IDE按钮
    const ideButton = page.locator('table tbody tr:first-child button:has-text("进入IDE")');
    await ideButton.click();
    
    // 检查URL是否跳转到IDE页面
    await expect(page).toHaveURL(/.*sandbox\/ide\/.*/);
  });
});
