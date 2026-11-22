# Upgraden

`nldd upgrade` brengt je project naar een nieuwe versie. Hij doet wat zeker is, en schrijft de rest op.

```bash
npx @nldd/design-system@latest upgrade
```

De opdracht upgradet naar zijn eigen versie. Wil je naar een bepaalde versie, noem die dan: `npx @nldd/design-system@0.27.1 upgrade`.

## Wat hij doet

- Hij zet de nieuwe versie overal waar je project haar noemt: in `package.json`, in een vastgelegde versie en in de adressen van een CDN.
- Hij werkt de lockfile bij.
- Hij past elke fix toe die zeker is, zoals een hernoemd attribuut, een hernoemde tag of een hernoemd event.
- Wat overblijft, schrijft hij op als werklijst. Bij elke plek staat het bestand en de regel.

Een keuze maakt hij nooit. Waar de bron niet zegt wat er komt te staan, staat de plek op de lijst.

## Het verslag

Met `--report` schrijft de opdracht het verslag naar een bestand. Dat is de tekst van een pull request.

```bash
npx @nldd/design-system@latest upgrade --install --report upgrade.md
```

- **Nog te doen.** Plekken waar iemand moet kiezen. Een fout breekt iets, een waarschuwing hoort bij deze upgrade.
- **Niet te beslissen in de bron.** De inhoud van een element komt uit een variabele. Lees de draaiende app met `--url` om te zien wat er staat.
- **Brekende wijzigingen onderweg.** De wijzigingen uit de changelog die een component noemen dat je gebruikt.
- **Stond er al.** Waarschuwingen die je project al had. Ze horen niet bij deze upgrade.

Met `--install` installeert hij ook de afhankelijkheden, zonder hun scripts. Dan leest de linter de typen van je project. In een React-app maakt dat veel plekken op de lijst zeker.

## De lijst afwerken

Dat doe je zelf, of met de skill `nldd-design-upgrade` in Claude Code of Cursor. Bewaar de eerste run als JSON, dan zie je daarna wat er nog openstaat:

```bash
npx @nldd/design-system@latest upgrade --install --format json > upgrade.json
# de lijst afwerken
npx @nldd/design-system@latest upgrade --since upgrade.json --report upgrade.md
```

De tweede run verandert niets aan je project. Hij leest het opnieuw en zegt per regel hoeveel plekken er waren en hoeveel er nu zijn.

## Workarounds die weg kunnen

Bouw je om iets heen wat het designsysteem nog niet kan, zet dan het issue erbij, in een commentaar naast de workaround: `NLDD #447`, `design-system#447` of het adres van het issue.

```js
// Weg als NLDD #447 is opgelost: de zijbalk blijft nog niet staan bij scrollen.
```

`nldd upgrade` vindt die commentaren in elk bestand en vraagt GitHub naar het issue. Is het opgelost in de versie waar je heen gaat, dan staat de workaround onder "Workarounds" in het verslag: die kan weg. Kijk wel na of de oplossing dekt wat je workaround deed.

## Voor en na vergelijken

De linter ziet niet alles. `nldd compare` fotografeert twee versies van je site en omlijnt wat veranderde.

```bash
npx @nldd/design-system@latest compare oud/dist nieuw/dist --out vergelijking
```

Een versie is een map met een gebouwde site, of het adres van een draaiende app. Hiervoor moet Playwright in je project staan.

## Een pull request bij elke release

De action `upgrade` draait de opdracht in je repository en opent een pull request met het verslag als tekst. Staat die pull request nog open bij een nieuwere release, dan gaat de action erop verder: `main` gaat erin, de nieuwe versie komt erbovenop, en wat jij of de agent er al deed blijft staan. Botst `main` met de branch buiten de lockfiles, dan gaat hij verder zonder `main` en zegt hij waar het conflict zit. Staat je project er al zonder deze pull request, dan sluit hij hem. Sluit je hem zelf zonder te mergen, dan vraagt hij het pas weer bij de volgende minor.

Gebruik je Dependabot of Renovate, dan zet de eerste pull request in hun configuratie een uitzondering voor `@nldd/design-system`. Zij zouden alleen de versie ophogen, zonder de fixes, en een release die iets breekt zou je build breken. De andere afhankelijkheden houden ze gewoon bij. Zet dit in `.github/workflows/nldd-upgrade.yml`:

```yaml
on:
  schedule:
    - cron: '0 6 * * 1'
  workflow_dispatch:
jobs:
  upgrade:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    steps:
      - uses: NederlandseDigitaleDienst/design-system/upgrade@v{{version}}
```

De action kloont je repository zelf, dus een checkout is niet nodig. De tag zegt hoe de upgrade wordt afgeleverd. Naar welke versie je project gaat, is `version`: standaard de nieuwste op npm. Verhoog de tag zelf, of laat Dependabot dat doen.

Zonder token van een app of een bot opent `github-actions[bot]` de pull request. Dan draait je eigen CI er niet op. Geef een token mee als je dat wel wilt, met `token`, of een app met `app-client-id` en `app-private-key`.

Je organisatie moet een action uit een andere organisatie toestaan. Dat staat onder **Settings**, **Actions**, **General**. Staat daar dat alleen eigen acties mogen, dan faalt de stap.

### Met een agent

Met `agent: true` werkt een agent de lijst af voordat de pull request opengaat. Hij volgt de skill van dezelfde versie, draait de CI van je project en schrijft zijn keuzes onder het verslag. Daarna leest de opdracht je project opnieuw, zodat het verslag zegt wat de linter nog vindt.

