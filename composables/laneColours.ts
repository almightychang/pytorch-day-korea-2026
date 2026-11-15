import { timeline } from './timeline'

export const laneColour = {
  python: timeline.sources.python.color,
  dispatch: '#6f8fd6',
  launch: '#3fc4b4',
  kernel: timeline.sources.gemm.color,
  align2: timeline.sources.align2.color,
  d2h: timeline.sources.d2h.color,
  d2d: timeline.sources.d2d.color,
  h2d: timeline.sources.h2d.color,
}
