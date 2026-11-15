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
eyebrow: Kernel · CPU-bound
---

# 2D RoPE: small kernels

<CodeLanes scene="rotPosEmbLoop" />

---
layout: content
eyebrow: Kernel · Memory-bound
---

# RMSNorm: intermediate tensors

<CodeLanes scene="rmsNorm" />

---
layout: content
eyebrow: Kernel
---

# Kernel bottlenecks

<KernelCosts />

---
layout: content
eyebrow: Kernel · CPU-bound
---

# How a launch works

<LaunchQueue />

---
layout: content
eyebrow: Kernel · CPU-bound
---

# Small kernels expose launch overhead

<LaunchOverhead />

---
layout: content
eyebrow: Kernel · Memory-bound
---

# Intermediate tensors

<TensorTraffic />

---
layout: content
eyebrow: Kernel · Memory-bound
---

# Kernel fusion

<TensorTraffic fused />

---
layout: content
eyebrow: Kernel · Kernel selection
---

# Tensor Core alignment

<KernelSelection />

---
layout: content
eyebrow: Analysis
---

# Rank skew

<WorstMicrostep :highlight="['nccl']" />

---
layout: content
eyebrow: Rank skew · Pretraining
---

# Waiting for the slowest rank

<RankSkew />

---
layout: content
eyebrow: Rank skew · Pretraining
---

# Why ranks get different work

<SkewCause />

---
layout: section
section: '6'
---

# Architecture

---
layout: content
eyebrow: Architecture
---

# Data flow: as-is

<AsIsFlow />

---
layout: content
eyebrow: Architecture
---

# Data flow: to-be

<ToBeFlow />

---
layout: content
eyebrow: Architecture
---

# Declare in Host, Execute in Device

<DeclareExecute />

---
layout: content
eyebrow: Architecture · Host vs Device
---

# Host Planner

<HostPlanner />

---
layout: content
eyebrow: Architecture · Host vs Device
---

# Async H2D Prefetch

<AsyncH2dPrefetch />

---
layout: content
eyebrow: Architecture · Rank skew
---

# Cost function

<CostFunction />

---
layout: content
eyebrow: Architecture · Rank skew
clicks: 1
---

# Batch Routing

<BatchRouting :step="$clicks" />

---
layout: content
eyebrow: Architecture · Kernel
---

# Fixed Shapes

<FixedShapes />

---
layout: content
eyebrow: Architecture · Kernel
---

# Kernel Compilation

<CompiledKernel />

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

---
layout: content
eyebrow: Appendix · Kernel
---

# Vision RoPE: cast vs compute

<CodeLanes scene="visionRope" />
