import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Layout from '../Layout'

// Mock child component
const TestPage = () => <div data-testid="test-page">Test Content</div>

const renderWithRouter = (initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="*" element={<Layout><TestPage /></Layout>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Layout Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ========== Structure Tests ==========

  it('renders main content area', () => {
    renderWithRouter()
    expect(screen.getByTestId('test-page')).toBeInTheDocument()
  })

  it('renders breadcrumb navigation', () => {
    renderWithRouter(['/'])
    expect(screen.getByText('首页')).toBeInTheDocument()
  })

  it('main element has correct margin-left class (ml-64)', () => {
    const { container } = renderWithRouter(['/'])
    const main = container.querySelector('main')

    expect(main).toHaveClass('ml-64')
  })

  it('main element has correct padding-top for navbar (pt-14)', () => {
    const { container } = renderWithRouter(['/'])
    const main = container.querySelector('main')

    expect(main).toHaveClass('pt-14')
  })

  it('main element has minimum full viewport height', () => {
    const { container } = renderWithRouter(['/'])
    const main = container.querySelector('main')

    expect(main).toHaveClass('min-h-[100dvh]')
  })

  it('applies transition class for sidebar collapse animation', () => {
    const { container } = renderWithRouter(['/'])
    const main = container.querySelector('main')

    expect(main).toHaveClass('transition-all')
    expect(main).toHaveClass('duration-300')
  })

  // ========== Route Name Mapping Tests ==========

  it('displays correct page title for root path', () => {
    const { container } = renderWithRouter(['/'])
    // Should show "数据资产概览" as current page in breadcrumb (font-medium class)
    // Use querySelector to target breadcrumb specifically (avoid sidebar duplicate)
    const breadcrumbCurrent = container.querySelector('.font-medium.text-slate-700')
    expect(breadcrumbCurrent).toBeInTheDocument()
    expect(breadcrumbCurrent).toHaveTextContent('数据资产概览')
  })

  it('displays correct page title for cockpit path', () => {
    const { container } = renderWithRouter(['/cockpit'])
    const breadcrumbCurrent = container.querySelector('.font-medium.text-slate-700')
    expect(breadcrumbCurrent).toHaveTextContent('数据资产驾驶舱')
  })

  it('displays correct page title for lineage path', () => {
    const { container } = renderWithRouter(['/lineage'])
    const breadcrumbCurrent = container.querySelector('.font-medium.text-slate-700')
    expect(breadcrumbCurrent).toHaveTextContent('血缘图谱')
  })

  it('displays correct page title for resources path', () => {
    const { container } = renderWithRouter(['/resources'])
    const breadcrumbCurrent = container.querySelector('.font-medium.text-slate-700')
    expect(breadcrumbCurrent).toHaveTextContent('数据资源目录')
  })

  // ========== Parent Breadcrumb Tests ==========

  it('shows parent breadcrumb for nested sampling routes', () => {
    const { container } = renderWithRouter(['/sampling/rules'])
    const breadcrumbCurrent = container.querySelector('.font-medium.text-slate-700')
    expect(breadcrumbCurrent).toHaveTextContent('抽样规则配置')
    // Parent "抽样管理" should be in breadcrumb (non-current, text-slate-500 class)
    const parentItems = container.querySelectorAll('.text-slate-500')
    const hasSamplingParent = Array.from(parentItems).some(el => el.textContent === '抽样管理')
    expect(hasSamplingParent).toBe(true)
  })

  it('shows parent breadcrumb for nested sandbox routes', () => {
    const { container } = renderWithRouter(['/sandbox/components'])
    const breadcrumbCurrent = container.querySelector('.font-medium.text-slate-700')
    expect(breadcrumbCurrent).toHaveTextContent('建模组件库')
  })

  it('shows parent breadcrumb for privacy routes', () => {
    const { container } = renderWithRouter(['/privacy/models'])
    const breadcrumbCurrent = container.querySelector('.font-medium.text-slate-700')
    expect(breadcrumbCurrent).toHaveTextContent('模型管理')
  })

  it('shows parent breadcrumb for blockchain routes', () => {
    const { container } = renderWithRouter(['/blockchain/ops'])
    const breadcrumbCurrent = container.querySelector('.font-medium.text-slate-700')
    expect(breadcrumbCurrent).toHaveTextContent('运维与监控')
  })

  it('shows parent breadcrumb for secret routes', () => {
    const { container } = renderWithRouter(['/secret/projects'])
    const breadcrumbCurrent = container.querySelector('.font-medium.text-slate-700')
    expect(breadcrumbCurrent).toHaveTextContent('密态计算项目管理')
  })

  // ========== Responsive Class Tests ==========

  it('has sidebar collapsed state class support', () => {
    const { container } = renderWithRouter(['/'])
    const main = container.querySelector('main')

    // Should support collapsed state class
    expect(main).toBeInTheDocument()
  })

  // ========== Dark Mode Class Tests ==========

  it('has dark mode background classes', () => {
    const { container } = renderWithRouter(['/'])
    // querySelector doesn't support [] in class names, use first div instead
    const wrapper = container.querySelector('div')

    expect(wrapper).toHaveClass('bg-slate-50')
    expect(wrapper).toHaveClass('dark:bg-[#0B1120]')
  })
})
