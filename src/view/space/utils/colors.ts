import { formatCss } from 'culori'

type TokenMap = Record<string, string>

function ok(l: number, c: number, h: number): string {
  return formatCss({ mode: 'oklch', l, c, h }) ?? `oklch(${l} ${c} ${h})`
}

/**
 * 根据单一色调值生成全套语义颜色 token。
 * 保持与 main.css 相同的 lightness 结构，注入 hue 对应的小幅 chroma。
 */
export function generatePalette(hue: number): { light: TokenMap; dark: TokenMap } {
  const light: TokenMap = {}
  const dark: TokenMap = {}

  // ── 亮色模式 ──
  // Surfaces — 接近白色，微量色度
  light['--background'] = ok(0.985, 0.005, hue)
  light['--card'] = ok(0.985, 0.005, hue)
  light['--popover'] = ok(0.985, 0.005, hue)
  // Foreground text — 无色相，保持可读性
  light['--foreground'] = ok(0.145, 0, 0)
  light['--card-foreground'] = ok(0.145, 0, 0)
  light['--popover-foreground'] = ok(0.145, 0, 0)
  // Primary
  light['--primary'] = ok(0.45, 0.12, hue)
  light['--primary-foreground'] = ok(0.985, 0, 0)
  // Secondary
  light['--secondary'] = ok(0.95, 0.02, hue)
  light['--secondary-foreground'] = ok(0.205, 0, 0)
  // Muted
  light['--muted'] = ok(0.95, 0.01, hue)
  light['--muted-foreground'] = ok(0.556, 0, 0)
  // Accent
  light['--accent'] = ok(0.95, 0.05, hue)
  light['--accent-foreground'] = ok(0.205, 0, 0)
  // Destructive — 固定红色
  light['--destructive'] = ok(0.577, 0.245, 27.325)
  light['--destructive-foreground'] = ok(0.577, 0.245, 27.325)
  // Border / Input
  light['--border'] = ok(0.90, 0.01, hue)
  light['--input'] = ok(0.92, 0.005, hue)
  // Ring
  light['--ring'] = ok(0.65, 0.08, hue)
  // Charts — hue 偏移产生和谐色板
  light['--chart-1'] = ok(0.72, 0.12, hue)
  light['--chart-2'] = ok(0.65, 0.10, hue + 40)
  light['--chart-3'] = ok(0.55, 0.10, hue + 80)
  light['--chart-4'] = ok(0.45, 0.10, hue + 160)
  light['--chart-5'] = ok(0.35, 0.08, hue + 240)
  // Sidebar
  light['--sidebar'] = ok(0.985, 0.005, hue)
  light['--sidebar-foreground'] = ok(0.145, 0, 0)
  light['--sidebar-primary'] = ok(0.35, 0.15, hue)
  light['--sidebar-primary-foreground'] = ok(0.985, 0, 0)
  light['--sidebar-accent'] = ok(0.95, 0.03, hue)
  light['--sidebar-accent-foreground'] = ok(0.205, 0, 0)
  light['--sidebar-border'] = ok(0.90, 0.01, hue)
  light['--sidebar-ring'] = ok(0.65, 0.08, hue)

  // ── 暗色模式 ──
  // Surfaces — 深色，微量色度
  dark['--background'] = ok(0.145, 0.005, hue)
  dark['--card'] = ok(0.205, 0.005, hue)
  dark['--popover'] = ok(0.205, 0.005, hue)
  // Foreground text — 无色相
  dark['--foreground'] = ok(0.985, 0, 0)
  dark['--card-foreground'] = ok(0.985, 0, 0)
  dark['--popover-foreground'] = ok(0.985, 0, 0)
  // Primary — 更高 L 在深色背景上突出
  dark['--primary'] = ok(0.72, 0.12, hue)
  dark['--primary-foreground'] = ok(0.15, 0, 0)
  // Secondary
  dark['--secondary'] = ok(0.27, 0.02, hue)
  dark['--secondary-foreground'] = ok(0.985, 0, 0)
  // Muted
  dark['--muted'] = ok(0.27, 0.01, hue)
  dark['--muted-foreground'] = ok(0.708, 0, 0)
  // Accent
  dark['--accent'] = ok(0.27, 0.05, hue)
  dark['--accent-foreground'] = ok(0.985, 0, 0)
  // Destructive — 固定红色
  dark['--destructive'] = ok(0.704, 0.191, 22.216)
  dark['--destructive-foreground'] = ok(0.637, 0.237, 25.331)
  // Border / Input — 暗色模式使用半透明白色
  dark['--border'] = 'oklch(1 0 0 / 10%)'
  dark['--input'] = 'oklch(1 0 0 / 15%)'
  // Ring
  dark['--ring'] = ok(0.55, 0.08, hue)
  // Charts
  dark['--chart-1'] = ok(0.72, 0.12, hue)
  dark['--chart-2'] = ok(0.65, 0.10, hue + 40)
  dark['--chart-3'] = ok(0.55, 0.10, hue + 80)
  dark['--chart-4'] = ok(0.45, 0.10, hue + 160)
  dark['--chart-5'] = ok(0.35, 0.08, hue + 240)
  // Sidebar
  dark['--sidebar'] = ok(0.205, 0.005, hue)
  dark['--sidebar-foreground'] = ok(0.985, 0, 0)
  dark['--sidebar-primary'] = ok(0.488, 0.18, hue)
  dark['--sidebar-primary-foreground'] = ok(0.985, 0, 0)
  dark['--sidebar-accent'] = ok(0.269, 0.03, hue)
  dark['--sidebar-accent-foreground'] = ok(0.985, 0, 0)
  dark['--sidebar-border'] = ok(0.269, 0.01, hue)
  dark['--sidebar-ring'] = ok(0.55, 0.08, hue)

  return { light, dark }
}
