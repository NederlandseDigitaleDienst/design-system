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
  `digitaledienst.overheid.nl`. De workflow geeft die drie bij elke uitrol
  mee. Een eigen domein moet per project door het ZAD-team worden
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
| `ZAD_API_KEY` | secret | Token van een service account in het ZAD-project, rol `Ops CI` |
| `ZAD_PROJECT_ID` | variable | `nd-1i5` |

Het GHCR-package `design-system-www` is openbaar, zodat ZAD het image zonder
inloggegevens kan ophalen.
