import { test, expect } from '@playwright/test';

/* ───────────────────────────────────────────────
   五大模块核心页面 Playwright 测试
   模块：数据抽样管理 / 数据沙箱 / 隐私计算 / 密态计算 / 区块链
   ─────────────────────────────────────────────── */

const clickTab = async (page: any, text: string) => {
  await page.locator(`button[role="tab"]:has-text("${text}")`).click();
};

test.describe('五大模块核心页面测试', () => {

  /* ═══════════════════════════════════════════════
     1. 数据抽样管理
     ═══════════════════════════════════════════════ */
  test.describe('数据抽样管理', () => {

    test('抽样任务列表页', async ({ page }) => {
      await page.goto('/#/sampling/tasks');
      await expect(page.locator('h1')).toContainText('抽样任务管理');
      await expect(page.locator('button:has-text("新建任务")')).toBeVisible();
      // Use first() to avoid strict mode violation from multiple status tags
      await expect(page.locator('text=待执行').first()).toBeVisible();
      await expect(page.locator('text=执行中').first()).toBeVisible();
      await expect(page.locator('text=已完成').first()).toBeVisible();
      await expect(page.locator('text=失败').first()).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });

    test('抽样标准库页', async ({ page }) => {
      await page.goto('/#/sampling/standards');
      await expect(page.locator('h1')).toContainText('抽样标准库');
      await expect(page.locator('button:has-text("添加标准")')).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });

    test('质检审核页', async ({ page }) => {
      await page.goto('/#/sampling/inspection');
      await expect(page.locator('h1')).toContainText('质检审核');
      await expect(page.locator('text=质检任务')).toBeVisible();
      await expect(page.locator('text=已通过')).toBeVisible();
      await expect(page.locator('text=待审核').first()).toBeVisible();
      await expect(page.locator('text=已驳回')).toBeVisible();
      await clickTab(page, '待审核');
      await expect(page.locator('table tbody tr').first()).toBeVisible();
      await clickTab(page, '全部记录');
      await expect(page.locator('table tbody tr').first()).toBeVisible();
    });

    test('留样管理页', async ({ page }) => {
      await page.goto('/#/sampling/samples');
      await expect(page.locator('h1')).toContainText('样品管理');
      await expect(page.locator('button:has-text("登记样品")')).toBeVisible();
      await clickTab(page, '全部样品');
      await expect(page.locator('table')).toBeVisible();
      await clickTab(page, '观察检验');
      await expect(page.locator('table')).toBeVisible();
    });

    test('数据源管理页', async ({ page }) => {
      await page.goto('/#/sampling/datasources');
      await expect(page.locator('h1')).toContainText('数据源管理');
      await expect(page.locator('button:has-text("新建数据源")')).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });
  });

  /* ═══════════════════════════════════════════════
     2. 数据沙箱（核心页面快速验证）
     ═══════════════════════════════════════════════ */
  test.describe('数据沙箱', () => {

    test('资源审批页', async ({ page }) => {
      await page.goto('/#/sandbox/resources');
      await page.locator('h1').waitFor();
      await expect(page.locator('h1')).toContainText('资源审批');
      await expect(page.locator('table')).toBeVisible();
    });

    test('沙箱审计页', async ({ page }) => {
      await page.goto('/#/sandbox/audit');
      await page.locator('h1').waitFor();
      await expect(page.locator('h1')).toContainText('沙箱审计');
      await expect(page.locator('table')).toBeVisible();
    });
  });

  /* ═══════════════════════════════════════════════
     3. 隐私计算
     ═══════════════════════════════════════════════ */
  test.describe('隐私计算', () => {

    test('隐私计算任务中心', async ({ page }) => {
      await page.goto('/#/privacy/tasks');
      await page.locator('h1').waitFor();
      await expect(page.locator('h1')).toContainText('隐私计算任务中心');
      // 快速入口
      await expect(page.locator('button:has-text("隐私求交")').first()).toBeVisible();
      await expect(page.locator('button:has-text("隐匿查询")').first()).toBeVisible();
      await expect(page.locator('button:has-text("联合统计")').first()).toBeVisible();
      await expect(page.locator('button:has-text("联合SQL")').first()).toBeVisible();
      await expect(page.locator('button:has-text("联合建模")').first()).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
    });

    test('模型管理页', async ({ page }) => {
      await page.goto('/#/privacy/models');
      await page.locator('h1').waitFor();
      await expect(page.locator('h1')).toContainText('模型管理');
      await expect(page.locator('table')).toBeVisible();
    });

    test('节点管理页', async ({ page }) => {
      await page.goto('/#/privacy/nodes');
      await expect(page.locator('h1')).toContainText('隐私计算节点管理');
      await expect(page.locator('button:has-text("新增隐私计算节点")')).toBeVisible();
    });
  });

  /* ═══════════════════════════════════════════════
     4. 密态计算
     ═══════════════════════════════════════════════ */
  test.describe('密态计算', () => {

    test('MPC引擎页', async ({ page }) => {
      await page.goto('/#/secret/mpc-engine');
      await expect(page.locator('h1')).toContainText('密码协议引擎');
    });

    test('TEE环境页', async ({ page }) => {
      await page.goto('/#/secret/tee');
      await expect(page.locator('h1')).toContainText('可信执行环境');
    });

    test('同态加密引擎页', async ({ page }) => {
      await page.goto('/#/secret/he-engine');
      await expect(page.locator('h1')).toContainText('同态加密引擎');
    });

    test('密态网络页', async ({ page }) => {
      await page.goto('/#/secret/network');
      await expect(page.locator('h1')).toContainText('网络通信');
    });

    test('密钥管理页', async ({ page }) => {
      await page.goto('/#/secret/keys');
      await expect(page.locator('h1')).toContainText('密钥与证书');
      await expect(page.locator('button:has-text("生成密钥")').first()).toBeVisible();
    });

    test('资源池页', async ({ page }) => {
      await page.goto('/#/secret/resources');
      await expect(page.locator('h1')).toContainText('资源与调度');
    });
  });

  /* ═══════════════════════════════════════════════
     5. 区块链
     ═══════════════════════════════════════════════ */
  test.describe('区块链', () => {

    test('审计日志页', async ({ page }) => {
      await page.goto('/#/blockchain/audit-logs');
      await page.locator('h1').waitFor();
      await expect(page.locator('h1')).toContainText('审计日志');
      await expect(page.locator('table')).toBeVisible();
    });

    test('跨链管理页', async ({ page }) => {
      await page.goto('/#/blockchain/cross-chain-mgmt');
      await page.locator('h1').waitFor();
      await expect(page.locator('h1')).toContainText('跨链');
    });

    test('合约生命周期页', async ({ page }) => {
      await page.goto('/#/contract-lifecycle');
      await expect(page.locator('h1')).toContainText('合约全生命周期视图');
    });

    test('治理链页', async ({ page }) => {
      await page.goto('/#/blockchain/governance');
      await expect(page.locator('h1')).toContainText('治理链');
    });

    test('区块链系统页', async ({ page }) => {
      await page.goto('/#/blockchain/system');
      await expect(page.locator('h1')).toContainText('系统管理');
    });

    test('区块链运维页', async ({ page }) => {
      await page.goto('/#/blockchain/ops');
      await expect(page.locator('h1')).toContainText('运维监控');
    });

    test('链网络页', async ({ page }) => {
      await page.goto('/#/blockchain/networks');
      await page.locator('h1').waitFor();
      await expect(page.locator('h1')).toContainText('链网络');
      await expect(page.locator('text=网络列表')).toBeVisible();
      await expect(page.locator('text=节点监控')).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
      // Tab切换
      await clickTab(page, '节点监控');
      await expect(page.locator('table')).toBeVisible();
      await clickTab(page, '网络列表');
      await expect(page.locator('table')).toBeVisible();
    });
  });

  /* ═══════════════════════════════════════════════
     跨模块导航完整性
     ═══════════════════════════════════════════════ */
  test.describe('跨模块导航完整性', () => {
    const routes = [
      { path: '/#/sampling/tasks',     title: '抽样任务管理' },
      { path: '/#/sampling/standards', title: '抽样标准库' },
      { path: '/#/sampling/inspection',title: '质检审核' },
      { path: '/#/sampling/samples',   title: '样品管理' },
      { path: '/#/sampling/datasources',title:'数据源管理' },
      { path: '/#/sandbox/ide',        title: '沙箱开发环境' },
      { path: '/#/sandbox/resources',  title: '资源审批' },
      { path: '/#/sandbox/audit',      title: '沙箱审计' },
      { path: '/#/privacy/tasks',      title: '隐私计算任务中心' },
      { path: '/#/privacy/models',     title: '模型管理' },
      { path: '/#/privacy/nodes',      title: '隐私计算节点管理' },
      { path: '/#/secret/mpc-engine',  title: '密码协议引擎' },
      { path: '/#/secret/tee',         title: 'TEE' },
      { path: '/#/secret/he-engine',   title: '同态加密' },
      { path: '/#/secret/network',     title: '网络通信' },
      { path: '/#/secret/keys',        title: '密钥与证书' },
      { path: '/#/secret/resources',   title: '资源与调度' },
      { path: '/#/blockchain/audit-logs',     title: '审计日志' },
      { path: '/#/blockchain/cross-chain-mgmt',title:'跨链管理' },
      { path: '/#/contract-lifecycle', title: '合约全生命周期' },
      { path: '/#/blockchain/governance',     title: '治理链' },
      { path: '/#/blockchain/system',         title: '系统管理' },
      { path: '/#/blockchain/ops',            title: '运维监控' },
      { path: '/#/blockchain/networks',       title: '链网络' },
    ];

    for (const { path, title } of routes) {
      test(`导航验证: ${title}`, async ({ page }) => {
        await page.goto(path, { timeout: 20000 });
        await page.locator('h1').waitFor({ timeout: 15000 });
        await expect(page.locator('h1')).toContainText(title);
      });
    }
  });
});
