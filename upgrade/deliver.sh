#!/usr/bin/env bash
# Commits what changed on one branch and opens the pull request, or updates the one that is open.
# A project that is at the version already has that pull request closed.
# In: REPOSITORY, BASE, VERSION, CHANGED, APP, GH_TOKEN, TOOLS, PROJECT. Out: number.
set -euo pipefail

BRANCH=nldd/design-system-upgrade
cd "$PROJECT"
number="$(gh pr list --repo "$REPOSITORY" --head "$BRANCH" --state open --json number --jq '.[0].number')"
if [ "$CHANGED" != true ]; then
	if [ -n "$number" ]; then
		gh pr close "$number" --repo "$REPOSITORY" --delete-branch --comment "Het project staat al op $VERSION. Deze pull request is niet meer nodig."
	fi
	exit 0
fi

# The commit is by whoever opens the pull request.
if [ -n "$APP" ]; then
	name="${APP}[bot]"
	id="$(gh api "users/$name" --jq .id)"
elif name="$(gh api user --jq .login 2>/dev/null)"; then
	id="$(gh api user --jq .id)"
else
	name='github-actions[bot]'
	id=41898282
fi
git config user.name "$name"
git config user.email "$id+$name@users.noreply.github.com"

# What the repository tracks, and a file made after the command ran: the agent's.
title="chore: designsysteem naar $VERSION"
git switch --force-create "$BRANCH"
git add --update
git ls-files --others --exclude-standard | sort | comm -13 "$TOOLS/untracked" - | xargs --no-run-if-empty --delimiter '\n' git add --
git commit --quiet --message "$title"
git push --force origin "$BRANCH"

if [ -n "$number" ]; then
	gh pr edit "$number" --repo "$REPOSITORY" --title "$title" --body-file "$TOOLS/upgrade.md"
else
	gh pr create --repo "$REPOSITORY" --base "$BASE" --head "$BRANCH" --title "$title" --body-file "$TOOLS/upgrade.md"
	number="$(gh pr view "$BRANCH" --repo "$REPOSITORY" --json number --jq .number)"
fi
echo "number=$number" >> "$GITHUB_OUTPUT"

# A report too long for one text continues in comments. Those of an earlier run go first.
gh api --paginate "repos/$REPOSITORY/issues/$number/comments" --jq '.[] | select(.body | startswith("<!-- nldd-upgrade")) | .id' |
	while read -r comment; do gh api --method DELETE "repos/$REPOSITORY/issues/comments/$comment"; done
find "$TOOLS" -maxdepth 1 -name 'upgrade.*.md' | sort --version-sort | while read -r part; do
	{ echo '<!-- nldd-upgrade -->'; cat "$part"; } | gh pr comment "$number" --repo "$REPOSITORY" --body-file -
done
echo "$REPOSITORY naar $VERSION: $(gh pr view "$number" --repo "$REPOSITORY" --json url --jq .url)" >> "$GITHUB_STEP_SUMMARY"
