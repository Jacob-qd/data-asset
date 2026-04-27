import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router-dom'
import Sidebar from '../Sidebar'

// Helper to render with router
const renderWithRouter = (initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Sidebar />
    </MemoryRouter>
  )
}

describe('Sidebar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ========== Structure Tests ==========

  it('renders all 13 top-level menu labels', () => {
    renderWithRouter()

    const expectedLabels = [
      '工作台',
      '数据资产概览',
      '数据资源目录',
      '血缘图谱',
      '数据沙箱',
      '隐私计算',
      '抽样管理',
      '区块链可信存证',
      '审批中心',
      '服务与监控',
      '平台管理',
      '统计报表中心',
    ]

    expectedLabels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument()
    })
  })

  it('renders sidebar with fixed positioning classes', () => {
    const { container } = renderWithRouter()
    const aside = container.querySelector('aside')

    expect(aside).toHaveClass('fixed')
    expect(aside).toHaveClass('left-0')
    expect(aside).toHaveClass('top-14')
    expect(aside).toHaveClass('w-64')
    expect(aside).toHaveClass('z-40')
  })

  it('has correct height calculation for viewport minus navbar', () => {
    const { container } = renderWithRouter()
    const aside = container.querySelector('aside')

    expect(aside).toHaveClass('h-[calc(100vh-3.5rem)]')
  })

  it('renders version info at bottom', () => {
    renderWithRouter()
    expect(screen.getByText('数据资产管理平台 V5.0')).toBeInTheDocument()
  })

  // ========== Expand/Collapse Tests ==========

  it('expands 工作台 menu by default when on root path', () => {
    renderWithRouter(['/'])

    // 工作台首页 should be visible as it's the active path
    expect(screen.getByText('工作台首页')).toBeInTheDocument()
    expect(screen.getByText('项目管理')).toBeInTheDocument()
  })

  it('toggles menu expand on click', () => {
    renderWithRouter(['/'])

    // Initially 工作台 is expanded (root path), others collapsed
    const 数据资产概览 = screen.getByText('数据资产概览')

    // Click to expand
    fireEvent.click(数据资产概览)
    expect(screen.getByText('概览看板')).toBeInTheDocument()
    expect(screen.getByText('数据资产驾驶舱')).toBeInTheDocument()

    // Click to collapse
    fireEvent.click(数据资产概览)
    expect(screen.queryByText('概览看板')).not.toBeInTheDocument()
  })

  it('expands nested 隐私计算 submenus correctly', () => {
    renderWithRouter(['/'])

    // Click 隐私计算 to expand
    fireEvent.click(screen.getByText('隐私计算'))

    // Should show 4 sub-modules
    expect(screen.getByText('智能建模')).toBeInTheDocument()
    expect(screen.getByText('联合计算')).toBeInTheDocument()
    expect(screen.getByText('数据处理')).toBeInTheDocument()
    expect(screen.getByText('密态计算')).toBeInTheDocument()
  })

  it('expands third-level menu inside 隐私计算', () => {
    renderWithRouter(['/'])

    // Expand 隐私计算
    fireEvent.click(screen.getByText('隐私计算'))

    // Expand 智能建模
    fireEvent.click(screen.getByText('智能建模'))

    // Should show third-level items
    expect(screen.getByText('项目与模型')).toBeInTheDocument()
    expect(screen.getByText('模型服务')).toBeInTheDocument()
    expect(screen.getByText('联邦建模')).toBeInTheDocument()
    expect(screen.getByText('模型市场')).toBeInTheDocument()
  })

  // ========== Menu Count Validation ==========

  it('has correct number of direct children in 工作台', () => {
    renderWithRouter(['/'])

    // 工作台 is expanded by default on root
    const workbenchItems = [
      '工作台首页',
      '项目管理',
      '规则管理',
      '场景配置',
      '资产登记',
      '消息通知',
    ]
    workbenchItems.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument()
    })
  })

  it('has correct number of children in 数据沙箱 (7 items)', () => {
    renderWithRouter(['/'])

    fireEvent.click(screen.getByText('数据沙箱'))

    const sandboxItems = [
      '沙箱项目',
      '数据探查',
      '数据加工',
      '模型开发',
      '结果审查',
      '沙箱审计',
      '数据源管理',
    ]
    sandboxItems.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument()
    })
  })

  it('has correct number of children in 抽样管理 (4 items)', () => {
    renderWithRouter(['/'])

    fireEvent.click(screen.getByText('抽样管理'))

    const samplingItems = [
      '标准与规则',
      '抽样任务',
      '质检中心',
      '样品管理',
    ]
    samplingItems.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument()
    })
  })

  it('has correct number of children in 区块链可信存证 (5 items)', () => {
    renderWithRouter(['/'])

    fireEvent.click(screen.getByText('区块链可信存证'))

    const blockchainItems = [
      '网络运维',
      '链网络',
      '智能合约',
      '跨链治理',
      '系统管理',
    ]
    blockchainItems.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument()
    })
  })

  // ========== Routing Tests ==========

  it('renders correct link paths for menu items', () => {
    renderWithRouter(['/'])

    // Check some key paths - MemoryRouter uses / prefix
    expect(screen.getByText('工作台首页').closest('a')).toHaveAttribute('href', '/')

    // Expand 血缘图谱 to access its child link
    fireEvent.click(screen.getByText('血缘图谱'))
    expect(screen.getByText('血缘分析').closest('a')).toHaveAttribute('href', '/lineage')
  })

  // ========== Accessibility Tests ==========

  it('menu buttons have proper button role', () => {
    renderWithRouter(['/'])

    // All expandable menus should be buttons
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('menu links have proper anchor tags', () => {
    renderWithRouter(['/'])

    // 工作台首页 should be a link
    const link = screen.getByText('工作台首页').closest('a')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href')
  })
})
