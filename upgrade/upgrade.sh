#!/usr/bin/env bash
# Clones the repository, puts `nldd` of the version it goes to on the PATH, and runs the upgrade.
# In: REPOSITORY, BASE, WANTED, FROM_SOURCE, APP, GH_TOKEN, TOOLS, WORK, PROJECT, ACTION.
# Out: version, changed, agent, number.
#
# Without an open pull request of the action, it starts from the default branch. With one, it
# continues that branch: what the team and an earlier agent did there stays, the default branch
# is merged in, and the upgrade goes on from there. Nothing is pushed with force.
set -euo pipefail
source "$ACTION/confine.sh"

BRANCH=nldd/design-system-upgrade
BASE="${BASE:-$(gh api "repos/$REPOSITORY" --jq .default_branch)}"
echo "BASE=$BASE" >> "$GITHUB_ENV"
install_confine
mkdir -p "$TOOLS/bin" "$WORK"

# Who commits: whoever opens the pull request. Kept outside the git configuration, which a later
# step puts back as it was cloned, and read by every step that commits.
if [ -n "$APP" ]; then
	name="${APP}[bot]"
	id="$(gh api "users/$name" --jq .id)"
elif name="$(gh api user --jq .login 2>/dev/null)"; then
	id="$(gh api user --jq .id)"
else
	name='github-actions[bot]'
	id=41898282
fi
printf '%s\n%s\n' "$name" "$id+$name@users.noreply.github.com" > "$TOOLS/identity"
use_identity

# `nldd` is the command of the version the project goes to, in every step from here.
if [ "$FROM_SOURCE" = true ]; then
	checkout="$(cd "$ACTION/.." && pwd)"
	npm ci --prefix "$checkout" --omit=dev --ignore-scripts --no-audit --no-fund
	version="$(node --print "require('$checkout/package.json').version")"
	printf '#!/bin/sh\nexec node "%s" "$@"\n' "$checkout/lint/cli.js" > "$TOOLS/bin/nldd"
	echo "SKILLS=$checkout/skills" >> "$GITHUB_ENV"
else
	version="$(npm view "@nldd/design-system@$WANTED" version)"
	printf '#!/bin/sh\nexec npx --yes "@nldd/design-system@%s" "$@"\n' "$version" > "$TOOLS/bin/nldd"
fi
chmod +x "$TOOLS/bin/nldd"
echo "$TOOLS/bin" >> "$GITHUB_PATH"
echo "version=$version" >> "$GITHUB_OUTPUT"

number="$(gh pr list --repo "$REPOSITORY" --head "$BRANCH" --state open --json number --jq '.[0].number')"
echo "number=$number" >> "$GITHUB_OUTPUT"

# A pull request the team closed without merging is a no for that minor. The patches of it do not
# ask again; the next minor, which may break something, does. A pull request the action closed
# itself, because the project got there without it, is no answer of the team.
if [ -z "$number" ]; then
	read -r declined title < <(gh pr list --repo "$REPOSITORY" --head "$BRANCH" --state closed --limit 1 --json number,title,mergedAt --jq '.[] | select(.mergedAt == null) | "\(.number) \(.title)"') || true
	if [ -n "${declined:-}" ]; then
		closer="$(gh api "repos/$REPOSITORY/issues/$declined/events" --jq '[.[] | select(.event == "closed")] | last | .actor.login')"
		was="${title##* }"
		if [ "$closer" != "$name" ] && [ "${was%.*}" = "${version%.*}" ]; then
			echo "The team closed #$declined for $was. $version is of the same minor, so it waits for the next one."
			{ echo "changed=false"; echo "agent=false"; } >> "$GITHUB_OUTPUT"
			exit 0
		fi
	fi
fi

# A plain clone, and not the checkout action. The token is asked for when git needs it and is
# never written to disk, so a later step without it cannot push. And the action stops on a
# repository whose tree holds a submodule without an address, which a real app turned out to have.
# The history comes along without its files, for a merge with the branch of an open pull request.
gh auth setup-git
git clone --quiet --filter=blob:none --branch "$BASE" "https://github.com/$REPOSITORY" "$PROJECT"
cp "$PROJECT/.git/config" "$TOOLS/git-config"
cd "$PROJECT"
git() { command git -c core.hooksPath=/dev/null "$@"; }

