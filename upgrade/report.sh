#!/usr/bin/env bash
# Reads the project again and writes the report as it stands now, with the choices under it: those
# of an agent in this run, and those an earlier run of a continued pull request wrote down.
# In: TOOLS, WORK, PROJECT, ACTION.
set -euo pipefail
source "$ACTION/confine.sh"

[ -f "$WORK/keuzes.md" ] || exit 0

# The linter loads the TypeScript of the project, which the agent could have changed, so it runs
# confined; the report goes to a directory of its own and is taken from there.
cd "$PROJECT"
mkdir -p "$TOOLS/since"
cp "$WORK/keuzes.md" "$TOOLS/since/keuzes.md"
CONFINE_RW=("$TOOLS/since")
confine "$TOOLS/bin/nldd" upgrade --since "$TOOLS/upgrade.json" --notes "$TOOLS/since/keuzes.md" --report "$TOOLS/since/upgrade.md"
rm -f "$WORK"/upgrade*.md
cp "$TOOLS"/since/upgrade*.md "$WORK/"
