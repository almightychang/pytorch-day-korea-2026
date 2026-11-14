---
title: 오픈소스 Physical AI 모델은 더 빠르게 훈련할 수 있다
theme: default
colorSchema: dark
canvasWidth: 1920
aspectRatio: 16/9
transition: fade
layout: cover
---

# 오픈소스 Physical AI 모델은<br>더 빠르게 훈련할 수 있다

장주철 (Joochul Chang) · RLWRLD

PyTorch Day Korea 2026

---
layout: content
eyebrow: About Me
---

# 발표자 소개

<Placeholder label="약력 · 사진" />

---
layout: bleed
clicks: 1
---

<ScopeFields :step="$clicks" />

---
layout: section
section: '3'
---

# VLA

---
layout: content
eyebrow: VLA
---

# Vision-Language-Action 모델

<Placeholder label="VLA 구조 다이어그램 · vision + language → action" />

---
layout: content
eyebrow: VLA
---

# 실제로 움직이는 모습

<Placeholder label="로봇 demo 영상" />

---
layout: content
eyebrow: VLA
---

# Fine-tuning에서 real-time inference까지

<Placeholder label="lifecycle 다이어그램 · 데이터 수집 → fine-tuning → real-time inference" />

---
layout: section
section: '4'
---

# Problem Definition

---
layout: statement
eyebrow: Context
---

# 데모와 실험은 늘어나고,<br>GPU는 한정되어 있다

---
layout: content
eyebrow: Root Cause
---

# GPU is expensive

<StepBreakdown bracket />

---
layout: content
eyebrow: Baseline Profile (Nsight Systems)
---

<StepTimeline />

---
layout: content
eyebrow: Baseline Profile · Worst Micro-step
---

<WorstMicrostep />

---
layout: content
eyebrow: Example
---

# host의 Python: forward 한가운데의 D2H

```py
max_hw = int(grid_thw[:, 1:].max().item())             # D2H
total_tokens = int(torch.prod(grid_thw, dim=1).sum().item())  # D2H

for num_frames, height, width in grid_thw:
    block_rows = torch.arange(height // merge_size, device=device)  # D2H
    if num_frames > 1:                                 # D2H
        coords = coords.repeat(num_frames, 1)
```

<p class="caption">GPU에 있는 값을 Python이 읽을 때마다 GPU는 멈춘다</p>

---
layout: section
section: '5'
---

# Architecture for Optimized Path

---
layout: content
eyebrow: TOC
---

# 세 가지 축

- **Host-Device**: host planner, pipelining
- **Kernel**: kernel fusion, compute shapes, dynamic input tensor
- **Distributed**: batch routing

---
layout: content
eyebrow: Host Planner
---

# Host는 계획하고, device는 실행만 한다

<Placeholder label="Collator + Host Planner → Contract (dtype · shape · layout · device) → Model" />

---
layout: content
eyebrow: Pipelining
clicks: 2
---

# H2D를 compute 뒤에 숨긴다

<PipelineTimeline :step="$clicks" />

---
layout: content
eyebrow: Kernel Rewriting
clicks: 2
---

# Sample-wise에서 batch-wise로

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

---
layout: content
eyebrow: Kernel Fusion
---

# 중간 tensor를 없앤다

```txt
y = x * scale + bias

Kernel 1: x 읽기 → 곱셈 → 중간 tensor 저장
Kernel 2: 중간 tensor 읽기 → 덧셈 → y 저장
─────────────────────────────────────────────
Fused:    x 읽기 → 곱셈 → 덧셈 → y 저장
```

<p class="caption">torch.compile: RMSNorm · RoPE → vision block → MSAT forward 전체</p>

---
layout: content
eyebrow: Compute Shapes
---

# 채널 6개를 늘렸더니 3배 빨라졌다

```txt
hidden = int(2 / 3 * 4096 * 4)   # 10,922

기존:  [ 10,922 ]                      → SM80 CUTLASS align2
정렬:  [ 10,922 ][ zero padding 6 ]    → SM90 nvjet
```

<p class="caption">H200 · BF16 · hidden dimension을 8의 배수로</p>

---
layout: content
eyebrow: Dynamic Input Tensor
---

# 재컴파일을 막는 입력 계약

- **stride**: compile 경계에서 `.contiguous()`
- **max_seqlen**: batch별 정확한 값 대신 bucket 상한

<Placeholder label="stride · bucket 다이어그램" :height="360" />

---
layout: content
eyebrow: Batch Routing
---

# 가장 느린 rank가 step time을 정한다

```txt
AS-IS   micro-step 0  [12] [ 4] [ 8] [ 5]  → 12
        micro-step 1  [ 3] [11] [ 4] [ 6]  → 11     critical path 23

TO-BE   micro-step 0  [12] [11] [ 8] [ 6]  → 12
        micro-step 1  [ 5] [ 4] [ 4] [ 3]  →  5     critical path 17
```

<p class="caption">cost 추정 → All-Gather → node-local A2A routing</p>

---
layout: section
section: '6'
---

# Results

---
layout: content
eyebrow: Impact · RLDX#223
clicks: 1
---

# Rank당 step 평균

<ResultBars :step="$clicks" />

---
layout: content
eyebrow: Throughput
---

# Throughput

<Placeholder label="Base → #211 → #223 → #232 throughput 차트" />

---
layout: content
eyebrow: More Optimizations
---

# 사내 추가 최적화 사례

- Selective union decoding
- jemalloc
- `gc.freeze()`: gen-2 pause 0.33–0.93초 → 약 0.003초

---
layout: cover
---

# 감사합니다

<div class="qr-row">
  <Placeholder label="LinkedIn QR" :height="320" />
  <Placeholder label="미팅 QR" :height="320" />
  <Placeholder label="RLWRLD 채용 QR" :height="320" />
</div>
