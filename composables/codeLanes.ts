import type { Span } from './lanes'

export type Side = 'host' | 'device' | 'd2h' | 'h2d' | 'comment'
export type Piece = [text: string, side: Side]
export type HostSpan = Span & { line: number; state: 'python' | 'wait' }
export type CopySpan = Span & { kind: 'd2h' | 'h2d' }
export type KernelSpan = Span & { movesData?: boolean }
export type Excerpt = { path: string; code: string }
export type Source = {
  repo: string
  users: string
  path?: string
  symbol?: string
  excerpts?: Excerpt[]
}

export type Scene = {
  source: Source
  code: Piece[][]
  host: HostSpan[]
  kernels: KernelSpan[]
  copies: CopySpan[]
  totalUnits: number
}

type Stage = {
  python: (line: number, units: number, label?: string) => void
  launch: (name: string, units: number, movesData?: boolean) => void
  d2h: (line: number) => void
  h2d: (line: number, units: number) => void
}

const D2H_UNITS = 0.4

export const scene = (source: Source, code: Piece[][], script: (stage: Stage) => void): Scene => {
  const host: HostSpan[] = []
  const kernels: KernelSpan[] = []
  const copies: CopySpan[] = []
  let hostClock = 0
  let deviceFreeAt = 0

  const blockHostUntil = (line: number, end: number) => {
    host.push({ line, state: 'wait', start: hostClock, end })
    hostClock = end
  }

  script({
    python(line, units, label) {
      host.push({ line, state: 'python', start: hostClock, end: hostClock + units, label })
      hostClock += units
    },
    launch(name, units, movesData) {
      const start = Math.max(hostClock, deviceFreeAt)
      kernels.push({ label: name, start, end: start + units, movesData })
      deviceFreeAt = start + units
    },
    d2h(line) {
      const start = Math.max(hostClock, deviceFreeAt)
      copies.push({ kind: 'd2h', start, end: start + D2H_UNITS })
      blockHostUntil(line, start + D2H_UNITS)
    },
    h2d(line, units) {
      copies.push({ kind: 'h2d', start: hostClock, end: hostClock + units })
      blockHostUntil(line, hostClock + units)
    },
  })

  return { source, code, host, kernels, copies, totalUnits: Math.max(hostClock, deviceFreeAt) }
}
