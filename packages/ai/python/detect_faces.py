"""Face detection and blurring using MediaPipe."""
import sys
import json


def emit_progress(percent, stage):
    """Emit structured progress to stderr for bridge.ts to capture."""
    print(json.dumps({"progress": percent, "stage": stage}), file=sys.stderr, flush=True)


def main():
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    settings = json.loads(sys.argv[3]) if len(sys.argv) > 3 else {}

    blur_radius = settings.get("blurRadius", 30)
    sensitivity = settings.get("sensitivity", 0.5)

    try:
        emit_progress(10, "Loading face detection model")
        from PIL import Image, ImageFilter

        img = Image.open(input_path).convert("RGB")

        try:
            import mediapipe as mp
            import numpy as np

            emit_progress(20, "Model ready")

            mp_face = mp.solutions.face_detection

            with mp_face.FaceDetection(
                min_detection_confidence=sensitivity
            ) as detector:
                img_array = np.array(img)
                emit_progress(25, "Scanning for faces")
                results = detector.process(img_array)

                faces = []
                emit_progress(50, f"Found {len(results.detections or [])} faces")
                if results.detections:
                    for i, detection in enumerate(results.detections):
                        bbox = detection.location_data.relative_bounding_box
                        x = int(bbox.xmin * img.width)
                        y = int(bbox.ymin * img.height)
                        w = int(bbox.width * img.width)
                        h = int(bbox.height * img.height)

                        # Add some padding around the face
                        pad = int(max(w, h) * 0.1)
                        x1 = max(0, x - pad)
                        y1 = max(0, y - pad)
                        x2 = min(img.width, x + w + pad)
                        y2 = min(img.height, y + h + pad)

                        face_region = img.crop((x1, y1, x2, y2))
                        blurred = face_region.filter(
                            ImageFilter.GaussianBlur(blur_radius)
                        )
                        img.paste(blurred, (x1, y1))
                        faces.append({"x": x, "y": y, "w": w, "h": h})
                        emit_progress(50 + int((i + 1) / max(len(results.detections), 1) * 40), f"Blurring face {i + 1} of {len(results.detections)}")

                emit_progress(95, "Saving result")
                img.save(output_path)
                print(
                    json.dumps(
                        {
                            "success": True,
                            "facesDetected": len(faces),
                            "faces": faces,
                        }
                    )
                )

        except ImportError:
            # MediaPipe not available — report error clearly
            print(
                json.dumps(
                    {
                        "success": False,
                        "error": "Face detection requires the mediapipe package. Install with: pip install mediapipe",
                    }
                )
            )
            sys.exit(1)

    except ImportError:
        print(
            json.dumps(
                {
                    "success": False,
                    "error": "Pillow is not installed. Install with: pip install Pillow",
                }
            )
        )
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
