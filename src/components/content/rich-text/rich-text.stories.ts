import { html, nothing } from 'lit';
import './rich-text.js';
import '../../status-and-feedback/banner/banner.js';

export default {
	title: 'Components/Content/Rich Text',
	component: 'nldd-rich-text',
	tags: ['autodocs'],
	args: { color: 'content', spacing: 'snug', centered: false, hyphens: false },
	argTypes: {
		color: {
			control: 'select',
			options: ['content', 'inherit'],
			description: '`content` neemt de eigen tekstkleuren van het systeem, elk element z\'n eigen. `inherit` laat alle tekst de kleur van de ondergrond volgen (voor gekleurde vlakken).',
			table: { defaultValue: { summary: 'content' } },
		},
		spacing: {
			control: 'select',
			options: ['flat', 'tight', 'snug', 'loose'],
			description: 'Tussenruimte tussen elementen',
			table: { defaultValue: { summary: 'snug' } },
		},
		centered: {
			control: 'boolean',
			description: 'Centreert de main column in de container; zonder dit attribuut is content links uitgelijnd',
			table: { defaultValue: { summary: false } },
		},
		hyphens: {
			control: 'boolean',
			description: 'Opt-in automatische woordafbreking voor doorlopende tekst (p, li, dd). Vereist een correcte lang op de pagina',
			table: { defaultValue: { summary: false } },
		},
	},
};

export const Standaard = {
	render: (args: Record<string, any>) => html`
		<nldd-rich-text color=${args.color || nothing} spacing=${args.spacing} ?centered=${args.centered} ?hyphens=${args.hyphens}>
				<h3>Artikel 1. Algemene begrippen</h3>
				<p>In deze wet en de daarop berustende bepalingen wordt verstaan onder:</p>
				<ul>
					<li><strong>alleenstaande:</strong> de verzekerde die geen partner heeft;</li>
					<li><strong>partner:</strong> de persoon die met de verzekerde een gezamenlijke huishouding voert;</li>
					<li><strong>berekeningsjaar:</strong> het kalenderjaar waarover de zorgtoeslag wordt berekend;</li>
				</ul>
			</nldd-rich-text>
	`,
};

export const Koppen = {
	render: (args: Record<string, any>) => html`
		<nldd-rich-text color=${args.color || nothing} spacing=${args.spacing} ?centered=${args.centered}>
				<h1>Heading 1 — Wet op de zorgtoeslag</h1>
				<h2>Heading 2 — Hoofdstuk 1</h2>
				<h3>Heading 3 — Artikel 1</h3>
				<h4>Heading 4 — Lid 1</h4>
				<h5>Heading 5 — Onderdeel a</h5>
				<h6>Heading 6 — Subonderdeel i</h6>
			</nldd-rich-text>
	`,
};

export const Alinea = {
	render: (args: Record<string, any>) => html`
		<nldd-rich-text color=${args.color || nothing} spacing=${args.spacing} ?centered=${args.centered} ?hyphens=${args.hyphens}>
				<h3>Artikel 2. Zorgtoeslag</h3>
				<p>De verzekerde die op de eerste dag van het berekeningsjaar de leeftijd van achttien jaar heeft bereikt, heeft aanspraak op een zorgtoeslag.</p>
				<p>De zorgtoeslag wordt berekend op basis van het toetsingsinkomen van de verzekerde en, indien van toepassing, diens partner.</p>
				<p>Bij algemene maatregel van bestuur worden regels gesteld omtrent de wijze waarop de zorgtoeslag wordt berekend.</p>
			</nldd-rich-text>
	`,
};

/**
 * Opt-in via `hyphens`. Automatische woordafbreking voor doorlopende tekst
 * (p, li, dd), handig in smalle kolommen met lange Nederlandse
 * samenstellingen. Vereist een correcte `lang` op de pagina — hier staat
 * `lang="nl"` op de wrapper, anders breekt de browser niet af. De grens
 * `hyphenate-limit-chars: 6 3 3` voorkomt losse-letterafbrekingen. Links de
 * standaard (uit), rechts aan; let op de rechterrand van de tekst.
 */
