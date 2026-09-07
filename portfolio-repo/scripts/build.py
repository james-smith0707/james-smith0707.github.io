#!/usr/bin/env python3
"""
build.py — the one script you run after editing anything in /data.

What it does:
  1. Reads data/theme.yaml       -> writes site/css/theme-vars.css
                                  -> writes latex/shared/theme.sty
  2. Reads data/projects/*.yaml  -> writes site/data/projects.json
                                  -> writes latex/portfolio/sections/projects.tex
  3. Reads data/design-team.yaml and data/internships.yaml (if present)
                                  -> writes site/data/design-team.json, internships.json
                                  -> writes latex/portfolio/sections/{design-team,internships}.tex

Usage:
    python scripts/build.py

Nothing in site/data/*.json or latex/portfolio/sections/*.tex should be
hand-edited — they're regenerated every run and your edits will be lost.
"""

import json
import shutil
import sys
from pathlib import Path

import yaml
from jinja2 import Environment, FileSystemLoader

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
SITE = ROOT / "site"
LATEX = ROOT / "latex"
TEMPLATES = LATEX / "portfolio" / "templates"

VALID_BLOCK_TYPES = {"text", "photo", "gallery", "carousel", "video", "stl"}
VALID_VIDEO_PLAY_TYPES = {"automatic", "boomerang", "button", "once"}


def make_tex_env(template_dir: Path) -> Environment:
    """
    Jinja2 env with delimiters that don't collide with LaTeX's { } syntax.
    In .tex.j2 templates use:  (((variable)))   ((* for/if *))   ((= comment =))
    """
    env = Environment(
        loader=FileSystemLoader(str(template_dir)),
        block_start_string="((*",
        block_end_string="*))",
        variable_start_string="(((",
        variable_end_string=")))",
        comment_start_string="((=",
        comment_end_string="=))",
        trim_blocks=True,
        lstrip_blocks=True,
    )
    env.filters["tex"] = escape_tex
    return env


def load_yaml(path: Path) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def escape_tex(s: str) -> str:
    """Minimal LaTeX special-character escaping for plain text fields."""
    if s is None:
        return ""
    replacements = {
        "\\": r"\textbackslash{}",
        "&": r"\&",
        "%": r"\%",
        "$": r"\$",
        "#": r"\#",
        "_": r"\_",
        "{": r"\{",
        "}": r"\}",
        "~": r"\textasciitilde{}",
        "^": r"\textasciicircum{}",
    }
    out = []
    for ch in s:
        out.append(replacements.get(ch, ch))
    return "".join(out)


# ------------------------------------------------------------
# 1. THEME
# ------------------------------------------------------------

