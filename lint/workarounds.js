/**
 * A workaround that waits for the design system says so in the code, next to it: `// Remove once
 * NLDD #447 is fixed.`, `Reported as NederlandseDigitaleDienst/design-system#288`, or the address
 * of the issue in a suppression, as the migration skill asks. In eleven real apps thirteen such
 * notes stood, in those three forms, in scripts, stylesheets and templates; none in a suppression.
 * An upgrade can tell which may go: those whose issue was closed as done before the release it
 * goes to. A person or an agent then removes the workaround; the note says where.
 */

const ISSUE = /(?:github\.com\/NederlandseDigitaleDienst\/design-system\/issues\/|(?:NederlandseDigitaleDienst\/)?design-system#|\bNLDD #)(\d+)/gi;

/** Every line that cites an issue of the design system, once per issue. */
export function workaroundsIn(source) {
	const found = [];
	source.split('\n').forEach((text, index) => {
		for (const issue of new Set([...text.matchAll(ISSUE)].map((match) => Number(match[1])))) found.push({ line: index + 1, issue });
	});
	return found;
}

/** Where such a note can stand: code, styles, templates and documentation. */
export const WORKAROUND_EXTENSIONS = ['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.vue', '.astro', '.svelte', '.html', '.htm', '.j2', '.jinja', '.jinja2', '.py', '.css', '.scss', '.sass', '.less', '.md', '.mdx'];

/**
 * What GitHub says about an issue of the design system, without a token: a public repository. A
 * question that fails is an answer of nothing, and the workaround stays on the list as unknown.
 * @returns {Promise<{ state: string, reason?: string, closedAt?: string } | undefined>}
 */
export async function issueOnGitHub(number) {
	try {
		const response = await fetch(`https://api.github.com/repos/NederlandseDigitaleDienst/design-system/issues/${number}`, {
			headers: { accept: 'application/vnd.github+json', ...(process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) },
			signal: AbortSignal.timeout(10_000),
		});
		if (!response.ok) return undefined;
		const issue = await response.json();
		return { state: issue.state, reason: issue.state_reason ?? undefined, closedAt: issue.closed_at ?? undefined };
	} catch {
		return undefined;
	}
}

/**
 * Whether each workaround may go: its issue was closed as done, before the release the project
 * goes to was published. Closed as not planned, or after that release, it stays.
 * @param {{ file: string, line: number, issue: number }[]} places
 * @param {(number: number) => Promise<object | undefined>} ask - issueOnGitHub, or a stand-in
 * @param {string | undefined} released - when the version the project goes to was published
 */
export async function judgeWorkarounds(places, ask, released) {
	const answers = new Map();
	for (const issue of new Set(places.map((place) => place.issue))) answers.set(issue, await ask(issue));
	return places.map((place) => {
		const answer = answers.get(place.issue);
		const done = answer?.state === 'closed' && answer.reason !== 'not_planned' && (!released || !answer.closedAt || answer.closedAt <= released);
		return { ...place, status: !answer ? 'unknown' : done ? 'solved' : 'open' };
	});
}