export const Afbreken = {
	render: (args: Record<string, any>) => {
		const content = html`
			<h3>Zorgtoeslagverantwoordelijkheid</h3>
			<p>De gegevensverwerkingsovereenkomst beschrijft de verantwoordelijkheidsverdeling tussen de socialezekerheidsuitvoeringsinstantie en de belanghebbende. Zie ook https://www.rijksoverheid.nl/onderwerpen/zorgtoeslag voor meer informatie.</p>
			<ul>
				<li>Inkomensafhankelijkheidsberekening per huishouden</li>
				<li>Arbeidsongeschiktheidsverzekeringspremie</li>
			</ul>
		`;
		return html`
			<div lang="nl" style="display: flex; gap: 24px; align-items: start;">
				<div style="flex: 1;">
					<p style="font: var(--primitives-font-body-sm-bold-tight); color: var(--semantics-content-color); margin: 0 0 8px;">Zonder afbreking (standaard)</p>
					<div style="width: 280px; border: 1px dashed var(--semantics-dividers-color); padding: 16px;">
						<nldd-rich-text spacing=${args.spacing}>${content}</nldd-rich-text>
					</div>
				</div>
				<div style="flex: 1;">
					<p style="font: var(--primitives-font-body-sm-bold-tight); color: var(--semantics-content-color); margin: 0 0 8px;">Met <code>hyphens</code></p>
					<div style="width: 280px; border: 1px dashed var(--semantics-dividers-color); padding: 16px;">
						<nldd-rich-text spacing=${args.spacing} hyphens>${content}</nldd-rich-text>
					</div>
				</div>
			</div>
		`;
	},
	parameters: { controls: { disable: true } },
	name: 'Woordafbreking',
};

export const Lijsten = {
	render: (args: Record<string, any>) => html`
		<nldd-rich-text color=${args.color || nothing} spacing=${args.spacing} ?centered=${args.centered}>
				<h3>Ongeordende lijst</h3>
				<p>De volgende documenten zijn vereist:</p>
				<ul>
					<li>Geldig identiteitsbewijs</li>
					<li>Bewijs van inschrijving bij de gemeente</li>
					<li>Recent loonstrookje of jaaropgave</li>
					<li>Bankafschrift van de afgelopen drie maanden</li>
				</ul>
				<h3>Geneste en ongeordende lijst</h3>
				<ul>
					<li>Hoofdcategorie A
						<ul>
							<li>Subcategorie A1</li>
							<li>Subcategorie A2</li>
						</ul>
					</li>
					<li>Hoofdcategorie B
						<ul>
							<li>Subcategorie B1</li>
							<li>Subcategorie B2</li>
						</ul>
					</li>
				</ul>
				<h3>Geordende lijst</h3>
				<p>De aanvraag verloopt in de volgende stappen:</p>
				<ol>
					<li>Maak een DigiD aan op digid.nl</li>
					<li>Log in op de website van de Belastingdienst</li>
					<li>Vul het aanvraagformulier volledig in</li>
					<li>Voeg de vereiste documenten toe</li>
					<li>Dien de aanvraag in en bewaar de bevestiging</li>
				</ol>
				<h3>Geneste en geordende lijst</h3>
				<ol>
					<li>Hoofdcategorie A
						<ol>
							<li>Subcategorie A1</li>
							<li>Subcategorie A2</li>
						</ol>
					</li>
					<li>Hoofdcategorie B
						<ol>
							<li>Subcategorie B1</li>
							<li>Subcategorie B2</li>
						</ol>
					</li>
				</ol>
			</nldd-rich-text>
	`,
};