def build_theme():
    theme = load_yaml(DATA / "theme.yaml")
    colors = theme["colors"]
    fonts = theme["fonts"]
    layout = theme["layout"]
    radius = theme["radius"]
    type_scale = theme.get("type_scale", {})
    line_height = theme.get("line_height", {})
    media = theme.get("media", {})
    interaction = theme.get("interaction", {})

    def color_ref(name: str) -> str:
        """Resolve a color name from theme.yaml's colors: block to its hex value."""
        return colors.get(name, name)

    # --- CSS custom properties ---
    css_lines = [":root {"]
    for name, hexval in colors.items():
        css_lines.append(f"  --color-{name}: {hexval};")
    css_lines.append(f"  --font-display: '{fonts['display']['family']}', sans-serif;")
    css_lines.append(f"  --font-body: '{fonts['body']['family']}', sans-serif;")
    css_lines.append(f"  --font-mono: '{fonts['mono']['family']}', monospace;")
    css_lines.append(f"  --content-max-width: {layout['content_max_width']};")
    css_lines.append(f"  --grid-unit: {layout['grid_unit']};")
    css_lines.append(f"  --radius-base: {radius['base']};")
    # type scale
    for key, sizes in type_scale.items():
        css_lines.append(f"  --text-{key.replace('_', '-')}: {sizes['site']};")
    css_lines.append(f"  --line-height-heading: {line_height.get('heading', 1.15)};")
    css_lines.append(f"  --line-height-body: {line_height.get('body', 1.6)};")
    # media framing
    css_lines.append(f"  --media-border-color: {color_ref(media.get('border_color', 'steel-700'))};")
    css_lines.append(f"  --media-border-width: {media.get('border_width', '1px')};")
    css_lines.append(f"  --media-frame-bg: {color_ref(media.get('frame_bg', 'graphite-900'))};")
    css_lines.append(f"  --media-max-height: {media.get('max_height', '70vh')};")
    # interaction
    css_lines.append(f"  --glow-color: {color_ref(interaction.get('glow_color', 'blueprint-500'))};")
    css_lines.append(f"  --glow-strength: {interaction.get('glow_strength', '0 0 0 3px')};")
    css_lines.append(f"  --hover-lift: {interaction.get('lift', '-3px')};")
    css_lines.append(f"  --hover-transition: {interaction.get('transition', '160ms ease')};")
    css_lines.append("}")
    css_out = SITE / "css" / "theme-vars.css"
    css_out.parent.mkdir(parents=True, exist_ok=True)
    css_out.write_text("\n".join(css_lines) + "\n", encoding="utf-8")
    print(f"  wrote {css_out.relative_to(ROOT)}")

    # --- LaTeX theme.sty ---
    def hex_to_rgb(hexval: str):
        h = hexval.lstrip("#")
        return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))

    tex_lines = [
        "% AUTO-GENERATED by scripts/build.py from data/theme.yaml — do not hand-edit.",
        r"\NeedsTeXFormat{LaTeX2e}",
        r"\ProvidesPackage{theme}",
        r"\RequirePackage{xcolor}",
        r"\RequirePackage{fontspec}",
        "",
    ]
    for name, hexval in colors.items():
        r, g, b = hex_to_rgb(hexval)
        texname = name.replace("-", "")
        tex_lines.append(f"\\definecolor{{{texname}}}{{RGB}}{{{r},{g},{b}}}")
    tex_lines += [
        "",
        "% --- fonts: fall back to a widely-installed substitute if the",
        "% theme font isn't installed on this machine, so text is never",
        "% silently rendered invisible (fontspec's default failure mode).",
        "% Install the real fonts for the intended look — see README.md.",
        f"\\IfFontExistsTF{{{fonts['display']['family']}}}"
        f"{{\\newfontfamily\\displayfont{{{fonts['display']['family']}}}}}"
        f"{{\\newfontfamily\\displayfont{{DejaVu Sans}}\\ClassWarning{{theme}}"
        f"{{'{fonts['display']['family']}' not found, falling back to DejaVu Sans}}}}",
        f"\\IfFontExistsTF{{{fonts['mono']['family']}}}"
        f"{{\\newfontfamily\\monofont{{{fonts['mono']['family']}}}}}"
        f"{{\\newfontfamily\\monofont{{DejaVu Sans Mono}}\\ClassWarning{{theme}}"
        f"{{'{fonts['mono']['family']}' not found, falling back to DejaVu Sans Mono}}}}",
        f"\\IfFontExistsTF{{{fonts['body']['family']}}}"
        f"{{\\setmainfont{{{fonts['body']['family']}}}}}"
        f"{{\\setmainfont{{DejaVu Sans}}\\ClassWarning{{theme}}"
        f"{{'{fonts['body']['family']}' not found, falling back to DejaVu Sans}}}}",
        "",
        "% --- type scale (from data/theme.yaml type_scale:) — LaTeX size commands ---",
    ]
    for key, sizes in type_scale.items():
        camel = "".join(w.capitalize() for w in key.split("_"))
        tex_lines.append(f"\\newcommand{{\\text{camel}}}{{{sizes['pdf']}}}")
    sty_out = LATEX / "shared" / "theme.sty"
    sty_out.parent.mkdir(parents=True, exist_ok=True)
    sty_out.write_text("\n".join(tex_lines) + "\n", encoding="utf-8")
    print(f"  wrote {sty_out.relative_to(ROOT)}")


