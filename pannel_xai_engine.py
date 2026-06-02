import numpy as np
import json
import cv2
import torch
import torch.nn as nn
from PIL import Image, ImageDraw, ImageFont
from ultralytics import YOLO
from ultralytics.data.augment import LetterBox
from pytorch_grad_cam import EigenCAM
from pytorch_grad_cam.utils.image import show_cam_on_image


# YOLOv8 출력 래퍼
class YOLOWrapper(nn.Module):
    def __init__(self, model):
        super().__init__()
        self.model = model

    def forward(self, x):
        output = self.model(x)
        if isinstance(output, (tuple, list)):
            return output[0]
        return output


class YOLOXAIEngine:

    CLASS_NAMES = ["normal", "dust", "snow", "bird_dropping", "physical_damage"]

    CLASS_KO = {
        "dust": "먼지",
        "snow": "눈",
        "bird_dropping": "조류 배설물",
        "physical_damage": "물리적 손상",
    }

    KOREAN_FONT_PATHS = [
        "C:/Windows/Fonts/malgun.ttf",
        "C:/Windows/Fonts/gulim.ttc",
        "C:/Windows/Fonts/batang.ttc",
        "C:/Windows/Fonts/NanumGothic.ttf",
    ]

    def __init__(
        self,
        model_path: str,
        target_layer_index: int = 15,
    ):
        self.model = YOLO(model_path)
        self.torch_model = self.model.model
        self.torch_model.eval()

        wrapped_model = YOLOWrapper(self.torch_model)

        #이름 기반 레이어 탐색
        target_layer = self._find_target_layer(target_layer_index)

        self.cam = EigenCAM(
            model=wrapped_model,
            target_layers=[target_layer],
            reshape_transform=self._yolo_reshape_transform,
        )

        self.font = self._load_korean_font(16)

    # 내부 유틸

    def _load_korean_font(self, size: int) -> ImageFont.FreeTypeFont:
        for path in self.KOREAN_FONT_PATHS:
            try:
                return ImageFont.truetype(path, size)
            except (IOError, OSError):
                continue
        print("[경고] 한글 폰트를 찾을 수 없습니다. 기본 폰트를 사용합니다.")
        return ImageFont.load_default()

    def _find_target_layer(self, fallback_index: int):
        layers = list(self.torch_model.model)
        for i, layer in enumerate(layers):
            if i >= 10 and type(layer).__name__ == "C2f":
                print(f"[레이어 탐색] index={i}, type=C2f → EigenCAM 타겟 설정")
                return layer

        # 전체 범위에서 C2f 탐색
        for i, layer in enumerate(layers):
            if type(layer).__name__ == "C2f":
                print(f"[레이어 탐색] index={i}, type=C2f (전체 범위) → EigenCAM 타겟 설정")
                return layer

        # 최종 폴백: index 직접 사용
        print(f"[레이어 탐색] C2f 레이어를 찾지 못했습니다. index={fallback_index} 폴백 사용")
        try:
            return layers[fallback_index]
        except IndexError:
            raise ValueError(
                f"레이어 인덱스 {fallback_index}를 찾을 수 없습니다.\n"
                "아래 코드로 모델 레이어 목록을 먼저 확인하세요:\n"
                "  for i, layer in enumerate(model.model.model):\n"
                "      print(i, type(layer).__name__)"
            )

    @staticmethod
    def _yolo_reshape_transform(tensor):
        while isinstance(tensor, (list, tuple)):
            tensor = tensor[0]
        if tensor.dim() == 3:
            tensor = tensor.unsqueeze(0)
        return tensor

    def _preprocess(self, rgb: np.ndarray) -> tuple[torch.Tensor, dict]:
        orig_h, orig_w = rgb.shape[:2]

        letterbox = LetterBox(new_shape=(640, 640))
        img = letterbox(image=rgb)  # (640, 640, 3)

        lb_h, lb_w = img.shape[:2]  

        scale = min(lb_w / orig_w, lb_h / orig_h)
        new_w = round(orig_w * scale)
        new_h = round(orig_h * scale)

        # 실제 패딩값 역산
        pad_x = (lb_w - new_w) // 2
        pad_y = (lb_h - new_h) // 2

        img_f = img.astype(np.float32) / 255.0
        tensor = torch.from_numpy(img_f).permute(2, 0, 1).unsqueeze(0)

        lb_info = {
            "scale": scale,
            "pad_x": pad_x, "pad_y": pad_y,
            "new_w": new_w, "new_h": new_h,
        }
        return tensor, lb_info

    def _remove_letterbox_padding(
        self,
        cam_640: np.ndarray,
        lb_info: dict,
        orig_w: int,
        orig_h: int,
    ) -> np.ndarray:
        px, py = lb_info["pad_x"], lb_info["pad_y"]
        nw, nh = lb_info["new_w"], lb_info["new_h"]
        cam_cropped = cam_640[py: py + nh, px: px + nw]
        return cv2.resize(cam_cropped, (orig_w, orig_h))

    def _validate_cam_bbox_alignment(
        self, cam_full: np.ndarray, bbox: dict
    ) -> dict:
        b = bbox
        bbox_region = cam_full[b["y1"]: b["y2"], b["x1"]: b["x2"]]

        bbox_max  = float(bbox_region.max())  if bbox_region.size > 0 else 0.0
        bbox_mean = float(bbox_region.mean()) if bbox_region.size > 0 else 0.0
        global_max  = float(cam_full.max())
        global_mean = float(cam_full.mean())

        peak_y, peak_x = np.unravel_index(cam_full.argmax(), cam_full.shape)
        peak_in_bbox_strict = (
            (b["x1"] <= peak_x <= b["x2"]) and (b["y1"] <= peak_y <= b["y2"])
        )

        mean_ratio  = bbox_mean / global_mean if global_mean > 1e-6 else 0.0
        max_ratio   = bbox_max  / global_max  if global_max  > 1e-6 else 0.0
        aligned = (mean_ratio >= 1.5) or (max_ratio >= 0.5)

        high_attention_ratio = float((bbox_region > 0.5).sum() / bbox_region.size) \
            if bbox_region.size > 0 else 0.0

        return {
            "peak_in_bbox": aligned,                          
            "peak_in_bbox_strict": bool(peak_in_bbox_strict), 
            "peak_xy": (int(peak_x), int(peak_y)),
            "bbox_max": round(bbox_max, 4),
            "bbox_mean": round(bbox_mean, 4),
            "global_max": round(global_max, 4),
            "global_mean": round(global_mean, 4),
            "mean_ratio": round(mean_ratio, 4),              
            "bbox_attention_ratio": round(max_ratio, 4),      
            "bbox_high_attention_ratio": round(high_attention_ratio, 4),
        }

    def _normalize_cam_in_bbox(
        self, cam: np.ndarray, bbox: dict
    ) -> np.ndarray:
        cam_out = cam.copy()
        b = bbox
        region = cam_out[b["y1"]: b["y2"], b["x1"]: b["x2"]]
        if region.size == 0:
            return cam_out
        r_min, r_max = region.min(), region.max()
        if r_max - r_min > 1e-6:
            cam_out[b["y1"]: b["y2"], b["x1"]: b["x2"]] = (
                (region - r_min) / (r_max - r_min)
            )
        return cam_out

    def _parse_detections(self, results, img_w: int, img_h: int) -> list:
        detections = []
        for i, box in enumerate(results.boxes):
            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
            conf = float(box.conf[0])
            cls_id = int(box.cls[0])
            detections.append({
                "detection_id": f"det_{i:03d}",
                "class_id": cls_id,
                "class_name": self.CLASS_NAMES[cls_id],
                "confidence": round(conf, 4),
                "bbox": {
                    "x1": x1, "y1": y1,
                    "x2": x2, "y2": y2,
                    "width": x2 - x1,
                    "height": y2 - y1,
                },
            })
        return detections

    def _filter_top1_per_class(self, detections: list) -> list:
        seen_classes = {}
        filtered = []
        for det in sorted(detections, key=lambda x: x["confidence"], reverse=True):
            cls = det["class_name"]
            if cls == "normal":
                filtered.append(det)
            elif cls not in seen_classes:
                seen_classes[cls] = True
                filtered.append(det)
        filtered.sort(key=lambda x: (x["bbox"]["y1"], x["bbox"]["x1"]))
        for idx, det in enumerate(filtered):
            det["detection_id"] = f"det_{idx:03d}"
        return filtered

    def _extract_bbox_region(self, cam: np.ndarray, bbox: dict) -> np.ndarray:
        return cam[bbox["y1"]: bbox["y2"], bbox["x1"]: bbox["x2"]]

    def _cam_to_grid(self, cam_region: np.ndarray, grid_size: int) -> dict:
        if cam_region.size == 0:
            return {"grid_size": grid_size, "values": [], "stats": {}}
        grid = cv2.resize(cam_region, (grid_size, grid_size))
        grid = np.clip(grid, 0, 1)
        return {
            "grid_size": grid_size,
            "values": [[round(float(v), 4) for v in row] for row in grid],
            "stats": {
                "max": round(float(grid.max()), 4),
                "mean": round(float(grid.mean()), 4),
                "high_attention_ratio": round(
                    float((grid > 0.5).sum() / grid.size), 4
                ),
            },
        }

    def _draw_korean_label(
        self,
        img_rgb: np.ndarray,
        text: str,
        x: int,
        y: int,
        font: ImageFont.FreeTypeFont,
        text_color: tuple = (255, 0, 0),
        bg_color: tuple = (0, 0, 0),
    ) -> np.ndarray:
        pil_img = Image.fromarray(img_rgb)
        draw = ImageDraw.Draw(pil_img)
        bbox = draw.textbbox((x, y), text, font=font)
        draw.rectangle(
            [bbox[0] - 2, bbox[1] - 2, bbox[2] + 2, bbox[3] + 2],
            fill=bg_color,
        )
        draw.text((x, y), text, font=font, fill=text_color)
        return np.array(pil_img)

    # 메인 계산
    def compute(self, image_path: str) -> dict:
        bgr = cv2.imread(image_path)
        if bgr is None:
            raise FileNotFoundError(f"이미지를 불러올 수 없습니다: {image_path}")
        rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
        h, w = rgb.shape[:2]

        # YOLO 탐지
        results = self.model(image_path, verbose=False)[0]
        detections = self._parse_detections(results, w, h)
        detections = self._filter_top1_per_class(detections)

        if not detections:
            return {
                "image_path": image_path,
                "image_size": {"width": w, "height": h},
                "detections": [],
                "xai_maps": {},
                "alignment_reports": {},
                "_cam_full": None,
                "_cam_normalized": {},
                "_rgb": rgb,
            }
        
        input_tensor, lb_info = self._preprocess(rgb)
        grayscale_cam = self.cam(input_tensor=input_tensor)[0]
        cam_resized = self._remove_letterbox_padding(grayscale_cam, lb_info, w, h)

        # bbox별 attribution 추출
        xai_maps = {}
        alignment_reports = {}
        cam_normalized_store = {}

        for det in detections:
            if det["class_name"] == "normal":
                continue
            det_id = det["detection_id"]

            # CAM-bbox 정렬 검증
            alignment_reports[det_id] = self._validate_cam_bbox_alignment(
                cam_resized, det["bbox"]
            )

            # bbox 내부 독립 정규화
            cam_norm = self._normalize_cam_in_bbox(cam_resized, det["bbox"])
            cam_normalized_store[det_id] = cam_norm
            xai_maps[det_id] = self._extract_bbox_region(cam_norm, det["bbox"])

        return {
            "image_path": image_path,
            "image_size": {"width": w, "height": h},
            "detections": detections,
            "xai_maps": xai_maps,
            "alignment_reports": alignment_reports,
            "_cam_full": cam_resized,
            "_cam_normalized": cam_normalized_store,
            "_rgb": rgb,
        }
    
    #JSON 출력
    def to_json(self, result: dict, grid_size: int = 8) -> str:
        output = {
            "image_path": result["image_path"],
            "image_size": result["image_size"],
            "detections": [],
        }
        for det in result["detections"]:
            det_id = det["detection_id"]
            xai_entry = {
                **{k: v for k, v in det.items() if k != "detection_id"},
                "xai": None,
                "alignment": result.get("alignment_reports", {}).get(det_id),
            }
            if det_id in result["xai_maps"]:
                xai_entry["xai"] = self._cam_to_grid(result["xai_maps"][det_id], grid_size)
            output["detections"].append({det_id: xai_entry})
        return json.dumps(output, ensure_ascii=False, indent=2)

    #히트맵 출력

    def to_heatmap(self, result: dict, output_path: str) -> dict:
        rgb = result["_rgb"]
        cam_full = result["_cam_full"]

        if cam_full is None:
            raise ValueError("감지된 객체가 없어 히트맵을 생성할 수 없습니다.")

        rgb_norm = rgb.astype(np.float32) / 255.0

        cam_display = np.zeros_like(cam_full)
        for det in result["detections"]:
            if det["class_name"] == "normal":
                continue
            det_id = det["detection_id"]
            cam_norm = result.get("_cam_normalized", {}).get(det_id)
            if cam_norm is not None:
                b = det["bbox"]
                cam_display[b["y1"]: b["y2"], b["x1"]: b["x2"]] = \
                    cam_norm[b["y1"]: b["y2"], b["x1"]: b["x2"]]

        overlay = show_cam_on_image(rgb_norm, cam_display, use_rgb=True)

        for det in result["detections"]:
            if det["class_name"] == "normal":
                continue
            det_id = det["detection_id"]
            class_ko = self.CLASS_KO.get(det["class_name"], det["class_name"])
            alignment = result.get("alignment_reports", {}).get(det_id, {})

            aligned = alignment.get("peak_in_bbox", True)
            box_color = (255, 0, 0) if aligned else (255, 140, 0)

            label = f"{class_ko} {det['confidence']:.2f}"
            cv2.rectangle(overlay, (b["x1"], b["y1"]), (b["x2"], b["y2"]), box_color, 2)

            label_y = max(b["y1"] - 22, 0)
            overlay = self._draw_korean_label(
                overlay, label,
                x=b["x1"], y=label_y,
                font=self.font,
                text_color=(255, 255, 255),
                bg_color=(200, 0, 0) if aligned else (180, 100, 0),
            )

            if not aligned:
                ratio = alignment.get("bbox_attention_ratio", 0)
                warn = f"! CAM 미정렬 (집중비={ratio:.2f})"
                overlay = self._draw_korean_label(
                    overlay, warn,
                    x=b["x1"], y=min(b["y2"] + 4, rgb.shape[0] - 20),
                    font=self.font,
                    text_color=(255, 200, 0),
                    bg_color=(80, 40, 0),
                )

        bgr_out = cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR)
        cv2.imwrite(output_path, bgr_out)

        return {
            "image": bgr_out,
            "saved_path": output_path,
        }

    # XAI 판단 근거 바 

    def to_xai_bars(self, result: dict) -> list:
        abnormal = [d for d in result["detections"] if d["class_name"] != "normal"]
        if not abnormal:
            return []

        top = sorted(abnormal, key=lambda x: x["confidence"], reverse=True)[0]
        det_id = top["detection_id"]
        alignment = result.get("alignment_reports", {}).get(det_id, {})

        conf = top["confidence"]                                          
        area_ratio = alignment.get("bbox_high_attention_ratio", 0.3)     
        severity = min(1.0, conf * 0.6 + area_ratio * 0.4)              

        BAR_TEMPLATES = {
            "dust": [
                ("표면 오염도",  area_ratio),           # 오염이 얼마나 넓게 퍼졌는지
                ("발전 저하율",  severity),             
            ],
            "snow": [
                ("적설 면적",    area_ratio),           # 눈이 덮인 비율
                ("발전 차단율",  severity),             
            ],
            "bird_dropping": [
                ("오염 집중도",  area_ratio),           # 배설물 점유 면적
                ("셀 손상 위험", min(1.0, conf * 0.9)), 
            ],
            "physical_damage": [
                ("출력 저하율",    conf),               # 모델이 물리 손상으로 판단한 확신도
                ("손상 면적 비율", area_ratio),         
                ("종합 심각도",    severity),            
            ],
        }

        templates = BAR_TEMPLATES.get(
            top["class_name"],
            [("출력 저하율", conf), ("손상 면적 비율", area_ratio)],
        )

        bars = []
        for label, raw_value in templates:
            value = min(100, max(0, round(raw_value * 100)))
            bars.append({
                "label": label,
                "value": value,
                "color": "red" if value >= 70 else ("orange" if value >= 40 else "blue"),
            })
        return bars