export const Definitielijst = {
	render: (args: Record<string, any>) => {
		const content = html`
			<h3>Artikel 1. Begrippen</h3>
			<dl>
				<dt>Alleenstaande</dt>
				<dd>De verzekerde die geen partner heeft.</dd>
				<dt>Partner</dt>
				<dd>De persoon die met de verzekerde een gezamenlijke huishouding voert.</dd>
				<dt>Toetsingsinkomen</dt>
				<dd>Het inkomen als bedoeld in artikel 8.</dd>
				<dd>Inclusief het inkomen van een eventuele toeslagpartner.</dd>
			</dl>
		`;
		return html`
			<div style="display: flex; flex-direction: column; gap: 2rem;">
				<div>
					<p style="font: var(--primitives-font-body-sm-bold-tight); color: var(--semantics-content-color); margin: 0 0 8px;">sm (&lt; 641px) — gestapeld</p>
					<div style="width: 393px; border: 1px dashed var(--semantics-dividers-color); padding: 16px;">
						<nldd-rich-text color=${args.color || nothing} spacing=${args.spacing} ?centered=${args.centered}>${content}</nldd-rich-text>
					</div>
				</div>
				<div>
					<p style="font: var(--primitives-font-body-sm-bold-tight); color: var(--semantics-content-color); margin: 0 0 8px;">md (≥ 641px) — term links (240px), definitie rechts</p>
					<div style="width: 834px; border: 1px dashed var(--semantics-dividers-color); padding: 16px;">
						<nldd-rich-text color=${args.color || nothing} spacing=${args.spacing} ?centered=${args.centered}>${content}</nldd-rich-text>
					</div>
				</div>
				<div>
					<p style="font: var(--primitives-font-body-sm-bold-tight); color: var(--semantics-content-color); margin: 0 0 8px;">lg (≥ 1008px) — term links (240px), definitie rechts</p>
					<div style="width: 1200px; border: 1px dashed var(--semantics-dividers-color); padding: 16px;">
						<nldd-rich-text color=${args.color || nothing} spacing=${args.spacing} ?centered=${args.centered}>${content}</nldd-rich-text>
					</div>
				</div>
			</div>
		`;
	},
};

export const InlineElementen = {
	render: (args: Record<string, any>) => html`
		<nldd-rich-text color=${args.color || nothing} spacing=${args.spacing} ?centered=${args.centered}>
				<h3>Inline elementen</h3>
				<p>Dit is een paragraaf met <strong>vetgedrukte tekst</strong> en <em>schuingedrukte tekst</em>.</p>
				<p>Hier staat een <a href="#">hyperlink naar een pagina</a> in de tekst.</p>
				<p>Dit is een stukje <code>inline code</code> in een paragraaf.</p>
				<p>Dit is <mark>gemarkeerde tekst</mark> die extra aandacht verdient.</p>
				<p>Combinaties zijn ook mogelijk: <strong>vet en <em>vet schuins</em></strong> of een <a href="#"><strong>vetgedrukte link</strong></a>.</p>
			</nldd-rich-text>
	`,
};

export const Citaat = {
	render: (args: Record<string, any>) => html`
		<nldd-rich-text color=${args.color || nothing} spacing=${args.spacing} ?centered=${args.centered}>
				<h3>Artikel 3. Citaat</h3>
				<p>In de memorie van toelichting staat het volgende vermeld:</p>
				<blockquote>
					De zorgtoeslag is bedoeld als tegemoetkoming in de kosten van de zorgverzekering voor mensen met een laag inkomen. Het doel is om de toegankelijkheid van de zorg voor iedereen te waarborgen, ongeacht de financiële situatie van de verzekerde.
				</blockquote>
				<p>Dit citaat vormt de basis voor de interpretatie van artikel 2.</p>
			</nldd-rich-text>
	`,
};

export const Figuur = {
	render: (args: Record<string, any>) => html`
		<nldd-rich-text color=${args.color || nothing} spacing=${args.spacing} ?centered=${args.centered}>
				<h3>Artikel 4. Toelichting met afbeelding</h3>
				<p>Onderstaande afbeelding toont de verdeling van de zorgtoeslag over de verschillende inkomensgroepen.</p>
				<figure>
					<img src="https://placehold.co/800x400" alt="Verdeling zorgtoeslag per inkomensgroep" />
					<figcaption>Figuur 1 — Verdeling van de zorgtoeslag per inkomensgroep (2024)</figcaption>
				</figure>
				<p>Uit de afbeelding blijkt dat de laagste inkomensgroepen de hoogste toeslag ontvangen.</p>
			</nldd-rich-text>
	`,
};