# ------------------------------------------------------------
# 2. PROJECTS
# ------------------------------------------------------------

def validate_project(proj: dict, path: Path):
    required = ["slug", "title", "short_description"]
    for key in required:
        if key not in proj:
            sys.exit(f"ERROR: {path.name} is missing required field '{key}'")
    for block in proj.get("blocks", []):
        if block.get("type") not in VALID_BLOCK_TYPES:
            sys.exit(
                f"ERROR: {path.name} has block type '{block.get('type')}' — "
                f"must be one of {sorted(VALID_BLOCK_TYPES)}"
            )
        if block["type"] in ("gallery", "carousel") and "items" not in block:
            sys.exit(f"ERROR: {path.name} {block['type']} block is missing 'items'")
        if block["type"] == "video" and "play_type" in block:
            if block["play_type"] not in VALID_VIDEO_PLAY_TYPES:
                sys.exit(
                    f"ERROR: {path.name} video block has play_type '{block['play_type']}' — "
                    f"must be one of {sorted(VALID_VIDEO_PLAY_TYPES)}"
                )
    mm = proj.get("main_media")
    if mm and mm.get("type") == "video" and "play_type" in mm:
        if mm["play_type"] not in VALID_VIDEO_PLAY_TYPES:
            sys.exit(
                f"ERROR: {path.name} main_media video has play_type '{mm['play_type']}' — "
                f"must be one of {sorted(VALID_VIDEO_PLAY_TYPES)}"
            )


def build_projects():
    proj_dir = DATA / "projects"
    projects = []
    for yml_path in sorted(proj_dir.glob("*.yaml")):
        proj = load_yaml(yml_path)
        validate_project(proj, yml_path)
        projects.append(proj)

    # --- site JSON (consumed by site/js/load-projects.js) ---
    json_out = SITE / "data" / "projects.json"
    json_out.parent.mkdir(parents=True, exist_ok=True)
    json_out.write_text(json.dumps(projects, indent=2), encoding="utf-8")
    print(f"  wrote {json_out.relative_to(ROOT)} ({len(projects)} project(s))")

    # --- LaTeX projects.tex via Jinja2 template ---
    env = make_tex_env(TEMPLATES)
    template = env.get_template("project_block.tex.j2")

    rendered = "\n".join(template.render(p=p) for p in projects)
    tex_out = LATEX / "portfolio" / "sections" / "projects.tex"
    tex_out.parent.mkdir(parents=True, exist_ok=True)
    header = (
        "% AUTO-GENERATED by scripts/build.py from data/projects/*.yaml\n"
        "% Do not hand-edit — edit the YAML files instead and re-run the build.\n\n"
    )
    tex_out.write_text(header + rendered + "\n", encoding="utf-8")
    print(f"  wrote {tex_out.relative_to(ROOT)}")


# ------------------------------------------------------------
# 3. OPTIONAL SECTIONS (design team / internships) — same pattern
# ------------------------------------------------------------

def build_simple_section(data_file: str, template_name: str, tex_out_name: str, json_out_name: str):
    path = DATA / data_file
    if not path.exists():
        return
    entries = load_yaml(path)

    json_out = SITE / "data" / json_out_name
    json_out.write_text(json.dumps(entries, indent=2), encoding="utf-8")
    print(f"  wrote {json_out.relative_to(ROOT)}")

    env = make_tex_env(TEMPLATES)
    template = env.get_template(template_name)
    rendered = template.render(entries=entries)
    tex_out = LATEX / "portfolio" / "sections" / tex_out_name
    header = f"% AUTO-GENERATED by scripts/build.py from data/{data_file} — do not hand-edit.\n\n"
    tex_out.write_text(header + rendered + "\n", encoding="utf-8")
    print(f"  wrote {tex_out.relative_to(ROOT)}")


