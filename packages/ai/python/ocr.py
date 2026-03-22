"""Text extraction from images using Tesseract or PaddleOCR."""
import sys
import json


def emit_progress(percent, stage):
    """Emit structured progress to stderr for bridge.ts to capture."""
    print(json.dumps({"progress": percent, "stage": stage}), file=sys.stderr, flush=True)


def main():
    input_path = sys.argv[1]
    settings = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}

    engine = settings.get("engine", "tesseract")
    language = settings.get("language", "en")

    try:
        emit_progress(10, "Loading OCR engine")
        if engine == "paddleocr":
            try:
                from paddleocr import PaddleOCR

                ocr = PaddleOCR(use_angle_cls=True, lang=language)
                emit_progress(30, "Analyzing text regions")
                result = ocr.ocr(input_path, cls=True)
                emit_progress(70, "Extracting text")
                text = "\n".join(
                    [
                        line[1][0]
                        for res in result
                        if res
                        for line in res
                        if line and line[1]
                    ]
                )
                emit_progress(95, "Formatting results")
                print(
                    json.dumps({"success": True, "text": text, "engine": "paddleocr"})
                )
            except ImportError:
                print(
                    json.dumps(
                        {
                            "success": False,
                            "error": "PaddleOCR is not installed. Install with: pip install paddleocr paddlepaddle",
                        }
                    )
                )
                sys.exit(1)
        else:
            # Tesseract via subprocess
            import subprocess

            lang_map = {"en": "eng", "de": "deu", "fr": "fra", "es": "spa", "zh": "chi_sim", "ja": "jpn", "ko": "kor"}
            tess_lang = lang_map.get(language, "eng")

            try:
                emit_progress(30, "Running Tesseract")
                result = subprocess.run(
                    ["tesseract", input_path, "stdout", "-l", tess_lang],
                    capture_output=True,
                    text=True,
                    timeout=120,
                )
                emit_progress(70, "Extracting text")
                text = result.stdout.strip()
                if result.returncode != 0 and not text:
                    raise RuntimeError(result.stderr.strip() or "Tesseract failed")
                emit_progress(95, "Formatting results")
                print(
                    json.dumps(
                        {"success": True, "text": text, "engine": "tesseract"}
                    )
                )
            except FileNotFoundError:
                print(
                    json.dumps(
                        {
                            "success": False,
                            "error": "Tesseract is not installed. Install with: apt-get install tesseract-ocr",
                        }
                    )
                )
                sys.exit(1)

    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
