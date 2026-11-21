#!/usr/bin/env bash
# Builds the site before and after the upgrade, each from a clean checkout of its commit so
# neither build leaves anything in the other, and photographs both. No token is in reach here.
# In: BUILD, SITE (or what the agent wrote in site.json), TOOLS, PROJECT. Out: made.
set -euo pipefail

if [ -z "$BUILD" ] && [ -f "$TOOLS/site.json" ]; then
	BUILD="$(jq --raw-output '.build // empty' "$TOOLS/site.json")"
	SITE="$(jq --raw-output '.site // empty' "$TOOLS/site.json")"
fi
if [ -z "$BUILD" ] || [ -z "$SITE" ]; then
	echo "No pictures: nothing says how this project builds a site."
	exit 0
fi

cd "$PROJECT"
git worktree add --quiet --detach "$TOOLS/before" HEAD~1
git worktree add --quiet --detach "$TOOLS/after" HEAD
(cd "$TOOLS/before" && sh -c "$BUILD")
(cd "$TOOLS/after" && sh -c "$BUILD")
npm install --prefix "$TOOLS/browser" --no-audit --no-fund playwright
"$TOOLS/browser/node_modules/.bin/playwright" install --with-deps chromium
nldd compare "$TOOLS/before/$SITE" "$TOOLS/after/$SITE" --out "$TOOLS/compare" --report "$TOOLS/compare/compare.md" --playwright "$TOOLS/browser/node_modules/playwright"
echo "made=true" >> "$GITHUB_OUTPUT"
