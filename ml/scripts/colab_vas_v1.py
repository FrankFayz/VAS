"""
VAS Model V1 — Colab training cells (copy into Colab in order).

Prerequisite (already done in your ChatGPT/Colab session):
  - Dataset at /content/Merged_Datasets_For_Malpractice_Images-1
  - QC cleanup (invalid pairs removed)
  - Tesla T4 available

Philosophy:
  Smoke (3 epochs) → Full baseline (≤100, early stop) → Test eval → Document gaps
  Do NOT duplicate rare classes to fake balance.
"""

# =============================================================================
# STEP 0 — Environment + dataset paths (run first in a fresh cell)
# =============================================================================
from pathlib import Path
import torch
import yaml

DATASET_ROOT = Path("/content/Merged_Datasets_For_Malpractice_Images-1")
DATA_YAML = DATASET_ROOT / "data.yaml"

assert DATASET_ROOT.exists(), f"Dataset missing: {DATASET_ROOT}"
assert DATA_YAML.exists(), f"data.yaml missing: {DATA_YAML}"
assert torch.cuda.is_available(), "CUDA required for V1 baseline on Colab T4"

# Fix Roboflow relative paths so Ultralytics resolves train/val/test correctly
with open(DATA_YAML, "r", encoding="utf-8") as f:
    cfg = yaml.safe_load(f)

cfg["path"] = str(DATASET_ROOT.resolve())
cfg["train"] = "train/images"
cfg["val"] = "valid/images"
cfg["test"] = "test/images"

with open(DATA_YAML, "w", encoding="utf-8") as f:
    yaml.safe_dump(cfg, f, sort_keys=False)

print("Dataset:", DATASET_ROOT.resolve())
print("GPU:", torch.cuda.get_device_name(0))
print("VRAM GB:", round(torch.cuda.get_device_properties(0).total_memory / 1024**3, 2))
print("Classes:", cfg.get("names"))
print("nc:", cfg.get("nc"))
print("data.yaml paths normalized ✅")


# =============================================================================
# STEP 1 — Load YOLO26s (do not train yet)
# =============================================================================
# !pip install -U ultralytics  # run once if needed

from ultralytics import YOLO

model = YOLO("yolo26s.pt")
print("✅ YOLO26s pretrained weights loaded")


# =============================================================================
# STEP 2 — SMOKE TEST (3 epochs) — prove the pipeline before the long run
# =============================================================================
# Expectation: losses move, no crash, batch fits in ~14.6 GB.
# If CUDA OOM: change batch=16 → batch=8, or batch=-1 for auto.

smoke = model.train(
    data=str(DATA_YAML),
    epochs=3,
    imgsz=640,
    batch=16,
    device=0,
    workers=2,
    patience=3,
    seed=42,
    pretrained=True,
    cos_lr=True,
    cache=False,
    plots=True,
    project="runs/detect",
    name="vas_v1_smoke",
    exist_ok=True,
    # Exam-hall–aware augmentation
    fliplr=0.5,
    flipud=0.0,
    degrees=5.0,
    shear=0.0,
    perspective=0.0,
    mosaic=1.0,
    mixup=0.0,
    copy_paste=0.0,
    hsv_h=0.015,
    hsv_s=0.5,
    hsv_v=0.3,
)

print("✅ Smoke finished. Inspect runs/detect/vas_v1_smoke/")
print("If losses decreased and no OOM → proceed to STEP 3.")


# =============================================================================
# STEP 3 — FULL VAS V1 BASELINE (only after smoke looks healthy)
# =============================================================================
# Reload fresh pretrained weights so the baseline is not continuing from smoke.
model = YOLO("yolo26s.pt")

results = model.train(
    data=str(DATA_YAML),
    epochs=100,
    imgsz=640,
    batch=16,          # OOM → 8 or -1
    device=0,
    workers=2,
    patience=20,       # stop if val mAP stalls
    seed=42,
    pretrained=True,
    cos_lr=True,
    close_mosaic=10,
    cache=False,
    plots=True,
    save=True,
    project="runs/detect",
    name="vas_v1",
    exist_ok=True,
    fliplr=0.5,
    flipud=0.0,
    degrees=5.0,
    shear=0.0,
    perspective=0.0,
    mosaic=1.0,
    mixup=0.0,
    copy_paste=0.0,
    hsv_h=0.015,
    hsv_s=0.5,
    hsv_v=0.3,
)

print("✅ V1 training finished")
print("Best weights:", Path("runs/detect/vas_v1/weights/best.pt").resolve())


# =============================================================================
# STEP 4 — Evaluate on validation + held-out TEST (per-class honesty)
# =============================================================================
best = YOLO("runs/detect/vas_v1/weights/best.pt")

print("\n=== VALIDATION ===")
val_metrics = best.val(data=str(DATA_YAML), split="val", plots=True)

print("\n=== TEST (primary report for dissertation / grant) ===")
test_metrics = best.val(data=str(DATA_YAML), split="test", plots=True)

# Ultralytics prints per-class table in the cell output — save that output.
print("\n⚠️ Interpret carefully:")
print(" - Strong classes may look good (phone, paper, normal, multi-person).")
print(" - un_authorized_material / handwritten_copying may be near-zero — expected.")
print(" - Do not oversell overall mAP without reading per-class rows.")


# =============================================================================
# STEP 5 — Quick inference sanity check on a few test images
# =============================================================================
from glob import glob

test_images = sorted(glob(str(DATASET_ROOT / "test" / "images" / "*.jpg")))[:8]
if test_images:
    pred = best.predict(
        source=test_images,
        imgsz=640,
        conf=0.35,
        save=True,
        project="runs/detect",
        name="vas_v1_preview",
        exist_ok=True,
    )
    print("✅ Preview saved under runs/detect/vas_v1_preview/")
else:
    print("No test jpgs found for preview.")


# =============================================================================
# STEP 6 — Download checklist (run in Colab UI / files panel)
# =============================================================================
# Download:
#   runs/detect/vas_v1/weights/best.pt
#   runs/detect/vas_v1/weights/last.pt
#   runs/detect/vas_v1/results.csv
#   runs/detect/vas_v1/results.png
#   runs/detect/vas_v1/confusion_matrix.png
#   runs/detect/vas_v1/args.yaml
#
# Keep best.pt OUT of git. Next: edge agent loads best.pt → posts incidents to VAS API.
