# B2Inspect Inspector

De actuele Inspector is opnieuw bouwbaar vanuit leesbare broncode.

## Bronnen

- `src/recovered/production-runtime.ts`: volledige, niet-geminificeerde React-runtime die op
  26 oktober 2026 uit de geverifieerde productieversie is gereconstrueerd.
- `src/recovered/production.css`: actuele productiestijlen.
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
```

`npm run build` bouwt de gereconstrueerde bron en controleert automatisch of Planning,
Werkvoorraad en de Commerciële pipeline aanwezig zijn en of geen geheime Supabase-sleutel in
de clientbundel terechtkomt.

Alleen voor een noodherstel kan de exacte productiesnapshot worden klaargezet:

```bash
npm run build:snapshot
```

Zie [CURRENT_SOURCE_STATUS.md](CURRENT_SOURCE_STATUS.md) voor herkomst, bewijs en resterende
onderhoudsaandachtspunten.