from=''
if [ -n "$number" ]; then
	gh pr view "$number" --repo "$REPOSITORY" --json body --jq .body > "$TOOLS/previous.md"
	node "$ACTION/state.mjs" read "$TOOLS/previous.md" > "$TOOLS/state.json"
	from="$(jq --raw-output '.from // empty' "$TOOLS/state.json")"
	node "$ACTION/state.mjs" choices "$TOOLS/previous.md" > "$WORK/keuzes.md"
	[ -s "$WORK/keuzes.md" ] || rm "$WORK/keuzes.md"
	# How the site builds, as an earlier agent found it: the pictures come without the agent too.
	jq --exit-status '.site' "$TOOLS/state.json" > "$WORK/site.json" || rm -f "$WORK/site.json"

	git fetch --quiet origin "$BRANCH"
	git switch --quiet --create "$BRANCH" "origin/$BRANCH"
	if git merge --quiet --no-edit "origin/$BASE"; then
		echo "MERGE=merged" >> "$GITHUB_ENV"
	else
		# A lockfile or the manifest is what changes on both sides; the upgrade writes them again.
		# Anything else is the team's to settle: the branch goes on without the default branch.
		conflicted="$(git diff --name-only --diff-filter=U)"
		if ! grep --quiet --invert-match --extended-regexp '(^|/)(package\.json|package-lock\.json|npm-shrinkwrap\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb?)$' <<< "$conflicted"; then
			xargs --delimiter '\n' git checkout --theirs -- <<< "$conflicted"
			xargs --delimiter '\n' git add -- <<< "$conflicted"
			git commit --quiet --no-edit
			echo "MERGE=resolved" >> "$GITHUB_ENV"
		else
			git merge --abort
			behind=true
			{ echo 'MERGE<<EOF'; echo 'behind'; sed 's/^/- `/; s/$/`/' <<< "$conflicted"; echo 'EOF'; } >> "$GITHUB_ENV"
		fi
	fi
fi

# A pull request without a state, one from before the state or whose text someone rewrote, holds
# the version of the run before. Where the project came from is then what the default branch has.
if [ -n "$number" ] && [ -z "$from" ]; then
	git worktree add --quiet --detach "$TOOLS/base" "origin/$BASE"
	CONFINE_RW=("$TOOLS/base")
	from="$(cd "$TOOLS/base" && confine "$TOOLS/bin/nldd" upgrade --no-install --format json | jq --raw-output '.from // empty')"
	git worktree remove --force "$TOOLS/base"
fi

# The upgrade installs the dependencies without their scripts, and then loads the project's own
# TypeScript to read its types. That is code of the project, so it runs confined, without the token.
CONFINE_RW=("$PROJECT" "$WORK")
confine "$TOOLS/bin/nldd" upgrade --install ${from:+--from "$from"} --report "$WORK/upgrade.md" --format json > "$TOOLS/upgrade.json"
# What the next run continues from: written here, where node is the one this job set up.
node "$ACTION/state.mjs" write "$TOOLS/upgrade.json" > "$TOOLS/state-new.json"

# Changed: the upgrade wrote something, or the default branch came in. Nothing at all to do: the
# project is where the release is, by this pull request or without it.
# A branch that falls behind says so, also when nothing else is new.
if [ -z "${behind:-}" ] && git diff --quiet && { [ -z "$number" ] || [ "$(git rev-parse HEAD)" = "$(git rev-parse "origin/$BRANCH")" ]; }; then
	echo "changed=false" >> "$GITHUB_OUTPUT"
else
	echo "changed=true" >> "$GITHUB_OUTPUT"
fi
# The agent works what is new: everything, for a new pull request, and for one that is continued
# only a place the list did not hold before. What it left on purpose does not call it again.
if [ -n "$number" ]; then
	echo "agent=$(node "$ACTION/state.mjs" new "$TOOLS/upgrade.json" "$TOOLS/state.json")" >> "$GITHUB_OUTPUT"
else
	echo "agent=true" >> "$GITHUB_OUTPUT"
fi
# What the install left behind, so that only a file made after this is taken for work.
git ls-files --others --exclude-standard | sort > "$TOOLS/untracked"