def build_title():
    path = DATA / "title.yaml"
    if not path.exists():
        return
    title = load_yaml(path)

    # --- site JSON ---
    json_out = SITE / "data" / "title.json"
    json_out.parent.mkdir(parents=True, exist_ok=True)
    json_out.write_text(json.dumps(title, indent=2), encoding="utf-8")
    print(f"  wrote {json_out.relative_to(ROOT)}")

    # --- LaTeX header partial, \input by both resume.tex and portfolio.tex ---
    links = title.get("links", {})
    tex_lines = [
        "% AUTO-GENERATED by scripts/build.py from data/title.yaml — do not hand-edit.",
        r"\newcommand{\myName}{" + escape_tex(title.get("name", "")) + "}",
        r"\newcommand{\myTagline}{" + escape_tex(title.get("tagline", "")) + "}",
        r"\newcommand{\myLocation}{" + escape_tex(title.get("location", "")) + "}",
        r"\newcommand{\myEmail}{" + escape_tex(title.get("email", "")) + "}",
        r"\newcommand{\myPhone}{" + escape_tex(title.get("phone", "")) + "}",
        r"\newcommand{\myGithub}{" + escape_tex(links.get("github", "")) + "}",
        r"\newcommand{\myLinkedin}{" + escape_tex(links.get("linkedin", "")) + "}",
        r"\newcommand{\myWebsite}{" + escape_tex(links.get("website", "")) + "}",
    ]
    tex_out = LATEX / "shared" / "title.tex"
    tex_out.write_text("\n".join(tex_lines) + "\n", encoding="utf-8")
    print(f"  wrote {tex_out.relative_to(ROOT)}")


def build_media():
    """
    Copies media/ -> site/media/ so the site always has a real, working
    copy of your media regardless of how the repo was obtained (a zip
    download's unzip tool often can't recreate a symlink, which used to
    live here and silently broke every image/video on the site).
    """
    src = ROOT / "media"
    dst = SITE / "media"
    if dst.is_symlink() or dst.is_file():
        dst.unlink()
    elif dst.is_dir():
        shutil.rmtree(dst)
    shutil.copytree(src, dst)
    print(f"  copied {src.relative_to(ROOT)} -> {dst.relative_to(ROOT)}")


# ------------------------------------------------------------
# 4. RESUME — block-structured like projects, drives resume.tex
# ------------------------------------------------------------

RESUME_TEMPLATES = LATEX / "resume" / "templates"


def build_resume():
    path = DATA / "resume.yaml"
    if not path.exists():
        return
    resume = load_yaml(path)
    config = resume.get("config", {})
    sections = resume.get("sections", [])

    # --- site JSON (not consumed by the site yet, but kept as the same
    # single source of truth in case you add a resume page to the site) ---
    json_out = SITE / "data" / "resume.json"
    json_out.parent.mkdir(parents=True, exist_ok=True)
    json_out.write_text(json.dumps(resume, indent=2), encoding="utf-8")
    print(f"  wrote {json_out.relative_to(ROOT)}")

    # --- LaTeX resume content via Jinja2 template ---
    env = make_tex_env(RESUME_TEMPLATES)
    template = env.get_template("resume_content.tex.j2")
    rendered = template.render(sections=sections, config=config)
    tex_out = LATEX / "resume" / "sections" / "resume_content.tex"
    tex_out.parent.mkdir(parents=True, exist_ok=True)
    header = (
        "% AUTO-GENERATED by scripts/build.py from data/resume.yaml\n"
        "% Do not hand-edit — edit the YAML instead and re-run the build.\n\n"
    )
    tex_out.write_text(header + rendered + "\n", encoding="utf-8")
    print(f"  wrote {tex_out.relative_to(ROOT)}")


def main():
    print("Building theme...")
    build_theme()
    print("Building title/contact info...")
    build_title()
    print("Building projects...")
    build_projects()
    print("Building resume...")
    build_resume()
    print("Syncing media...")
    build_media()
    print("Building optional sections...")
    build_simple_section("design-team.yaml", "simple_entry_block.tex.j2", "design-team.tex", "design-team.json")
    build_simple_section("internships.yaml", "simple_entry_block.tex.j2", "internships.tex", "internships.json")
    print("Done.")


if __name__ == "__main__":
    main()
