import { scene } from '../composables/codeLanes'

const GEMM_UNITS = 2.6
const POINTWISE_UNITS = 0.6

export default scene(
  {
    repo: 'huggingface/transformers@v4.57.3',
    path: 'src/transformers/models/qwen3_vl/modeling_qwen3_vl.py#L472',
    symbol: 'Qwen3VLTextMLP.forward',
    users: 'used by GR00T N1.7, RLDX',
  },
  [[['down_proj = ', 'host'], ['self.down_proj(self.act_fn(self.gate_proj(x)) * self.up_proj(x))', 'device']]],
  ({ python, launch }) => {
    const kernel = (name: string, units: number) => {
      python(1, 1)
      launch(name, units)
    }
    kernel('gemm', GEMM_UNITS)
    kernel('silu', POINTWISE_UNITS)
    kernel('gemm', GEMM_UNITS)
    kernel('mul', POINTWISE_UNITS)
    kernel('gemm', GEMM_UNITS)
  },
)
