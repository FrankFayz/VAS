"""Map YOLO malpractice classes → VAS backend incident types."""

YOLO_TO_INCIDENT = {
    'gesture_copying': 'COPYING',
    'handwritten_copying': 'COPYING',
    'paper_cheating': 'COPYING',
    'two_more_cheating': 'COPYING',
    'peeping': 'PEEKING',
    'phone_cheating': 'PHONE_USE',
    'un_authorized_material': 'UNAUTHORIZED_MATERIAL',
    # 'normal' intentionally omitted — negative / no alert
}

# Classes we expect V1 to struggle with until more data exists
V1_LOW_CONFIDENCE_CLASSES = frozenset({
    'un_authorized_material',
    'handwritten_copying',
    'gesture_copying',
})


def should_raise_alert(class_name: str, confidence: float, min_conf: float = 0.45) -> bool:
    """Decide whether a detection should create a VAS incident."""
    if class_name == 'normal' or class_name not in YOLO_TO_INCIDENT:
        return False
    if class_name in V1_LOW_CONFIDENCE_CLASSES and confidence < max(min_conf, 0.55):
        return False
    return confidence >= min_conf
