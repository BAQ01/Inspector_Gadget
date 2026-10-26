# B2Inspect Inspector

De actuele Inspector is opnieuw bouwbaar vanuit leesbare broncode.

## Modulaire bron

- `src/runtime/vendor-core.ts`: basisruntime en generieke externe bibliotheekcode.
- `src/runtime/inspector-workspaces.ts`: inspecteur- en installateurswerkruimte.
- `src/runtime/reporting-vendor.ts`: rapportage-, PDF-, Excel-, agenda- en kaartondersteuning.
- `src/runtime/admin-workspaces.ts`: planning, offertes, commerciële pipeline en beheer.
- `src/runtime/bootstrap.ts`: login, autorisatie en applicatiestart.
- `src/recovered/production.css`: actuele productiestijlen.
- `recovery/production-runtime.monolith.ts`: alleen de bewaarde reconstructiebasis; wordt niet gebouwd.
- `legacy-src/`: oudere modulaire TypeScript/React-bron; alleen naslag, niet productierijp.
- `production-snapshot/`: byte-identieke noodterugval van de werkende productiepublicatie.

De Supabase-URL en publishable sleutel staan niet als vaste waarde in de gereconstrueerde bron.
Vite leest deze uit `VITE_SUPABASE_URL` en `VITE_SUPABASE_ANON_KEY`.

## Bouwen en controleren

```bash
npm ci
npm run build
npm run lint
npx tsc -b --pretty false
npm run verify:security
```

`npm run build` bouwt de gereconstrueerde bron en controleert automatisch of Planning,
Werkvoorraad en de Commerciële pipeline aanwezig zijn en of geen geheime Supabase-sleutel in
de clientbundel terechtkomt.

De runtime heeft geen losse productieafhankelijkheden meer in `node_modules`; de teruggewonnen
bibliotheekcode is geïsoleerd in de twee vendor-modules. Alleen de actuele build- en controlegereedschappen
worden geïnstalleerd. Zie [VENDOR_PROVENANCE.md](VENDOR_PROVENANCE.md) voor de herkomst daarvan.

Alleen voor een noodherstel kan de exacte productiesnapshot worden klaargezet:

```bash
npm run build:snapshot
```

Zie [CURRENT_SOURCE_STATUS.md](CURRENT_SOURCE_STATUS.md) voor herkomst, bewijs en resterende
onderhoudsaandachtspunten.
