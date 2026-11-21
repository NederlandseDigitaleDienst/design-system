This repository was just upgraded to @nldd/design-system {VERSION} by `nldd upgrade`.
The report is in {WORK}/upgrade.md. Follow {SKILLS}/nldd-design-upgrade/SKILL.md from step 2:
work every place under "Nog te doen", "Niet gelezen" and "Niet te beslissen in de bron", and read the breaking changes it lists.
Where you choose, keep what the page did before the upgrade.
`nldd` on the PATH is the linter of the new version; `nldd lint` says what is left.

Before you stop, run what the project's own CI runs on a pull request, where that needs no secret and no service:
read .github/workflows for it. A check that fails now is broken by the upgrade: fix it, also where the fix is in
the project's own scripts or configuration, with the smallest change that makes it pass, and name it in the choices.

Leave the report as it is: the command writes it again after you. Write {WORK}/keuzes.md instead, a short list
in Dutch, plain, without a title, for the people who review the pull request: every choice that does not follow from
the changelog, what you left and why, and what of the project's CI still fails.

If the project builds to a static site, write {WORK}/site.json as well:
{"build": "<one shell command that builds the site from a clean checkout on this runner, installing what it needs>", "site": "<the directory it writes to>"}.
Run that command once to see that it works. Leave the file out for an app that needs a server or a backend.

Your commands run in a sandbox. It puts empty, locked files in the project for protected paths that are not there,
such as package.json or a lockfile in the root; a tool that reads them may fail. Then run that check in a clean clone
outside the project. The files go away after you.
Leave no file behind that does not belong in the pull request. Do not commit and do not push.
If you cannot run a command at all, say so as the first line of {WORK}/keuzes.md.
