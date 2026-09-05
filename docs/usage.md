# Usage guide

How to actually get these rigs into After Effects, and how the different
"template" mechanisms relate.

## Pasting an expression

1. Open the rig's `README.md` and note which property each `.js` file targets.
2. In After Effects, reveal that property (e.g. `E` for expressions/effects, or
   twirl down to `Contents ▸ Rectangle 1 ▸ Rectangle Path 1 ▸ Size`).
3. **Alt-click** (Windows) / **Option-click** (macOS) the property's stopwatch to
   enable an expression.
4. Paste the contents of the `.js` file into the expression field. Comments at
   the top of each file are safe to keep.
5. Add the controls the rig lists (Effects ▸ Expression Controls ▸ Slider Control
   / Layer Control) and wire them as described.

## The layer-reference pattern

Every rig here references other layers through a **Layer Control** effect rather
than a name string:

```js
var s = effect("Layer Control")("Layer");   // hard reference, set once by pickwhip
```

instead of the brittle:

```js
var s = thisComp.layer("Text 1");            // breaks on rename or reuse
```

A Layer Control stores a reference to the layer, not its name, so you pickwhip it
**once** and then rename or restack the target freely. Both of a rig's
expressions read the same control, so there's never a name to edit in two places.
Always guard for the un-picked state:

```js
var s = effect("Layer Control")("Layer");
if (s == null) { value; } else { /* ... use s ... */ }
```

## Template mechanisms, and where these rigs fit

After Effects gives you several ways to reuse a setup. They split into **code
that builds a rig** and **artifacts you drop in**:

| Mechanism | Kind | Good for | Limitation |
|---|---|---|---|
| **`.js` expression** (this repo) | text | The core logic; copy into a property. | You add the controls and wire them yourself. |
| **`.jsx` / ExtendScript** | code (generator) | Building a whole rig procedurally — create layers, rename effects, wire cross-layer references, resolve targets at runtime. Most powerful. | You run it (`File ▸ Scripts ▸ Run Script File…`). |
| **`.ffx` animation preset** | artifact | Saving a per-layer rig (properties + effects + expressions) to re-apply to any layer. The native "expression template". | Applies to an existing selected layer; expression pickwhip targets are saved literally and can break. |
| **`.aep` project** | artifact | The finished rig itself — duplicate or import the comp. | No flexibility; nothing gets re-wired. |
| **`.mogrt` motion graphics template** | artifact | Handing an editor a template with exposed controls (Premiere/AE). | Authored via Essential Graphics; for consumption, not rigging. |

**Mental model:** `.jsx` *generates*; `.ffx` / `.aep` / `.mogrt` *store*. This
repo keeps the **expression text** as the source of truth — the most diffable,
reusable form. Phase 2 will add `.jsx` generators that stamp a full rig
(controls + expressions) onto a layer in one click; `.ffx`/`.aep` are treated as
regenerable outputs, not committed.

## AE version

Rigs assume the **JavaScript expressions engine** (After Effects 16.0 / CC 2019
and later): Project Settings ▸ Expressions ▸ Expressions Engine ▸ *JavaScript*.
The legacy ExtendScript engine may choke on `var`/`let` scoping and modern
syntax.
