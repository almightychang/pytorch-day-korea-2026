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
layout: bleed
---

<ScopeFields :step="2" />

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
clicks: 1
---

# Fine-tuning에서 real-time inference까지

<Lifecycle :step="$clicks" />

---
layout: bleed
---

<DemoVideo src="/demo-parcel.mp4" source="https://www.youtube.com/watch?v=lnaJeQUymXE" />

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
layout: section
section: '5'
---

# Analysis

---
layout: content
eyebrow: Analysis
---

# Host vs Device

<WorstMicrostep :highlight="['python', 'h2d', 'd2h']" />

---
layout: content
eyebrow: Host vs Device
---

# Implicit D2H

<CodeLanes scene="implicitD2h" />

---
layout: content
eyebrow: Host vs Device
---

# D2H → H2D round trip

<CodeLanes scene="implicitRoundTrip" />

---
layout: content
eyebrow: Host vs Device
---

# Cast before H2D

<CodeLanes scene="implicitH2d" />

---
layout: content
eyebrow: Analysis
---

# Kernel

<WorstMicrostep :highlight="['launch', 'device']" :sublanes="['host', 'device']" :lane-height="44" />

---
layout: content
eyebrow: Kernel
---

# RMSNorm: one launch per kernel

<CodeLanes scene="rmsNorm" />

---
layout: content
eyebrow: Kernel
---

# Vision RoPE: cast vs compute

<CodeLanes scene="visionRope" />

---
layout: content
eyebrow: Kernel
---

# How a launch works

<LaunchQueue />

---
layout: content
eyebrow: Kernel
---

# Small kernels expose launch overhead

<LaunchOverhead />

---
layout: content
eyebrow: Kernel
---

# Large kernels hide launch overhead

<CodeLanes scene="textMlp" />

---
layout: content
eyebrow: Kernel
---

# Intermediate tensors

<IntermediateTensors />

---
layout: content
eyebrow: Kernel
---

# Kernel selection

<KernelSelection />

---
layout: content
eyebrow: Analysis
---

# Rank

<WorstMicrostep :highlight="['nccl']" />

---
layout: content
eyebrow: Rank · Example
---

# Example

<Placeholder label="example" />

---
layout: content
eyebrow: Rank · Principle
---

# Why it happens

<Placeholder label="principle" />

---
layout: section
section: '6'
---

# Architecture for Optimized Path

---
layout: content
eyebrow: Principles
---

# 세 가지 원칙

<Placeholder label="host는 계획, device는 실행만 · 경계에는 명시적인 계약 · batch/vector 연산" />

---
layout: content
eyebrow: Overview
---

# 전체 구조

<Placeholder label="Collator + Host Planner → Contract · Transfer → Pure Device Kernel → Routing" />

---
layout: content
eyebrow: Host Planner
---

# Why it happens

<WaitCycle />

---
layout: content
eyebrow: Host Planner
---

# Host는 계획하고, device는 실행만 한다

<Placeholder label="입력만으로 정해지는 metadata와 실행 계획을 host에서 미리 준비" />

---
layout: content
eyebrow: Async Transfer
clicks: 2
---

# H2D를 compute 뒤에 숨긴다

<PipelineTimeline :step="$clicks" />

---
layout: content
eyebrow: Pure Device Kernel · Rewriting
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
eyebrow: Pure Device Kernel · Fusion
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
eyebrow: Pure Device Kernel · Compute Shapes
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
eyebrow: Pure Device Kernel · Input Contract
---

# 재컴파일을 막는 입력 계약

- **stride**: compile 경계에서 `.contiguous()`
- **max_seqlen**: batch별 정확한 값 대신 bucket 상한

<Placeholder label="stride · bucket 다이어그램" :height="360" />

---
layout: content
eyebrow: Workload-aware Routing
---

# 비싼 micro-batch를 같은 micro-step에 모은다

```txt
AS-IS   micro-step 0  [12] [ 4] [ 8] [ 5]  → 12
        micro-step 1  [ 3] [11] [ 4] [ 6]  → 11     critical path 23

TO-BE   micro-step 0  [12] [11] [ 8] [ 6]  → 12
        micro-step 1  [ 5] [ 4] [ 4] [ 3]  →  5     critical path 17
```

<p class="caption">cost 추정 → All-Gather → node-local A2A routing</p>

---
layout: section
section: '7'
---

# Results

---
layout: content
eyebrow: Profile
---

# 단계별 profile

<Placeholder label="base → #211 → #223 → #232 타임라인" />

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

# 2.652 s → 1.214 s

<Placeholder label="step period: base 2.652 → #211 1.814 → #223 1.290 → #232 1.214 s (2.188×)" />

---
layout: content
eyebrow: Reproducibility
---

# 같은 학습인가

<Placeholder label="base→#211 bitwise · #211→#223 same-math 1.024× · #223→#232 same-math 0.945× · base→#232 1.016×" />

---
layout: content
eyebrow: Failures
---

# 채택하지 않은 시도들

- 통신량을 줄였지만 collective 횟수가 늘어 더 느려진 변경
- workload를 균등화하려다 새로운 동기화 구간을 만든 방식
- profiler에서는 비용이 커 보였지만 wall time을 줄이지 못한 수정

---
layout: content
eyebrow: Stability
---

# 메모리와 실행 시간을 예측 가능하게

- Selective union decoding
- jemalloc
- `gc.freeze()`: gen-2 pause 0.33–0.93초 → 약 0.003초

---
layout: content
eyebrow: Upstream
---

# 이 과정에서 upstream에 돌려준 것

- **DeepSpeed #8364 · #8366**: ZeRO-1/2 `overlap_comm`에서 backward가 직전 bucket의 collective 뒤에 줄을 서던 문제
- 전체 reduction stream 대기 → 재사용하는 IPG buffer의 event만 대기

<p class="caption">8× H200 · ZeRO-2 · rank 도착 시차가 collective 시간을 지배할 때 특히 비싸다</p>

---
layout: cover
---

# 감사합니다

<div class="qr-row">
  <Placeholder label="LinkedIn QR" :height="320" />
  <Placeholder label="미팅 QR" :height="320" />
  <Placeholder label="RLWRLD 채용 QR" :height="320" />
</div>


---
layout: section
section: 'A'
---

# Appendix

---
layout: content
eyebrow: Appendix · Upstream
---

# Implicit D2H in `transformers`

<div class="pull-requests">
  <PullRequestCard repo="huggingface/transformers" :number="45396" title="Extract dynamic vision/audio tensors into standalone pure functions" merged="2026-05-13" release="v5.9.0">
    Goal: torch.compile / export.<br>rot_pos_emb → get_vision_position_ids: one grid_thw.tolist() per call, skipped when position_ids are precomputed.
  </PullRequestCard>
  <PullRequestCard repo="huggingface/transformers" :number="47170" title="Optimize flash attention max seqlen computation in vision attention" merged="2026-07-21" release="v5.15.0">
    Goal: avoid repeated device-to-host synchronization.<br>max_seqlen is computed once per encoder, not in every attention layer.
  </PullRequestCard>
</div>

<p class="pin-note">GR00T N1.7 pins transformers==4.57.3, before both changes.</p>

<style>
.pull-requests {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-top: 48px;
}

.pin-note {
  margin-top: 36px;
  font-size: 24px;
  color: var(--muted);
}
</style>
