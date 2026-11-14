import { scene } from '../composables/codeLanes'

export default scene(
  {
    repo: 'Simplified Code',
    users: 'used by GR00T N1.7, RLDX',
    excerpts: [
      {
        path: 'NVIDIA/Isaac-GR00T@n1.7-release  gr00t/experiment/trainer.py#L249',
        code: '"pin_memory": self.args.dataloader_pin_memory,',
      },
      { path: 'huggingface/transformers@v4.57.3  src/transformers/trainer.py#L3810', code: 'return data.to(**kwargs)' },
    ],
  },
  [
    [['loader = DataLoader(dataset, pin_memory=True)', 'host']],
    [['for batch in loader:', 'host'], ['  # pixel_values: CPU, fp32, pinned', 'comment']],
    [['    pixel_values = ', 'host'], ['batch["pixel_values"].to(device="cuda", dtype=torch.bfloat16)', 'h2d']],
  ],
  ({ python, launch, h2d }) => {
    python(1, 0.6)
    python(2, 0.8)
    python(3, 4, 'dtype casting (fp32 → bf16) into pageable memory')
    h2d(3, 1.5)
    launch('forward', 3)
  },
)
