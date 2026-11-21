#!/usr/bin/env bash
# Builds the site before and after the upgrade, each from a clean checkout of its commit so
# neither build leaves anything in the other, and photographs both. The builds and the browser
# run code of the project, or code the agent could have changed, so they run confined: they write
# only in their own checkout, the caches and the directory of the pictures.
# In: BUILD, SITE (or what the agent wrote in site.json), TOOLS, WORK, PROJECT. Out: made.
set -euo pipefail
source "$ACTION/confine.sh"

if [ -z "$BUILD" ] && [ -f "$WORK/site.json" ]; then
	BUILD="$(jq --raw-output '.build // empty' "$WORK/site.json")"
	SITE="$(jq --raw-output '.site // empty' "$WORK/site.json")"
fi
if [ -z "$BUILD" ] || [ -z "$SITE" ]; then
	echo "No pictures: nothing says how this project builds a site."
	exit 0
fi

# Playwright and its browser come from npm, checked against their hashes, and need sudo for
# what the browser needs from the system: that is not code of the project.
cd "$TOOLS"
npm install --prefix "$TOOLS/browser" --no-audit --no-fund playwright
"$TOOLS/browser/node_modules/.bin/playwright" install --with-deps chromium

git -C "$PROJECT" worktree add --quiet --detach "$TOOLS/before" HEAD~1
git -C "$PROJECT" worktree add --quiet --detach "$TOOLS/after" HEAD
CONFINE_RW=("$TOOLS/before")
confine sh -c "cd '$TOOLS/before' && $BUILD"
CONFINE_RW=("$TOOLS/after")
confine sh -c "cd '$TOOLS/after' && $BUILD"
CONFINE_RW=("$TOOLS/compare")
confine "$TOOLS/bin/nldd" compare "$TOOLS/before/$SITE" "$TOOLS/after/$SITE" --out "$TOOLS/compare" --report "$TOOLS/compare/compare.md" --playwright "$TOOLS/browser/node_modules/playwright"
echo "made=true" >> "$GITHUB_OUTPUT"
