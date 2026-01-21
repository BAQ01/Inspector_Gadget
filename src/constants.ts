import { LibraryDefect, Instrument, Company, Inspector } from './types';

export const calculateSample = (n: number): number => {
  if (n <= 0) return 0;
  if (n <= 5) return n;
  if (n <= 25) return 5;
  if (n <= 50) return 8;
  if (n <= 90) return 13;
  if (n <= 150) return 20;
  if (n <= 280) return 32;
  if (n <= 500) return 50;
  if (n <= 1200) return 80;
  if (n <= 3200) return 125;
  if (n <= 10000) return 200;
  return 315;
};

export const COMPANIES: Company[] = [
  {
    name: 'Van Gestel Inspectie en Advies B.V.',
    address: 'Bourgognelaan 1',
    postalCode: '5627 KP Eindhoven',
    phone: '06 291 988 79',
    email: 'Info@vangestelinspecties.nl'
  }
];

export const INSPECTORS: Inspector[] = [
  {
    name: 'Dhr. B. van Gestel',
    sciosNr: 'R 486'
  }
];

export const INSTRUMENTS: Instrument[] = [
  { id: 'INST-01', name: 'Installatietester Metrel 3155', serialNumber: '25213723', calibrationDate: '15-7-2025' },
  { id: 'INST-02', name: 'Installatietester Metrel 3155', serialNumber: '25270248', calibrationDate: '27-8-2025' },
  { id: 'INST-03', name: 'Stroomtang Kyoritsu KEW 2300R', serialNumber: '1247093', calibrationDate: 'Indicatief' },
  { id: 'INST-04', name: 'Stroomtang Chauvin Arnoux MA400D-170', serialNumber: '125172YCH', calibrationDate: 'Indicatief' },
  { id: 'INST-05', name: 'Thermografische camera Flir E54', serialNumber: '845113869', calibrationDate: '28-5-2025' }
];

