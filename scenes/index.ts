import implicitD2h from './implicitD2h'
import implicitH2d from './implicitH2d'
import implicitRoundTrip from './implicitRoundTrip'
import rmsNorm from './rmsNorm'
import rotPosEmbLoop from './rotPosEmbLoop'

export const scenes = { implicitD2h, implicitRoundTrip, implicitH2d, rotPosEmbLoop, rmsNorm }
export type SceneName = keyof typeof scenes
