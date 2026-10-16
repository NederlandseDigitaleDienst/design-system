import { html, nothing } from 'lit';
import './rich-text.js';
import '../../status-and-feedback/banner/banner.js';
import '../../layout/container/container.js';
import '../text/text.js';
import '../../layout/spacer/spacer.js';

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
		<nldd-rich-text
			color=${args.color || nothing}
			spacing=${args.spacing}
			?centered=${args.centered}
			?hyphens=${args.hyphens}
		>
				<h3>Wat telt als dakisolatie</h3>
				<p>Je aanvraag gaat over een van deze maatregelen:</p>
				<ul>
					<li><strong>dakisolatie:</strong> isolatie aan de binnen- of buitenkant van een schuin of plat dak;</li>
					<li><strong>zoldervloerisolatie:</strong> isolatie op de vloer van een zolder die je niet verwarmt;</li>
					<li><strong>warmtepomp:</strong> een installatie die warmte uit de lucht, de bodem of water haalt;</li>
				</ul>
			</nldd-rich-text>
	`,
};

export const Koppen = {
	render: (args: Record<string, any>) => html`
		<nldd-rich-text
			color=${args.color || nothing}
			spacing=${args.spacing}
			?centered=${args.centered}
		>
				<h1>Heading 1 — Mijn Dienst</h1>
				<h2>Heading 2 — Dossier D-318</h2>
				<h3>Heading 3 — Aanvraag A-1042</h3>
				<h4>Heading 4 — Dakisolatie</h4>
				<h5>Heading 5 — Bijlagen</h5>
				<h6>Heading 6 — Foto van het dak</h6>
			</nldd-rich-text>
	`,
};

export const Alinea = {
	render: (args: Record<string, any>) => html`
		<nldd-rich-text
			color=${args.color || nothing}
			spacing=${args.spacing}
			?centered=${args.centered}
			?hyphens=${args.hyphens}
		>
				<h3>Aanvraag A-1042</h3>
				<p>Je aanvraag voor dakisolatie is in behandeling. Team Uitvoering beoordeelt of de maatregel past bij je woning en of de offerte compleet is.</p>
				<p>Ontbreekt er iets, dan krijg je een bericht in Mijn Dienst. Je hebt daarna twee weken om je aanvraag aan te vullen.</p>
				<p>Na de beoordeling hoor je of de aanvraag is toegekend en welk bedrag je ontvangt voor de isolatie van je dak.</p>
			</nldd-rich-text>
	`,
};

/**
 * Opt-in via `hyphens`. Automatische woordafbreking voor doorlopende tekst
 * (p, li, dd), handig in smalle kolommen met lange Nederlandse
 * samenstellingen. Vereist een correcte `lang` op de pagina — hier staat
 * `lang="nl"` op de wrapper, anders breekt de browser niet af. De grens
 * `hyphenate-limit-chars: 6 3 3` voorkomt losse-letterafbrekingen. Een kop
 * breekt nooit met een streepje, alleen als één woord breder is dan de kolom.
 * Links de standaard (uit), rechts aan; let op de rechterrand van de tekst.
 */
export const Afbreken = {
	render: (args: Record<string, any>) => {
		const content = html`
			<h3>Dakisolatieverantwoordelijkheid</h3>
			<p>De gegevensverwerkingsovereenkomst beschrijft de verantwoordelijkheidsverdeling tussen de isolatiewerkzaamhedenuitvoerder en de aanvrager. De voorwaarden staan op https://example.nl/mijn-dienst/aanvragen/dakisolatie/voorwaarden.</p>
			<ul>
				<li>Energiebesparingsberekening per woning</li>
				<li>Dakisolatiesubsidieaanvraagformulier</li>
			</ul>
		`;
		return html`
			<nldd-container
				layout="row"
				gap="24"
				vertical-alignment="top"
				lang="nl"
			>
				<div style="flex: 1;">
					<nldd-text
						size="sm"
						weight="bold"
						line-height="tight"
					>
						Zonder afbreking (standaard)
					</nldd-text>
					<nldd-spacer size="8"></nldd-spacer>
					<div style="width: 280px; border: 1px dashed var(--semantics-dividers-color); padding: 16px;">
						<nldd-rich-text spacing=${args.spacing}>${content}</nldd-rich-text>
					</div>
				</div>
				<div style="flex: 1;">
					<nldd-text
						size="sm"
						weight="bold"
						line-height="tight"
					>
						Met <code>hyphens</code>
					</nldd-text>
					<nldd-spacer size="8"></nldd-spacer>
					<div style="width: 280px; border: 1px dashed var(--semantics-dividers-color); padding: 16px;">
						<nldd-rich-text spacing=${args.spacing} hyphens>${content}</nldd-rich-text>
					</div>
				</div>
			</nldd-container>
		`;
	},
	parameters: { controls: { disable: true } },
	name: 'Woordafbreking',
};

export const Lijsten = {
	render: (args: Record<string, any>) => html`
		<nldd-rich-text
			color=${args.color || nothing}
			spacing=${args.spacing}
			?centered=${args.centered}
		>
				<h3>Ongeordende lijst</h3>
				<p>Voeg bij je aanvraag toe:</p>
				<ul>
					<li>De offerte van de aannemer</li>
					<li>Een foto van het dak voor de isolatie</li>
					<li>De factuur van de werkzaamheden</li>
					<li>Een bewijs dat je eigenaar bent van de woning</li>
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
					<li>Log in bij Mijn Dienst</li>
					<li>Kies een nieuwe aanvraag voor dakisolatie</li>
					<li>Vul het aanvraagformulier volledig in</li>
					<li>Voeg de offerte en de foto van het dak toe</li>
					<li>Verstuur de aanvraag en bewaar de bevestiging</li>
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
			<h3>Begrippen</h3>
			<dl>
				<dt>Aanvrager</dt>
				<dd>De persoon die de aanvraag indient.</dd>
				<dt>Maatregel</dt>
				<dd>Dakisolatie, zoldervloerisolatie of een warmtepomp.</dd>
				<dt>Oppervlakte</dt>
				<dd>Het deel van het dak dat je isoleert, in vierkante meters.</dd>
				<dd>Zonder dakramen en dakkapellen.</dd>
			</dl>
		`;
		return html`
			<nldd-container gap="32">
				<nldd-container>
					<nldd-text
						size="sm"
						weight="bold"
						line-height="tight"
					>
						sm (&lt; 641px) — gestapeld
					</nldd-text>
					<nldd-spacer size="8"></nldd-spacer>
					<div style="width: 393px; border: 1px dashed var(--semantics-dividers-color); padding: 16px;">
						<nldd-rich-text color=${args.color || nothing} spacing=${args.spacing} ?centered=${args.centered}>${content}</nldd-rich-text>
					</div>
				</nldd-container>
				<nldd-container>
					<nldd-text
						size="sm"
						weight="bold"
						line-height="tight"
					>
						md (≥ 641px) — term links (240px), definitie rechts
					</nldd-text>
					<nldd-spacer size="8"></nldd-spacer>
					<div style="width: 834px; border: 1px dashed var(--semantics-dividers-color); padding: 16px;">
						<nldd-rich-text color=${args.color || nothing} spacing=${args.spacing} ?centered=${args.centered}>${content}</nldd-rich-text>
					</div>
				</nldd-container>
				<nldd-container>
					<nldd-text
						size="sm"
						weight="bold"
						line-height="tight"
					>
						lg (≥ 1008px) — term links (240px), definitie rechts
					</nldd-text>
					<nldd-spacer size="8"></nldd-spacer>
					<div style="width: 1200px; border: 1px dashed var(--semantics-dividers-color); padding: 16px;">
						<nldd-rich-text color=${args.color || nothing} spacing=${args.spacing} ?centered=${args.centered}>${content}</nldd-rich-text>
					</div>
				</nldd-container>
			</nldd-container>
		`;
	},
};

export const InlineElementen = {
	render: (args: Record<string, any>) => html`
		<nldd-rich-text
			color=${args.color || nothing}
			spacing=${args.spacing}
			?centered=${args.centered}
		>
				<h3>Inline elementen</h3>
				<p>Dit is een paragraaf met <strong>vetgedrukte tekst</strong> en <em>schuingedrukte tekst</em>.</p>
				<p>Hier staat een link naar <a href="#">Aanvraag A-1042</a> in de tekst.</p>
				<p>Dit is een stukje <code>inline code</code> in een paragraaf.</p>
				<p>Dit is <mark>gemarkeerde tekst</mark> die extra aandacht verdient.</p>
				<p>Combinaties zijn ook mogelijk: <strong>vet en <em>vet schuins</em></strong> of een vetgedrukte link naar <a href="#"><strong>Dossier D-318</strong></a>.</p>
			</nldd-rich-text>
	`,
};

export const Citaat = {
	render: (args: Record<string, any>) => html`
		<nldd-rich-text
			color=${args.color || nothing}
			spacing=${args.spacing}
			?centered=${args.centered}
		>
				<h3>Beoordeling van Aanvraag A-1042</h3>
				<p>In de beoordeling van team Uitvoering staat het volgende:</p>
				<blockquote>
					De offerte beschrijft isolatie van het hele schuine dak, met een isolatiewaarde die past bij de voorwaarden. De foto laat zien dat de oude isolatie is verwijderd, dus de aanvraag kan door naar het besluit over de hoogte van de bijdrage.
				</blockquote>
				<p>Dit citaat vormt de basis voor het besluit over de aanvraag.</p>
			</nldd-rich-text>
	`,
};

export const Figuur = {
	render: (args: Record<string, any>) => html`
		<nldd-rich-text
			color=${args.color || nothing}
			spacing=${args.spacing}
			?centered=${args.centered}
		>
				<h3>Aanvragen per maatregel</h3>
				<p>Onderstaande afbeelding toont hoe de aanvragen in Dossier D-318 verdeeld zijn over de maatregelen.</p>
				<figure>
					<img
						src="https://placehold.co/800x400"
						alt="Verdeling van de aanvragen per maatregel"
					/>
					<figcaption>Figuur 1 — Verdeling van de aanvragen per maatregel</figcaption>
				</figure>
				<p>Uit de afbeelding blijkt dat dakisolatie de meeste aanvragen krijgt.</p>
			</nldd-rich-text>
	`,
};

export const Tabel = {
	render: (args: Record<string, any>) => html`
		<nldd-rich-text
			color=${args.color || nothing}
			spacing=${args.spacing}
			?centered=${args.centered}
		>
				<h3>Bijdrage per maatregel</h3>
				<p>De maximale bijdrage per aanvraag hangt af van de maatregel:</p>
				<table>
					<tr>
						<th>Maatregel</th>
						<th>Maximale bijdrage</th>
						<th>Minimale oppervlakte</th>
					</tr>
					<tr>
						<td>Dakisolatie</td>
						<td>€ 1.234</td>
						<td>20 m²</td>
					</tr>
					<tr>
						<td>Zoldervloerisolatie</td>
						<td>€ 768</td>
						<td>20 m²</td>
					</tr>
					<tr>
						<td>Warmtepomp</td>
						<td>€ 2.368</td>
						<td>Geen</td>
					</tr>
				</table>
			</nldd-rich-text>
	`,
};

export const Codeblok = {
	render: (args: Record<string, any>) => html`
		<nldd-container max-width="560px">
			<nldd-rich-text
				color=${args.color || nothing}
				spacing=${args.spacing}
				?centered=${args.centered}
			>
				<h3>Codeblok</h3>
				<p>Een markdown-renderer levert een fenced block als <code>&lt;pre&gt;&lt;code&gt;</code> aan. Het kader zit op de <code>pre</code>, de chip blijft voor inline code.</p>
				<pre><code>const bijdrage = berekenBijdrage(aanvraag);