// --- DE NIEUWE BIBLIOTHEEK (MET SUBCATEGORIEËN) ---
export const DEFECT_LIBRARY: LibraryDefect[] = [
  // --- GEBRUIK ---
  {
    id: 'use_1',
    category: 'Gebruik',
    subcategory: 'TAFELCONTACTDOZEN / VERLENGSNOEREN',
    shortName: 'hangende tafecontactdoos',
    description: 'De toegepaste tafelcontactdoos is opgehangen aan de snoerleiding, waardoor de verbinding niet langer vrij is van mechanische belastingen; de aansluitingen worden hierdoor onjuist belast.',
    classification: 'Yellow',
    action: 'Bevestigen of verwijderen'
  },
  {
    id: 'use_2',
    category: 'Gebruik',
    subcategory: 'TAFELCONTACTDOZEN / VERLENGSNOEREN',
    shortName: 'hangende contrasteker',
    description: 'De hangende contra stekker en de bijhorende leiding zijn niet voorzien van een geschikte trekontlasting.',
    classification: 'Yellow',
    action: 'Trekontlasting aanbrengen'
  },
  {
    id: 'use_3',
    category: 'Gebruik',
    subcategory: 'TAFELCONTACTDOZEN / VERLENGSNOEREN',
    shortName: 'in serie',
    description: 'Er zijn verlengsnoeren, tafelcontactdozen en/of kabelboxen in serie aangesloten, wat duidt op een ondeugdelijke en niet doelmatige aanleg van de elektrische installatie. Voor veilig gebruik van verplaatsbaar en/of vast opgesteld elektrisch materieel dienen voldoende contactdozen op strategisch gekozen locaties aanwezig te zijn, zodat het doorlussen van tafelcontactdozen kan worden voorkomen.',
    classification: 'Orange',
    action: 'Vaste contactdozen bijplaatsen'
  },
  {
    id: 'use_4',
    category: 'Gebruik',
    subcategory: 'TAFELCONTACTDOZEN / VERLENGSNOEREN',
    shortName: 'niet geschikt omgeving',
    description: 'Er is een tafelcontactdoos toegepast die niet geschikt is voor de omgevingsinvloeden zoals stof.',
    classification: 'Yellow',
    action: 'Vervangen door geschikt type'
  },
  {
    id: 'use_5',
    category: 'Gebruik',
    subcategory: 'TAFELCONTACTDOZEN / VERLENGSNOEREN',
    shortName: 'algemeen in gebruik',
    description: 'Er zijn verlengsnoeren, tafelcontactdozen en/of kabelboxen in gebruik. Voor een veilige toepassing van verplaatsbaar en/of vast opgesteld elektrisch materieel moeten voldoende contactdozen op doeltreffend gekozen plekken aanwezig zijn, zodat het gebruik van losse verlengsnoeren e.d. tot een minimum wordt beperkt.',
    classification: 'Yellow',
    action: 'Vaste installatie uitbreiden'
  },
  {
    id: 'use_6',
    category: 'Gebruik',
    subcategory: 'TAFELCONTACTDOZEN / VERLENGSNOEREN',
    shortName: 'op radiator',
    description: 'Het VMvL-snoer en/of de tafelcontactdoos ligt op een radiator of wordt langs een verwarmingsbuis geleid. Door de verhoogde temperatuur kunnen de weekmakers in het PVC-isolatiemateriaal versneld uittreden, waardoor de isolatie van het snoer hard wordt en kan breken (defect raken). Oververhitting kan leiden tot spontane ontbranding van materialen in of in de buurt van elektrisch materieel.',
    classification: 'Yellow',
    action: 'Verplaatsen'
  },
  {
    id: 'use_7',
    category: 'Gebruik',
    subcategory: 'TAFELCONTACTDOZEN / VERLENGSNOEREN',
    shortName: 'haspel',
    description: 'Er is een kabelhaspel in gebruik waarvan de kabel niet geheel is afgerold. Bij langdurige belasting zal hierdoor een ontoelaatbare temperatuurstijging in de kabel ontstaan, waardoor de isolatie defect kan raken en brand kan ontstaan.',
    classification: 'Orange',
    action: 'Geheel afrollen'
  },
  {
    id: 'use_8',
    category: 'Gebruik',
    subcategory: 'TAFELCONTACTDOZEN / VERLENGSNOEREN',
    shortName: 'klasse 1 in klasse 2',
    description: 'Wanneer een tafelcontactdoos wordt toegepast moet rekening worden gehouden met de hierop aan te sluiten apparatuur. Klasse I apparatuur (geaard) dient op een contactdoos met beschermingsleiding te worden aangesloten. Zonder beschermingsleiding zal de beveiliging, bij aardsluiting, niet of te laat uitschakelen. In een bedrijfsomgeving mogen alleen (tafel)contactdozen met beschermingsleiding worden gebruikt.',
    classification: 'Red',
    action: 'Vervangen door geaarde exemplaren'
  },
  {
    id: 'use_9',
    category: 'Gebruik',
    subcategory: 'TAFELCONTACTDOZEN / VERLENGSNOEREN',
    shortName: 'tafelcontactdoos zonder RA',
    description: 'Het door elkaar gebruiken van contactdozen met en zonder beschermingsleiding in één en dezelfde gebruikersruimte is niet toegestaan.',
    classification: 'Orange',
    action: 'Uniformeren naar geaard'
  },
  {
    id: 'use_16',
    category: 'Gebruik',
    subcategory: 'ACCULADERS / ACCU’S',
    shortName: 'Accu opslag',
    description: 'Om risico\'s te minimaliseren, moeten accu\'s op de juiste manier worden opgeslagen en verwerkt.',
    classification: 'Orange',
    action: 'Opslag aanpassen'
  },
  {
    id: 'use_17',
    category: 'Gebruik',
    subcategory: 'ACCULADERS / ACCU’S',
    shortName: 'opstelling lader',
    description: 'De acculader staat opgesteld op een brandbare ondergrond (hout). Tijdens het laden vindt warmteontwikkeling plaats in de acculader.',
    classification: 'Orange',
    action: 'Plaatsen op onbrandbare ondergrond'
  },
  {
    id: 'use_18',
    category: 'Gebruik',
    subcategory: 'ACCULADERS / ACCU’S',
    shortName: 'lader vervuild',
    description: 'De acculader is vervuild door stof. Hierdoor kan de warmte onvoldoende worden afgevoerd.',
    classification: 'Red',
    action: 'Reinigen'
  },
  {
    id: 'use_19',
    category: 'Gebruik',
    subcategory: 'ACCULADERS / ACCU’S',
    shortName: 'lader beschadigd',
    description: 'De acculader is beschadigd. Hierdoor is het materieel onvoldoende beschermd tegen de uitwendige invloeden.',
    classification: 'Orange',
    action: 'Herstellen/Vervangen'
  },
  {
    id: 'use_20',
    category: 'Gebruik',
    subcategory: 'ACCULADERS / ACCU’S',
    shortName: 'ventilatie',
    description: 'De ruimte is onvoldoende geventileerd. Bij het laden van natte accu\'s kan knalgas vrijkomen. Knalgas is lichter dan lucht en zal zich ophopen onder het hoogste punt. Er dient zowel onder als boven in de ruimte, diagonaal ten opzichte van elkaar, niet afsluitbare ventilatieopeningen aangebracht te worden die rechtstreeks in verbinding staan met de buitenlucht.',
    classification: 'Red',
    action: 'Ventilatie aanbrengen'
  },
  {
    id: 'use_10',
    category: 'Gebruik',
    subcategory: 'APPARATUUR',
    shortName: 'Condensor vervuild',
    description: 'Bij één of meerdere koelingen/vriezers is de condensor vervuilt door stof. Hierdoor ontstaat er een verhoogd risico op brand. De condensor dient conform fabrikantopgave periodiek gereinigd te worden.',
    classification: 'Orange',
    action: 'Reinigen'
  },
  {
    id: 'use_11',
    category: 'Gebruik',
    subcategory: 'APPARATUUR',
    shortName: 'Radio niet geschikt',
    description: 'Er is een radio voor huishoudelijk gebruik aangetroffen. Deze radio is niet geschikt voor het toegepaste gebruik en/of omgeving.',
    classification: 'Yellow',
    action: 'Verwijderen of vervangen'
  },
  {
    id: 'use_12',
    category: 'Gebruik',
    subcategory: 'APPARATUUR',
    shortName: 'apparatuur niet geschikt',
    description: 'Er is apparatuur voor huishoudelijk gebruik toegepast in een industriële omgeving. Dit materieel is niet geschikt voor het toegepaste gebruik en/of omgeving.',
    classification: 'Yellow',
    action: 'Vervangen door industrieel materieel'
  },
  {
    id: 'use_13',
    category: 'Gebruik',
    subcategory: 'APPARATUUR',
    shortName: 'apparatuur vervuild met stof',
    description: 'Op de apparatuur is een aanzienlijke hoeveelheid vuil en/of stof aangetroffen. Deze ophoping kan leiden tot overmatige warmteontwikkeling in de installatie. Bovendien vormt het brandbare vuil een extra risico, omdat het een beginnende brand kan versnellen en uitbreiden.',
    classification: 'Red',
    action: 'Reinigen'
  },
  {
    id: 'use_14',
    category: 'Gebruik',
    subcategory: 'APPARATUUR',
    shortName: 'Ventilator vervuild met stof',
    description: 'Op/in de ventilator is een aanzienlijke hoeveelheid vuil en/of stof aangetroffen. Deze ophoping kan leiden tot overmatige warmteontwikkeling in de installatie. Bovendien vormt het brandbare vuil een extra risico, omdat het een beginnende brand kan versnellen en uitbreiden.',
    classification: 'Red',
    action: 'Reinigen'
  },
  {
    id: 'use_15',
    category: 'Gebruik',
    subcategory: 'APPARATUUR',
    shortName: 'Roosters afzuigkap',
    description: 'De roosters van de afzuigkap zijn vervuild met vet. Omdat vet brandbaar is, leidt dit tot een verhoogd risico op brand. Regelmatige reiniging van de roosters is daarom essentieel voor de veiligheid.',
    classification: 'Orange',
    action: 'Reinigen'
  },

  // --- INSTALLATIEMATERIAAL ---
  {
    id: 'inst_1',
    category: 'Installatiemateriaal',
    subcategory: 'Montagewijze',
    shortName: 'beschadiging',
    description: 'De behuizing van het installatiemateriaal is beschadigd. Hierdoor heeft het materieel niet meer de bedoelde beschermingsgraad.',
    classification: 'Orange',
    action: 'Vervangen'
  },
  {
    id: 'inst_2',
    category: 'Installatiemateriaal',
    subcategory: 'Montagewijze',
    shortName: 'materiaal op hout',
    description: 'Het installatiemateriaal is niet voorzien van een grondplaat. Als er verspreiding van brand tussen het elektrisch materieel en een brandbaar oppervlak van het gebouw kan optreden, moeten de contactdozen en schakelaars zijn voorzien van een grondplaat.',
    classification: 'Yellow',
    action: 'Grondplaat plaatsen'
  },
  {
    id: 'inst_3',
    category: 'Installatiemateriaal',
    subcategory: 'Montagewijze',
    shortName: 'materiaal op geleidende ondergrond',
    description: 'Het installatiemateriaal is niet voorzien van een grondplaat en/of de ondergrond is niet met de beschermingsleiding van de installatie verbonden. Contactdozen en schakelaars die zijn gemonteerd op een elektrisch geleidende ondergrond, moeten zijn voorzien van een grondplaat om spanningsoverslag te voorkomen of de ondergrond moet met de vereffeningsleiding van de installatie zijn verbonden.',
    classification: 'Yellow',
    action: 'Grondplaat plaatsen'
  },
  {
    id: 'inst_4',
    category: 'Installatiemateriaal',
    subcategory: 'Montagewijze',
    shortName: 'materiaal zit los',
    description: 'Het materieel is niet meer goed bevestigd aan de ondergrond. Hiermee is ten eerste niet voldaan aan de voorschriften van de fabrikant. Daarnaast kunnen er op deze manier ongewenste mechanische krachten worden uitgeoefend op het materieel.',
    classification: 'Yellow',
    action: 'Vastzetten'
  },
  {
    id: 'inst_5',
    category: 'Installatiemateriaal',
    subcategory: 'Montagewijze',
    shortName: 'Werkschakelaar',
    description: 'De verbruiker is niet voorzien van een werkschakelaar. Indien bij niet-elektrotechnische werkzaamheden gevaar voor ongevallen kan ontstaan door onverwachte inschakeling, moet een werkschakelaar of een daarmee gelijk te stellen toestel zijn aangebracht.',
    classification: 'Yellow',
    action: 'Plaatsen'
  },
  {
    id: 'inst_6',
    category: 'Installatiemateriaal',
    subcategory: 'Contactdozen',
    shortName: 'bedrading klem',
    description: 'Er is geconstateerd dat er bedrading bekneld zit tussen de behuizing. Hierdoor kan een isolatiedefect ontstaan waardoor de installatie onder spanning kan komen te staan en er brandgevaar kan ontstaan.',
    classification: 'Red',
    action: 'Herstellen'
  },
  {
    id: 'inst_7',
    category: 'Installatiemateriaal',
    subcategory: 'Contactdozen',
    shortName: 'verbrandingsverschijnselen',
    description: 'De contactdoos vertoont verschijnselen van verbranding. Door een slecht contact ontstaat een overgangsweerstand. Door de stroom die hierdoor vloeit vindt er warmteontwikkeling plaats. Oververhitting kan leiden tot spontane ontbranding van materialen in of in de buurt van elektrisch materieel.',
    classification: 'Red',
    action: 'Vervangen'
  },
  {
    id: 'inst_8',
    category: 'Installatiemateriaal',
    subcategory: 'Contactdozen',
    shortName: 'defecte behuizing',
    description: 'Van contactdooskast 1 is de behuizing gescheurd en is de klepdeksel defect. Het gebrek levert geen potentieel onaanvaardbaar risico op. Het verhelpen van het gebrek leidt wel tot een verhoging van de veiligheid en de professionele standaard van de installatie.',
    classification: 'Yellow',
    action: 'Vervangen'
  },
  {
    id: 'inst_9',
    category: 'Installatiemateriaal',
    subcategory: 'Contactdozen',
    shortName: 'beveiliging contactdozen',
    description: 'Opmerking: Contactdozen met een toegekende stroom van ten hoogste 20 A voor algemeen gebruik door leken zijn niet aanvullend beveiligd door toestellen voor aardlekbeveiliging met een toegekende aanspreekstroom van ten hoogste 30mA. Ten tijde van aanleg was dit geen vereiste echter is dit voor installaties aangelegd na 05-2009 opgenomen in NEN 1010. Wij adviseren u, ter verhoging van de persoonlijke veiligheid, deze aardlekbeveiliging alsnog aan te brengen.',
    classification: 'Yellow',
    action: 'Aardlekbeveiliging aanbrengen'
  },
  {
    id: 'inst_10',
    category: 'Installatiemateriaal',
    subcategory: 'Contactdozen',
    shortName: 'kroonstenen',
    description: 'Tevens zijn de soepele snoeren aangesloten door middel van kroonstenen, om te beveiligen tegen het opsplitsen of uiteengaan van de individuele draden van meerdraads-,soepele of zeer soepele geleiders moeten daarvoor geschikte aansluitklemmen worden gebruikt of moetende uiteinden van de geleider op geschikte wijze worden behandeld bijvoorbeeld dmv een adereindhuls.',
    classification: 'Orange',
    action: 'Adereindhulzen toepassen'
  },

  // --- VERDEELINRICHTING ---
  {
    id: 'verd_1',
    category: 'Verdeelinrichting',
    subcategory: 'OMHULLING',
    shortName: 'open invoeren bovenzijde',
    description: 'Aan de bovenzijde van de verdeelinrichting zijn open invoeren aangetroffen. Gemakkelijk bereikbare horizontale bovenzijden van afschermingen en omhulsels moeten een beschermingsgraad bieden van ten minste IPXXD of IP4X.',
    classification: 'Orange',
    action: 'Dichten'
  },
  {
    id: 'verd_2',
    category: 'Verdeelinrichting',
    subcategory: 'OMHULLING',
    shortName: 'openingen kast',
    description: 'Op de verdeelinrichting zijn één of meerdere openingen aangetroffen. Openingen in de omhulling zijn onvoldoende afgestemd op de omgevingsinvloeden zoals stof. Actieve delen moeten zijn aangebracht in omhulsels of achter afschermingen die een beschermingsgraad van ten minste IPXXB of IP2X.',
    classification: 'Red',
    action: 'Dichten'
  },
  {
    id: 'verd_3',
    category: 'Verdeelinrichting',
    subcategory: 'OMHULLING',
    shortName: 'stof / vuil',
    description: 'In de verdeler ligt stof, vuil en/of brandbaar materiaal. Dit kan op termijn voor problemen zorgen.',
    classification: 'Orange',
    action: 'Reinigen'
  },
  {
    id: 'verd_4',
    category: 'Verdeelinrichting',
    subcategory: 'OMHULLING',
    shortName: 'stof / vuil (ernstig)',
    description: 'De verdeler is door stof, vuil en/of brandbaar materiaal ernstig vervuild. Deze vervuiling levert een verhoogd risico op voor brand door mogelijke overslag of pyrolyse.',
    classification: 'Red',
    action: 'Direct Reinigen'
  },
  {
    id: 'verd_5',
    category: 'Verdeelinrichting',
    subcategory: 'OMHULLING',
    shortName: 'afscherming ontbreekt',
    description: 'Door het gedeeltelijk ontbreken van de afscherming is er niet voldaan aan de eis van basisbescherming. De actieve delen zijn niet volledig omhuld of afgeschermd en zijn aanraakbaar.',
    classification: 'Red',
    action: 'Direct herstellen'
  },
  {
    id: 'verd_6',
    category: 'Verdeelinrichting',
    subcategory: 'OMHULLING',
    shortName: 'afscherming niet veilig',
    description: 'Eén of meerdere componenten in de verdeelinrichting zijn niet aanrakingsveilig (IP2X), waardoor aanrakingsgevaar ontstaat.',
    classification: 'Red',
    action: 'Herstellen'
  },
  {
    id: 'verd_7',
    category: 'Verdeelinrichting',
    subcategory: 'OMHULLING',
    shortName: 'sluiting',
    description: 'De sluiting van de verdeelinrichting is defect. De verdeelinrichting kan hierdoor niet op de juiste wijze worden afgesloten.',
    classification: 'Yellow',
    action: 'Herstellen'
  },
  {
    id: 'verd_8',
    category: 'Verdeelinrichting',
    subcategory: 'BEVEILIGINGSTOESTELLEN',
    shortName: 'smeltpatroon',
    description: 'Er is een verkeerd type smeltpatroon toegepast. De smeltpatroon in de houder past niet bij de (kleur van de) passchroef.',
    classification: 'Orange',
    action: 'Vervangen'
  },
  {
    id: 'verd_9',
    category: 'Verdeelinrichting',
    subcategory: 'BEVEILIGINGSTOESTELLEN',
    shortName: 'automaat defect',
    description: 'Eén of meerdere installatieautomaten zijn defect. Het mechanisme werkt niet meer naar behoren of de behuizing is dusdanig beschadigd dat de werking kan worden beïnvloed.',
    classification: 'Orange',
    action: 'Vervangen'
  },
  {
    id: 'verd_10',
    category: 'Verdeelinrichting',
    subcategory: 'BEVEILIGINGSTOESTELLEN',
    shortName: 'Aardlekbeveiliging (ontbreekt)',
    description: 'Niet alle eindgroepen met contactdozen voor algemeen gebruik en een nominale stroom van ten hoogste 20 A zijn beveiligd door een aardlekschakelaar met een nominale aanspreekstroom van ten hoogste 30 mA.',
    classification: 'Yellow',
    action: 'Aanbrengen'
  },
  {
    id: 'verd_11',
    category: 'Verdeelinrichting',
    subcategory: 'BEVEILIGINGSTOESTELLEN',
    shortName: 'Aardlekbeveiliging (>4 groepen)',
    description: 'Er zijn meer dan 4 eindgroepen aangesloten op één aardlekschakelaar.',
    classification: 'Yellow',
    action: 'Aanpassen'
  },
  {
    id: 'verd_12',
    category: 'Verdeelinrichting',
    subcategory: 'BEVEILIGINGSTOESTELLEN',
    shortName: 'Aardlekbeveiliging (hoofdschakelaar)',
    description: 'In een installatie met twee of meer eindgroepen mogen de aardlekschakelaars niet worden uitgeschakeld door één hoofdschakelaar of één toestel voor beveiliging tegen overstroom.',
    classification: 'Orange',
    action: 'Aanpassen'
  },
  {
    id: 'verd_13',
    category: 'Verdeelinrichting',
    subcategory: 'BEVEILIGINGSTOESTELLEN',
    shortName: 'Aardlekbeveiliging (defect)',
    description: 'Eén of meerdere aardlekschakelaars functioneren niet (binnen de gestelde tijd) bij een druk op de testknop en/of door beproeving met een meetinstrument.',
    classification: 'Red',
    action: 'Vervangen'
  },
  {
    id: 'verd_14',
    category: 'Verdeelinrichting',
    subcategory: 'BEVEILIGINGSTOESTELLEN',
    shortName: 'hoofdschakelaar',
    description: 'De hoofdschakelaar ontbreekt of is defect. Hierdoor kan de installatie niet in één handeling spanningsloos worden gemaakt.',
    classification: 'Orange',
    action: 'Plaatsen/Vervangen'
  },
  {
    id: 'verd_15',
    category: 'Verdeelinrichting',
    subcategory: 'BEVEILIGINGSTOESTELLEN',
    shortName: 'codering',
    description: 'De groepen zijn niet of onvoldoende gecodeerd. Hierdoor is het niet duidelijk welke beveiliging bij welk deel van de installatie hoort.',
    classification: 'Yellow',
    action: 'Aanbrengen'
  },
  {
    id: 'verd_16',
    category: 'Verdeelinrichting',
    subcategory: 'BEVEILIGINGSTOESTELLEN',
    shortName: 'Draaddikte',
    description: 'De interne bedrading is te dun voor de (voor)beveiliging. Bij overbelasting kan de isolatie van de bedrading te warm worden waardoor er brand kan ontstaan.',
    classification: 'Red',
    action: 'Vervangen'
  },
  {
    id: 'verd_17',
    category: 'Verdeelinrichting',
    subcategory: 'BEVEILIGINGSTOESTELLEN',
    shortName: 'Railsysteem',
    description: 'Het railsysteem is ondergedimensioneerd. Bij de maximaal te voeren stroom moet het railsysteem geschikt zijn voor minimaal de voorbeveiliging.',
    classification: 'Red',
    action: 'Verzwaren'
  },
  {
    id: 'verd_18',
    category: 'Verdeelinrichting',
    subcategory: 'BEVEILIGINGSTOESTELLEN',
    shortName: 'bliksembeveiliging',
    description: 'Geconstateerd is dat het dak is voorzien van een bliksembeveiligingsinstallatie. Hierdoor moet de elektrische installatie worden beveiligd tegen de gevolgen van een directe inslag. Dit moet worden gerealiseerd met een type 1+2 overspanningsbeveiliging. Deze overspanningsbeveiliging is niet aanwezig.',
    classification: 'Orange',
    action: 'Aanbrengen'
  },
  {
    id: 'verd_19',
    category: 'Verdeelinrichting',
    subcategory: 'BEVEILIGINGSTOESTELLEN',
    shortName: 'arbeidsmiddelen',
    description: 'Er zijn arbeidsmiddelen aangetroffen met gevaarlijke gebreken. De aanwezige arbeidsmiddelen zijn niet geïnspecteerd. Volgens artikel 7.4a van het Arbeidsomstandighedenbesluit moeten arbeidsmiddelen periodiek worden geïnspecteerd.',
    classification: 'Red',
    action: 'Inspecteren en herstellen'
  },
  {
    id: 'verd_20',
    category: 'Verdeelinrichting',
    subcategory: 'BEVEILIGINGSTOESTELLEN',
    shortName: 'CE-markering',
    description: 'Volgens artikel 7.2 van het Arbeidsomstandighedenbesluit bestaat bij machines voorzien van een CE-markering het vermoeden dat deze aan de huidige veiligheidseisen voldoen. Bij machines zonder CE-markering (voor 1995) is dit niet het geval en zal eenmalig een RI&E uitgevoerd moeten worden om de veiligheid aan te tonen.',
    classification: 'Yellow',
    action: 'RI&E uitvoeren'
  },

  // --- LEIDINGEN ---
  {
    id: 'leid_1',
    category: 'Leidingen',
    subcategory: 'Algemeen',
    shortName: 'GST 18 vergrendeling',
    description: 'Op één of meerdere plaatsen zijn GST-18 connectoren niet of niet correct vergrendeld. De vergrendeling voorkomt onbedoeld loskoppelen van de verbinding, echter bij een bepaalde kracht (>80N) dient om schade aan de kabel te voorkomen de vergrendeling los te komen. Om deze reden zijn provisorische vergrendelingsmiddelen zoals bundelbanden niet toegestaan.',
    classification: 'Yellow',
    action: 'Herstellen'
  },
  {
    id: 'leid_2',
    category: 'Leidingen',
    subcategory: 'Algemeen',
    shortName: 'GST18 serie',
    description: 'Er zijn T-splitters zijn in serie aangesloten. Hierdoor is er geen betrouwbare verbinding in zowel de actieve geleiders als in de beschermingsleiding.',
    classification: 'Orange',
    action: 'Aanpassen'
  },
  {
    id: 'leid_3',
    category: 'Leidingen',
    subcategory: 'Algemeen',
    shortName: 'bescherming draad',
    description: 'De bedrading is niet volledig beschermd aangelegd. In tabel 52.A.1 staat dat de installatiemethode als op de foto niet is toegestaan.',
    classification: 'Yellow',
    action: 'Beschermen'
  },
  {
    id: 'leid_4',
    category: 'Leidingen',
    subcategory: 'Algemeen',
    shortName: 'kabel als buigzaam',
    description: 'De kabel is gebruikt als buigzame leiding. Het leidingtype dat is toegepast, is niet toegelaten voor deze specifieke toepassing.',
    classification: 'Yellow',
    action: 'Vervangen'
  },
  {
    id: 'leid_5',
    category: 'Leidingen',
    subcategory: 'Algemeen',
    shortName: 'hangende contra',
    description: 'De hangende koppelcontactstop (contra-stekker) en de bijbehorende leiding zijn niet voorzien van een geschikte trekontlasting.',
    classification: 'Yellow',
    action: 'Trekontlasting aanbrengen'
  },
  {
    id: 'leid_6',
    category: 'Leidingen',
    subcategory: 'Algemeen',
    shortName: 'hangende tafelcontactdoos',
    description: 'De hangende tafelcontactdoos en de bijbehorende leiding zijn niet voorzien van een geschikte trekontlasting.',
    classification: 'Yellow',
    action: 'Trekontlasting aanbrengen'
  },
  {
    id: 'leid_7',
    category: 'Leidingen',
    subcategory: 'Algemeen',
    shortName: 'isolatie beschadigd',
    description: 'De kabel is dusdanig beschadigd dat de basisisolatie zichtbaar of beschadigd is.',
    classification: 'Red',
    action: 'Vervangen'
  },
  {
    id: 'leid_8',
    category: 'Leidingen',
    subcategory: 'Algemeen',
    shortName: 'vmvl in buis',
    description: 'Er is snoer in buis getrokken. Snoer (VMvL) is, in tegenstelling tot draad (VD), niet geschikt om in buis te worden getrokken. In de bochten kunnen de aders door de mantel drukken met sluiting tot gevolg.',
    classification: 'Orange',
    action: 'Vervangen door draad'
  },
  {
    id: 'leid_9',
    category: 'Leidingen',
    subcategory: 'Algemeen',
    shortName: 'snoer door wand',
    description: 'Er is snoer door een wand gevoerd. Dit is niet toegestaan. Snoer is kwetsbaarder dan kabel. Voor vaste aanleg dient kabel te worden gebruikt (b.v. XMvK).',
    classification: 'Orange',
    action: 'Vervangen door kabel'
  },
  {
    id: 'leid_10',
    category: 'Leidingen',
    subcategory: 'Algemeen',
    shortName: 'niet gebeugeld',
    description: 'De leidingen zijn niet of onvoldoende gebeugeld. Kabels en buizen moeten deugdelijk zijn bevestigd om te voorkomen dat de verbindingen mechanisch worden belast.',
    classification: 'Yellow',
    action: 'Beugelen'
  },
  {
    id: 'leid_11',
    category: 'Leidingen',
    subcategory: 'Algemeen',
    shortName: 'kabel in grond',
    description: 'De kabel die in de grond ligt is niet geschikt voor deze toepassing. Kabels die in de grond worden gelegd, moeten zijn voorzien van een aardscherm.',
    classification: 'Orange',
    action: 'Vervangen door grondkabel'
  },
  {
    id: 'leid_12',
    category: 'Leidingen',
    subcategory: 'Algemeen',
    shortName: 'ongebruikte leiding',
    description: 'De leidingen die niet (meer) in gebruik zijn moeten worden verwijderd.',
    classification: 'Yellow',
    action: 'Verwijderen'
  },
  {
    id: 'leid_13',
    category: 'Leidingen',
    subcategory: 'Algemeen',
    shortName: 'E4 achter',
    description: 'Tevens zijn de verplaatsbare leidingen niet van het juiste type. Conform NEN 1010 bepaling 700.A dienen er in omgevingen die aan rubriek 705 moeten voldoen minimaal buigzame leidingen voor zwaar gebruik (E4) toegepast te worden.',
    classification: 'Yellow',
    action: 'Vervangen'
  },
  {
    id: 'leid_14',
    category: 'Leidingen',
    subcategory: 'Algemeen',
    shortName: 'doorsnede',
    description: 'De contactdozen zijn aangesloten door middel van een snoer met een te dunne aderdoorsnede. Conform tabel 52.2 van NEN 1010 dient voor vermogens- en verlichtingsketens een minimale doorsnede van 1,5mm² toegepast te worden.',
    classification: 'Red',
    action: 'Vervangen'
  },
  {
    id: 'leid_15',
    category: 'Leidingen',
    subcategory: 'Algemeen',
    shortName: 'leiding door muur',
    description: 'De leiding wordt onbeschermd door de muur gevoerd. Op plaatsen waar leidingen door vaste afscheidingen voeren, moeten ze worden beschermd tegen mechanische beschadiging, bijvoorbeeld door gebruik te maken van met metaal afgeschermde of gearmeerde kabels, of door gebruik te maken van een buis of doorvoertulen.',
    classification: 'Yellow',
    action: 'Beschermen'
  },
  {
    id: 'leid_16',
    category: 'Leidingen',
    subcategory: 'Algemeen',
    shortName: 'snoer / kroonsteen',
    description: 'Tevens zijn de soepele snoeren aangesloten door middel van kroonstenen, om te beveiligen tegen het opsplitsen of uiteengaan van de individuele draden van meerdraads-,soepele of zeer soepele geleiders moeten daarvoor geschikte aansluitklemmen worden gebruikt of moetende uiteinden van de geleider op geschikte wijze worden behandeld bijvoorbeeld dmv een adereindhuls.',
    classification: 'Orange',
    action: 'Adereindhulzen toepassen'
  },
  {
    id: 'leid_17',
    category: 'Leidingen',
    subcategory: 'Algemeen',
    shortName: 'kans op beschadiging',
    description: 'De kabels zijn zonder bescherming aangelegd door een vloer terwijl er kans op mechanische beschadiging is.',
    classification: 'Orange',
    action: 'Beschermen'
  },
  {
    id: 'leid_18',
    category: 'Leidingen',
    subcategory: 'Algemeen',
    shortName: 'Snoer opgelast',
    description: 'Er is een snoer aangetroffen dat vermoedelijk is opgelast of hersteld en vervolgens met tape omwikkeld. Een dergelijke verbinding voldoet niet aan de eisen van deugdelijkheid en veiligheid en kan leiden tot gevaarlijke situaties, zoals kortsluiting of brand.',
    classification: 'Red',
    action: 'Vervangen'
  },

  // --- VEREFFENING ---
  {
    id: 'ver_1',
    category: 'Vereffening',
    subcategory: 'Algemeen',
    shortName: 'Doucheruimte',
    description: 'In de doucheruimte ontbreekt een (zichtbaar) centraal aardpunt, hierdoor is niet vast kunnen stellen of de aanvullende beschermende vereffening conform voorschriften uitgevoerd is.',
    classification: 'Yellow',
    action: 'Controleren/Aanbrengen'
  },
  {
    id: 'ver_2',
    category: 'Vereffening',
    subcategory: 'Algemeen',
    shortName: 'gasleiding',
    description: 'Het vreemd geleidende deel, de gasleiding, is niet verbonden met de beschermende vereffening. Hierdoor is er niet voldaan aan de foutbeschermingseis.',
    classification: 'Orange',
    action: 'Aanbrengen'
  },
  {
    id: 'ver_3',
    category: 'Vereffening',
    subcategory: 'Algemeen',
    shortName: 'waterleiding',
    description: 'Het vreemd geleidende deel, de waterleiding, is niet verbonden met de beschermende vereffening. Hierdoor is er niet voldaan aan de foutbeschermingseis.',
    classification: 'Orange',
    action: 'Aanbrengen'
  },
  {
    id: 'ver_4',
    category: 'Vereffening',
    subcategory: 'Algemeen',
    shortName: 'water- en gasleiding',
    description: 'Vreemd geleidende delen, water- en gasleiding, zijn niet verbonden met de beschermende vereffening. Hierdoor is er niet voldaan aan de foutbeschermingseis.',
    classification: 'Orange',
    action: 'Aanbrengen'
  },
  {
    id: 'ver_5',
    category: 'Vereffening',
    subcategory: 'Algemeen',
    shortName: 'algemeen',
    description: 'Het vreemd geleidende deel is niet verbonden met de beschermende vereffening. Hierdoor is er niet voldaan aan de foutbeschermingseis.',
    classification: 'Orange',
    action: 'Aanbrengen'
  },
  {
    id: 'ver_6',
    category: 'Vereffening',
    subcategory: 'Algemeen',
    shortName: 'stekeind',
    description: 'Het stekeind van de gewapende vloer is niet verbonden met de hoofdaardrail. Hierdoor is er niet voldaan aan de foutbeschermingseis.',
    classification: 'Yellow',
    action: 'Aanbrengen'
  },
  {
    id: 'ver_7',
    category: 'Vereffening',
    subcategory: 'Algemeen',
    shortName: 'klem oxidatie',
    description: 'Op de vereffeningsklem is geen sprake van een duurzame elektrische verbinding met voldoende mechanische sterkte en bescherming.',
    classification: 'Yellow',
    action: 'Herstellen'
  },
  {
    id: 'ver_8',
    category: 'Vereffening',
    subcategory: 'Algemeen',
    shortName: 'HAR',
    description: 'Meerdere geleiders zijn niet afzonderlijk losneembaar van de hoofdaardrail of –klem.',
    classification: 'Yellow',
    action: 'Aanpassen'
  },
  {
    id: 'ver_9',
    category: 'Vereffening',
    subcategory: 'Algemeen',
    shortName: 'werkblad',
    description: 'De vreemd geleidende delen die door een defect onder spanning kunnen komen te staan (stalen werkbladen), zijn niet door een (aanvullende) vereffeningsleiding verbonden met de in het object aanwezige potentiaal vereffening. Dit is door metingen vastgesteld.',
    classification: 'Yellow',
    action: 'Aanbrengen'
  },
  {
    id: 'ver_10',
    category: 'Vereffening',
    subcategory: 'Algemeen',
    shortName: 'spiralen flexibele slang',
    description: 'De metalen spiralen van de flexibele slangen van de afzuiginstallatie zijn niet vereffend met de stalen leidingen. Door statische ontlading kan een ontstekingsbron ontstaan.',
    classification: 'Red',
    action: 'Aanbrengen'
  },
  {
    id: 'ver_11',
    category: 'Vereffening',
    subcategory: 'Algemeen',
    shortName: 'wandgoot',
    description: 'De veiligheidsaarding is onderbroken doordat er geen tandringen zijn toegepast bij de koppelingen.',
    classification: 'Red',
    action: 'Tandringen plaatsen'
  },

  // --- VERLICHTING ---
  {
    id: 'licht_1',
    category: 'Verlichting',
    subcategory: 'Algemeen',
    shortName: 'beschadigd / defect',
    description: 'Eén of meerdere verlichtingsarmaturen zijn incompleet of beschadigd. Door het defect of ontbreken van delen van verlichtingsarmaturen kan de veiligheid in gevaar komen of kunnen er brandgevaarlijke situaties ontstaan.',
    classification: 'Orange',
    action: 'Herstellen'
  },
  {
    id: 'licht_2',
    category: 'Verlichting',
    subcategory: 'Algemeen',
    shortName: 'niet geschikt',
    description: 'Eén of meerdere verlichtingsarmaturen zijn niet geschikt voor het toegepaste gebruik of omgeving.',
    classification: 'Yellow',
    action: 'Vervangen'
  },
  {
    id: 'licht_3',
    category: 'Verlichting',
    subcategory: 'Algemeen',
    shortName: 'Tl- buis gloeit',
    description: 'In de ruimte hangen één of meerdere tl-armaturen met een buislamp die bij de lampvoeten gloeit. Deze buislamp vraagt veel meer vermogen dan goed werkende buislampen. De warmteontwikkeling bij de lampvoeten en het voorschakelapparaat is groot.',
    classification: 'Orange',
    action: 'Vervangen'
  },
  {
    id: 'licht_4',
    category: 'Verlichting',
    subcategory: 'Algemeen',
    shortName: 'nabij brandbaar mat',
    description: 'Er zijn één of meerdere (open) verlichtingsarmaturen op of nabij een brandbare ondergrond gemonteerd. Bij overmatige warmteontwikkeling zal eenvoudig brand kunnen ontstaan.',
    classification: 'Red',
    action: 'Verplaatsen'
  },
  {
    id: 'licht_5',
    category: 'Verlichting',
    subcategory: 'Algemeen',
    shortName: 'kap ontbreekt',
    description: 'De kap van het armatuur ontbreekt. Het materieel is niet optimaal afgestemd op de omgevingsinvloeden.',
    classification: 'Yellow',
    action: 'Herstellen'
  },
  {
    id: 'licht_6',
    category: 'Verlichting',
    subcategory: 'Algemeen',
    shortName: 'bevestiging kap',
    description: 'De bevestiging van de kap is niet meer intact. Hierdoor is het verlichtingsarmatuur onvoldoende beschermd tegen de uitwendige invloeden.',
    classification: 'Yellow',
    action: 'Herstellen'
  },
  {
    id: 'licht_7',
    category: 'Verlichting',
    subcategory: 'Algemeen',
    shortName: 'omhulling armatuur',
    description: 'De omhulling van het verlichtingsarmatuur is niet meer geheel intact. Het verlichtingsarmatuur is onvoldoende afgestemd op de uitwendige invloeden.',
    classification: 'Yellow',
    action: 'Vervangen'
  },
  {
    id: 'licht_8',
    category: 'Verlichting',
    subcategory: 'Algemeen',
    shortName: 'warmte',
    description: 'Het verlichtingsarmatuur bereikt een temperatuur die brand zou kunnen veroorzaken bij materiaal in de nabijheid.',
    classification: 'Red',
    action: 'Direct Oplossen'
  },
  {
    id: 'licht_9',
    category: 'Verlichting',
    subcategory: 'Algemeen',
    shortName: 'vluchtroute',
    description: 'Het verlichtingsarmatuur voor de vluchtrouteaanduiding is defect.',
    classification: 'Orange',
    action: 'Herstellen'
  },
  {
    id: 'licht_10',
    category: 'Verlichting',
    subcategory: 'Algemeen',
    shortName: 'spots in goot',
    description: 'Er zijn halogeen spots gemonteerd in de kabelbaan. Deze halogeen spots geven een warmte af die schadelijk kan zijn voor de kabel(s).',
    classification: 'Red',
    action: 'Verwijderen'
  },
  {
    id: 'licht_11',
    category: 'Verlichting',
    subcategory: 'Algemeen',
    shortName: 'invoer armatuur',
    description: 'Door deze wijze van leidinginvoer is het materieel niet bestand tegen de te verwachte uitwendige invloeden.',
    classification: 'Yellow',
    action: 'Herstellen'
  },
  {
    id: 'licht_12',
    category: 'Verlichting',
    subcategory: 'Algemeen',
    shortName: 'tweelingsnoer',
    description: 'Diverse Tl armaturen zijn aangesloten door middel van twee-adrige snoerleidingen. Er kan nu géén foutbescherming door automatische uitschakeling van de voeding plaatsvinden.',
    classification: 'Red',
    action: 'Aarde aanbrengen'
  },
  {
    id: 'licht_13',
    category: 'Verlichting',
    subcategory: 'Algemeen',
    shortName: 'fitting',
    description: 'In de ruimte ontbreekt een geschikt verlichtingsarmatuur. Aan de bedrading hangt een losse fitting.',
    classification: 'Yellow',
    action: 'Armatuur plaatsen'
  },
  {
    id: 'licht_14',
    category: 'Verlichting',
    subcategory: 'Algemeen',
    shortName: 'handbereik',
    description: 'Daar waar tl-armaturen binnen handbereik hangen of eenvoudig beschadigd kunnen raken, moeten slagvaste armaturen worden toegepast. Er zijn één of meerdere verlichtingsarmaturen niet in overeenstemming met de montagevoorschriften van de fabrikant geïnstalleerd.',
    classification: 'Orange',
    action: 'Vervangen door slagvast'
  },
  {
    id: 'licht_15',
    category: 'Verlichting',
    subcategory: 'Algemeen',
    shortName: 'halogeen beschadigd',
    description: 'Meerdere halogeen spotjes zijn beschadigd, of niet meer compleet. De beschermglaasjes onder de halogeenlamp ontbreken. Indien de lichtbron defect raakt en uit elkaar spat, kunnen de gloeiend hete glasdeeltjes op de ondergelegen, veelal brandbare materialen vallen en brand veroorzaken.',
    classification: 'Red',
    action: 'Herstellen'
  },

  // --- LAADPALEN ---
  {
    id: 'laad_1',
    category: 'Laadpalen',
    subcategory: 'Algemeen',
    shortName: 'Verkeerde automaat (B32)',
    description: 'De laadinrichtingen met een maximaal vermogen van 2X 22 Kw zijn beveiligd tegen over- en kortsluitstroom met een beveiligingstoestel van B32 Amp. Dit is niet conform de productspecificaties van de fabrikant. Tevens voldoet dit niet aan de verificatiemethode voor de temperatuursverhoging conform de norm NEN-EN-IEC-61439-1.',
    classification: 'Yellow',
    action: 'Herstellen'
  },
  {
    id: 'laad_2',
    category: 'Laadpalen',
    subcategory: 'Algemeen',
    shortName: 'Max stroom overschreden',
    description: 'De toegekende stroom van de stroomketens van de te verifiëren SCHAKELINRICHTING (zie 10.10.1) mag niet meer bedragen dan 80 % van de toegekende afgesproken thermische stroom vrij in lucht (Ith), indien van toepassing, of de toegekende stroom (In) van de schakeltoestellen.',
    classification: 'Yellow',
    action: 'Herstellen'
  },
  {
    id: 'laad_3',
    category: 'Laadpalen',
    subcategory: 'Algemeen',
    shortName: 'Gelijktijdigheid 100%',
    description: 'Er is niet vast gesteld of er een regeling in de belasting aanwezig is tussen de laadinrichtingen, nader onderzoek is nodig. Op tekening staat een gelijktijdigheid van 50% terwijl er met 100% gerekend moet worden, tenzij er een vermogensregeling aanwezig is.',
    classification: 'Yellow',
    action: 'Onderzoeken'
  }
];