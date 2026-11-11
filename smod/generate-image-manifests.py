"""Refresh the static image lists after adding or removing gallery/hero photos."""

import json
from pathlib import Path


IMAGE_EXTENSIONS = {".avif", ".gif", ".jpg", ".jpeg", ".png", ".webp", ".bmp", ".svg"}
SITE_DIRECTORY = Path(__file__).resolve().parent


def main():
    for folder_name in ("pictures", "pictures-hero"):
        directory = SITE_DIRECTORY / folder_name
        image_names = sorted(
            (
                image.name
                for image in directory.iterdir()
                if image.is_file() and image.suffix.lower() in IMAGE_EXTENSIONS
            ),
            key=str.casefold,
        )
        manifest = directory / "images.json"
        manifest.write_text(json.dumps(image_names, indent=2) + "\n", encoding="utf-8")
        print(f"{folder_name}/images.json: {len(image_names)} images")


if __name__ == "__main__":
    main()
