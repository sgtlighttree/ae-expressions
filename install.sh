#!/usr/bin/env bash
#
# install.sh — copy ae-expressions rig panels into After Effects' ScriptUI
# Panels folder so they show up as dockable panels in the Window menu.
#
# Usage:  ./install.sh          (from the repo root)
#         sudo ./install.sh     (if /Applications needs elevated write access)
#
# macOS/Linux only. Windows users: copy rigs/<rig>/*.jsx by hand into
#   <AE>\Support Files\Scripts\ScriptUI Panels\
#
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
shopt -s nullglob

# Every panel script shipped by a rig.
panels=("$REPO_DIR"/rigs/*/*.jsx)
if [ ${#panels[@]} -eq 0 ]; then
  echo "No panel scripts (rigs/*/*.jsx) found in $REPO_DIR" >&2
  exit 1
fi

# Every After Effects install under /Applications that has a ScriptUI Panels dir.
targets=()
for app in /Applications/Adobe\ After\ Effects\ */; do
  dir="${app}Scripts/ScriptUI Panels"
  [ -d "$dir" ] && targets+=("$dir")
done

if [ ${#targets[@]} -eq 0 ]; then
  cat >&2 <<'EOF'
No After Effects install found under /Applications/Adobe After Effects */.
Copy the panel(s) manually into:
  <AE>/Scripts/ScriptUI Panels/                     (macOS)
  <AE>\Support Files\Scripts\ScriptUI Panels\       (Windows)
EOF
  exit 1
fi

echo "Installing ${#panels[@]} panel(s) into ${#targets[@]} After Effects install(s):"
failed=0
for dir in "${targets[@]}"; do
  for panel in "${panels[@]}"; do
    name="$(basename "$panel")"
    if cp "$panel" "$dir/" 2>/dev/null; then
      echo "  OK   $name -> $dir"
    else
      echo "  FAIL $name -> $dir  (permission denied)" >&2
      failed=1
    fi
  done
done

if [ "$failed" -ne 0 ]; then
  echo "" >&2
  echo "Some copies failed — re-run with: sudo ./install.sh" >&2
  exit 1
fi

echo ""
echo "Done. In After Effects: enable Preferences > Scripting & Expressions >"
echo "'Allow Scripts to Write Files and Access Network', restart AE, then open"
echo "the panels from the Window menu."
