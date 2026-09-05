# ae-expressions

A personal, version-controlled library of reusable Adobe After Effects
expression rigs — each one documented, resilient, and built to be reused across
comps and projects without hand-editing layer names.

## What's here

Each **rig** is a self-contained folder under [`rigs/`](rigs/): the expression
files plus a README that says what it does, which controls it needs, and exactly
which property each expression goes on. The expressions are plain text, so every
change is a clean git diff.

| Rig | What it does |
|---|---|
| [`auto-textbox`](rigs/auto-textbox/) | A shape box that auto-sizes and centers to a text layer, with padding sliders. Works as a background or a track matte. |

## How to use it

1. Open the rig folder and read its `README.md` — it lists the controls to add
   and the property each expression belongs on.
2. Copy the expression from the `.js` file into that property in After Effects
   (Alt/Option-click the stopwatch, paste).
3. Add and wire the listed controls (sliders, Layer Control).

See [`docs/usage.md`](docs/usage.md) for the fuller workflow: how expressions,
`.jsx` scripts, animation presets (`.ffx`), `.aep` projects, and motion graphics
templates (`.mogrt`) differ, and the layer-reference pattern these rigs rely on.

## Conventions (for humans and agents)

- **One rig = one folder** under `rigs/<rig-name>/`.
- Every rig folder has a `README.md` with the same headings: **Purpose**,
  **Controls**, **Where to apply**, **Gotchas**, **AE notes**. This fixed schema
  means the rigs are browsable by a person and parseable by a tool.
- Expressions are `.js` files. One property's expression per file, named for the
  property (`size.js`, `position.js`).
- Expressions reference source layers through a **Layer Control**, never a
  hardcoded `thisComp.layer("name")` — so a rig is drop-in reusable.

## Status

**Phase 1 — archive + documentation.** The repo is a reference you copy from; it
does not touch your After Effects install.

**Phase 2 (in progress) — living toolkit.** Each rig can ship a self-contained
`build.jsx` panel that stamps the whole rig into After Effects in one click —
drop it into AE's `Scripts/ScriptUI Panels/` folder, no siblings required.
`auto-textbox` has one. The expressions stay the text source of truth: the panel
embeds them, regenerated from the `.js` files by
[`tools/bundle-expressions.mjs`](tools/bundle-expressions.mjs). `.ffx`/`.aep`
outputs are regenerated, not committed.

## License

[MIT](LICENSE).
