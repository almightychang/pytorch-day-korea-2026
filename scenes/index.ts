import implicitD2h from './implicitD2h'
import implicitH2d from './implicitH2d'
import implicitRoundTrip from './implicitRoundTrip'
import rmsNorm from './rmsNorm'
import textMlp from './textMlp'
import visionRope from './visionRope'

export const scenes = { implicitD2h, implicitRoundTrip, implicitH2d, rmsNorm, visionRope, textMlp }
export type SceneName = keyof typeof scenes