export const Tabel = {
	render: (args: Record<string, any>) => html`
		<nldd-rich-text color=${args.color || nothing} spacing=${args.spacing} ?centered=${args.centered}>
				<h3>Artikel 5. Overzicht toeslagbedragen</h3>
				<p>De maximale zorgtoeslag per jaar is afhankelijk van de huishoudsamenstelling:</p>
				<table>
					<tr>
						<th>Huishoudtype</th>
						<th>Maximale toeslag</th>
						<th>Inkomensgrens</th>
					</tr>
					<tr>
						<td>Alleenstaande</td>
						<td>€ 1.234</td>
						<td>€ 38.520</td>
					</tr>
					<tr>
						<td>Toeslagpartners</td>
						<td>€ 2.368</td>
						<td>€ 48.224</td>
					</tr>
					<tr>
						<td>Alleenstaande ouder</td>
						<td>€ 1.234</td>
						<td>€ 38.520</td>
					</tr>
				</table>
			</nldd-rich-text>
	`,
};

export const Codeblok = {
	render: (args: Record<string, any>) => html`
		<div style="max-width: 560px;">
		<nldd-rich-text color=${args.color || nothing} spacing=${args.spacing} ?centered=${args.centered}>
				<h3>Codeblok</h3>
				<p>Een markdown-renderer levert een fenced block als <code>&lt;pre&gt;&lt;code&gt;</code> aan. Het kader zit op de <code>pre</code>, de chip blijft voor inline code.</p>
				<pre><code>const toeslag = berekenZorgtoeslag(inkomen);
if (toeslag > 0) {
  console.log(toeslag);
}</code></pre>
				<p>Een regel die niet past scrollt binnen het blok in plaats van de kaart eromheen op te rekken.</p>
				<pre><code>const uitkomst = await client.evalueer('zorgtoeslag', { toetsingsinkomen: 24000, vermogen: 0, partner: false });</code></pre>
				<p>Zonder <code>&lt;code&gt;</code> is <code>pre</code> preformatted tekst die geen code is:</p>
				<pre>zorgtoeslag
├── toetsingsinkomen
└── vermogen</pre>
			</nldd-rich-text>
		</div>
	`,
};

export const CodeblokOpTinted = {
	name: 'Codeblok op tinted vlak',
	render: (args: Record<string, any>) => html`
		<div style="max-width: 420px; padding: 16px; border-radius: 12px; background: var(--semantics-surfaces-tinted-background-color);">
			<nldd-rich-text color=${args.color || nothing} spacing=${args.spacing} ?centered=${args.centered}>
				<p>Het blok heeft dezelfde achtergrond als dit vlak, dus alleen de ring scheidt de twee.</p>
				<pre><code>const a = 1;
const b = 2;</code></pre>
			</nldd-rich-text>
		</div>
	`,
};

export const Scheidingslijn = {
	render: (args: Record<string, any>) => html`
		<nldd-rich-text color=${args.color || nothing} spacing=${args.spacing} ?centered=${args.centered}>
				<h3>Artikel 6. Eerste onderdeel</h3>
				<p>De verzekerde heeft recht op zorgtoeslag indien het toetsingsinkomen niet hoger is dan de vastgestelde inkomensgrens.</p>
				<hr>
				<h3>Artikel 7. Tweede onderdeel</h3>
				<p>De zorgtoeslag wordt maandelijks als voorschot uitbetaald op basis van het geschatte jaarinkomen.</p>
			</nldd-rich-text>
	`,
};

