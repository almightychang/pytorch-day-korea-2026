import { scene } from '../composables/codeLanes'

const ROTATE = ['mul', 'neg', 'cat', 'mul', 'add']

export default scene(
  {
    repo: 'huggingface/transformers@v4.57.3',
    path: 'src/transformers/models/qwen3_vl/modeling_qwen3_vl.py#L121-L126',
    symbol: 'apply_rotary_pos_emb_vision',
    users: 'used by GR00T N1.7, RLDX',
  },
  [
    [['q, k = ', 'host'], ['q.float(), k.float()', 'device']],
    [['cos, sin = ', 'host'], ['cos.unsqueeze(-2).float(), sin.unsqueeze(-2).float()', 'device']],
    [['q_embed = ', 'host'], ['(q * cos) + (rotate_half(q) * sin)', 'device']],
    [['k_embed = ', 'host'], ['(k * cos) + (rotate_half(k) * sin)', 'device']],
    [['q_embed = ', 'host'], ['q_embed.to(orig_q_dtype)', 'device']],
    [['k_embed = ', 'host'], ['k_embed.to(orig_k_dtype)', 'device']],
  ],
  ({ python, launch }) => {
    const kernels = (line: number, names: string[]) =>
      names.forEach((name) => {
        python(line, 1)
        launch(name, 0.6)
      })
    kernels(1, ['cast', 'cast'])
    kernels(2, ['cast', 'cast'])
    kernels(3, ROTATE)
    kernels(4, ROTATE)
    kernels(5, ['cast'])
    kernels(6, ['cast'])
  },
)
