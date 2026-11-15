import { scene } from '../composables/codeLanes'

const SAMPLES = 2

export default scene(
  {
    repo: 'huggingface/transformers@v4.57.3',
    path: 'src/transformers/models/qwen3_vl/modeling_qwen3_vl.py#L948-L1010',
    users: 'used by GR00T N1.7, RLDX',
  },
  [
    [['for i, input_ids in enumerate(', 'host'], ['total_input_ids', 'device'], ['):', 'host'], ['  # total_input_ids: CUDA tensor', 'comment']],
    [['    input_tokens = ', 'host'], ['input_ids.tolist()', 'd2h']],
    [['    if st < len(input_tokens):', 'host']],
    [['        llm_pos_ids_list.append(torch.arange(text_len).view(1, -1).expand(3, -1) + st_idx)', 'host']],
    [['    llm_positions = torch.cat(llm_pos_ids_list, dim=1).reshape(3, -1)', 'host']],
    [['    ', 'host'], ['position_ids[..., i, attention_mask[i] == 1] = ', 'device'], ['llm_positions.to(position_ids.device)', 'h2d']],
  ],
  ({ python, launch, d2h, h2d }) => {
    for (let sample = 0; sample < SAMPLES; sample++) {
      python(1, 0.6)
      d2h(2)
      python(3, 0.5)
      python(4, 2.2)
      python(5, 1)
      h2d(6, 0.5)
      launch('eq', 0.6)
      launch('put', 0.8)
    }
  },
)