export const Witruimte = {
	render: () => html`
		<div style="display: flex; flex-direction: column; gap: 3rem;">
			<div>
				<p style="font: var(--primitives-font-body-sm-bold-tight); color: var(--semantics-content-color); margin: 0 0 8px;">flat</p>
				<nldd-rich-text spacing="flat">
					<h3>Artikel 1. Algemene begrippen</h3>
					<p>In deze wet wordt verstaan onder:</p>
					<ul>
						<li><strong>alleenstaande:</strong> de verzekerde die geen partner heeft;</li>
						<li><strong>partner:</strong> de persoon die met de verzekerde een gezamenlijke huishouding voert;</li>
					</ul>
				</nldd-rich-text>
			</div>
			<div>
				<p style="font: var(--primitives-font-body-sm-bold-tight); color: var(--semantics-content-color); margin: 0 0 8px;">tight</p>
				<nldd-rich-text spacing="tight">
					<h3>Artikel 1. Algemene begrippen</h3>
					<p>In deze wet wordt verstaan onder:</p>
					<ul>
						<li><strong>alleenstaande:</strong> de verzekerde die geen partner heeft;</li>
						<li><strong>partner:</strong> de persoon die met de verzekerde een gezamenlijke huishouding voert;</li>
					</ul>
				</nldd-rich-text>
			</div>
			<div>
				<p style="font: var(--primitives-font-body-sm-bold-tight); color: var(--semantics-content-color); margin: 0 0 8px;">snug (default)</p>
				<nldd-rich-text spacing="snug">
					<h3>Artikel 1. Algemene begrippen</h3>
					<p>In deze wet wordt verstaan onder:</p>
					<ul>
						<li><strong>alleenstaande:</strong> de verzekerde die geen partner heeft;</li>
						<li><strong>partner:</strong> de persoon die met de verzekerde een gezamenlijke huishouding voert;</li>
					</ul>
				</nldd-rich-text>
			</div>
			<div>
				<p style="font: var(--primitives-font-body-sm-bold-tight); color: var(--semantics-content-color); margin: 0 0 8px;">loose</p>
				<nldd-rich-text spacing="loose">
					<h3>Artikel 1. Algemene begrippen</h3>
					<p>In deze wet wordt verstaan onder:</p>
					<ul>
						<li><strong>alleenstaande:</strong> de verzekerde die geen partner heeft;</li>
						<li><strong>partner:</strong> de persoon die met de verzekerde een gezamenlijke huishouding voert;</li>
					</ul>
				</nldd-rich-text>
			</div>
		</div>
	`,
};

export const VolledigArtikel = {
	render: (args: Record<string, any>) => html`
		<nldd-rich-text color=${args.color || nothing} spacing=${args.spacing} ?centered=${args.centered}>
				<h1>Wet op de zorgtoeslag</h1>
				<h2>Hoofdstuk 1. Algemene bepalingen</h2>
				<h3>Artikel 1. Begrippen</h3>
				<p>In deze wet en de daarop berustende bepalingen wordt verstaan onder:</p>
				<ul>
					<li><strong>alleenstaande:</strong> de verzekerde die geen partner heeft;</li>
					<li><strong>partner:</strong> de persoon die met de verzekerde een gezamenlijke huishouding voert;</li>
					<li><strong>berekeningsjaar:</strong> het kalenderjaar waarover de zorgtoeslag wordt berekend;</li>
					<li><strong>toetsingsinkomen:</strong> het inkomen als bedoeld in artikel 8;</li>
				</ul>
				<h3>Artikel 2. Aanspraak op zorgtoeslag</h3>
				<p>De verzekerde die op de eerste dag van het berekeningsjaar de leeftijd van achttien jaar heeft bereikt, heeft aanspraak op een zorgtoeslag indien:</p>
				<ol>
					<li>hij op die datum in Nederland woont;</li>
					<li>hij verzekerd is op grond van de Zorgverzekeringswet;</li>
					<li>zijn toetsingsinkomen de inkomensgrens niet overschrijdt.</li>
				</ol>
				<blockquote>
					De zorgtoeslag is bedoeld als tegemoetkoming in de kosten van de zorgverzekering voor mensen met een laag inkomen.
				</blockquote>
				<h2>Hoofdstuk 2. Berekening</h2>
				<h3>Artikel 3. Toeslagbedragen</h3>
				<p>De maximale zorgtoeslag per jaar is als volgt:</p>
				<table>
					<tr>
						<th>Huishoudtype</th>
						<th>Maximale toeslag</th>
						<th>Inkomensgrens</th>
					</tr>
					<tr>
						<td>Alleenstaande</td>
						<td>€ 1.234</td>
						<td>€ 38.520</td>
					</tr>
					<tr>
						<td>Toeslagpartners</td>
						<td>€ 2.368</td>
						<td>€ 48.224</td>
					</tr>
				</table>
				<h3>Artikel 4. Meer informatie</h3>
				<p>Voor meer informatie verwijzen wij naar de <a href="#">website van de Belastingdienst</a> of het <a href="#">Besluit zorgtoeslag</a>.</p>
				<figure>
					<img src="https://placehold.co/800x400" alt="Overzicht zorgtoeslag" />
					<figcaption>Figuur 1 — Schematisch overzicht van de zorgtoeslag berekening</figcaption>
				</figure>
			</nldd-rich-text>
	`,
};

