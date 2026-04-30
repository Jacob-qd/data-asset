import { test, expect } from '@playwright/test';

test.describe('数据沙箱全页面测试', () => {
  test.describe('资源审批 /sandbox/resources', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/#/sandbox/resources');
      await page.locator('h1').waitFor();
    });

    test('页面标题和列表', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('资源审批');
      await expect(page.locator('table')).toBeVisible();
      await expect(page.locator('table tbody tr').first()).toBeVisible();
    });

    test('搜索功能', async ({ page }) => {
      await page.locator('input[placeholder*="搜索"]').fill('不存在的环境');
      await expect(page.locator('table tbody tr')).toHaveCount(0);
    });

    test('抽样对话框打开', async ({ page }) => {
      const sampleBtn = page.locator('button:has-text("抽取样本")').first();
      if (await sampleBtn.count() > 0) {
        await sampleBtn.click();
        await expect(page.getByRole('dialog')).toContainText('抽取样本');
        await page.getByRole('dialog').locator('button:has-text("取消")').click();
      }
    });

    test('变更配置对话框打开', async ({ page }) => {
      const configBtn = page.locator('table tbody tr').first().locator('button').filter({ hasText: '变更' });
      if (await configBtn.count() > 0) {
        await configBtn.click();
        await expect(page.getByRole('dialog')).toContainText('变更资源配置');
        await page.getByRole('dialog').locator('button:has-text("取消")').click();
      }
    });
  });

  test.describe('产品验证 /sandbox/verify', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/#/sandbox/verify');
      await page.locator('h1').waitFor();
    });

    test('页面标题和列表', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('产品验证');
      await expect(page.locator('table')).toBeVisible();
    });

    test('状态筛选', async ({ page }) => {
      const statusBtn = page.locator('button:has-text("待审核"), select');
      if (await statusBtn.count() > 0) {
        await statusBtn.first().click();
        await expect(page.locator('table tbody tr').first()).toBeVisible();
      }
    });
  });

  test.describe('数据探查 /sandbox/preview', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/#/sandbox/preview');
      await page.locator('h1').waitFor();
    });

    test('页面标题和结构', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('数据探查');
      await expect(page.locator('table')).toBeVisible();
    });

    test('数据源选择和表格显示', async ({ page }) => {
      await expect(page.locator('table tbody tr').first()).toBeVisible();
    });
  });

  test.describe('数据加工 /sandbox/preprocess', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/#/sandbox/preprocess');
      await page.locator('h1').waitFor();
    });

    test('页面标题和工具列表', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('数据加工');
      await expect(page.locator('table')).toBeVisible();
      await expect(page.locator('text=缺失值填充')).toBeVisible();
    });

    test('Tab切换 - 加工流程', async ({ page }) => {
      const flowTab = page.locator('button[role="tab"]:has-text("加工流程")');
      if (await flowTab.count() > 0) {
        await flowTab.click();
        await expect(page.locator('text=加工流程')).toBeVisible();
      }
    });
  });

  test.describe('模型开发 /sandbox/train', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/#/sandbox/train');
      await page.locator('h1').waitFor();
    });

    test('页面标题和算法列表', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('模型开发');
      await expect(page.locator('table')).toBeVisible();
      await expect(page.locator('text=XGBoost分类器')).toBeVisible();
    });

    test('Tab切换 - 训练任务', async ({ page }) => {
      const taskTab = page.locator('button[role="tab"]:has-text("训练任务")');
      if (await taskTab.count() > 0) {
        await taskTab.click();
        await expect(page.locator('text=训练任务列表')).toBeVisible();
      }
    });
  });

  test.describe('沙箱审计 /sandbox/audit', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/#/sandbox/audit');
      await page.locator('h1').waitFor();
    });

    test('页面标题和审计日志', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('沙箱审计');
      await expect(page.locator('table')).toBeVisible();
      await expect(page.locator('text=模型提交审查')).toBeVisible();
    });

    test('查看详情Drawer', async ({ page }) => {
      await page.locator('table tbody tr').first().locator('button').first().click();
      await expect(page.locator('text=审计详情')).toBeVisible();
    });
  });

  test.describe('结果审查 /sandbox/review', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/#/sandbox/review');
      await page.locator('h1').waitFor();
    });

    test('页面标题和审查列表', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('结果审查');
      await expect(page.locator('table')).toBeVisible();
    });

    test('审批通过/驳回按钮', async ({ page }) => {
      const approveBtn = page.locator('table tbody tr').first().locator('button').filter({ hasText: /通过|批准/ }).first();
      if (await approveBtn.count() > 0) {
        await expect(approveBtn).toBeVisible();
      }
      const rejectBtn = page.locator('table tbody tr').first().locator('button').filter({ hasText: /驳回|拒绝/ }).first();
      if (await rejectBtn.count() > 0) {
        await expect(rejectBtn).toBeVisible();
      }
    });
  });

  test.describe('跨页面导航测试', () => {
    test('从沙箱IDE导航到各子页面', async ({ page }) => {
      await page.goto('/#/sandbox/ide');
      await page.locator('h1').waitFor();

      const navTests = [
        { url: '/#/sandbox/resources', title: '资源审批' },
        { url: '/#/sandbox/verify', title: '产品验证' },
        { url: '/#/sandbox/preview', title: '数据探查' },
        { url: '/#/sandbox/preprocess', title: '数据加工' },
        { url: '/#/sandbox/train', title: '模型开发' },
        { url: '/#/sandbox/audit', title: '沙箱审计' },
        { url: '/#/sandbox/review', title: '结果审查' },
      ];

      for (const { url, title } of navTests) {
        await page.goto(url, { timeout: 20000, waitUntil: 'domcontentloaded' });
        await page.locator('h1').waitFor({ timeout: 15000 });
        await expect(page.locator('h1')).toContainText(title);
        // Small delay to let server breathe between navigations
        await page.waitForTimeout(200);
      }
    });
  });
});
