# Status van de Inspector-bron

Meetdatum: 26 oktober 2026 (Europe/Amsterdam)

## Uitgevoerd en bewezen

- De actuele productiebundel is succesvol geparseerd en opgesplitst in vijf afzonderlijk
  bouwbare TypeScript-compatibele React-modules onder `src/runtime/`.
- Betekenisvolle namen zijn hersteld voor de hoofdmodules, waaronder `InspectorWorkspace`,
  `PlanningWorkspace`, `PlanningCalendar`, `CommercialPipeline`, `AdminDashboard`,
  `QuoteCalculator`, `QuotePdfDocument`, `LoginScreen` en `InspectorApplication`.
- De vaste Supabase-URL en publishable sleutel zijn vervangen door Vite-omgevingsvariabelen.
- De nieuwe bronbuild bevat exact dezelfde 12.301 unieke runtime-teksten en dezelfde aantallen
  als de geverifieerde livebundel.
- De bronbuild bevat **Planning en agenda**, **Werkvoorraad** en de **Commerciële pipeline**.
- De lokale browsertest toont het actuele B2Inspect-inlogscherm zonder runtimefouten.
- TypeScript-controle, lintcontrole en de productiebuild slagen.
- `npm audit` rapporteert na gerichte updates en verwijdering van ongebruikte pakketten
  **0 bekende kwetsbaarheden**.
- De GitHub-controle voert voortaan ook TypeScript, lint en `npm audit` uit.
- `production-snapshot/` blijft beschikbaar als byte-identieke noodterugval.

## Herkomst en beperking

De oorspronkelijke modulaire TSX-bestanden en sourcemaps zijn niet teruggevonden in lokale
opslag, TransIP, NAS of Git-geschiedenis. De gereconstrueerde runtime is functioneel volledig en
opnieuw bouwbaar. Applicatiecode en teruggewonnen externe bibliotheekcode zijn nu gescheiden,
maar de bestandsindeling is niet bit-voor-bit gelijk aan het verloren origineel.

De oudere modulaire bron staat onder `legacy-src/` en mag niet rechtstreeks worden gepubliceerd.
De bewaarde monoliet onder `recovery/` wordt evenmin gebouwd. Nieuwe wijzigingen horen in de
verantwoordelijke module onder `src/runtime/`.

## Automatische bescherming

De GitHub-workflow bouwt voortaan de gereconstrueerde bron. De build wordt afgekeurd wanneer een
kernfunctie ontbreekt, de applicatiebundel niet correct is gekoppeld, een geheime Supabase-sleutel
in de clientcode terechtkomt, TypeScript of lint faalt, of `npm audit` een kwetsbaarheid van
minimaal gemiddelde ernst aantreft.