# 실행 예시
if __name__ == "__main__":
    engine = YOLOXAIEngine(
        model_path="best.pt",
        target_layer_index=15, 
    )

    result = engine.compute("panel_image.jpg")

    # CAM 정렬 상태 확인
    print("=== CAM 정렬 리포트 ===")
    for det_id, report in result.get("alignment_reports", {}).items():
        status  = "정렬됨" if report["peak_in_bbox"] else "미정렬"
        strict  = "O" if report["peak_in_bbox_strict"] else "X"
        print(
            f"[{det_id}] {status} (strict peak={strict}) | "
            f"평균비율: {report['mean_ratio']:.2f} | "
            f"최고비율: {report['bbox_attention_ratio']:.2f} | "
            f"고주의 면적: {report['bbox_high_attention_ratio']:.4f}"
        )

    # JSON 출력
    print("\n=== JSON 출력 ===")
    print(engine.to_json(result, grid_size=8))

    # 히트맵 저장
    heatmap = engine.to_heatmap(result, "output_heatmap.jpg")
    print(f"\n히트맵 저장 완료: {heatmap['saved_path']}")

    # XAI 판단 근거 바
    print("\n=== XAI 판단 근거 바 ===")
    bars = engine.to_xai_bars(result)
    for bar in bars:
        filled = "█" * (bar["value"] // 5)
        print(f"  {bar['label']:<14} {filled:<20} {bar['value']}%  [{bar['color']}]")
