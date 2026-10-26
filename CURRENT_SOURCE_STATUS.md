# Status van de Inspector-bron

Meetdatum: 26 oktober 2026 (Europe/Amsterdam)

## Aantoonbaar vastgesteld

- De live Inspector bevat onder meer **Planning en agenda**, **Werkvoorraad** en de
  **Commerciële pipeline**.
- De bron onder `src/` en de volledige Git-geschiedenis bevatten niet alle actuele livefunctionaliteit.
- Lokale projectmappen, lokale archieven, TransIP-back-ups en de beschikbare NAS-mappen bevatten
  geen volledige, actuele TypeScript/React-bron.
- Er is geen sourcemap bij de actuele JavaScript-bundel aangetroffen.
- `production-snapshot/` is een byte-identieke kopie van de werkende publicatie van 26 oktober 2026.
- De snapshot bevat één Supabase **publishable** sleutel en geen `sb_secret_`- of `service_role`-sleutel.

## Bescherming tegen regressie

`npm run build` publiceert niet langer de achterlopende `src/`-versie. Het controleert de hashes,
essentiële functiemarkeringen en assetverwijzingen van `production-snapshot/` en kopieert daarna
alleen die snapshot naar `dist/`.

## Nog open

De oorspronkelijke, niet-geminificeerde bron van de huidige productieversie is niet teruggevonden.
De snapshot is daarom wel reproduceerbaar en veilig publiceerbaar, maar niet prettig onderhoudbaar.

Herstelvolgorde:

1. Zoek de machine, chat of externe opslag van waaruit de liveversie destijds is gebouwd.
2. Vergelijk een gevonden bronbuild met de snapshot op alle kernfuncties en Supabase-gedrag.
3. Vervang pas daarna `src/`, verwijder de tijdelijke snapshotbouw en laat een volledige regressietest lopen.

Tot dat moment is `production-snapshot/` de enige geautoriseerde productiebasis.
