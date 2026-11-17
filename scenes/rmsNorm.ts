import { scene } from '../composables/codeLanes'

const MOVES_DATA = true
const HOST_US_PER_KERNEL = 13
const LABELLED_US = 10
const THIN_UNITS = 0.08

export default scene(
  {
    repo: 'huggingface/transformers@v4.57.3',
    path: 'src/transformers/models/qwen3_vl/modeling_qwen3_vl.py#L348-L352',
    symbol: 'Qwen3VLTextRMSNorm.forward',
    users: 'used by GR00T N1.7, RLDX',
  },
  [
    [['input_dtype = hidden_states.dtype', 'host']],
    [['hidden_states = ', 'host'], ['hidden_states.to(torch.float32)', 'device']],
    [['variance = ', 'host'], ['hidden_states.pow(2).mean(-1, keepdim=True)', 'device']],
    [['hidden_states = ', 'host'], ['hidden_states * torch.rsqrt(variance + self.variance_epsilon)', 'device']],
    [['return ', 'host'], ['self.weight * hidden_states.to(input_dtype)', 'device']],
  ],
  ({ python, launch }) => {
    const kernel = (line: number, name: string, kernelUs: number, movesData = false) => {
      python(line, 0.45, `${HOST_US_PER_KERNEL} µs`)
      if (kernelUs < LABELLED_US) launch('', THIN_UNITS)
      else launch(name, 1, { movesData, caption: `${kernelUs} µs` })
    }
    python(1, 0.3)
    kernel(2, 'cast', 120, MOVES_DATA)
    kernel(3, 'pow', 66)
    kernel(3, 'mean', 40)
    kernel(4, 'add', 1)
    kernel(4, 'rsqrt', 1)
    kernel(4, 'mul', 102)
    kernel(5, 'cast', 48, MOVES_DATA)
    kernel(5, 'mul', 86)
  },
  'H200 · eager',
)
