import { scene } from '../composables/codeLanes'

const HOST_US_PER_KERNEL = 24

export default scene(
  {
    repo: 'huggingface/transformers@v4.57.3',
    path: 'src/transformers/models/qwen3_vl/modeling_qwen3_vl.py#L614-L624',
    symbol: 'Qwen3VLVisionModel.rot_pos_emb',
    users: 'used by GR00T N1.7, RLDX',
  },
  [
    [['for num_frames, height, width in ', 'host'], ['grid_thw', 'device'], [':', 'host'], ['  # once per image', 'comment']],
    [['    intra_row = ', 'host'], ['torch.arange(merge_size, device=device)', 'device']],
    [['    intra_col = ', 'host'], ['torch.arange(merge_size, device=device)', 'device']],
    [['    row_idx = ', 'host'], ['block_rows[:, None, None, None] * merge_size + intra_row[None, None, :, None]', 'device']],
    [['    col_idx = ', 'host'], ['block_cols[None, :, None, None] * merge_size + intra_col[None, None, None, :]', 'device']],
  ],
  ({ python, launch }) => {
    const kernel = (line: number, name: string, kernelUs: number) => {
      python(line, 1, `${HOST_US_PER_KERNEL} µs`)
      launch(name, 0.35, { caption: `${kernelUs} µs` })
    }
    python(1, 0.5)
    kernel(2, 'arange', 0.7)
    kernel(3, 'arange', 0.7)
    kernel(4, 'mul', 0.9)
    kernel(4, 'add', 1)
    kernel(5, 'mul', 0.9)
    kernel(5, 'add', 1)
  },
  'H200 · eager',
)
