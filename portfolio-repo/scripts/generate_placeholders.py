#!/usr/bin/env python3
"""
generate_placeholders.py — creates placeholder JPGs for every media path
referenced in data/projects/*.yaml, plus a demo STL bracket, so the site
and portfolio render correctly before you swap in real photos/models.

This is a ONE-OFF helper for the fake demo data — not part of the normal
build pipeline (build.py doesn't call it). Delete media/ and this script
once you're adding your own media.
"""
import struct
from pathlib import Path

import yaml
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "projects"
MEDIA = ROOT / "media"

BG = (28, 31, 34)        # graphite-900
ACCENT = (35, 87, 137)   # blueprint-500
TEXT = (237, 239, 241)   # fog-100


def make_placeholder(path: Path, label: str, size=(1200, 800)):
    path.parent.mkdir(parents=True, exist_ok=True)
    img = Image.new("RGB", size, BG)
    draw = ImageDraw.Draw(img)
    # simple blueprint-style grid
    step = 40
    for x in range(0, size[0], step):
        draw.line([(x, 0), (x, size[1])], fill=(255, 255, 255, 10), width=1)
    for y in range(0, size[1], step):
        draw.line([(0, y), (size[0], y)], fill=(255, 255, 255, 10), width=1)
    draw.rectangle([0, 0, size[0] - 1, size[1] - 1], outline=ACCENT, width=3)
    try:
        font = ImageFont.load_default(size=28)
    except TypeError:
        font = ImageFont.load_default()
    bbox = draw.textbbox((0, 0), label, font=font)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(((size[0] - w) / 2, (size[1] - h) / 2), label, fill=TEXT, font=font)
    img.save(path, quality=85)


def collect_media_paths():
    paths = []
    for yml in sorted(DATA.glob("*.yaml")):
        proj = yaml.safe_load(yml.read_text())
        mm = proj.get("main_media")
        if mm:
            paths.append((mm["src"], proj["title"] + " — cover"))
        for block in proj.get("blocks", []):
            if block["type"] == "photo":
                paths.append((block["src"], block.get("title", proj["title"])))
            elif block["type"] == "gallery":
                for item in block["items"]:
                    paths.append((item["src"], item.get("title", "")))
            elif block["type"] == "video":
                if "poster" in block:
                    paths.append((block["poster"], "video poster"))
            # skip .stl / .mp4 — handled separately / not placeholder-able as JPG
    return paths


def write_ascii_stl_bracket(path: Path):
    """A simple faceted L-bracket, hand-authored triangles — good enough
    to prove the rotating-model viewer works end to end."""
    path.parent.mkdir(parents=True, exist_ok=True)
    # Vertices of a simple L-shaped extruded bracket
    verts = {
        "A": (0, 0, 0), "B": (40, 0, 0), "C": (40, 10, 0), "D": (10, 10, 0),
        "E": (10, 40, 0), "F": (0, 40, 0),
        "A2": (0, 0, 10), "B2": (40, 0, 10), "C2": (40, 10, 10), "D2": (10, 10, 10),
        "E2": (10, 40, 10), "F2": (0, 40, 10),
    }
    top = ["A", "B", "C", "D", "E", "F"]
    bot = [v + "2" for v in top]

    def tri_fan(loop, reverse=False):
        tris = []
        for i in range(1, len(loop) - 1):
            tri = (loop[0], loop[i], loop[i + 1])
            if reverse:
                tri = tri[::-1]
            tris.append(tri)
        return tris

    facets = []
    facets += tri_fan(top)                 # bottom face (z=0)
    facets += tri_fan(bot, reverse=True)    # top face (z=10)
    n = len(top)
    for i in range(n):
        a, b = top[i], top[(i + 1) % n]
        a2, b2 = bot[i], bot[(i + 1) % n]
        facets.append((a, b, b2))
        facets.append((a, b2, a2))

    def normal(p1, p2, p3):
        ux, uy, uz = (p2[j] - p1[j] for j in range(3))
        vx, vy, vz = (p3[j] - p1[j] for j in range(3))
        nx, ny, nz = uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx
        length = (nx**2 + ny**2 + nz**2) ** 0.5 or 1
        return nx / length, ny / length, nz / length

    lines = ["solid bracket"]
    for f in facets:
        p1, p2, p3 = (verts[v] for v in f)
        nx, ny, nz = normal(p1, p2, p3)
        lines.append(f"  facet normal {nx:.4f} {ny:.4f} {nz:.4f}")
        lines.append("    outer loop")
        for p in (p1, p2, p3):
            lines.append(f"      vertex {p[0]:.4f} {p[1]:.4f} {p[2]:.4f}")
        lines.append("    endloop")
        lines.append("  endfacet")
    lines.append("endsolid bracket")
    path.write_text("\n".join(lines) + "\n")


def main():
    for rel, label in collect_media_paths():
        make_placeholder(MEDIA.parent / rel, label[:40])
    write_ascii_stl_bracket(MEDIA / "projects" / "robotic-arm" / "gripper-jaw.stl")
    make_placeholder(MEDIA / "projects" / "robotic-arm" / "gripper-jaw-render.png", "Gripper jaw — render")
    make_placeholder(MEDIA / "projects" / "robotic-arm" / "pick-and-place-poster.jpg", "Pick-and-place demo")
    make_placeholder(MEDIA / "hero.jpg", "Hero cover")
    write_ascii_stl_bracket(MEDIA / "hero.stl")
    print("Placeholder media generated.")


if __name__ == "__main__":
    main()
