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

## Voor en na vergelijken

De linter ziet niet alles. `nldd compare` fotografeert twee versies van je site en omlijnt wat veranderde.

```bash
npx @nldd/design-system@latest compare oud/dist nieuw/dist --out vergelijking
```

Een versie is een map met een gebouwde site, of het adres van een draaiende app. Hiervoor moet Playwright in je project staan.

## Een pull request bij elke release

De workflow `upgrade.yml` draait de opdracht in je repository en opent een pull request met het verslag als tekst. Een nieuwere release werkt die pull request bij.

```yaml
on:
  schedule:
    - cron: '0 6 * * 1'
jobs:
  upgrade:
    uses: NederlandseDigitaleDienst/design-system/.github/workflows/upgrade.yml@main
    permissions:
      contents: write
      pull-requests: write
```

Zonder token van een app of een bot opent `github-actions[bot]` de pull request. Dan draait je eigen CI er niet op. Geef de workflow een token als je dat wel wilt.

Je organisatie moet een workflow uit een andere repository toestaan. Dat staat onder **Settings**, **Actions**, **General**. Staat daar dat alleen eigen acties mogen, dan faalt de aanroep.

`@main` neemt elke wijziging aan de workflow meteen mee. Wil je dat niet, zet dan een versie achter de naam, zoals `upgrade.yml@v0.28.0`, en verhoog die zelf.

### Met een agent

Met `agent: true` werkt een agent de lijst af voordat de pull request opengaat. Hij volgt de skill van dezelfde versie, draait de CI van je project en schrijft zijn keuzes onder het verslag. Daarna leest de opdracht je project opnieuw, zodat het verslag zegt wat de linter nog vindt.

```yaml
    with:
      agent: true
    secrets:
      anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

De agent krijgt geen token van je repository, en de sleutel van het model blijft buiten de opdrachten die hij draait. Zet hem aan voor een repository waarvan je de inhoud vertrouwt. Het model staat vast, standaard `claude-opus-5-5`, en de pull request noemt het.

Bouwt je project naar een statische site, dan komen er ook beelden van voor en na onder de pull request. De agent zoekt uit hoe je site bouwt, of je geeft het mee met `build` en `site`.

## Na een release, zonder dat je iets doet

Het designsysteem kan je repository na elke release zelf een pull request sturen. De app **NLDD Designsysteem** opent die pull request, en daarom draait je eigen CI erop.

### De app installeren

Dit doet een eigenaar van je organisatie, één keer.

1. Open [github.com/apps/nldd-designsysteem](https://github.com/apps/nldd-designsysteem) en kies **Install**.
2. Kies je organisatie.
3. Kies **Only select repositories** en vink de repositories aan die het designsysteem gebruiken.
4. Kies **Install**.

Een repository erbij of eraf zet je later onder de instellingen van je organisatie, bij **GitHub Apps**.

Open daarna een issue in de repository van het designsysteem met de repositories die op de lijst moeten. Zonder plek op de lijst doet de app niets.

### Wat de app mag

| Recht | Waarvoor |
|---|---|
| Inhoud, schrijven | De branch `nldd/design-system-upgrade` pushen, en de beelden van voor en na op `refs/nldd/pictures` |
| Pull requests, schrijven | De pull request openen, bijwerken of sluiten, en de reacties eronder |
| Workflows, schrijven | Een versie bijwerken die in een workflow staat, zoals de versie in een `npx`-regel |
| Metadata, lezen | Dit vraagt elke app |

De app heeft geen webhook en luistert naar niets in je repository. Hij doet alleen iets na een release van het designsysteem, of als de beheerders van het designsysteem hem met de hand starten. Hij schrijft alleen op die ene branch, en je main raakt hij niet aan.

Staat de agent aan voor je repository, dan krijgt die het token van de app niet. Hij werkt in een kloon zonder token, en de push gebeurt in een stap na hem.

### Met een eigen app

Wil je liever je eigen app, gebruik dan de workflow `upgrade.yml` in je eigen repository en geef die app mee:

```yaml
    with:
      app_client_id: ${{ vars.UPGRADE_APP_CLIENT_ID }}
    secrets:
      app_private_key: ${{ secrets.UPGRADE_APP_KEY }}
```

Je app vraagt dezelfde rechten als in de tabel hierboven.
