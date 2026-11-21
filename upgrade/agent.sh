#!/usr/bin/env bash
# Lets an agent work the list of what is left. report.sh reads the project again after it, so the
# report says what the linter still finds and not what the agent says it did.
# In: VERSION, MODEL, OAUTH_TOKEN or API_KEY, CLAUDE_CODE_SUBPROCESS_ENV_SCRUB, TOOLS, WORK, PROJECT, SKILLS.
#
# The agent may write in the project and in WORK, where it finds the report and leaves its
# choices and how the site builds. TOOLS, with the command the later steps run and the result of
# the check on the key, it cannot reach: it is not one of its directories, and its commands run in
# a sandbox that writes only in the project and the caches.
set -euo pipefail
source "$ACTION/confine.sh"

if [ -n "${OAUTH_TOKEN:-}" ]; then
	export CLAUDE_CODE_OAUTH_TOKEN="$OAUTH_TOKEN"
elif [ -n "${API_KEY:-}" ]; then
	export ANTHROPIC_API_KEY="$API_KEY"
else
	echo "::warning::The agent was asked for, and there is no claude-code-oauth-token or anthropic-api-key. The pull request holds what the command did."
	exit 0
fi
unset OAUTH_TOKEN API_KEY

# The skill of the version the project now has.
if [ -z "${SKILLS:-}" ]; then
	if ! git clone --quiet --depth 1 --branch "v$VERSION" https://github.com/NederlandseDigitaleDienst/design-system "$TOOLS/source"; then
		echo "::error::The skill of $VERSION could not be fetched: the design system has no tag v$VERSION. The pull request holds what the command did."
		exit 1
	fi
	SKILLS="$TOOLS/source/skills"
fi

# A command of the session itself says whether it can see the key: it runs as the agent's commands do.
printf '#!/bin/sh\nif [ -n "${CLAUDE_CODE_OAUTH_TOKEN:-}${ANTHROPIC_API_KEY:-}" ]; then echo yes; else echo no; fi > "%s"\n' "$TOOLS/sees-key" > "$TOOLS/sees-key.sh"
chmod +x "$TOOLS/sees-key.sh"
# In the sandbox a build may write to its caches in the home directory, and to nothing else outside the clone.
mkdir -p "$HOME/.npm" "$HOME/.cache"
jq --null-input --arg hook "$TOOLS/sees-key.sh" --arg home "$HOME" --arg work "$WORK" '{
	hooks: { SessionStart: [{ hooks: [{ type: "command", command: $hook }] }] },
	sandbox: { enabled: true, filesystem: { allowWrite: [($home + "/.npm"), ($home + "/.cache"), $work] } }
}' > "$TOOLS/settings.json"

# A fixed version: what the sandbox and the settings do depends on it, and the pull request names it.
npm install --global --no-audit --no-fund "@anthropic-ai/claude-code@$CLAUDE_CODE_VERSION"

# The sandbox has to start. Without it the commands of the agent would run unconfined, with nothing
# to say so; so a runner where bubblewrap cannot make a namespace stops here.
if [ "$CLAUDE_CODE_SUBPROCESS_ENV_SCRUB" = 1 ] && ! bwrap --ro-bind / / --dev /dev --proc /proc --unshare-pid true; then
	echo "::error::The sandbox for the commands of the agent cannot start on this runner. No agent runs; the pull request holds what the command did."
	exit 1
fi

# The sandbox puts an empty, locked file in the project for each protected path that is not
# there, such as package.json, a lockfile or .bashrc, and adds them to .git/info/exclude.
# What stands in the project now is the project's; what is added and empty is the sandbox's.
cd "$PROJECT"
ls -A > "$TOOLS/root.before"
cp .git/info/exclude "$TOOLS/exclude.before" 2>/dev/null || true

prompt="$(sed -e "s#{VERSION}#$VERSION#g" -e "s#{WORK}#$WORK#g" -e "s#{SKILLS}#$SKILLS#g" "$ACTION/prompt.md")"
# --restricted reads no settings of the user, the project or `local`: a repository could otherwise
# bring a hook of its own in .claude/, which runs as Claude Code itself, outside the sandbox and with
# the key in its environment. Only the settings of the action apply, and no MCP server of the project.
if ! timeout 60m claude --print "$prompt" --model "$MODEL" --restricted --strict-mcp-config --add-dir "$WORK" --add-dir "$SKILLS" --settings "$TOOLS/settings.json" --tools Bash Read Edit Write Glob Grep --allowedTools Bash Read Edit Write Glob Grep; then
	echo "::warning::The agent stopped before it was done. The pull request holds what it did until then."
	printf '\n- De agent die de lijst afwerkt is niet klaar gekomen. Wat hij tot dan deed, staat in deze pull request.\n' >> "$WORK/keuzes.md"
fi
version="$(claude --version | cut -d' ' -f1)"
# From here nothing needs the key, and what runs next may run code the agent changed.
unset CLAUDE_CODE_OAUTH_TOKEN ANTHROPIC_API_KEY

# Out of the sandbox again: what it left goes, so nothing after this trips over an empty package.json.
ls -A | sort | comm -13 <(sort "$TOOLS/root.before") - | while read -r entry; do
	if [ -f "$entry" ] && [ ! -s "$entry" ]; then rm -f "$entry"; elif [ -d "$entry" ]; then rmdir "$entry" 2>/dev/null || true; fi
done
if [ -f "$TOOLS/exclude.before" ]; then cp "$TOOLS/exclude.before" .git/info/exclude; fi

case "$CLAUDE_CODE_SUBPROCESS_ENV_SCRUB$(cat "$TOOLS/sees-key" 2>/dev/null || true)" in
	0*) echo "::notice::The commands of the agent ran without a sandbox, as asked: they could read the key for the model, and write anywhere on the runner." ;;
	1no) echo "Sandbox: the commands of the agent could not read the key for the model." ;;
	1yes)
		echo "::error::A command of the agent could read the key for the model. No pull request is made; replace the key."
		exit 1
		;;
	*) echo "::warning::Whether a command of the agent could read the key for the model was not checked: the check did not run." ;;
esac

# Who worked the list, for whoever reviews it.
printf '\n_Afgewerkt door een agent: %s, met Claude Code %s._\n' "$MODEL" "$version" >> "$WORK/keuzes.md"
