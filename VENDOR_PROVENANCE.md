# Herkomst en beveiligingsgrens van teruggewonnen vendorcode

Meetdatum: 26 oktober 2026 (Europe/Amsterdam)

De verloren oorspronkelijke bron is gereconstrueerd uit de geverifieerde productiebundel.
Daarom staat de destijds meegebouwde externe browsercode in twee afzonderlijke modules:

- `src/runtime/vendor-core.ts`
- `src/runtime/reporting-vendor.ts`

Deze code staat niet meer vermengd met de functionele B2Inspect-modules. De bewaarde versies zijn
afgeleid van het laatste bekende lockbestand, waaronder React 19.2.3, Supabase JS 2.93.3,
React PDF Renderer 4.3.2, ExcelJS 4.4.0, Leaflet 1.9.4 en React Big Calendar 1.19.4.

De geïnstalleerde npm-pakketten zijn beperkt tot de werkelijk gebruikte build-, type- en
lintgereedschappen. `npm audit` rapporteert daarvoor nul bekende kwetsbaarheden.

## Bekende vendorgrens

ExcelJS bevat intern UUID 8.3.2. De gemelde UUID-kwetsbaarheid betreft v3/v5/v6-aanroepen waarbij
een door de aanroeper aangeleverde buffer wordt gebruikt. In de teruggewonnen Inspector-code gebruikt
ExcelJS uitsluitend `uuid.v4()` zonder aangeleverde buffer voor conditionele Excel-opmaak. Dit pad is
daarom niet bereikbaar via de kwetsbare aanroepvorm. Het blijft verstandig dit opnieuw te beoordelen
wanneer de rapportagevendor later door een actuele npm-import wordt vervangen.

De exacte byte-identieke productieversie blijft beschikbaar onder `production-snapshot/` voor rollback.
