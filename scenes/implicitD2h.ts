import { scene } from '../composables/codeLanes'

const IMAGES = 3

export default scene(
  {
    repo: 'huggingface/transformers@v4.57.3',
    path: 'src/transformers/models/qwen3_vl/modeling_qwen3_vl.py#L606-L617',
    users: 'used by GR00T N1.7, RLDX',
  },
  [
    [['max_hw = int(', 'host'], ['grid_thw[:, 1:].max()', 'device'], ['.item()', 'd2h'], [')', 'host']],
    [['freq_table = ', 'host'], ['self.rotary_pos_emb(max_hw)', 'device']],
    [['total_tokens = int(', 'host'], ['torch.prod(grid_thw, dim=1).sum()', 'device'], ['.item()', 'd2h'], [')', 'host']],
    [['for num_frames, height, width in grid_thw:', 'host']],
    [['    merged_h, merged_w = ', 'host'], ['height // merge_size, width // merge_size', 'device']],
    [['    block_rows = ', 'host'], ['torch.arange(', 'device'], ['merged_h', 'd2h'], [', device=device)', 'device']],
  ],
  ({ python, launch, d2h }) => {
    python(1, 1)
    launch('max', 2)
    d2h(1)
    python(2, 1.5)
    launch('rope', 3)
    python(3, 1)
    launch('prod', 1)
    launch('sum', 1)
    d2h(3)
    for (let image = 0; image < IMAGES; image++) {
      python(4, 1)
      python(5, 0.8)
      launch('div', 0.6)
      launch('div', 0.6)
      python(6, 0.5)
      d2h(6)
      python(6, 0.5)
      launch('arange', 1)
    }
  },
)