export const AlleGrootten = {
	render: (args: Record<string, any>) => html`
		<div style="display: flex; flex-direction: column; gap: 2rem;">
			<div>
				<p style="font: var(--primitives-font-body-sm-bold-tight); color: var(--semantics-content-color); margin: 0 0 8px;">sm (&lt; 641px) — beperkt tot 393px</p>
				<div style="width: 393px; border: 1px dashed var(--semantics-dividers-color); padding: 16px;">
					<nldd-rich-text color=${args.color || nothing} spacing=${args.spacing} ?centered=${args.centered}>
						<h2>Artikel 1. Algemene begrippen</h2>
						<p>In deze wet wordt verstaan onder:</p>
						<ul>
							<li><strong>alleenstaande:</strong> de verzekerde die geen partner heeft;</li>
							<li><strong>partner:</strong> de persoon die met de verzekerde een gezamenlijke huishouding voert;</li>
						</ul>
					</nldd-rich-text>
				</div>
			</div>
			<div>
				<p style="font: var(--primitives-font-body-sm-bold-tight); color: var(--semantics-content-color); margin: 0 0 8px;">md (≥ 641px) — beperkt tot 834px</p>
				<div style="width: 834px; border: 1px dashed var(--semantics-dividers-color); padding: 16px;">
					<nldd-rich-text color=${args.color || nothing} spacing=${args.spacing} ?centered=${args.centered}>
						<h2>Artikel 1. Algemene begrippen</h2>
						<p>In deze wet wordt verstaan onder:</p>
						<ul>
							<li><strong>alleenstaande:</strong> de verzekerde die geen partner heeft;</li>
							<li><strong>partner:</strong> de persoon die met de verzekerde een gezamenlijke huishouding voert;</li>
						</ul>
					</nldd-rich-text>
				</div>
			</div>
			<div>
				<p style="font: var(--primitives-font-body-sm-bold-tight); color: var(--semantics-content-color); margin: 0 0 8px;">lg (≥ 1008px) — beperkt tot 1200px</p>
				<div style="width: 1200px; border: 1px dashed var(--semantics-dividers-color); padding: 16px;">
					<nldd-rich-text color=${args.color || nothing} spacing=${args.spacing} ?centered=${args.centered}>
						<h2>Artikel 1. Algemene begrippen</h2>
						<p>In deze wet wordt verstaan onder:</p>
						<ul>
							<li><strong>alleenstaande:</strong> de verzekerde die geen partner heeft;</li>
							<li><strong>partner:</strong> de persoon die met de verzekerde een gezamenlijke huishouding voert;</li>
						</ul>
					</nldd-rich-text>
				</div>
			</div>
		</div>
	`,
	name: 'Alle groottes (container query)',
};

