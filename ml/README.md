# VAS Model Training (V1)

Professional baseline for the Virtual Assistant Supervisor detection engine.

## Where we left off

Dataset QC on Colab is complete:

| Split | Images | Labels |
|-------|--------|--------|
| Train | 8,407 | 8,407 |
| Valid | 2,401 | 2,401 |
| Test  | 1,202 | 1,202 |
| **Total** | **12,010** | **12,010** |

- 8 classes validated
- Invalid / useless image pairs removed from the **local** Colab copy
- Annotations visually spot-checked
- GPU: Tesla T4 (~14.6 GB)

**Do not claim V1 is strong on every class.** Train counts are heavily skewed (`un_authorized_material` ≈ 4 images). V1 establishes a **measurable baseline**; V2 adds targeted data for weak classes.

## Classes → VAS console

| YOLO class | Backend `incident_type` |
|------------|-------------------------|
| `gesture_copying` | `COPYING` |
| `handwritten_copying` | `COPYING` |
| `paper_cheating` | `COPYING` |
| `two_more_cheating` | `COPYING` / `TALKING` (context) |
| `peeping` | `PEEKING` |
| `phone_cheating` | `PHONE_USE` |
| `un_authorized_material` | `UNAUTHORIZED_MATERIAL` |
| `normal` | *(no alert — negative class)* |

## Training philosophy (V1)

1. **Smoke test** (3 epochs) — prove paths, GPU, and loss movement before a long run.
2. **Baseline train** (up to 100 epochs, early stop) — one clean, reproducible experiment.
3. **Evaluate** on the held-out **test** split with **per-class** metrics.
4. **Document weaknesses** — especially rare classes — instead of oversampling 4 images.
5. **Exam-aware augmentation** — lighting / left-right flip OK; avoid upside-down / wild perspective (unrealistic for fixed hall cameras).

## How to continue in Colab

Open your existing notebook (dataset already on disk at  
`/content/Merged_Datasets_For_Malpractice_Images-1`).

Copy cells from [`scripts/colab_vas_v1.py`](scripts/colab_vas_v1.py) **in order**:

1. `STEP 0` — paths + environment check  
2. `STEP 1` — load `yolo26s.pt`  
3. `STEP 2` — smoke train (3 epochs)  
4. `STEP 3` — full V1 baseline (only after smoke looks healthy)  
5. `STEP 4` — validate + test evaluation  
6. `STEP 5` — export notes for the grant / dissertation  

Config reference: [`configs/vas_v1.yaml`](configs/vas_v1.yaml).

## After training

Download from Colab:

- `runs/detect/vas_v1/weights/best.pt`
- `results.png`, `confusion_matrix.png`, `args.yaml`

Store weights **outside git** (too large). Keep metrics / plots in reports if needed.

## V2 backlog (after V1 metrics)

Priority data collection (more real, varied exam-hall footage):

1. `un_authorized_material`
2. `handwritten_copying`
3. `gesture_copying`
4. `peeping`

Then retrain as **VAS V2** with the same protocol — do not silently change V1 settings mid-experiment.
