"""Builds the four "كيف تعمل" screenshots from the app's own screen recording.

    py -3.14 tools/make-how-shots.py "<path to Recording 2026-08-23 223049.mp4>"

Needs Pillow, numpy and imageio-ffmpeg (pip install imageio-ffmpeg).

Every frame is cleaned before it can go public:
  * the screen recorder's grey touch dots are patched out with the same
    pixels from a neighbouring frame of the same screen;
  * every personal detail is blurred: people's names, the patient's age,
    gender, blood type and allergies, and order IDs.

The boxes below were measured on the 396x836 recording. If a different
recording is used, re-measure them before publishing anything.
"""

import subprocess
import sys
from pathlib import Path

import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "how"
VIDEO = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(
    r"D:\Applications_Doctorleandek\Recording 2026-08-23 223049.mp4"
)
FF = imageio_ffmpeg.get_ffmpeg_exe()


def frame(t: float) -> Image.Image:
    """One frame at time t, as RGB."""
    png = subprocess.run(
        [FF, "-loglevel", "error", "-ss", str(t), "-i", str(VIDEO),
         "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "-"],
        check=True, capture_output=True,
    ).stdout
    from io import BytesIO
    return Image.open(BytesIO(png)).convert("RGB")


def patch(dst: Image.Image, src: Image.Image, box, shift_y: int = 0) -> None:
    """Copy `box` from src (moved by shift_y rows) onto the same place in dst."""
    x0, y0, x1, y1 = box
    dst.paste(src.crop((x0, y0 + shift_y, x1, y1 + shift_y)), (x0, y0))


def blur(img: Image.Image, box, radius: int = 9) -> None:
    """Heavy blur: text inside must be unreadable, not just soft."""
    region = img.crop(box)
    for _ in range(3):
        region = region.filter(ImageFilter.GaussianBlur(radius))
    img.paste(region, box[:2])


def find_shift(a: Image.Image, b: Image.Image, rows, search=range(-200, 200)) -> int:
    """Vertical offset at which rows `rows` of `a` best match `b` (same screen
    at another scroll position)."""
    A = np.asarray(a.convert("L"), dtype=np.float32)
    B = np.asarray(b.convert("L"), dtype=np.float32)
    r0, r1 = rows
    ref = A[r0:r1, 20:300]
    best, best_s = None, 0
    for s in search:
        if r0 + s < 0 or r1 + s > B.shape[0]:
            continue
        d = np.mean((B[r0 + s:r1 + s, 20:300] - ref) ** 2)
        if best is None or d < best:
            best, best_s = d, s
    return best_s


def save(img: Image.Image, name: str) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    img.save(OUT / name, "WEBP", quality=88, method=6)
    print("wrote", OUT / name, img.size)


# 1. Home screen. u_101 has a dot on the menu icon, 17s has one under the
#    header; the screen is static, so each covers the other's dot.
home = frame(101)
patch(home, frame(17), (330, 0, 396, 60))
save(home, "step-1-home.webp")

# 2. Medical services list. Nothing personal; one dot on a chip, covered
#    from 84s, which shows the same list at the same scroll position.
services = frame(81.5)
patch(services, frame(84), (296, 626, 350, 672))
save(services, "step-2-services.webp")

# 3. Notifications: the whole order journey as the app reports it.
notes = frame(19.6)
# The dot on the first card: same card from an earlier frame, aligned.
other = frame(19)
s = find_shift(notes, other, (60, 115))
patch(notes, other, (120, 112, 190, 160), s)
# Each card's body line names the doctor. Blur the bodies, keep the titles.
for y0, y1 in [(248, 287), (402, 424), (538, 560), (674, 696), (808, 836)]:
    blur(notes, (14, y0, 312, y1))
save(notes, "step-3-notifications.webp")

# 4. The medical record, with the completed visit in its timeline.
record = frame(32)
# Every frame of this screen has a dot by the back button, so it is filled
# from the empty stretch of the same header just beside it.
patch_src = record.crop((286, 0, 322, 36))
record.paste(patch_src, (322, 0))
record.paste(patch_src.crop((0, 0, 20, 36)), (342, 0))
blur(record, (24, 78, 312, 142))                   # name, age, gender, blood type
blur(record, (14, 197, 342, 222))                  # allergies (the label stays)
save(record, "step-4-record.webp")
