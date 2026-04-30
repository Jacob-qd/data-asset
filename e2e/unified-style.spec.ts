import { test, expect } from '@playwright/test';

const clickTab = async (page: any, text: string) => {
  await page.locator(`button[role="tab"]:has-text("${text}")`).click();
};

/* ───────────────────────────────────────────────
   五大模块样式统一验证测试
   验证 PageHeader / PageSearchBar / ActionButtons
   在各模块中的正确使用
   ─────────────────────────────────────────────── */

test.describe('五大模块样式统一验证', () => {

  /* ═══════════════════════════════════════════════
     1. 数据抽样管理 — 样式统一验证
     ═══════════════════════════════════════════════ */
  test.describe('数据抽样管理', () => {
    test('抽样任务页 — PageHeader + PageSearchBar + ActionButtons', async ({ page }) => {
      await page.goto('/#/sampling/tasks');
      await page.locator('h1').waitFor();

      // PageHeader: 标题 + Badge
      await expect(page.locator('h1')).toContainText('抽样任务管理');
      await expect(page.locator('.bg-indigo-50:has-text("任务")')).toBeVisible();

      // PageSearchBar: 搜索框 + 查询/重置按钮
      await expect(page.locator('input[placeholder*="搜索"]').first()).toBeVisible();
      await expect(page.locator('button:has-text("查询")').first()).toBeVisible();
      await expect(page.locator('button:has-text("重置")').first()).toBeVisible();

      // ActionButtons: 操作列按钮组
      await expect(page.locator('table tbody tr').first()).toBeVisible();
      const firstRow = page.locator('table tbody tr').first();
      await expect(firstRow.locator('button').first()).toBeVisible();
    });

    test('抽样标准库页 — 样式组件', async ({ page }) => {
      await page.goto('/#/sampling/standards');
      await page.locator('h1').waitFor();
      await expect(page.locator('h1')).toContainText('抽样标准库');
      await expect(page.locator('input[placeholder*="搜索"]').first()).toBeVisible();
    });

    test('样品管理页 — 样式组件', async ({ page }) => {
      await page.goto('/#/sampling/samples');
      await page.locator('h1').waitFor();
      await expect(page.locator('h1')).toContainText('样品管理');
      await expect(page.locator('input[placeholder*="搜索"]').first()).toBeVisible();
    });

    test('数据源管理页 — 样式组件', async ({ page }) => {
      await page.goto('/#/sampling/datasources');
      await page.locator('h1').waitFor();
      await expect(page.locator('h1')).toContainText('数据源管理');
      await expect(page.locator('input[placeholder*="搜索"]').first()).toBeVisible();
    });
  });

  /* ═══════════════════════════════════════════════
     2. 数据沙箱 — 样式统一验证
     ═══════════════════════════════════════════════ */
  test.describe('数据沙箱', () => {
    test('资源审批页 — 样式组件', async ({ page }) => {
      await page.goto('/#/sandbox/resources');
      await page.locator('h1').waitFor();
      await expect(page.locator('h1')).toContainText('资源审批');
      await expect(page.locator('input[placeholder*="搜索"]').first()).toBeVisible();
    });

    test('沙箱IDE列表页 — 样式组件', async ({ page }) => {
      await page.goto('/#/sandbox/ide');
      await page.locator('h1').waitFor();
      await expect(page.locator('h1')).toContainText('沙箱开发环境');
      await expect(page.locator('input[placeholder*="搜索"]').first()).toBeVisible();
    });

    test('数据加工页 — 样式组件', async ({ page }) => {
      await page.goto('/#/sandbox/preprocess');
      await page.locator('h1').waitFor();
      await expect(page.locator('h1')).toContainText('数据加工');
    });

    test('模型开发页 — 样式组件', async ({ page }) => {
      await page.goto('/#/sandbox/train');
      await page.locator('h1').waitFor();
      await expect(page.locator('h1')).toContainText('模型开发');
    });

    test('沙箱审计页 — 样式组件', async ({ page }) => {
      await page.goto('/#/sandbox/audit');
      await page.locator('h1').waitFor();
      await expect(page.locator('h1')).toContainText('沙箱审计');
    });
  });

  /* ═══════════════════════════════════════════════
     3. 隐私计算 — 样式统一验证
     ═══════════════════════════════════════════════ */
  test.describe('隐私计算', () => {
    test('PSI任务页 — PageHeader + PageSearchBar + ActionButtons', async ({ page }) => {
      await page.goto('/#/privacy/tasks/psi');
      await page.locator('h1').waitFor();
      await expect(page.locator('h1')).toContainText('隐私求交');
      await expect(page.locator('input[placeholder*="搜索"]').first()).toBeVisible();
      await expect(page.locator('button:has-text("查询")').first()).toBeVisible();
    });

    test('PIR任务页 — 样式组件', async ({ page }) => {
      await page.goto('/#/privacy/tasks/pir');
      await page.locator('h1').waitFor();
      await expect(page.locator('h1')).toContainText('隐匿查询');
      await expect(page.locator('input[placeholder*="搜索"]').first()).toBeVisible();
    });

    test('联合统计页 — 样式组件', async ({ page }) => {
      await page.goto('/#/privacy/tasks/stats');
      await page.locator('h1').waitFor();
      await expect(page.locator('h1')).toContainText('联合统计');
      await expect(page.locator('input[placeholder*="搜索"]').first()).toBeVisible();
    });

    test('联合SQL页 — 样式组件', async ({ page }) => {
      await page.goto('/#/privacy/tasks/sql');
      await page.locator('h1').waitFor();
      await expect(page.locator('h1')).toContainText('联合SQL');
      await expect(page.locator('input[placeholder*="搜索"]').first()).toBeVisible();
    });

    test('联合建模页 — 样式组件', async ({ page }) => {
      await page.goto('/#/privacy/tasks/modeling');
      await page.locator('h1').waitFor();
      await expect(page.locator('h1')).toContainText('联合建模');
      await expect(page.locator('input[placeholder*="搜索"]').first()).toBeVisible();
    });

    test('模型管理页 — 样式组件', async ({ page }) => {
      await page.goto('/#/privacy/models');
      await page.locator('h1').waitFor();
      await expect(page.locator('h1')).toContainText('模型管理');
    });
  });

  /* ═══════════════════════════════════════════════
     4. 密态计算 — 样式统一验证
     ═══════════════════════════════════════════════ */
  test.describe('密态计算', () => {
    test('MPC引擎页 — 样式组件', async ({ page }) => {
      await page.goto('/#/secret/mpc-engine');
      await page.locator('h1').waitFor();
      await expect(page.locator('h1')).toContainText('密码协议引擎');
    });

    test('TEE环境页 — 样式组件', async ({ page }) => {
      await page.goto('/#/secret/tee');
      await page.locator('h1').waitFor();
      await expect(page.locator('h1')).toContainText('可信执行环境');
    });

    test('同态加密引擎页 — 样式组件', async ({ page }) => {
      await page.goto('/#/secret/he-engine');
      await page.locator('h1').waitFor();
      await expect(page.locator('h1')).toContainText('同态加密引擎');
    });

    test('网络通信页 — 样式组件', async ({ page }) => {
      await page.goto('/#/secret/network');
      await page.locator('h1').waitFor();
      await expect(page.locator('h1')).toContainText('网络通信');
    });

    test('密钥与证书页 — 样式组件', async ({ page }) => {
      await page.goto('/#/secret/keys');
      await page.locator('h1').waitFor();
      await expect(page.locator('h1')).toContainText('密钥与证书');
    });
  });

  /* ═══════════════════════════════════════════════
     5. 区块链 — 样式统一验证
     ═══════════════════════════════════════════════ */
  test.describe('区块链', () => {
    test('审计日志页 — PageHeader + PageSearchBar', async ({ page }) => {
      await page.goto('/#/blockchain/audit-logs');
      await page.locator('h1').waitFor();
      await expect(page.locator('h1')).toContainText('审计日志');
      await expect(page.locator('input[placeholder*="搜索"]').first()).toBeVisible();
    });

    test('跨链管理页 — 样式组件', async ({ page }) => {
      await page.goto('/#/blockchain/cross-chain-mgmt');
      await page.locator('h1').waitFor();
      await expect(page.locator('h1')).toContainText('跨链');
      await expect(page.locator('input[placeholder*="搜索"]').first()).toBeVisible();
    });

    test('链网络页 — 样式组件', async ({ page }) => {
      await page.goto('/#/blockchain/networks');
      await page.locator('h1').waitFor();
      await expect(page.locator('h1')).toContainText('链网络');
      await expect(page.locator('input[placeholder*="搜索"]').first()).toBeVisible();
    });

    test('系统管理页 — 样式组件', async ({ page }) => {
      await page.goto('/#/blockchain/system');
      await page.locator('h1').waitFor();
      await expect(page.locator('h1')).toContainText('系统管理');
    });

    test('运维监控页 — 样式组件', async ({ page }) => {
      await page.goto('/#/blockchain/ops');
      await page.locator('h1').waitFor();
      await expect(page.locator('h1')).toContainText('运维监控');
    });
  });
});
