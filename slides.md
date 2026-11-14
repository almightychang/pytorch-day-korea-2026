---
title: Slidev spike
theme: default
colorSchema: dark
canvasWidth: 1920
aspectRatio: 16/9
transition: fade
layout: none
clicks: 2
---

<div class="page">
  <p class="eyebrow">01 · Kernel Rewriting</p>
  <h1>Sample-wise에서 batch-wise로</h1>

````md magic-move {lines: false}
```py
selected = []

for b in range(batch_size):
    tokens = hidden[b][keep_mask[b]]
    selected.append(tokens)

output = pad_to_batch(selected)
```
```py {3-5}
selected = []

for b in range(batch_size):
    tokens = hidden[b][keep_mask[b]]
    selected.append(tokens)

output = pad_to_batch(selected)
```
```py
# gather_indices, pad_mask: host planner가 준비한 [B, K]
indices = gather_indices.unsqueeze(-1).expand(
    -1, -1, hidden.shape[-1]
)

output = hidden.gather(dim=1, index=indices)
output = output.masked_fill(pad_mask.unsqueeze(-1), 0)
```
````

  <p class="caption" v-click="[1, 2]">sample마다 kernel을 제출하고, 결과 길이가 데이터마다 달라진다</p>
  <p class="caption" v-click="2">plan은 host가, 실행은 device가 batch 단위로</p>
</div>

---
layout: none
clicks: 2
---

<div class="page">
  <p class="eyebrow">02 · Async Device Transfer</p>
  <h1>H2D를 compute 뒤에 숨긴다</h1>
  <PipelineTimeline :step="$clicks" />
</div>

---
layout: none
clicks: 1
---

<div class="page">
  <p class="eyebrow">03 · Impact · RLDX#223</p>
  <h1>Rank당 step 평균</h1>
  <ResultBars :step="$clicks" />
</div>
