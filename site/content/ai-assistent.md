# Werken met een AI-assistent

Een AI-assistent die het designsysteem niet kent, raadt naar tags en attributen of bouwt een component na die er al is. De `nldd-design-system`-plugin geeft hem de kennis die ook op deze site staat: welke componenten er zijn, wat hun attributen, slots en events zijn, en hoe de patronen ze samenstellen.

De plugin is er voor Claude Code en voor Cursor. Je hebt hem niet nodig om met het systeem te bouwen.

## Installeren in Claude Code

{{skillsInstall}}

Een nieuwere versie haal je binnen met:

```text
/plugin marketplace update nldd
```

## Installeren in Cursor

Importeer de marketplace via **Dashboard → Settings → Plugins → Import** met de repository `NederlandseDigitaleDienst/ai-plugins`, en zet daarna `nldd-design-system` aan.

Deze route is in Claude Code gemeten en in Cursor nog niet. Loopt hij bij jou anders, meld het dan in een [issue](https://github.com/NederlandseDigitaleDienst/ai-plugins/issues).

## Wat erin zit

De plugin levert vijf skills. De assistent kiest zelf welke hij nodig heeft.

{{skillsTable}}

In Claude Code roep je er ook zelf een aan, met `/nldd-design`.

## Waar de kennis vandaan komt

De skills zijn geen losse documentatie die naast de site wordt bijgehouden.

- De componentreferentie in de skills wordt gegenereerd uit dezelfde broncode als de [componentpagina's](/componenten/) hier.
- De patronen in de skills zijn dezelfde tekst en dezelfde voorbeeldmarkup als de [patronen](/patronen/) hier.
- Bij elke wijziging aan het systeem controleert een geautomatiseerde test of die twee nog bij hun bron passen, en of elke tag en elk attribuut in de voorbeelden echt bestaat.
- De changelog en de [ontwerprichtlijnen](/richtlijnen/) in de skills worden bij elke release ververst.

Een assistent met deze skills schrijft daardoor markup die klopt met de versie die je hebt geïnstalleerd. Controleren blijft jouw werk: bekijk het resultaat in een browser, met het toetsenbord en op een smal scherm.

## Kwam je van de oude plugin?

Heette de plugin bij jou nog `nldd@nldd-plugins`, dan staan de stappen om over te gaan in de [README](https://github.com/NederlandseDigitaleDienst/design-system#heb-je-de-plugin-al-als-nlddnldd-plugins). De oude naam werkt tot 1 maart 2027.
