import { scene } from '../composables/codeLanes'

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
    const kernel = (line: number, name: string) => {
      python(line, 1)
      launch(name, 0.6)
    }
    python(1, 0.5)
    kernel(2, 'cast')
    kernel(3, 'pow')
    kernel(3, 'mean')
    kernel(4, 'add')
    kernel(4, 'rsqrt')
    kernel(4, 'mul')
    kernel(5, 'cast')
    kernel(5, 'mul')
  },
)
