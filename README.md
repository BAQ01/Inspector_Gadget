# B2Inspect Inspector

Dit repository bevat twee duidelijk gescheiden onderdelen:

- `production-snapshot/`: de aantoonbaar werkende productieversie van 26 oktober 2026.
- `src/`: oudere, onvolledige broncode die **niet** rechtstreeks naar productie mag.

## Veilig bouwen

`npm run build` controleert de productie-snapshot en zet uitsluitend die versie in `dist/`.
Hierdoor kunnen de actuele functies voor planning, werkvoorraad en commerciële dossiers niet
per ongeluk worden overschreven door de achterlopende broncode.

```bash
npm ci
npm run build
```

De oude broncode is alleen nog voor herstelonderzoek te bouwen:

```bash
npm run build:legacy-source
```

Gebruik de uitvoer daarvan nooit voor productie voordat deze volledig is gereconcilieerd met de
productie-snapshot en alle regressietests slagen.

Zie [CURRENT_SOURCE_STATUS.md](CURRENT_SOURCE_STATUS.md) voor bewijs, beperkingen en de herstelroute.