if (bijdrage > 0) {
  console.log(bijdrage);
}</code></pre>
				<p>Een regel die niet past scrollt binnen het blok in plaats van de kaart eromheen op te rekken.</p>
				<pre><code>const uitkomst = await client.beoordeel('A-1042', { maatregel: 'dakisolatie', oppervlakte: 48, eigenaar: true });</code></pre>
				<p>Zonder <code>&lt;code&gt;</code> is <code>pre</code> preformatted tekst die geen code is:</p>
				<pre>aanvraag
├── maatregel
└── oppervlakte</pre>
			</nldd-rich-text>
		</nldd-container>
	`,
};

export const CodeblokOpTinted = {
	name: 'Codeblok op tinted vlak',
	render: (args: Record<string, any>) => html`
		<div style="max-width: 420px; padding: 16px; border-radius: 12px; background: var(--semantics-surfaces-tinted-background-color);">
			<nldd-rich-text
				color=${args.color || nothing}
				spacing=${args.spacing}
				?centered=${args.centered}
			>
				<p>Het blok heeft dezelfde achtergrond als dit vlak, dus alleen de ring scheidt de twee.</p>
				<pre><code>const a = 1;
const b = 2;</code></pre>
			</nldd-rich-text>
		</div>
	`,
};

export const Scheidingslijn = {
	render: (args: Record<string, any>) => html`
		<nldd-rich-text
			color=${args.color || nothing}
			spacing=${args.spacing}
			?centered=${args.centered}
		>
				<h3>Eerste stap: beoordeling</h3>
				<p>Team Uitvoering kijkt of de offerte en de foto van het dak passen bij de voorwaarden voor dakisolatie.</p>
				<hr>
				<h3>Tweede stap: besluit</h3>
				<p>Je krijgt het besluit in Mijn Dienst, met het bedrag dat je ontvangt en wanneer het wordt betaald.</p>
			</nldd-rich-text>
	`,
};

export const Witruimte = {
	render: () => html`
		<nldd-container gap="48">
			<nldd-container>
				<nldd-text
					size="sm"
					weight="bold"
					line-height="tight"
				>
					flat
				</nldd-text>
				<nldd-spacer size="8"></nldd-spacer>
				<nldd-rich-text spacing="flat">
					<h3>Wat telt als dakisolatie</h3>
					<p>Je aanvraag gaat over een van deze maatregelen:</p>
					<ul>
						<li><strong>dakisolatie:</strong> isolatie aan de binnen- of buitenkant van een schuin of plat dak;</li>
						<li><strong>zoldervloerisolatie:</strong> isolatie op de vloer van een zolder die je niet verwarmt;</li>
					</ul>
				</nldd-rich-text>
			</nldd-container>
			<nldd-container>
				<nldd-text
					size="sm"
					weight="bold"
					line-height="tight"
				>
					tight
				</nldd-text>
				<nldd-spacer size="8"></nldd-spacer>
				<nldd-rich-text spacing="tight">
					<h3>Wat telt als dakisolatie</h3>
					<p>Je aanvraag gaat over een van deze maatregelen:</p>
					<ul>
						<li><strong>dakisolatie:</strong> isolatie aan de binnen- of buitenkant van een schuin of plat dak;</li>
						<li><strong>zoldervloerisolatie:</strong> isolatie op de vloer van een zolder die je niet verwarmt;</li>
					</ul>
				</nldd-rich-text>
			</nldd-container>
			<nldd-container>
				<nldd-text
					size="sm"
					weight="bold"
					line-height="tight"
				>
					snug (default)
				</nldd-text>
				<nldd-spacer size="8"></nldd-spacer>
				<nldd-rich-text spacing="snug">
					<h3>Wat telt als dakisolatie</h3>
					<p>Je aanvraag gaat over een van deze maatregelen:</p>
					<ul>
						<li><strong>dakisolatie:</strong> isolatie aan de binnen- of buitenkant van een schuin of plat dak;</li>
						<li><strong>zoldervloerisolatie:</strong> isolatie op de vloer van een zolder die je niet verwarmt;</li>
					</ul>
				</nldd-rich-text>
			</nldd-container>
			<nldd-container>
				<nldd-text
					size="sm"
					weight="bold"
					line-height="tight"
				>
					loose
				</nldd-text>
				<nldd-spacer size="8"></nldd-spacer>
				<nldd-rich-text spacing="loose">
					<h3>Wat telt als dakisolatie</h3>
					<p>Je aanvraag gaat over een van deze maatregelen:</p>
					<ul>
						<li><strong>dakisolatie:</strong> isolatie aan de binnen- of buitenkant van een schuin of plat dak;</li>
						<li><strong>zoldervloerisolatie:</strong> isolatie op de vloer van een zolder die je niet verwarmt;</li>
					</ul>
				</nldd-rich-text>
			</nldd-container>
		</nldd-container>
	`,
};

export const VolledigArtikel = {
	render: (args: Record<string, any>) => html`
		<nldd-rich-text
			color=${args.color || nothing}
			spacing=${args.spacing}
			?centered=${args.centered}
		>
				<h1>Dakisolatie aanvragen</h1>
				<h2>Voorwaarden</h2>
				<h3>Wat telt als dakisolatie</h3>
				<p>Je aanvraag gaat over een van deze maatregelen:</p>
				<ul>
					<li><strong>dakisolatie:</strong> isolatie aan de binnen- of buitenkant van een schuin of plat dak;</li>
					<li><strong>zoldervloerisolatie:</strong> isolatie op de vloer van een zolder die je niet verwarmt;</li>
					<li><strong>warmtepomp:</strong> een installatie die warmte uit de lucht, de bodem of water haalt;</li>
					<li><strong>offerte:</strong> de prijsopgave van de aannemer voor de maatregel;</li>
				</ul>
				<h3>Wie een aanvraag kan doen</h3>
				<p>Je kunt een aanvraag indienen voor de isolatie van je dak als:</p>
				<ol>
					<li>je eigenaar bent van de woning;</li>
					<li>je zelf in de woning woont;</li>
					<li>de werkzaamheden nog niet zijn begonnen.</li>
				</ol>
				<blockquote>
					Isoleer eerst en verwarm daarna: een goed geïsoleerd dak maakt een warmtepomp zuiniger.
				</blockquote>
				<h2>Bijdrage</h2>
				<h3>Bedragen per maatregel</h3>
				<p>De maximale bijdrage per aanvraag is als volgt:</p>
				<table>
					<tr>
						<th>Maatregel</th>
						<th>Maximale bijdrage</th>
						<th>Minimale oppervlakte</th>
					</tr>
					<tr>
						<td>Dakisolatie</td>
						<td>€ 1.234</td>
						<td>20 m²</td>
					</tr>
					<tr>
						<td>Warmtepomp</td>
						<td>€ 2.368</td>
						<td>Geen</td>
					</tr>
				</table>
				<h3>Je aanvraag volgen</h3>
				<p>Bekijk de <a href="#">status van Aanvraag A-1042</a> of lees de <a href="#">voorwaarden voor dakisolatie</a>.</p>
				<figure>
					<img
						src="https://placehold.co/800x400"
						alt="Overzicht van de stappen van een aanvraag"
					/>
					<figcaption>Figuur 1 — Schematisch overzicht van de stappen van een aanvraag</figcaption>
				</figure>
			</nldd-rich-text>
	`,
};

export const AlleGrootten = {
	render: (args: Record<string, any>) => html`
		<nldd-container gap="32">
			<nldd-container>
				<nldd-text
					size="sm"
					weight="bold"
					line-height="tight"
				>
					sm (&lt; 641px) — beperkt tot 393px
				</nldd-text>
				<nldd-spacer size="8"></nldd-spacer>
				<div style="width: 393px; border: 1px dashed var(--semantics-dividers-color); padding: 16px;">
					<nldd-rich-text
						color=${args.color || nothing}
						spacing=${args.spacing}
						?centered=${args.centered}
					>
						<h2>Wat telt als dakisolatie</h2>
						<p>Je aanvraag gaat over een van deze maatregelen:</p>
						<ul>
							<li><strong>dakisolatie:</strong> isolatie aan de binnen- of buitenkant van een schuin of plat dak;</li>
							<li><strong>zoldervloerisolatie:</strong> isolatie op de vloer van een zolder die je niet verwarmt;</li>
						</ul>
					</nldd-rich-text>
				</div>
			</nldd-container>
			<nldd-container>
				<nldd-text
					size="sm"
					weight="bold"
					line-height="tight"
				>
					md (≥ 641px) — beperkt tot 834px
				</nldd-text>
				<nldd-spacer size="8"></nldd-spacer>
				<div style="width: 834px; border: 1px dashed var(--semantics-dividers-color); padding: 16px;">
					<nldd-rich-text
						color=${args.color || nothing}
						spacing=${args.spacing}
						?centered=${args.centered}
					>
						<h2>Wat telt als dakisolatie</h2>
						<p>Je aanvraag gaat over een van deze maatregelen:</p>
						<ul>
							<li><strong>dakisolatie:</strong> isolatie aan de binnen- of buitenkant van een schuin of plat dak;</li>
							<li><strong>zoldervloerisolatie:</strong> isolatie op de vloer van een zolder die je niet verwarmt;</li>
						</ul>
					</nldd-rich-text>
				</div>
			</nldd-container>
			<nldd-container>
				<nldd-text
					size="sm"
					weight="bold"
					line-height="tight"
				>
					lg (≥ 1008px) — beperkt tot 1200px
				</nldd-text>
				<nldd-spacer size="8"></nldd-spacer>
				<div style="width: 1200px; border: 1px dashed var(--semantics-dividers-color); padding: 16px;">
					<nldd-rich-text
						color=${args.color || nothing}
						spacing=${args.spacing}
						?centered=${args.centered}
					>
						<h2>Wat telt als dakisolatie</h2>
						<p>Je aanvraag gaat over een van deze maatregelen:</p>
						<ul>
							<li><strong>dakisolatie:</strong> isolatie aan de binnen- of buitenkant van een schuin of plat dak;</li>
							<li><strong>zoldervloerisolatie:</strong> isolatie op de vloer van een zolder die je niet verwarmt;</li>
						</ul>
					</nldd-rich-text>
				</div>
			</nldd-container>
		</nldd-container>
	`,
	name: 'Alle groottes (container query)',
};

/**
 * Drie breedtezones: tekst, blockquotes, codeblokken en componenten lezen op de
 * `main`-maat, media, tabellen (ook `nldd-table`) en `nldd-step-bar` krijgen
 * het `wide`-accent, en `nldd-collection` en `nldd-container` krijgen de
 * volle breedte (`full`): beschikbaar, niet geforceerd, dankzij
 * `justify-self: start`. Per kind te overschrijven met
 * `data-rich-text-width="main" | "wide" | "full"`; de laatste paragraaf hieronder
 * staat bewust op wide. Zet `centered` aan voor de symmetrische variant.
 */
export const Breedtezones = {
	render: (args: Record<string, any>) => html`
		<nldd-rich-text
			color=${args.color || nothing}
			spacing=${args.spacing}
			?centered=${args.centered}
		>
			<h2>Bijdrage per maatregel</h2>
			<p>De hoogte van de bijdrage hangt af van de maatregel en de oppervlakte die je isoleert. Onderstaande tabel toont de maximale bedragen per aanvraag; de tabel krijgt het wide-accent.</p>
			<table>
				<thead>
					<tr><th>Maatregel</th><th>Oppervlakte</th><th>Maximale bijdrage</th></tr>
				</thead>
				<tbody>
					<tr><td>Dakisolatie</td><td>vanaf 20 m²</td><td>€ 1.234</td></tr>
					<tr><td>Warmtepomp</td><td>niet van toepassing</td><td>€ 2.368</td></tr>
				</tbody>
			</table>
			<p>Afbeeldingen krijgen het wide-accent: iets breder dan de tekst, zonder de pagina te domineren.</p>
			<img
				src="sample-images/butterfly-960.jpg"
				alt="Vlinder op een bloem"
			>
			<p>Componenten zoals een banner horen bij de tekst en worden niet breder dan de main-maat.</p>
			<nldd-banner
				variant="accent"
				text="Een component blijft binnen de leesbreedte"
			></nldd-banner>
			<p data-rich-text-width="wide">Deze paragraaf staat bewust op <code>data-rich-text-width="wide"</code> en leest dus iets breder dan de main-maat — de per-item override wint van elke default.</p>
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
		<nldd-container gap="16">
			<div style="background: var(--semantics-categories-donkerblauw-filled-background-color); color: var(--semantics-categories-donkerblauw-filled-content-color); padding: 24px; border-radius: var(--primitives-corner-radius-md);">
				<nldd-rich-text color="inherit">
					<h3>Op een donker vlak</h3>
					<p>Alle tekst erft de contentkleur van het vlak, inclusief <a href="#">links met hun onderstreping</a> en <strong>nadruk</strong>.</p>
					<figure>
						<img
							src="sample-images/butterfly-480.jpg"
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
		</nldd-container>
	`,
	parameters: { controls: { disable: true } },
};
