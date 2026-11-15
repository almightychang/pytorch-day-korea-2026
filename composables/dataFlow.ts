import type { ThemeKey } from './themes'

export type Side = 'host' | 'device'
export type Lane = { side: Side; name: string; kind?: string }
export type FlowNode = { lane: string; label: string; details?: string[]; theme?: ThemeKey; isCopy?: boolean }

const MAIN = 'main'
const WORKER = 'worker'
const COPY_STREAM = 'copy'
const EXCHANGE_STREAM = 'exchange'
const COMPUTE_STREAM = 'compute'
const DEFAULT_STREAM = 'default'
const CUDA_STREAM = 'CUDA stream'

export const STREAM_LANES: Lane[] = [
  { side: 'host', name: WORKER },
  { side: 'device', name: COPY_STREAM, kind: CUDA_STREAM },
  { side: 'device', name: EXCHANGE_STREAM, kind: CUDA_STREAM },
  { side: 'device', name: COMPUTE_STREAM, kind: CUDA_STREAM },
]

export const AS_IS = {
  lanes: [
    { side: 'host', name: MAIN },
    { side: 'device', name: DEFAULT_STREAM, kind: CUDA_STREAM },
  ] satisfies Lane[],
  nodes: [
    { lane: MAIN, label: 'collate' },
    { lane: DEFAULT_STREAM, label: 'forward' },
    { lane: MAIN, label: 'python' },
    { lane: DEFAULT_STREAM, label: 'forward' },
    { lane: MAIN, label: 'python' },
    { lane: DEFAULT_STREAM, label: 'forward' },
  ] satisfies FlowNode[],
  columnPx: 243,
}

export const TO_BE = {
  lanes: STREAM_LANES,
  nodes: [
    { lane: WORKER, label: 'Host Planner', theme: 'host' },
    { lane: WORKER, label: 'Input Contract', theme: 'host' },
    { lane: COPY_STREAM, label: 'H2D Prefetch', theme: 'host', isCopy: true },
    { lane: EXCHANGE_STREAM, label: 'Batch Routing', theme: 'rank' },
    { lane: COMPUTE_STREAM, label: 'Compiled Kernel', theme: 'kernel' },
  ] satisfies FlowNode[],
  columnPx: 290,
}

const HOST = 'boundary'
const DEVICE = 'model'
export const CONTRACT_LANES: Lane[] = [
  { side: 'host', name: HOST },
  { side: 'device', name: DEVICE },
]
export const FLOW_CONTRACT: FlowNode[] = [
  { lane: HOST, label: 'Input Contract', details: ['tensors only', 'bf16', 'contiguous stride', 'length bucket'] },
  { lane: DEVICE, label: 'Compiled Kernel', details: ['no host values read', 'batch-wise ops', 'one region per block', 'no recompilation'] },
]
