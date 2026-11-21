#!/usr/bin/env bash
# Clones the repository, puts `nldd` of the version it goes to on the PATH, and runs the upgrade.
# In: REPOSITORY, BASE, WANTED, FROM_SOURCE, GH_TOKEN, TOOLS, PROJECT, ACTION.
# Out: version, changed.
set -euo pipefail

BASE="${BASE:-$(gh api "repos/$REPOSITORY" --jq .default_branch)}"
echo "BASE=$BASE" >> "$GITHUB_ENV"

# A plain clone, and not the checkout action. The token is asked for when git needs it and is
# never written to disk, so a later step without it cannot push. And the action stops on a
# repository whose tree holds a submodule without an address, which a real app turned out to have.
gh auth setup-git
mkdir -p "$TOOLS/bin"
git clone --quiet --depth 1 --branch "$BASE" "https://github.com/$REPOSITORY" "$PROJECT"

# `nldd` is the command of the version the project goes to, in every step from here.
if [ "$FROM_SOURCE" = true ]; then
	source="$(cd "$ACTION/.." && pwd)"
	npm ci --prefix "$source" --omit=dev --ignore-scripts --no-audit --no-fund
	version="$(node --print "require('$source/package.json').version")"
	printf '#!/bin/sh\nexec node "%s" "$@"\n' "$source/lint/cli.js" > "$TOOLS/bin/nldd"
	echo "SKILLS=$source/skills" >> "$GITHUB_ENV"
else
	version="$(npm view "@nldd/design-system@$WANTED" version)"
	printf '#!/bin/sh\nexec npx --yes "@nldd/design-system@%s" "$@"\n' "$version" > "$TOOLS/bin/nldd"
fi
chmod +x "$TOOLS/bin/nldd"
echo "$TOOLS/bin" >> "$GITHUB_PATH"
echo "version=$version" >> "$GITHUB_OUTPUT"

cd "$PROJECT"
"$TOOLS/bin/nldd" upgrade --install --report "$TOOLS/upgrade.md" --format json > "$TOOLS/upgrade.json"
if git diff --quiet; then
	echo "Nothing to upgrade."
	echo "changed=false" >> "$GITHUB_OUTPUT"
else
	echo "changed=true" >> "$GITHUB_OUTPUT"
fi
# What the install left behind, so that only a file made after this is taken for work.
git ls-files --others --exclude-standard | sort > "$TOOLS/untracked"
