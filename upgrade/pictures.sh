#!/usr/bin/env bash
# Posts what the comparison found under the pull request, with the pictures that show most.
# In: REPOSITORY, NUMBER, ALL (the artifact), GH_TOKEN, TOOLS, PROJECT.
set -euo pipefail

cd "$TOOLS/compare"
{
	echo '<!-- nldd-upgrade-compare -->'
	cat compare.md
	printf '\nAlle beelden: %s\n' "$ALL"
} > comment.md
images="$(grep --only-matching '(\./[^)]*\.png)' comment.md | tr -d '()' | sed 's#^\./##')"
id="$(gh api "repos/$REPOSITORY" --jq .id)"

# Each picture goes where GitHub keeps what is attached to a comment, the address `gh --attach`
# uses. It takes the token of a person, and answers the token of an app with a 404.
cp comment.md hosted.md
attached=true
for image in $images; do
	status="$(curl --silent --output answer.json --write-out '%{http_code}' --request POST \
		"https://uploads.github.com/user-attachments/assets?name=$image&content_type=image/png&repository_id=$id" \
		--header "Authorization: Bearer $GH_TOKEN" --header 'Content-Type: application/octet-stream' \
		--header 'Accept: application/vnd.github+json' --data-binary "@$image")" || status=000
	url="$(jq --raw-output '.url // empty' answer.json 2>/dev/null || true)"
	if [ -z "$url" ]; then
		echo "Attaching was refused (HTTP $status), so the pictures go to refs/nldd/pictures."
		attached=false
		break
	fi
	sed --in-place "s#(\./$image)#($url)#" hosted.md
done

# Where that is refused, the pictures go in a commit of their own, on a ref that is no
# branch, and the comment points at them by that commit. A next run replaces the ref.
if [ "$attached" != true ]; then
	export GIT_INDEX_FILE="$TOOLS/pictures.index"
	git -C "$PROJECT" read-tree --empty
	for image in $images; do
		blob="$(git -C "$PROJECT" hash-object -w "$PWD/$image")"
		git -C "$PROJECT" update-index --add --cacheinfo "100644,$blob,$image"
	done
	tree="$(git -C "$PROJECT" write-tree)"
	commit="$(git -C "$PROJECT" commit-tree "$tree" -m "Beelden van de designsysteem-upgrade")"
	if git -C "$PROJECT" push --force origin "$commit:refs/nldd/pictures"; then
		sed --regexp-extended "s#^(!\[[^]]*\]\()\./([^)]*)\)\$#\1https://github.com/$REPOSITORY/raw/$commit/\2)#" comment.md > hosted.md
	else
		echo "::warning::The pictures could not be pushed either. The comment names them, and they are in the artifact."
		sed --regexp-extended 's/^!\[([^]]*)\]\(\.\/([^)]*)\)$/Beeld `\2` in de bijlage van de run./' comment.md > hosted.md
	fi
fi
gh pr comment "$NUMBER" --repo "$REPOSITORY" --body-file hosted.md
