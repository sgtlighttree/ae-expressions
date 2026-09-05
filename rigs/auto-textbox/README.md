# auto-textbox

A shape-layer box that auto-fits a text layer, with adjustable padding. The box
tracks the text's live bounds (`sourceRectAtTime`) so it resizes and re-centers
whenever the text content changes — usable as a background fill or a track matte.

## Purpose

Keep a rectangle sized and centered to a text layer automatically, driven by
two padding sliders, without hardcoding the text layer's name into the
expressions.

## Quick start (generator)

Run [`Auto-Fit TextBox.jsx`](Auto-Fit%20TextBox.jsx) — via **File ▸ Scripts ▸ Run
Script File…**, or [install it as a panel](#install-as-a-panel) — enter your text
and margins, and click **Create auto-textbox**.
It builds the whole rig (point-text layer + solid box below it + Layer Control +
`H_Margin`/`V_Margin` sliders + both expressions) into the active comp in one
undo step. Prefer to wire it by hand? Follow the sections below.

## Controls (add these to the box shape layer)

| Control | Type | Name | Role |
|---|---|---|---|
| Layer reference | Layer Control | *(default name)* | Pickwhip once to the target text layer. Holds a hard reference — survives renames and restacking. |
| Horizontal padding | Slider Control | `H_Margin` | Pixels added to the text width. |
| Vertical padding | Slider Control | `V_Margin` | Pixels added to the text height. |

> An `Animation` slider (0–1) is often paired with this rig for an animated
> reveal, but the two expressions here do not reference it. Add it only when you
> wire up a reveal.

## Where to apply

| File | Property |
|---|---|
| [`size.js`](size.js) | box ▸ Contents ▸ Rectangle 1 ▸ Rectangle Path 1 ▸ **Size** |
| [`position.js`](position.js) | box ▸ Transform ▸ **Position** |

[`Auto-Fit TextBox.jsx`](Auto-Fit%20TextBox.jsx) stamps all of the above
automatically. It is **self-contained** — the expressions are embedded, so you
can drop just that one file into After Effects' `Scripts/ScriptUI Panels/` folder
(see [Install](#install-as-a-panel)) or run it via File ▸ Scripts ▸ Run Script
File…. `size.js` / `position.js` remain the single source of truth; after editing
either, re-embed them with `node tools/bundle-expressions.mjs`.

## Install as a panel

To get a dockable panel instead of a floating window, put the script in After
Effects' ScriptUI Panels folder:

- **macOS:** `/Applications/Adobe After Effects <version>/Scripts/ScriptUI Panels/`
- **Windows:** `C:\Program Files\Adobe\Adobe After Effects <version>\Support Files\Scripts\ScriptUI Panels\`

1. Copy `Auto-Fit TextBox.jsx` into that folder (admin rights may be required).
2. In After Effects: **Preferences ▸ Scripting & Expressions ▸** enable *Allow
   Scripts to Write Files and Access Network*.
3. Restart After Effects.
4. Open it from **Window ▸ Auto-Fit TextBox** and dock it anywhere. Approve the
   trust prompt the first time.

The Window-menu label is the filename, so rename the file if you want a different
menu entry. Running the same file via **File ▸ Scripts ▸ Run Script File…**
instead opens it as a floating window — no install needed.

## Why the Layer Control (not `thisComp.layer("Text 1")`)

Referencing the text by name string means renaming the layer — or reusing the
rig in another comp — forces you to edit the name in every expression. The Layer
Control stores a reference instead of a name, set **once** via a single
pickwhip, and both expressions read it. Rename the text freely; nothing breaks.
Relative-index tricks like `thisComp.layer(index - 1)` were rejected because they
break the moment the box is used as a track matte (which forces stacking order).

## Gotchas

- **Empty Layer Control:** until you pickwhip it, `effect("Layer Control")("Layer")`
  is `null`; both expressions guard for this and hold the current value instead of
  going red.
- **Parenting:** handled — `position.js` uses `toComp()` to resolve the text's
  rect-center into composition space, so the box lands correctly no matter the
  text's position, parent, or stacking order.
- **Shape, not solid:** `size.js` targets a rectangle path's Size. A solid layer
  has no such property — use a shape layer for the box.
- **Text with strokes / animators:** `sourceRectAtTime()` samples at the current
  time and includes drawn extents; motion-blurred or per-frame-animating text may
  make the box jitter. Sample deliberately if needed.

## AE notes

Written for the JavaScript expressions engine (After Effects 16.0 / CC 2019 and
later). `sourceRectAtTime()` and Layer Control are standard, no third-party
plugins required.
