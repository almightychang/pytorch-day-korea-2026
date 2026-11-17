export type Span = { start: number; end: number; label?: string; caption?: string }
export type Bar = Span & { look: 'solid' | 'waiting' | 'idle'; fill?: string }
export type Row = { name: string; bars: Bar[] }
export type LegendItem = { label: string; fill?: string }
export type Handoff = { from: number; to: number; straight?: boolean }

export const LANE_LABEL_WIDTH = 120
export const LANE_WIDTH = 1480

export const solid = (span: Span, fill: string): Bar => ({ ...span, look: 'solid', fill })
export const waiting = (span: Span): Bar => ({ ...span, look: 'waiting' })
export const idle = (span: Span): Bar => ({ ...span, look: 'idle' })
