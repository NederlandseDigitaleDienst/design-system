# Uitrollen naar ZAD

De website in `www/` draait op ZAD (Zelfservice Applicatie Deployment) op
`design.digitaledienst.overheid.nl`, als rootless nginx-container met de
gebouwde pagina erin. Storybook blijft op GitHub Pages.

## Hoe het werkt

`.github/workflows/deploy-www.yml` draait bij elke push naar `main`. De
workflow bouwt de pagina met `npm run build:www`, bouwt daar met
`deploy/Dockerfile` een image omheen en pusht dat naar
`ghcr.io/nederlandsedigitaledienst/design-system-www:<commit>`. Daarna rolt
de action `RijksICTGilde/zad-actions/deploy` dat image uit op de deployment
`productie`.

De image-tag is de commit. Een nieuwe tag verandert de pod-spec, en alleen dan
start ZAD een nieuwe pod; met `latest` gebeurt dat niet.

De GitHub-environment `productie` hoort alleen de branch `main` toe te laten
(Settings, Environments). De workflow is ook handmatig te starten; vanaf een
andere branch weigert GitHub dan de uitrol.

## Preview per pull request

`.github/workflows/deploy-www-preview.yml` zet elke pull request die de
pagina raakt (`www/`, `deploy/` of een van de twee workflows) op een eigen
ZAD-deployment `pr-<nummer>`, met hetzelfde image, dezelfde nginx-config en
dezelfde CSP als productie. De link komt in een reactie op de PR:

```text
https://pr-<nummer>-nd-1i5.rig.prd1.gn2.quattro.rijksapps.nl
```

Een PR die alleen `src/` raakt krijgt geen preview: dat is bijna elke PR, en
daarvoor is Storybook er. In het preview-image staat een `robots.txt` die
zoekmachines weert.

Een pull request uit een fork of van Dependabot krijgt geen preview: die heeft
geen toegang tot de secrets. De pagina wordt dan wel gelint en gebouwd.

Bij het sluiten van de PR gaan de deployment, de reactie en de images
`pr-<nummer>-<sha>` weg.

De preview gebruikt een eigen token (`ZAD_PREVIEW_API_KEY`, rol
`Developer CI`): die mag deployments aanmaken, maar niet aan productie komen.
Het productietoken staat alleen in de environment `productie`.

## Het image

- `nginx.conf` serveert de pagina op poort 8080, met `/healthz` voor de health
  check. De pagina zelf staat op `Cache-Control: no-cache`; alles onder
  `assets/` heeft een hash in de naam van Vite en mag dus voor altijd in de
  cache.
- `security-headers.conf` zet HSTS, de Content-Security-Policy en de overige
  beveiligingsheaders. Alles komt van de site zelf. Een script of afbeelding
  van een ander adres blokkeert de browser zonder melding op de pagina: voeg
  de herkomst dan toe aan de CSP.
- `.dockerignore` houdt de build-context bij `deploy/` en `www-dist/`.

Lokaal testen:

```sh
npm run build:www
docker build -f deploy/Dockerfile -t nldd-www .
docker run --rm -p 8081:8080 nldd-www   # http://localhost:8081
```

## ZAD-configuratie

- Project `nd-1i5` (NLDD Designsysteem), deployment `productie`, component
  `website` op poort 8080 met de service `publish-on-web`.
- Health check op de component: `http`, poort 8080, liveness en readiness
  allebei op `/healthz`. Gezet met
  `zadctl service config set health-check --target component -c website`.
- Webadres: formaat `subdomain`, subdomein `design`, basisdomein
  `digitaledienst.overheid.nl`. Die staan op de deployment zelf, gezet bij
  `zadctl deployment create`; de workflow vervangt alleen het image, want
  meer mag een token met de rol `Ops CI` niet. Een eigen domein moet per project door het ZAD-team worden
  goedgekeurd; tot die tijd staat de site op het standaardadres van ZAD en
  geeft de workflow een waarschuwing.

Bekijken wat er draait:

```sh
zadctl project use nd-1i5
zadctl deployment describe productie
zadctl logs productie -c website
```

`zadctl project use` schrijft de API-key naar `.env.zadctl` in de map waar je
het commando draait. Dat bestand staat in `.gitignore`.

## GitHub-instellingen voor de workflow

| Naam | Soort | Inhoud |
| --- | --- | --- |
| `ZAD_API_KEY` | secret van de environment `productie` | Token van service account `github-actions`, rol `Ops CI` |
| `ZAD_PREVIEW_API_KEY` | secret van de repository | Token van service account `github-actions-preview`, rol `Developer CI` |
| `ZAD_PROJECT_ID` | variable | `nd-1i5` |

De environment `productie` laat alleen de branch `main` toe.

Het GHCR-package `design-system-www` is openbaar, zodat ZAD het image zonder
inloggegevens kan ophalen. De repository heeft er `Admin`-toegang op (package
settings, Manage Actions access): schrijven voor de push, admin om de
preview-images op te ruimen.
