# Status van de Inspector-bron

Meetdatum: 26 oktober 2026 (Europe/Amsterdam)

## Uitgevoerd en bewezen

- De actuele productiebundel is succesvol geparseerd en als leesbare TypeScript-compatibele
  React-runtime opgeslagen in `src/recovered/production-runtime.ts`.
- Betekenisvolle namen zijn hersteld voor de hoofdmodules, waaronder `InspectorWorkspace`,
  `PlanningWorkspace`, `PlanningCalendar`, `CommercialPipeline`, `AdminDashboard`,
  `QuoteCalculator`, `QuotePdfDocument`, `LoginScreen` en `InspectorApplication`.
- De vaste Supabase-URL en publishable sleutel zijn vervangen door Vite-omgevingsvariabelen.
- De nieuwe bronbuild bevat exact dezelfde 12.301 unieke runtime-teksten en dezelfde aantallen
  als de geverifieerde livebundel.
- De bronbuild bevat **Planning en agenda**, **Werkvoorraad** en de **Commerciële pipeline**.
- De lokale browsertest toont het actuele B2Inspect-inlogscherm zonder runtimefouten.
- TypeScript-controle, lintcontrole en de productiebuild slagen.
- `production-snapshot/` blijft beschikbaar als byte-identieke noodterugval.

## Herkomst en beperking

De oorspronkelijke modulaire TSX-bestanden en sourcemaps zijn niet teruggevonden in lokale
opslag, TransIP, NAS of Git-geschiedenis. De gereconstrueerde runtime is functioneel volledig en
opnieuw bouwbaar, maar bevat de externe bibliotheekcode nog inline. Het is dus geen bit-voor-bit
herstel van de oorspronkelijke bestandsindeling.

De oudere modulaire bron staat onder `legacy-src/` en mag niet rechtstreeks worden gepubliceerd.
Nieuwe wijzigingen horen bij voorkeur als kleine, geteste modules naast de gereconstrueerde runtime
te worden toegevoegd; bestaande delen kunnen vervolgens gecontroleerd uit de runtime worden gehaald.

## Automatische bescherming

De GitHub-workflow bouwt voortaan de gereconstrueerde bron. De build wordt afgekeurd wanneer een
kernfunctie ontbreekt, de applicatiebundel niet correct is gekoppeld of een geheime Supabase-sleutel
in de clientcode terechtkomt.
