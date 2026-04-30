# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: five-modules.spec.ts >> 五大模块核心页面测试 >> 跨模块导航完整性 >> 导航验证: 链网络
- Location: e2e/five-modules.spec.ts:243:7

# Error details

```
TimeoutError: page.goto: Timeout 20000ms exceeded.
Call log:
  - navigating to "http://localhost:3000/#/blockchain/networks", waiting until "load"

```

# Test source

```ts
  144 |     });
  145 | 
  146 |     test('密钥管理页', async ({ page }) => {
  147 |       await page.goto('/#/secret/keys');
  148 |       await expect(page.locator('h1')).toContainText('密钥与证书');
  149 |       await expect(page.locator('button:has-text("生成密钥")').first()).toBeVisible();
  150 |     });
  151 | 
  152 |     test('资源池页', async ({ page }) => {
  153 |       await page.goto('/#/secret/resources');
  154 |       await expect(page.locator('h1')).toContainText('资源与调度');
  155 |     });
  156 |   });
  157 | 
  158 |   /* ═══════════════════════════════════════════════
  159 |      5. 区块链
  160 |      ═══════════════════════════════════════════════ */
  161 |   test.describe('区块链', () => {
  162 | 
  163 |     test('审计日志页', async ({ page }) => {
  164 |       await page.goto('/#/blockchain/audit-logs');
  165 |       await page.locator('h1').waitFor();
  166 |       await expect(page.locator('h1')).toContainText('审计日志');
  167 |       await expect(page.locator('table')).toBeVisible();
  168 |     });
  169 | 
  170 |     test('跨链管理页', async ({ page }) => {
  171 |       await page.goto('/#/blockchain/cross-chain-mgmt');
  172 |       await page.locator('h1').waitFor();
  173 |       await expect(page.locator('h1')).toContainText('跨链');
  174 |     });
  175 | 
  176 |     test('合约生命周期页', async ({ page }) => {
  177 |       await page.goto('/#/contract-lifecycle');
  178 |       await expect(page.locator('h1')).toContainText('合约全生命周期视图');
  179 |     });
  180 | 
  181 |     test('治理链页', async ({ page }) => {
  182 |       await page.goto('/#/blockchain/governance');
  183 |       await expect(page.locator('h1')).toContainText('治理链');
  184 |     });
  185 | 
  186 |     test('区块链系统页', async ({ page }) => {
  187 |       await page.goto('/#/blockchain/system');
  188 |       await expect(page.locator('h1')).toContainText('系统管理');
  189 |     });
  190 | 
  191 |     test('区块链运维页', async ({ page }) => {
  192 |       await page.goto('/#/blockchain/ops');
  193 |       await expect(page.locator('h1')).toContainText('运维监控');
  194 |     });
  195 | 
  196 |     test('链网络页', async ({ page }) => {
  197 |       await page.goto('/#/blockchain/networks');
  198 |       await page.locator('h1').waitFor();
  199 |       await expect(page.locator('h1')).toContainText('链网络');
  200 |       await expect(page.locator('text=网络列表')).toBeVisible();
  201 |       await expect(page.locator('text=节点监控')).toBeVisible();
  202 |       await expect(page.locator('table')).toBeVisible();
  203 |       // Tab切换
  204 |       await clickTab(page, '节点监控');
  205 |       await expect(page.locator('table')).toBeVisible();
  206 |       await clickTab(page, '网络列表');
  207 |       await expect(page.locator('table')).toBeVisible();
  208 |     });
  209 |   });
  210 | 
  211 |   /* ═══════════════════════════════════════════════
  212 |      跨模块导航完整性
  213 |      ═══════════════════════════════════════════════ */
  214 |   test.describe('跨模块导航完整性', () => {
  215 |     const routes = [
  216 |       { path: '/#/sampling/tasks',     title: '抽样任务管理' },
  217 |       { path: '/#/sampling/standards', title: '抽样标准库' },
  218 |       { path: '/#/sampling/inspection',title: '质检审核' },
  219 |       { path: '/#/sampling/samples',   title: '样品管理' },
  220 |       { path: '/#/sampling/datasources',title:'数据源管理' },
  221 |       { path: '/#/sandbox/ide',        title: '沙箱开发环境' },
  222 |       { path: '/#/sandbox/resources',  title: '资源审批' },
  223 |       { path: '/#/sandbox/audit',      title: '沙箱审计' },
  224 |       { path: '/#/privacy/tasks',      title: '隐私计算任务中心' },
  225 |       { path: '/#/privacy/models',     title: '模型管理' },
  226 |       { path: '/#/privacy/nodes',      title: '隐私计算节点管理' },
  227 |       { path: '/#/secret/mpc-engine',  title: '密码协议引擎' },
  228 |       { path: '/#/secret/tee',         title: 'TEE' },
  229 |       { path: '/#/secret/he-engine',   title: '同态加密' },
  230 |       { path: '/#/secret/network',     title: '网络通信' },
  231 |       { path: '/#/secret/keys',        title: '密钥与证书' },
  232 |       { path: '/#/secret/resources',   title: '资源与调度' },
  233 |       { path: '/#/blockchain/audit-logs',     title: '审计日志' },
  234 |       { path: '/#/blockchain/cross-chain-mgmt',title:'跨链管理' },
  235 |       { path: '/#/contract-lifecycle', title: '合约全生命周期' },
  236 |       { path: '/#/blockchain/governance',     title: '治理链' },
  237 |       { path: '/#/blockchain/system',         title: '系统管理' },
  238 |       { path: '/#/blockchain/ops',            title: '运维监控' },
  239 |       { path: '/#/blockchain/networks',       title: '链网络' },
  240 |     ];
  241 | 
  242 |     for (const { path, title } of routes) {
  243 |       test(`导航验证: ${title}`, async ({ page }) => {
> 244 |         await page.goto(path, { timeout: 20000 });
      |                    ^ TimeoutError: page.goto: Timeout 20000ms exceeded.
  245 |         await page.locator('h1').waitFor({ timeout: 15000 });
  246 |         await expect(page.locator('h1')).toContainText(title);
  247 |       });
  248 |     }
  249 |   });
  250 | });
  251 | 
```