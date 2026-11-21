#!/usr/bin/env bash
# Lets an agent work the list of what is left, then reads the project again, so the report says
# what the linter still finds and not what the agent says it did.
# In: VERSION, MODEL, OAUTH_TOKEN or API_KEY, CLAUDE_CODE_SUBPROCESS_ENV_SCRUB, TOOLS, PROJECT, SKILLS.
set -euo pipefail

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
	git clone --quiet --depth 1 --branch "v$VERSION" https://github.com/NederlandseDigitaleDienst/design-system "$TOOLS/source"
	SKILLS="$TOOLS/source/skills"
fi

# A command of the session itself says whether it can see the key: it runs as the agent's commands do.
printf '#!/bin/sh\nif [ -n "${CLAUDE_CODE_OAUTH_TOKEN:-}${ANTHROPIC_API_KEY:-}" ]; then echo yes; else echo no; fi > "%s"\n' "$TOOLS/sees-key" > "$TOOLS/sees-key.sh"
chmod +x "$TOOLS/sees-key.sh"
# In the sandbox a build may write to its caches in the home directory, and to nothing else outside the clone.
mkdir -p "$HOME/.npm" "$HOME/.cache"
jq --null-input --arg hook "$TOOLS/sees-key.sh" --arg home "$HOME" '{
	hooks: { SessionStart: [{ hooks: [{ type: "command", command: $hook }] }] },
	sandbox: { filesystem: { allowWrite: [($home + "/.npm"), ($home + "/.cache")] } }
}' > "$TOOLS/settings.json"

# With the key kept out, the agent's commands run in a sandbox of their own. That needs
# bubblewrap, and a runner that lets a process without privileges make a namespace.
if [ "$CLAUDE_CODE_SUBPROCESS_ENV_SCRUB" = 1 ]; then
	sudo apt-get update --quiet --quiet
	sudo apt-get install --yes --quiet --quiet --no-install-recommends bubblewrap socat
	sudo sysctl --quiet --write kernel.apparmor_restrict_unprivileged_userns=0
fi

npm install --global --no-audit --no-fund @anthropic-ai/claude-code

# The sandbox puts an empty, locked file in the project for each protected path that is not
# there, such as package.json, a lockfile or .bashrc, and adds them to .git/info/exclude.
# What stands in the project now is the project's; what is added and empty is the sandbox's.
cd "$PROJECT"
ls -A > "$TOOLS/root.before"
cp .git/info/exclude "$TOOLS/exclude.before" 2>/dev/null || true

prompt="$(sed -e "s#{VERSION}#$VERSION#g" -e "s#{TOOLS}#$TOOLS#g" -e "s#{SKILLS}#$SKILLS#g" "$(dirname "$0")/prompt.md")"
if ! timeout 60m claude --print "$prompt" --model "$MODEL" --add-dir "$TOOLS" --add-dir "$SKILLS" --settings "$TOOLS/settings.json" --tools Bash Read Edit Write Glob Grep --allowedTools Bash Read Edit Write Glob Grep; then
	echo "::warning::The agent stopped before it was done. The pull request holds what it did until then."
	printf '\n- De agent die de lijst afwerkt is niet klaar gekomen. Wat hij tot dan deed, staat in deze pull request.\n' >> "$TOOLS/keuzes.md"
fi

# Out of the sandbox again: what it left goes, so nothing after this trips over an empty package.json.
ls -A | sort | comm -13 <(sort "$TOOLS/root.before") - | while read -r entry; do
	if [ -f "$entry" ] && [ ! -s "$entry" ]; then rm -f "$entry"; elif [ -d "$entry" ]; then rmdir "$entry" 2>/dev/null || true; fi
done
if [ -f "$TOOLS/exclude.before" ]; then cp "$TOOLS/exclude.before" .git/info/exclude; fi

case "$CLAUDE_CODE_SUBPROCESS_ENV_SCRUB$(cat "$TOOLS/sees-key" 2>/dev/null || true)" in
	0*) echo "::notice::The commands of the agent ran without a sandbox, as asked: they could read the key for the model." ;;
	1no) echo "Sandbox: the commands of the agent could not read the key for the model." ;;
	1yes)
		echo "::error::A command of the agent could read the key for the model. No pull request is made; replace the key."
		exit 1
		;;
	*) echo "::warning::Whether a command of the agent could read the key for the model was not checked: the check did not run." ;;
esac

# Who worked the list, for whoever reviews it.
printf '\n_Afgewerkt door een agent: %s, met Claude Code %s._\n' "$MODEL" "$(claude --version | cut -d' ' -f1)" >> "$TOOLS/keuzes.md"

# What is left now, as the linter finds it, with the choices of the agent under it.
nldd upgrade --since "$TOOLS/upgrade.json" --notes "$TOOLS/keuzes.md" --report "$TOOLS/upgrade.md"