/**
 * Drie breedtezones: tekst en blockquotes lezen op de `main`-maat, media en
 * tabellen krijgen het `wide`-accent en codeblokken en componenten krijgen
 * de volle breedte (`full`) — beschikbaar, niet geforceerd, dankzij
 * `justify-self: start`. Per kind te overschrijven met
 * `data-width="main" | "wide" | "full"`; de laatste paragraaf hieronder
 * staat bewust op wide. Zet `centered` aan voor de symmetrische variant.
 */
export const Breedtezones = {
	render: (args: Record<string, any>) => html`
		<nldd-rich-text color=${args.color || nothing} spacing=${args.spacing} ?centered=${args.centered}>
			<h2>Zorgtoeslag per huishoudtype</h2>
			<p>De hoogte van de zorgtoeslag hangt af van het toetsingsinkomen en het huishoudtype. Onderstaande tabel toont de maximale bedragen per maand; de tabel krijgt het wide-accent.</p>
			<table>
				<thead>
					<tr><th>Huishoudtype</th><th>Toetsingsinkomen</th><th>Maximale toeslag</th></tr>
				</thead>
				<tbody>
					<tr><td>Alleenstaande</td><td>tot € 37.496</td><td>€ 127</td></tr>
					<tr><td>Met partner</td><td>tot € 47.368</td><td>€ 243</td></tr>
				</tbody>
			</table>
			<p>Afbeeldingen krijgen het wide-accent: iets breder dan de tekst, zonder de pagina te domineren.</p>
			<img src="sample-images/butterfly-960.jpg"
				alt="Vlinder op een bloem"
			>
			<p>Componenten zoals een banner vallen onder de full-default en vullen de beschikbare breedte met hun eigen gedrag.</p>
			<nldd-banner variant="accent"
				text="Een component pakt automatisch de volle breedte"
			></nldd-banner>
			<p data-width="wide">Deze paragraaf staat bewust op <code>data-width="wide"</code> en leest dus iets breder dan de main-maat — de per-item override wint van elke default.</p>
		</nldd-rich-text>
	`,
};

/**
 * Met `color="inherit"` volgt alle tekst de kleur van de ondergrond — voor
 * gekleurde vlakken zoals de filled-categories. Links blijven onderstreept
 * als affordance (hover toont een dikkere lijn in plaats van een
 * kleurverschuiving); figcaption krijgt dezelfde kleur op verlaagde
 * dekking. Bekende v1-gaten: inline code, mark, tabellen en hr behouden
 * hun eigen surfaces.
 */
export const OpKleurvlak = {
	render: () => html`
		<div style="display: flex; flex-direction: column; gap: 16px;">
			<div style="background: var(--semantics-categories-donkerblauw-filled-background-color); color: var(--semantics-categories-donkerblauw-filled-content-color); padding: 24px; border-radius: var(--primitives-corner-radius-md);">
				<nldd-rich-text color="inherit">
					<h3>Op een donker vlak</h3>
					<p>Alle tekst erft de contentkleur van het vlak, inclusief <a href="#">links met hun onderstreping</a> en <strong>nadruk</strong>.</p>
					<figure>
						<img src="sample-images/butterfly-480.jpg"
							alt="Vlinder op een bloem"
						>
						<figcaption>Figuur 1 — de figcaption staat op verlaagde dekking</figcaption>
					</figure>
				</nldd-rich-text>
			</div>
			<div style="background: var(--semantics-categories-oranje-filled-background-color); color: var(--semantics-categories-oranje-filled-content-color); padding: 24px; border-radius: var(--primitives-corner-radius-md);">
				<nldd-rich-text color="inherit">
					<h3>Op een middenton</h3>
					<p>De filled-categories leveren puur zwart of wit als contentkleur, zodat ook middentonen <a href="#">voldoende contrast</a> houden.</p>
				</nldd-rich-text>
			</div>
		</div>
	`,
	parameters: { controls: { disable: true } },
};
