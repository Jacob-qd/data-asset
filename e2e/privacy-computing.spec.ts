import { test, expect } from '@playwright/test';

const clickTab = async (page: any, text: string) => {
  await page.locator(`button[role="tab"]:has-text("${text}")`).click();
};

test.describe('隐私计算模块测试', () => {

  test.describe('任务中心', () => {
    test('页面加载与统计卡片', async ({ page }) => {
      await page.goto('/#/privacy/tasks');
      await expect(page.locator('h1')).toContainText('隐私计算任务中心');
      
      // 统计卡片
      await expect(page.locator('text=总任务数').first()).toBeVisible();
      await expect(page.locator('text=执行中').first()).toBeVisible();
      await expect(page.locator('text=执行成功').first()).toBeVisible();
      await expect(page.locator('text=执行失败').first()).toBeVisible();
      
      // 快速入口
      await expect(page.locator('text=隐私求交').first()).toBeVisible();
      await expect(page.locator('text=隐匿查询').first()).toBeVisible();
      await expect(page.locator('text=联合统计').first()).toBeVisible();
      await expect(page.locator('text=联合SQL').first()).toBeVisible();
      await expect(page.locator('text=联合建模').first()).toBeVisible();
      
      // 最近任务表格
      await expect(page.locator('table')).toBeVisible();
    });

    test('快速入口跳转', async ({ page }) => {
      await page.goto('/#/privacy/tasks');
      
      // 点击隐私求交入口
      await page.locator('button:has-text("隐私求交")').first().click();
      await expect(page.locator('h1')).toContainText('隐私求交');
      
      // 返回任务中心
      await page.goto('/#/privacy/tasks');
      
      // 点击联合建模入口
      await page.locator('button:has-text("联合建模")').first().click();
      await expect(page.locator('h1')).toContainText('联合建模');
    });

    test('搜索功能', async ({ page }) => {
      await page.goto('/#/privacy/tasks');
      
      const searchInput = page.locator('input[placeholder="搜索任务名称..."]');
      await searchInput.fill('数据');
      // 检查表格是否有数据行
      await expect(page.locator('table tbody tr').first()).toBeVisible();
      
      await searchInput.fill('不存在的任务');
      await expect(page.locator('table tbody tr')).toHaveCount(0);
    });
  });

  test.describe('隐私求交 (PSI)', () => {
    test('页面加载与列表', async ({ page }) => {
      await page.goto('/#/privacy/tasks/psi');
      await expect(page.locator('h1')).toContainText('隐私求交');
      await expect(page.locator('button:has-text("新建求交任务")')).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });

    test('Tab切换', async ({ page }) => {
      await page.goto('/#/privacy/tasks/psi');
      
      await clickTab(page, '我创建的');
      await expect(page.locator('table tbody tr').first()).toBeVisible();
      
      await clickTab(page, '我参与的');
      await expect(page.locator('table')).toBeVisible();
      
      await clickTab(page, '可执行的');
      await expect(page.locator('table')).toBeVisible();
      
      await clickTab(page, '执行历史');
      await expect(page.locator('table')).toBeVisible();
    });

    test('新建任务对话框', async ({ page }) => {
      await page.goto('/#/privacy/tasks/psi');
      
      await page.locator('button:has-text("新建求交任务")').click();
      await expect(page.locator('text=新建隐私求交任务')).toBeVisible();
      
      // 验证表单字段 - 使用对话框内的label
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog.locator('text=任务名称').first()).toBeVisible();
      await expect(dialog.locator('text=求交键字段')).toBeVisible();
      await expect(dialog.locator('text=参与方数量')).toBeVisible();
      
      // 取消
      await page.locator('button:has-text("取消")').click();
      await expect(page.locator('text=新建隐私求交任务')).not.toBeVisible();
    });

    test('任务详情对话框', async ({ page }) => {
      await page.goto('/#/privacy/tasks/psi');
      
      // 点击第一个任务的名称
      await page.locator('table tbody tr:first-child td:nth-child(2) span').click();
      
      // 验证详情对话框 - 使用role=dialog限定范围
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog.locator('button:has-text("概览")')).toBeVisible();
      await expect(dialog.locator('button:has-text("参与方")')).toBeVisible();
      await expect(dialog.locator('button:has-text("执行结果")')).toBeVisible();
      await expect(dialog.locator('button:has-text("执行日志")')).toBeVisible();
      
      // 关闭
      await page.locator('button:has-text("关闭")').last().click();
    });

    test('执行按钮', async ({ page }) => {
      await page.goto('/#/privacy/tasks/psi');
      
      // 查找可执行的任务（状态为pending）
      const executeButton = page.locator('table tbody tr button svg[data-lucide="play"]').first();
      if (await executeButton.isVisible().catch(() => false)) {
        await executeButton.click();
        await expect(page.locator('text=任务开始执行')).toBeVisible();
      }
    });
  });

  test.describe('隐匿查询 (PIR)', () => {
    test('页面加载', async ({ page }) => {
      await page.goto('/#/privacy/tasks/pir');
      await expect(page.locator('h1')).toContainText('隐匿查询');
      await expect(page.locator('button:has-text("新建查询任务")')).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });

    test('新建任务与详情', async ({ page }) => {
      await page.goto('/#/privacy/tasks/pir');
      
      // 新建
      await page.locator('button:has-text("新建查询任务")').click();
      await expect(page.locator('text=新建隐匿查询任务')).toBeVisible();
      await page.locator('button:has-text("取消")').click();
      
      // 详情
      await page.locator('table tbody tr:first-child td:nth-child(2) span').click();
      // 使用对话框内的选择器避免冲突
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog.locator('text=查询类型').first()).toBeVisible();
      await page.locator('button:has-text("关闭")').last().click();
    });
  });

  test.describe('联合统计', () => {
    test('页面加载', async ({ page }) => {
      await page.goto('/#/privacy/tasks/stats');
      await expect(page.locator('h1')).toContainText('联合统计');
      await expect(page.locator('button:has-text("新建统计任务")')).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });

    test('新建任务与详情', async ({ page }) => {
      await page.goto('/#/privacy/tasks/stats');
      
      // 新建
      await page.locator('button:has-text("新建统计任务")').click();
      await expect(page.locator('text=新建联合统计任务')).toBeVisible();
      await page.locator('button:has-text("取消")').click();
      
      // 详情
      await page.locator('table tbody tr:first-child td:nth-child(2) span').click();
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog.locator('text=统计类型').first()).toBeVisible();
      await page.locator('button:has-text("关闭")').last().click();
    });
  });

  test.describe('联合SQL', () => {
    test('页面加载', async ({ page }) => {
      await page.goto('/#/privacy/tasks/sql');
      await expect(page.locator('h1')).toContainText('联合SQL');
      await expect(page.locator('button:has-text("新建SQL任务")')).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });

    test('新建任务与详情', async ({ page }) => {
      await page.goto('/#/privacy/tasks/sql');
      
      // 新建
      await page.locator('button:has-text("新建SQL任务")').click();
      await expect(page.locator('text=新建联合SQL任务')).toBeVisible();
      await page.locator('button:has-text("取消")').click();
      
      // 详情
      await page.locator('table tbody tr:first-child td:nth-child(2) span').click();
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog.locator('text=SQL配置')).toBeVisible();
      await page.locator('button:has-text("关闭")').last().click();
    });
  });

  test.describe('联合建模', () => {
    test('页面加载', async ({ page }) => {
      await page.goto('/#/privacy/tasks/modeling');
      await expect(page.locator('h1')).toContainText('联合建模');
      await expect(page.locator('button:has-text("可视化建模")')).toBeVisible();
      await expect(page.locator('button:has-text("新建建模任务")')).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });

    test('新建任务与详情', async ({ page }) => {
      await page.goto('/#/privacy/tasks/modeling');
      
      // 新建
      await page.locator('button:has-text("新建建模任务")').click();
      await expect(page.locator('text=新建联合建模任务')).toBeVisible();
      await page.locator('button:has-text("取消")').click();
      
      // 详情
      await page.locator('table tbody tr:first-child td:nth-child(2) span').click();
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog.locator('text=模型配置')).toBeVisible();
      await page.locator('button:has-text("关闭")').last().click();
    });

    test('可视化建模入口', async ({ page }) => {
      await page.goto('/#/privacy/tasks/modeling');
      
      await page.locator('button:has-text("可视化建模")').click();
      // 检查URL是否跳转
      await expect(page).toHaveURL(/.*modeling\/visual.*/);
    });
  });
});