```yaml
      - uses: NederlandseDigitaleDienst/design-system/upgrade@v{{version}}
        with:
          agent: true
          anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
```

De agent krijgt geen token van je repository. Zijn opdrachten draaien in een sandbox, zodat ze de sleutel van het model niet kunnen lezen. Sommige builds draaien daar niet in; zet dan `sandbox: false`, maar alleen voor een repository waarvan je de inhoud vertrouwt als je eigen. Het model staat vast, standaard `claude-opus-5-5`, en de pull request noemt het.

Bouwt je project naar een statische site, dan komen er ook beelden van voor en na onder de pull request. De agent zoekt uit hoe je site bouwt, of je geeft het mee met `build` en `site`.

### Als het designsysteem in de weg staat

Soms kan een upgrade niet goed binnen wat het designsysteem biedt: na de upgrade ziet iets er slechter uit of werkt het minder, en dat is alleen met een workaround te verhelpen. Dan schrijft de agent een bevinding voor een issue op het designsysteem, zonder je app te noemen, en zegt hij of die de upgrade blokkeert.

- **Een blokkerende bevinding zet de pull request op concept**, met bovenaan dat hij wacht op het designsysteem. Merge hem niet eerder.
- **De eerste run na de release die het oplost**, zet hem weer op klaar. Tot dan staat de bevinding in de tekst van de pull request, met het issue erbij.
- **Een bevinding die niet blokkeert**, wordt alleen gemeld.

Draai je de action zelf, dan krijg je per bevinding een link die het issue ingevuld opent. Lees het na en open het. Staat je repository op de lijst van het designsysteem, dan doet de vloot dat voor je: zie hieronder.

## Na een release, zonder dat je iets doet

Het designsysteem kan je repository na elke release zelf een pull request sturen: meteen na een release die iets kan breken, en op maandagochtend voor de kleinere releases van die week. Daarvoor installeer je de app en meld je je repository aan. De app **NLDD Designsysteem** opent die pull request, en daarom draait je eigen CI erop.

### De app installeren

Dit doet een eigenaar van je organisatie, één keer.

1. Open [github.com/apps/nldd-designsysteem](https://github.com/apps/nldd-designsysteem) en kies **Install**.
2. Kies je organisatie.
3. Kies **Only select repositories** en vink de repositories aan die het designsysteem gebruiken.
4. Kies **Install**.

Een repository erbij of eraf zet je later onder de instellingen van je organisatie, bij **GitHub Apps**.

### Aanmelden

Zet daarna je repository op de lijst. Dat kan op twee manieren:

- **Met [het formulier](https://github.com/NederlandseDigitaleDienst/design-system/issues/new?template=fleet.yml).** Een workflow controleert of de app op je repository staat en maakt er een pull request van.
- **Met een eigen pull request** die een regel toevoegt aan [`fleet.json`](https://github.com/NederlandseDigitaleDienst/design-system/blob/main/fleet.json), op alfabet.

Een regel ziet er zo uit:

```json
{ "repository": "jouw-organisatie/jouw-app", "agent": true }
```

| Veld | Betekenis |
|---|---|
| `repository` | De repository, als eigenaar/naam |
| `agent` | Een agent werkt de lijst af voordat de pull request opengaat. Standaard niet |
| `build` en `site` | Hoe je site bouwt vanaf een schone checkout, en naar welke map, voor beelden van voor en na |
| `sandbox` | `false` draait de agent zonder sandbox. Alleen voor een repository die de beheerders vertrouwen als hun eigen |

Een fout in de regel faalt in je pull request, niet bij de volgende release. Afmelden is de regel weer weghalen, of de app van je repository halen.

Deze repositories staan er nu op:

{{fleetList}}

### Issues voor het designsysteem

Wat de agents in de hele vloot vinden, komt na elke ronde samen in één job van het designsysteem. Die opent per probleem één issue, met het label `uit-upgrade`, en `blocking` als het een upgrade tegenhoudt. Vond een andere app hetzelfde, ook in andere woorden, dan komt het als reactie bij het issue dat er al is. Elke pull request die erop wacht, krijgt een reactie met het issue, en het issue toont die pull requests. Een issue met `blocking` krijgt voorrang bij de beheerders: zolang het openstaat, wachten upgrades erop.

### Wat de app mag

| Recht | Waarvoor |
|---|---|
| Inhoud, schrijven | De branch `nldd/design-system-upgrade` pushen, en de beelden van voor en na op `refs/nldd/pictures` |
| Pull requests, schrijven | De pull request openen, bijwerken of sluiten, op concept zetten, en de reacties eronder |
| Workflows, schrijven | Een versie bijwerken die in een workflow staat, zoals de versie in een `npx`-regel |
| Metadata, lezen | Dit vraagt elke app |

De app heeft geen webhook en luistert naar niets in je repository. Hij doet alleen iets na een release van het designsysteem, of als de beheerders van het designsysteem hem met de hand starten. Hij schrijft alleen op die ene branch, en je main raakt hij niet aan.

Staat de agent aan voor je repository, dan krijgt die het token van de app niet. Hij werkt in een kloon zonder token, en de push gebeurt in een stap na hem.

### Met een eigen app

Wil je liever je eigen app, gebruik dan de action in je eigen repository en geef die app mee:

```yaml
      - uses: NederlandseDigitaleDienst/design-system/upgrade@v{{version}}
        with:
          app-client-id: ${{ vars.UPGRADE_APP_CLIENT_ID }}
          app-private-key: ${{ secrets.UPGRADE_APP_KEY }}
```

Je app vraagt dezelfde rechten als in de tabel hierboven.
