import { laneColour } from './laneColours'

export type ThemeKey = 'host' | 'kernel' | 'rank'
export type Theme = { label: string; colour: string }

export const THEMES: Record<ThemeKey, Theme> = {
  host: { label: 'Host vs Device', colour: laneColour.python },
  kernel: { label: 'Kernel', colour: laneColour.kernel },
  rank: { label: 'Rank skew', colour: laneColour.nccl },
}
