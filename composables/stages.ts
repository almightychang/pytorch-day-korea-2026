export type Stage = { name: string; tag: string; techniques: string[]; effect: string }

export const BASELINE = { name: 'Baseline', tag: 'before' }

export const STAGES: Stage[] = [
  {
    name: 'Host vs Device',
    tag: 'hostDevice',
    techniques: ['Host Planner', 'Async H2D Prefetch'],
    effect: 'No kernel 854 → 55 ms',
  },
  {
    name: 'Kernel',
    tag: 'kernel',
    techniques: ['Fixed Shapes', 'Kernel Compilation'],
    effect: 'Compute 1313 → 896 ms',
  },
  {
    name: 'Rank skew',
    tag: 'after',
    techniques: ['Cost function', 'Batch Routing'],
    effect: 'NCCL 356 → 253 ms',
  },
]
