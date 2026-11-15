# Deck plan

PyTorch Day Korea 2026 · 2026-11-21 15:40 · 30분 · Build Track
「오픈소스 Physical AI 모델은 더 빠르게 훈련할 수 있다」

2026-11-14 기준. 장 번호는 이 구성으로 다 옮긴 뒤의 번호다.

## 구조

```
도입 → Problem Definition → Analysis → Architecture → Results
```

- **Analysis**는 주제마다 `예시 → 원리`로 간다. 원리는 PyTorch·NVIDIA 문서에 있는 일반적인 사실이고, 전후 비교를 포함해도 된다.
- **Architecture**는 우리가 만든 구조다. 파이프라인 그림 한 장을 지도로 삼고, 단계마다 `단계 설명 → 효과`로 끝낸다. Analysis의 원리 그림을 다시 꺼내지 않는다.
- 주제, 파이프라인 단계, PR, 측정값이 1:1로 대응한다.

| 주제 | 파이프라인 단계 | PR | 측정값 (exp-64) |
|---|---|---|---|
| Host vs Device | `BatchPlanner`, `AsyncDeviceTransfer` | #211 | GPU가 빈 시간 854.0 → 54.7 ms |
| Kernel | `prepare_for_execution` | #223 | compute 1,348.9 → 896.0 ms |
| Rank skew | `route_batches` | #232 | NCCL 616.0 → 252.7 ms |

## 장 목록

상태: `완료` 만들어 둠 · `손봄` 있는데 고쳐야 함 · `빈칸` 자리표시 · `신규` 새로 만듦

### 도입

| p | 내용 | 상태 |
|---|---|---|
| 1 | 표지 | 완료 |
| 2 | About Me | 빈칸 |
| 3 | 직군 mosaic, ML Performance 강조 | 완료 |
| 4 | 분야별 효과 (Research, Serving, Infra) | 완료 |
| 5 | VLA 섹션 표지 | 완료 |
| 6 | VLA 구조 | 빈칸 |
| 7 | Data Collection → Training → Rollout | 완료 |
| 8 | 데모 영상 | 완료 |

### Problem Definition

| p | 내용 | 상태 |
|---|---|---|
| 9 | 섹션 표지 | 완료 |
| 10 | 데모와 실험은 늘어나고 GPU는 한정되어 있다 | 완료 |
| 11 | GPU is expensive · 53% WASTED | 완료 |
| 12 | Baseline 타임라인 (Nsight Systems) | 완료 |
| 13 | Worst micro-step · DEVICE 67% IDLE | 완료 |

### Analysis

| p | 주제 | 내용 | 상태 |
|---|---|---|---|
| 14 | | 섹션 표지 | 완료 |
| 15 | Host vs Device | 주제 표지 (타임라인 하이라이트) | 완료 |
| 16 | | Implicit D2H — `rot_pos_emb` | 완료 |
| 17 | | D2H → H2D round trip — `get_rope_index` | 완료 |
| 18 | | Cast before H2D — `.to(device, dtype)` | 완료 |
| 19 | Kernel | 주제 표지 | 완료 |
| 20 | | 예시: RMSNorm 다섯 줄 | 완료 |
| 21 | | 원리: Launch overhead | 완료 |
| 22 | | 원리: Intermediate tensors (8번 vs 4번) | 완료 |
| 23 | | 원리: Kernel selection (10,922 vs 10,928) | 완료 |
| 24 | Rank skew | 주제 표지 | 완료 |
| 25 | | 예시: 가장 느린 rank를 나머지가 기다린다 | 빈칸 |
| 26 | | 원리: collective는 모든 rank가 도착해야 진행한다 | 빈칸 |

### Architecture

| p | 내용 | 상태 |
|---|---|---|
| 27 | 섹션 표지 | 완료 |
| 28 | 파이프라인 전체 그림, 세 주제가 놓이는 단계 표시 | 신규 (Principles·Overview 대체) |
| 29 | `BatchPlanner`: forward 안의 계산을 worker로 | 신규 (Host Planner 두 장 대체) |
| 30 | `AsyncDeviceTransfer`: 다음 batch를 미리 올린다 | 손봄 (영어로) |
| 31 | 효과 #211: 타임라인 전후, 854.0 → 54.7 ms | 신규 |
| 32 | `prepare_for_execution` ①: compile 범위 | 손봄 (Rewriting·Fusion 합침) |
| 33 | `prepare_for_execution` ②: hidden 폭 정렬, 입력 계약 | 손봄 (Compute Shapes·Input Contract 합침) |
| 34 | 효과 #223: kernel 30,047 → 4,977, compute 1,348.9 → 896.0 ms | 손봄 (Results에서 옮김) |
| 35 | `route_batches`: cost 추정, micro-step별 균형 | 손봄 |
| 36 | 효과 #232: NCCL 616.0 → 252.7 ms | 신규 |
| 37 | 파이프라인 그림 다시, 세 단계가 채워진 상태 | p28 재사용 |

### Results

| p | 내용 | 상태 |
|---|---|---|
| 38 | 섹션 표지 | 완료 |
| 39 | Throughput: 2.652 s → 1.214 s (2.188×) | 빈칸 |
| 40 | Reproducibility: bitwise / same-math | 빈칸 |
| 41 | Failures: 채택하지 않은 시도 | 손봄 (글머리표만 있음) |
| 42 | Stability: selective decoding, jemalloc, `gc.freeze()` | 손봄 (글머리표만 있음) |
| 43 | Upstream에 돌려준 것 (DeepSpeed #8364·#8366) | 완료 |
| 44 | 감사합니다 + QR | 빈칸 |
| 45 | Appendix 표지 | 완료 |
| 46 | Appendix: upstream `transformers` PR (#45396, #47170) | 완료 |

## 남은 결정

- 섹션 표지의 번호(3~7, A)를 유지할지
- 한국어로 남은 장(p1, p2, p5~p10, Architecture, Results)을 영어로 바꿀 범위
- Appendix를 전체 장수에 넣을지

## 출처

- 수치: `~/Workspaces/rldx-training-optimization/64-final-stack/RESULT.md`
- 구조: `~/Workspaces/code-quality/reports/rldx-refactor-2026-10-20.md`
- 서사: Notion 「20260909 RLDX 훈련 최적화」
- 코드 예시: `huggingface/transformers@v4.57.3`, `NVIDIA/Isaac-GR00T@n1.7-release`, `RLWRLD/RLDX-1@v1.0.2`
