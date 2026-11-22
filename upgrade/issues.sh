#!/usr/bin/env bash
# What the agent found the design system cannot do, and what it means for this pull request.
# In: REPOSITORY, FINDINGS (fleet or link), RELEASED, NODE, GH_TOKEN, TOOLS, WORK, PROJECT, ACTION.
# Out: blocked. Writes $WORK/issues-section.md, $TOOLS/pending.json, and in the fleet $TOOLS/findings/.
#
# A finding that blocks holds this pull request back, as a draft, until the issue for it is closed
# as done in a release the project goes to. The issue is found by the fingerprint of the finding,
# which it carries in a hidden marker; findings.mjs says more. In the fleet one job after all
# repositories files the issues (upgrade-fleet.yml); a team that runs the action itself gets a link
# that opens the issue filled in, marker and all.
set -euo pipefail
# The system's own commands. A test of the action points this at its stand-ins. Only a step that
# writes the environment of the next could change it, and no code of the project runs in one.
export PATH="${NLDD_SYSTEM_PATH:-/usr/bin:/bin}"

DESIGN=NederlandseDigitaleDienst/design-system
section="$WORK/issues-section.md"
: > "$section"
echo '[]' > "$TOOLS/pending.json"
mkdir -p "$TOOLS/findings"

git -C "$PROJECT" ls-files > "$TOOLS/tracked"
"$NODE" "$ACTION/findings.mjs" read "$WORK/issues" "$REPOSITORY" "$TOOLS/tracked" > "$TOOLS/findings.json"

# What blocks: the findings of this run that block, and those an earlier run left open.
jq --slurpfile before <(jq '.pending // []' "$TOOLS/state.json" 2> /dev/null || echo '[]') \
	'[.[] | select(.blocking) | {fingerprint, title}] + $before[0] | unique_by(.fingerprint)' "$TOOLS/findings.json" > "$TOOLS/blocking.json"

# Per blocking finding: the issue that carries its fingerprint, and whether the release solves it.
echo '[]' > "$TOOLS/judged.json"
while read -r entry; do
	fingerprint="$(jq --raw-output .fingerprint <<< "$entry")"
	issue="$(gh api -X GET search/issues -f q="repo:$DESIGN is:issue $fingerprint" --jq '[.items[] | .number] | min // empty' 2> /dev/null || true)"
	status=unfiled
	if [ -n "$issue" ]; then
		status="$(gh api "repos/$DESIGN/issues/$issue" 2> /dev/null | jq --raw-output --arg released "${RELEASED:-}" \
			'if .state == "open" then "open" elif .state_reason == "not_planned" then "not-planned" elif ($released == "" or .closed_at <= $released) then "solved" else "open" end' || echo open)"
	fi
	jq --argjson entry "$entry" --arg issue "$issue" --arg status "$status" '. + [$entry + { issue: $issue, status: $status }]' "$TOOLS/judged.json" > "$TOOLS/judged.next" && mv "$TOOLS/judged.next" "$TOOLS/judged.json"
done < <(jq --compact-output '.[]' "$TOOLS/blocking.json")
jq '[.[] | select(.status == "open" or .status == "unfiled") | {fingerprint, title}]' "$TOOLS/judged.json" > "$TOOLS/pending.json"
if [ "$(jq length "$TOOLS/pending.json")" -gt 0 ]; then echo "blocked=true" >> "$GITHUB_OUTPUT"; else echo "blocked=false" >> "$GITHUB_OUTPUT"; fi

# In the fleet the findings that name no app go to the job that files them; the rest is a link.
if [ "${FINDINGS:-link}" = fleet ]; then
	jq --compact-output '.[] | select(.namesApp | not) | {fingerprint, title, body, blocking}' "$TOOLS/findings.json" |
		while read -r finding; do jq . <<< "$finding" > "$TOOLS/findings/$(jq --raw-output .fingerprint <<< "$finding").json"; done
fi

link() {
	local title="$1" body="$2" fingerprint="$3" blocking="$4" labels=uit-upgrade
	[ "$blocking" = true ] && labels=uit-upgrade,blocking
	printf 'https://github.com/%s/issues/new?labels=%s&title=%s&body=%s' "$DESIGN" "$labels" \
		"$(jq --raw-input --raw-output @uri <<< "$title")" \
		"$(printf '%s\n\n<!-- nldd-finding %s -->\n' "$(head -c 5000 <<< "$body")" "$fingerprint" | jq --raw-input --slurp --raw-output @uri)"
}

[ "$(jq length "$TOOLS/findings.json")" -gt 0 ] || [ "$(jq length "$TOOLS/judged.json")" -gt 0 ] || exit 0
{
	echo '## Voor het designsysteem'
	echo
	if [ "$(jq length "$TOOLS/pending.json")" -gt 0 ]; then
		echo '**Deze pull request wacht op het designsysteem.** De upgrade kan hier niet goed binnen wat het designsysteem biedt. Hij staat daarom op concept, tot een release het issue oplost; de eerste run daarna zet hem terug. Merge hem niet eerder.'
		echo
	fi
	jq --compact-output '.[]' "$TOOLS/judged.json" | while read -r entry; do
		title="$(jq --raw-output .title <<< "$entry")"
		issue="$(jq --raw-output .issue <<< "$entry")"
		case "$(jq --raw-output .status <<< "$entry")" in
			solved) echo "- **Opgelost:** $title, in $DESIGN#$issue." ;;
			not-planned) echo "- **Niet gepland:** $title, in $DESIGN#$issue. Het blokkeert niet meer; kies zelf hoe je het oplost." ;;
			open) echo "- **Blokkeert:** $title, in $DESIGN#$issue." ;;
			unfiled)
				if [ "${FINDINGS:-link}" = fleet ] && jq --exit-status --arg title "$title" 'any(.[]; .title == $title and (.namesApp | not))' "$TOOLS/findings.json" > /dev/null; then
					echo "- **Blokkeert:** $title. Het issue wordt na deze ronde aangemaakt."
				else
					finding="$(jq --compact-output --arg title "$title" 'first(.[] | select(.title == $title)) // {}' "$TOOLS/findings.json")"
					echo "- **Blokkeert:** $title. [Open het issue]($(link "$title" "$(jq --raw-output '.body // ""' <<< "$finding")" "$(jq --raw-output .fingerprint <<< "$entry")" true)); kijk eerst na dat er niets van de app in staat."
				fi
				;;
		esac
	done
	jq --compact-output '.[] | select(.blocking | not)' "$TOOLS/findings.json" | while read -r finding; do
		title="$(jq --raw-output .title <<< "$finding")"
		if [ "${FINDINGS:-link}" = fleet ] && [ "$(jq --raw-output .namesApp <<< "$finding")" = false ]; then
			echo "- **Gemeld:** $title. Blokkeert deze pull request niet."
		else
			echo "- **Te melden:** $title. [Open het issue]($(link "$title" "$(jq --raw-output .body <<< "$finding")" "$(jq --raw-output .fingerprint <<< "$finding")" false)). Blokkeert deze pull request niet."
		fi
	done
	echo
} > "$section"
