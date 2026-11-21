#!/usr/bin/env bash
# Sourced by the steps of the action. `confine` runs a command that may run code of the
# project, or code the agent could have changed: the linter that loads the project's
# TypeScript, a build, a comparison in a browser. It runs where it cannot change what a
# later step with a token runs: everything is read-only except the directories in
# CONFINE_RW and the caches in the home directory, the files through which a step passes
# environment and PATH to the next are out of reach, and no token is in its environment.
# The network stays, because a build installs what it needs.

# The caches a build writes to. ~/.local/bin is on the PATH of a runner, so a step with a
# token sets its own PATH and never takes a command from there.
CONFINE_CACHES=("$HOME/.cache" "$HOME/.npm" "$HOME/.local")

confine() {
	local binds=() dir
	for dir in "${CONFINE_CACHES[@]}" "${CONFINE_RW[@]}"; do
		mkdir -p "$dir"
		binds+=(--bind "$dir" "$dir")
	done
	env -u GH_TOKEN -u GITHUB_TOKEN -u GITHUB_ENV -u GITHUB_PATH -u GITHUB_OUTPUT -u GITHUB_STATE -u GITHUB_STEP_SUMMARY \
		-u ACTIONS_RUNTIME_TOKEN -u ACTIONS_ID_TOKEN_REQUEST_TOKEN -u ACTIONS_ID_TOKEN_REQUEST_URL -u CLAUDE_CODE_OAUTH_TOKEN -u ANTHROPIC_API_KEY \
		bwrap --ro-bind / / --dev /dev --tmpfs /dev/shm --proc /proc --tmpfs /tmp "${binds[@]}" --unshare-pid --die-with-parent -- "$@"
}

# Bubblewrap, and a runner that lets a process without privileges make a namespace. Once per job.
install_confine() {
	if ! command -v bwrap > /dev/null; then
		sudo apt-get update --quiet --quiet
		sudo apt-get install --yes --quiet --quiet --no-install-recommends bubblewrap socat
	fi
	sudo sysctl --quiet --write kernel.apparmor_restrict_unprivileged_userns=0
}

# Before a step with a token works in the project: the git configuration as it was cloned,
# and no hooks, so nothing the agent or a build left there runs with the token.
reset_git() {
	cp "$TOOLS/git-config" "$PROJECT/.git/config"
	rm -rf "$PROJECT/.git/hooks"
	mkdir "$PROJECT/.git/hooks"
}

# The name and address a commit of the action carries, written by upgrade.sh.
use_identity() {
	local name email
	{ read -r name; read -r email; } < "$TOOLS/identity"
	export GIT_AUTHOR_NAME="$name" GIT_COMMITTER_NAME="$name" GIT_AUTHOR_EMAIL="$email" GIT_COMMITTER_EMAIL="$email"
}
