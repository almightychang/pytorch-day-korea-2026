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

PyTorch Day Korea 2026

장주철 (Joochul Chang) · Software Engineer

<img class="affiliation" src="/rlwrld-logo.png" alt="RLWRLD">

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

# Vision-Language-Action

<FigureCard class="vla-figure" src="/gr00t-n1-overview.png" padded />

<SourceNote site="arxiv" title="GR00T N1: An Open Foundation Model for Generalist Humanoid Robots" detail="Figure 2 · CC BY 4.0" href="https://arxiv.org/abs/2503.14734" />

<style>
.vla-figure {
  width: 1120px;
  margin: 0 auto;
}
</style>

---
layout: content
eyebrow: VLA
---

# Lifecycle

<Lifecycle />

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
layout: content
eyebrow: Root Cause
---

# GPU is expensive

<StepBreakdown bracket />

---
layout: content
eyebrow: Root Cause
---

# Profiling

<div class="tools">
  <DocCard site="pytorchDocs" title="PyTorch Docs" href="https://docs.pytorch.org/docs/stable/profiler.html">
    <h3>torch.profiler</h3>
    <p>which operator<br>which Python line<br>how much memory</p>
  </DocCard>
  <DocCard site="nvidia" title="NVIDIA Developer" href="https://developer.nvidia.com/nsight-systems">
    <h3>Nsight Systems</h3>
    <p>what the GPU did<br>across all ranks<br>on one timeline</p>
  </DocCard>
</div>

<style>
.tools {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-top: 80px;
}

.tools h3 {
  margin: 40px 0 28px;
  font-family: var(--mono);
  font-size: 44px;
  font-weight: 600;
}

.tools p {
  margin: 0 0 20px;
  font-size: 34px;
  line-height: 1.7;
  color: var(--muted);
}
</style>

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

# ZeRO-2

<ZeroStages />

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
clicks: 1
---

# Batch Routing

<BatchRouting :step="$clicks" />

---
layout: content
eyebrow: Architecture · Rank skew
---

# Cost function

<CostFunction />

---
layout: content
eyebrow: Architecture · Kernel
---

# Free Lunch

<CompiledKernel />

---
layout: content
eyebrow: Architecture · Kernel
---

# How torch.compile works

<CompileFlow focus="Dynamo" />

<SourceNote site="pytorchDocs" title="Dynamo Core Concepts" href="https://docs.pytorch.org/docs/stable/user_guide/torch_compiler/compile/programming_model.dynamo_core_concepts.html" />

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

# How torch.compile works

<CompileFlow focus="Inductor" />

<SourceNote site="pytorchDocs" title="Dynamo Core Concepts" href="https://docs.pytorch.org/docs/stable/user_guide/torch_compiler/compile/programming_model.dynamo_core_concepts.html" />

---
layout: content
eyebrow: Architecture · Kernel
---

# Compile region

<CompileRegion />

---
layout: section
section: '7'
---

# Results

---
layout: content
eyebrow: Throughput
---

# 2.27× faster

<StepPeriod />

---
layout: content
eyebrow: Profile · By stage
clicks: 3
---

<StageMorph :step="$clicks" />

---
layout: content
eyebrow: Results · wandb
---

# GPU utilization

<div class="wandb-pair">
  <FigureCard src="/wandb/gpu-before.png" caption="before" />
  <FigureCard src="/wandb/gpu-after.png" caption="after" />
</div>

<style>
.wandb-pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  margin-top: 88px;
}
</style>

---
layout: content
eyebrow: Results · wandb
---

# Step time

<FigureCard class="wandb-single" src="/wandb/step-max.png" caption="longest step · before grey, after green" />

<style>
.wandb-single {
  width: 1180px;
  margin: 28px auto 0;
}
</style>

---
layout: content
eyebrow: Results
---

# Inference

<InferenceLatency />

---
layout: section
section: '8'
---

# Behind the Scenes

---
layout: content
eyebrow: Behind the scenes
---

# GPU Power Cap

<GpuPowerCap />

---
layout: content
eyebrow: Behind the scenes
---

# Sync debug mode

<SyncDebugMode />

---
layout: content
eyebrow: Behind the scenes
---

# Gradient accumulation bug

<div class="single-card">
  <GithubCard repo="deepspeedai/DeepSpeed" :number="7718" title="Incorrect gradient computation in ZeRO-2 with DeepSpeed ≥ 0.17.6" state="closed" meta="2025-12-19 · fixed in v0.18.3">
    With gradient accumulation K > 1, only the last micro-batch reached the optimizer.<br>Training used 1 / K of the intended batch.
  </GithubCard>
  <p>Pinned in GR00T N1.7, RLDX-1.0</p>
</div>

<style>
.single-card {
  width: 1100px;
  margin: 88px auto 0;
}

.single-card p {
  margin: 36px 0 0;
  font-size: 24px;
  color: var(--muted);
}
</style>

---
layout: cover
---

<div class="hiring">
  <QrCode href="https://www.rlwrld.ai/careers" logo="/rlwrld-logo.png" />
  <h1>We’re hiring</h1>
</div>

<style>
.hiring {
  --qr-ink: #23b399;
  display: grid;
  grid-template-columns: 560px auto;
  justify-content: start;
  align-items: center;
  gap: 96px;
}

.hiring h1 {
  margin: 0;
}
</style>

---
layout: cover
---

# Q&A

<div class="contact">
  <QrCode href="https://github.com/almightychang/pytorch-day-korea-2026" />
  <div class="links">
    <SourceNote inline site="github" title="almightychang/pytorch-day-korea-2026" href="https://github.com/almightychang/pytorch-day-korea-2026" />
    <SourceNote inline site="linkedin" title="almightychang" href="https://www.linkedin.com/in/almightychang" />
  </div>
</div>

<style>
.contact {
  display: grid;
  grid-template-columns: 420px auto;
  justify-content: start;
  align-items: center;
  gap: 72px;
  margin-top: 24px;
}

.links {
  --source-size: 34px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}
</style>


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
  <GithubCard repo="huggingface/transformers" :number="45396" title="Extract dynamic vision/audio tensors into standalone pure functions" state="merged" meta="2026-05-13 · v5.9.0">
    Goal: torch.compile / export.<br>rot_pos_emb → get_vision_position_ids: one grid_thw.tolist() per call, skipped when position_ids are precomputed.
  </GithubCard>
  <GithubCard repo="huggingface/transformers" :number="47170" title="Optimize flash attention max seqlen computation in vision attention" state="merged" meta="2026-07-21 · v5.15.0">
    Goal: avoid repeated device-to-host synchronization.<br>max_seqlen is computed once per encoder, not in every attention layer.
  </GithubCard>
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
