import implicitD2h from './implicitD2h'
import implicitH2d from './implicitH2d'
import implicitRoundTrip from './implicitRoundTrip'

export const scenes = { implicitD2h, implicitRoundTrip, implicitH2d }
export type SceneName = keyof typeof scenes
