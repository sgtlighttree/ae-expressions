/*
 * bundle-expressions.mjs
 *
 * Embeds the canonical rig expression files (size.js / position.js) into the
 * self-contained "Auto-Fit TextBox.jsx" panel, so it can be dropped into After
 * Effects' ScriptUI Panels folder with no siblings.
 *
 * size.js / position.js stay the single source of truth. After editing either,
 * run:
 *     node tools/bundle-expressions.mjs
 *
 * It rewrites only the block between the BEGIN/END sentinel comments in the
 * panel file; everything else is left untouched.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const rigDir = join(repoRoot, "rigs", "auto-textbox");
const buildPath = join(rigDir, "Auto-Fit TextBox.jsx");

const targets = [
  { file: "size.js", constName: "SIZE_EXPRESSION" },
  { file: "position.js", constName: "POSITION_EXPRESSION" },
];

const BEGIN = "// === BEGIN GENERATED EXPRESSIONS";
const END = "// === END GENERATED EXPRESSIONS ===";

// Turn a multi-line expression file into an ExtendScript array-join literal.
// Per-line JSON.stringify handles all quote/backslash escaping safely.
function toArrayLiteral(constName, text) {
  const lines = text.replace(/\r?\n$/, "").split(/\r?\n/);
  const body = lines.map((l) => "    " + JSON.stringify(l)).join(",\n");
  return `  var ${constName} = [\n${body}\n  ].join("\\n");`;
}

const generated = targets
  .map(({ file, constName }) =>
    toArrayLiteral(constName, readFileSync(join(rigDir, file), "utf8"))
  )
  .join("\n\n");

let src = readFileSync(buildPath, "utf8");
const beginIdx = src.indexOf(BEGIN);
const endIdx = src.indexOf(END);
if (beginIdx === -1 || endIdx === -1) {
  throw new Error("Could not find BEGIN/END sentinel markers in " + buildPath);
}

const before = src.slice(0, beginIdx);
const after = src.slice(endIdx + END.length);
const block =
  `${BEGIN} — regenerate with: node tools/bundle-expressions.mjs ===\n` +
  `${generated}\n` +
  `  ${END}`;

writeFileSync(buildPath, before + block + after);
console.log(
  "Bundled " + targets.map((t) => t.file).join(", ") + " into Auto-Fit TextBox.jsx"
);
