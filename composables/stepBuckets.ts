export type BucketKey = 'compute' | 'noKernel' | 'nccl' | 'copy'
export type Bucket = { key: BucketKey; label: string; colour: string }
export type StepMs = Record<BucketKey, number>

export const BUCKETS: Bucket[] = [
  { key: 'compute', label: 'Compute', colour: 'var(--compute)' },
  { key: 'noKernel', label: 'No kernel', colour: 'var(--python)' },
  { key: 'nccl', label: 'NCCL', colour: 'var(--wait)' },
  { key: 'copy', label: 'Copy', colour: 'var(--other)' },
]

export const BASELINE_STEP_MS: StepMs = { compute: 1348.9, noKernel: 854.0, nccl: 616.0, copy: 70.5 }

export const stepTotal = (step: StepMs) => Object.values(step).reduce((sum, ms) => sum + ms, 0)
