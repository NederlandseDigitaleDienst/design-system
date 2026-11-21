#!/usr/bin/env bash
# Commits what changed on the branch and opens the pull request, or adds to the one that is open.
# A pull request that holds nothing beyond the default branch any more is closed.
# In: REPOSITORY, BASE, VERSION, CHANGED, NUMBER, MERGE, GH_TOKEN, TOOLS, WORK, PROJECT. Out: number.
#
# This step holds the token, after an agent and the project's own code have run. So it takes its
# commands from the system only, puts the git configuration back as it was cloned, and runs no hook.
set -euo pipefail
# The system's own commands. A test of the action points this at its stand-ins. Only a step that
# writes the environment of the next could change it, and no code of the project runs in one.
export PATH="${NLDD_SYSTEM_PATH:-/usr/bin:/bin}"
source "$ACTION/confine.sh"

BRANCH=nldd/design-system-upgrade
if [ "$CHANGED" != true ]; then
	echo "Nothing new for $REPOSITORY."
	exit 0
fi

cd "$PROJECT"
reset_git
use_identity
git() { command git -c core.hooksPath=/dev/null "$@"; }
title="chore: designsysteem naar $VERSION"
number="${NUMBER:-}"
merge="${MERGE:-}"

# What the repository tracks, and a file made after the command ran: the agent's.
git switch --quiet --create "$BRANCH" 2>/dev/null || true
git add --update
git ls-files --others --exclude-standard | sort | comm -13 "$TOOLS/untracked" - | xargs --no-run-if-empty --delimiter '\n' git -c core.hooksPath=/dev/null add --
git diff --cached --quiet || git commit --quiet --no-verify --message "$title"

# The project got to the version without this pull request: nothing in it is beyond the default branch.
if [ -n "$number" ] && [ "${merge%%$'\n'*}" != behind ] && git diff --quiet "origin/$BASE" HEAD; then
	gh pr close "$number" --repo "$REPOSITORY" --delete-branch --comment "Het project staat al op $VERSION. Deze pull request is niet meer nodig."
	exit 0
fi

# Without force where a pull request is open: it keeps every commit on it. A branch left by one
# that was closed is no one's work any more, and starts again.
if [ -n "$number" ]; then
	git push --no-verify origin "HEAD:refs/heads/$BRANCH"
else
	git push --no-verify --force origin "HEAD:refs/heads/$BRANCH"
fi

# The text: the report as it stands, what this run did to a pull request that was open already,
# and the state the next run continues from.
: > "$TOOLS/note.md"
if [ -n "$number" ]; then
	{
		printf '> Deze pull request liep al. Deze run bracht hem naar %s, bovenop wat er stond. Wat hieronder staat, is de stand van nu.\n' "$VERSION"
		case "$merge" in
			behind*)
				printf '>\n> **Deze branch loopt achter op `%s`.** Die erin mergen gaf een conflict buiten de lockfiles, en dat is aan jullie. Los het op bij het mergen van deze pull request, of sluit hem, dan begint de volgende run opnieuw. Het conflict zit in:\n' "$BASE"
				tail -n +2 <<< "$merge" | sed 's/^/> /'
				;;
			resolved) printf '>\n> `%s` gaf een conflict in de lockfile of `package.json`. Die zijn van `%s` genomen en daarna opnieuw geschreven.\n' "$BASE" "$BASE" ;;
		esac
		echo
	} > "$TOOLS/note.md"
fi
{
	# The title, then the note on a pull request that was open already, then the rest of the report.
	head -n 2 "$WORK/upgrade.md"
	cat "$TOOLS/note.md"
	tail -n +3 "$WORK/upgrade.md"
	echo
	# With how the site builds, when the agent found it. A file the agent wrote is data: jq reads it, and
	# a file that is no JSON is left out.
	state="$(jq --compact-output --slurpfile site "$WORK/site.json" '. + {site: $site[0]}' "$TOOLS/state-new.json" 2>/dev/null || jq --compact-output . "$TOOLS/state-new.json")"
	printf '<!-- nldd-upgrade-state %s -->\n' "${state//-->/--\\u003e}"
} > "$TOOLS/body.md"

if [ -n "$number" ]; then
	gh pr edit "$number" --repo "$REPOSITORY" --title "$title" --body-file "$TOOLS/body.md"
else
	gh pr create --repo "$REPOSITORY" --base "$BASE" --head "$BRANCH" --title "$title" --body-file "$TOOLS/body.md"
	number="$(gh pr view "$BRANCH" --repo "$REPOSITORY" --json number --jq .number)"
fi
echo "number=$number" >> "$GITHUB_OUTPUT"

# A report too long for one text continues in comments. Those of an earlier run go first.
gh api --paginate "repos/$REPOSITORY/issues/$number/comments" --jq '.[] | select(.body | startswith("<!-- nldd-upgrade")) | .id' |
	while read -r comment; do gh api --method DELETE "repos/$REPOSITORY/issues/comments/$comment"; done
find "$WORK" -maxdepth 1 -name 'upgrade.*.md' | sort --version-sort | while read -r part; do
	{ echo '<!-- nldd-upgrade -->'; cat "$part"; } | gh pr comment "$number" --repo "$REPOSITORY" --body-file -
done
echo "$REPOSITORY naar $VERSION: $(gh pr view "$number" --repo "$REPOSITORY" --json url --jq .url)" >> "$GITHUB_STEP_SUMMARY"
