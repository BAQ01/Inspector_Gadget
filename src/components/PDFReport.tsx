import { Document, Page, Text, View, StyleSheet, Image, Link } from '@react-pdf/renderer';
import { Defect, InspectionMeta, Measurements } from '../types';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#333', lineHeight: 1.4, paddingBottom: 60 },
  
  // --- VOORPAGINA STIJLEN ---
  coverPageStyle: { padding: 0, flexDirection: 'column', width: '100%', height: '100%' },
  coverContainer: { flex: 1, position: 'relative', width: '100%', height: '100%' },
  coverBgImage: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -1 },
  coverOverlayLeft: { position: 'absolute', top: 0, left: 0, width: '40%', height: '100%', backgroundColor: '#5b82c2', opacity: 0.85, padding: 30, paddingTop: 80, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  coverLogo: {
    width: 180,       // Breedte van het logo
    height: 'auto',
    marginTop: 60,    // Zorgt voor witruimte tussen de tekst "NTA 8220" en het logo
  },
  coverBranding: { marginTop: 0, marginBottom: 40 },
  coverBrandMain: { fontSize: 42, fontWeight: 'bold', color: 'white', lineHeight: 1 },
  coverBrandSub: { fontSize: 24, fontWeight: 'bold', color: 'white', opacity: 0.9 },
  coverTitleBlock: { marginBottom: 20 },
  coverTitleMain: { fontSize: 26, fontWeight: 'bold', color: '#ffff33', textTransform: 'uppercase', lineHeight: 1.1, marginBottom: 2 },
  coverTitleSub: { fontSize: 12, color: 'white', fontWeight: 'bold', marginBottom: 2 },
  coverStandard: { fontSize: 10, color: 'white', marginTop: 15 },
  coverProjectBox: { position: 'absolute', top: '40%', right: 40, width: 260, backgroundColor: 'white', opacity: 0.85, padding: 25, borderRadius: 4, shadowOpacity: 0.2, shadowRadius: 4 },
  projectBoxLabel: { fontSize: 8, fontWeight: 'bold', color: '#5b82c2', marginBottom: 2, textTransform: 'uppercase' },
  projectBoxValue: { fontSize: 11, marginBottom: 12, color: '#333', fontWeight: 'bold' },
  coverFooterInternal: { marginBottom: 20, color: 'white', fontSize: 9 },
  footerCompanyName: { fontWeight: 'bold', fontSize: 10, marginBottom: 2 },
  footerText: { marginBottom: 2 },
  footerLabel: { marginTop: 6, fontSize: 8, opacity: 0.9 },

  // --- ALGEMENE STIJLEN ---
  h1: { fontSize: 14, fontWeight: 'bold', color: '#0056b3', marginTop: 20, marginBottom: 10 }, 
  h3: { fontSize: 11, color: '#0056b3', marginTop: 15, marginBottom: 4 },
  textBlock: { marginBottom: 8, textAlign: 'justify' },
  bold: { fontWeight: 'bold' },
  listItem: { marginLeft: 10, marginBottom: 2 },
  link: { color: '#3399ff', textDecoration: 'none', fontSize: 9 },

  headerLevel1: { backgroundColor: '#5b82c2', color: 'white', padding: 4, fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 10, marginTop: 10 },
  headerLevel2: { backgroundColor: '#dae3f3', color: 'black', padding: 4, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 5, marginTop: 5 },
  headerLevel3: { fontSize: 10, color: '#333', textTransform: 'uppercase', borderBottomWidth: 1, borderColor: '#5b82c2', marginBottom: 5, paddingBottom: 2, marginTop: 10, fontWeight: 'bold' },

  // --- TABEL STIJLEN ---
  tableContainer: { borderWidth: 1, borderColor: '#000', marginBottom: 10, fontSize: 9 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000', minHeight: 18, alignItems: 'center' },
  tableRowStretch: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000', minHeight: 18, alignItems: 'stretch' },
  tableRowLast: { flexDirection: 'row', minHeight: 18, alignItems: 'center' },
  tableCell: { padding: 4, borderRightWidth: 1, borderColor: '#000' },
  tableCellLast: { padding: 4 },
  
  colLabel: { width: '40%', fontWeight: 'bold', backgroundColor: '#f9f9f9' },
  colValue: { width: '60%' },

  instColName: { width: '50%' },
  instColSn: { width: '25%' },
  instColDate: { width: '25%' },

  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  checkboxLabel: { width: '60%', fontSize: 10 },
  checkboxValue: { width: '40%', fontSize: 10 },

  funcHeaderBlock: { borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 0, borderColor: '#000', backgroundColor: '#dae3f3', padding: 4, fontSize: 9, fontWeight: 'bold' },
  funcTableBlock: { borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderTopWidth: 0, borderColor: '#000', fontSize: 9, marginBottom: 10 },

  ufColLabel: { width: '40%', padding: 4, fontSize: 9, backgroundColor: '#f9f9f9', borderRightWidth: 1, borderColor: '#000' },
  ufColCheck: { width: '10%', padding: 4, fontSize: 9, textAlign: 'center', borderRightWidth: 1, borderColor: '#000', borderRightColor: '#000' },
  ufColCheckLast: { width: '10%', padding: 4, fontSize: 9, textAlign: 'center' }, 

  normRow: { flexDirection: 'row', marginBottom: 6 },
  normColCheck: { width: '5%', alignItems: 'center', justifyContent: 'center' },
  normColName: { width: '30%', fontSize: 9 }, 
  normColDesc: { width: '65%', fontSize: 9 },

  // --- GEBREKEN TABEL STIJLEN ---
  cTableContainer: { borderWidth: 1, borderColor: '#000', fontSize: 9, marginBottom: 15 },
  cRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000', minHeight: 18 },
  cRowLast: { flexDirection: 'row', borderBottomWidth: 0, minHeight: 18 },
  cHeader: { backgroundColor: '#ccc', fontWeight: 'bold', borderBottomWidth: 1, borderColor: '#000' }, 
  cCell: { padding: 4, borderRightWidth: 1, borderColor: '#000' },
  cCellLast: { padding: 4 }, 
  
  bgRed: { backgroundColor: '#ff3333', color: 'white' },
  bgOrange: { backgroundColor: '#ffaa33' },
  bgYellow: { backgroundColor: '#ffff33' },
  bgBlue: { backgroundColor: '#3399ff', color: 'white' },

  defectBlock: { marginTop: 10, marginBottom: 10, borderWidth: 1, borderColor: '#eee', borderRadius: 4 },
  defectHeader: { flexDirection: 'row', padding: 5, backgroundColor: '#fafafa' },
  defectBody: { padding: 8 },
  defectImage: { width: 200, height: 130, objectFit: 'contain', borderRadius: 4, backgroundColor: '#f0f0f0' },
  
  bgRedLight: { backgroundColor: '#ffebee' },
  bgOrangeLight: { backgroundColor: '#fff3e0' },
  bgYellowLight: { backgroundColor: '#fffde7' },

  // --- STEEKPROEF & MATRIX STIJLEN ---
  matrixTable: { borderTopWidth: 1, borderLeftWidth: 1, borderColor: '#000', fontSize: 8 },
  matrixRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000' },
  matrixCol1: { width: '15%', padding: 3, borderRightWidth: 1, borderColor: '#000', backgroundColor: '#f9f9f9' },
  matrixCol2: { width: '20%', padding: 3, borderRightWidth: 1, borderColor: '#000' },
  matrixColSmall: { width: '16.25%', padding: 3, borderRightWidth: 1, borderColor: '#000', textAlign: 'center' },
  matrixHeader: { fontWeight: 'bold', backgroundColor: '#f0f0f0' },

  steekContainer: { borderWidth: 1, borderColor: '#000', fontSize: 9, marginTop: 10, marginBottom: 10 },
  stHeaderBlock: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000', backgroundColor: '#f0f0f0', fontWeight: 'bold', height: 54 },
  stHeadColCode: { width: '10%', borderRightWidth: 1, borderColor: '#000', justifyContent: 'center', alignItems: 'center', height: '100%' },
  stHeadColOmvang: { width: '30%', borderRightWidth: 1, borderColor: '#000', height: '100%' },
  stHeadColSteek: { width: '20%', borderRightWidth: 1, borderColor: '#000', justifyContent: 'center', alignItems: 'center', height: '100%' },
  stHeadCol1000: { width: '40%', height: '100%' },
  stSubRow: { height: 18, justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderColor: '#000', width: '100%' },
  stSubRowLast: { height: 18, flexDirection: 'row', width: '100%' },
  stRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000', height: 16, alignItems: 'center' },
  stCell: { borderRightWidth: 1, borderColor: '#000', textAlign: 'center', fontSize: 9 },

  resTableContainer: { borderWidth: 1, borderColor: '#000', marginTop: 0 },
  resHeaderBlock: { backgroundColor: '#ccc', borderBottomWidth: 1, borderColor: '#000', padding: 4, fontWeight: 'bold' },
  resRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000', minHeight: 20, alignItems: 'center' },
  resRowLast: { flexDirection: 'row', minHeight: 20, alignItems: 'center' },
  resCell: { padding: 4, borderRightWidth: 1, borderColor: '#000', fontSize: 9 },
  resCellLast: { padding: 4, fontSize: 9 },
  resCol1: { width: '40%' },
  resCol2: { width: '30%' },
  resCol3: { width: '15%' },
  resCol4: { width: '15%' },
  
  signatureBox: { marginTop: 10, borderWidth: 1, borderColor: '#ccc', height: 60, width: 200, justifyContent: 'center', alignItems: 'center' },
  declRow: { flexDirection: 'row', marginBottom: 8 },
  declCheck: { width: '5%', fontWeight: 'bold' },
  declText: { width: '95%', fontWeight: 'bold', fontSize: 9 },
  declBullet: { width: '5%', fontSize: 12 }, 

  formRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'center' },
  formLabel: { width: '25%', fontWeight: 'bold' },
  formColon: { width: '5%', textAlign: 'center' },
  formLine: { width: '70%', borderBottomWidth: 1, borderColor: '#ccc' },
  
  pageNumber: { position: 'absolute', top: 20, left: 0, right: 0, textAlign: 'center', fontSize: 9, color: '#888' }
});

interface Props {
  meta: InspectionMeta;
  defects: Defect[];
  measurements: Measurements;
}

const getSampleData = (count: number) => {
  if (count <= 0) return { range: 'Onbekend', sample: 0 };
  if (count <= 25) return { range: '5-25', sample: 5 };
  if (count <= 50) return { range: '26-50', sample: 8 };
  if (count <= 90) return { range: '51-90', sample: 13 };
  if (count <= 150) return { range: '91-150', sample: 20 };
  if (count <= 280) return { range: '151-280', sample: 32 };
  if (count <= 500) return { range: '281-500', sample: 50 };
  if (count <= 1200) return { range: '501-1200', sample: 80 };
  if (count <= 3200) return { range: '1201-3200', sample: 125 };
  if (count <= 10000) return { range: '3201-10000', sample: 200 };
  return { range: '10001-35000', sample: 315 };
};

export const PDFReport = ({ meta, defects, measurements }: Props) => {
  const check = (val: boolean) => val ? 'V' : '';
  const hasDefects = defects.length > 0;
  const companyName = meta.inspectionCompany || 'Het inspectiebedrijf';
  const sampleInfo = getSampleData(meta.totalComponents);

  const backgroundImageUrl = meta.locationPhotoUrl || 'https://via.placeholder.com/800x1200.png?text=Locatiefoto+Ontbreekt';

  // --- FUNCTIE OM NAMEN SAMEN TE VOEGEN ---
  // Hoofdinspecteur ALTIJD als eerste, daarna de unieke collega's
  const getInspectorNames = () => {
    // 1. Start met de hoofdinspecteur
    const allNames = [meta.inspectorName];
    
    // 2. Voeg eventuele collega's toe (met dubbel-check op duplicaten)
    if (meta.additionalInspectors && Array.isArray(meta.additionalInspectors)) {
        meta.additionalInspectors.forEach(name => {
            if (name && !allNames.includes(name)) {
                allNames.push(name);
            }
        });
    }

    // 3. Retourneer als string: "Jan Jansen, Piet Pietersen, Klaas Klaassen"
    return allNames.join(', ');
  };

  // --- FUNCTIE OM PREFIX TE VERWIJDEREN ---
  // Verwijdert "[BIJDRAGE NAAM]" (met of zonder dubbele punt) uit de tekst
  const cleanDescription = (desc: string) => {
    if (!desc) return '';
    // Regex uitleg: 
    // \[BIJDRAGE -> Zoek letterlijk naar [BIJDRAGE
    // .*?        -> Pak alles tot de sluitende haak
    // \]         -> Sluitende haak
    // :?         -> Optionele dubbele punt
    // \s* -> Eventuele spaties erachter
    // g, i       -> Globaal (overal in tekst), Case-insensitive (hoofdletters maken niet uit)
    return desc.replace(/\[BIJDRAGE.*?\]:?\s*/gi, '').trim();
  };

  return (
    <Document>
      
      {/* PAGINA 1: VOORBLAD */}
      <Page size="A4" style={styles.coverPageStyle}> 
        <View style={styles.coverContainer}>
          <Image src={backgroundImageUrl} style={styles.coverBgImage} />
          
          {/* DE BLAUWE BALK LINKS */}
          <View style={styles.coverOverlayLeft}>
             <View>
                <View style={styles.coverBranding}>
                    <Text style={styles.coverBrandMain}>SCIOS</Text>
                    <Text style={styles.coverBrandSub}>Scope 10</Text>
                </View>
                
                <View style={styles.coverTitleBlock}>
                    <Text style={styles.coverTitleMain}>INSPECTIE</Text>
                    <Text style={styles.coverTitleMain}>RAPPORT</Text>
                    <View style={{ height: 10 }} /> 
                    <Text style={styles.coverTitleSub}>Beoordeling elektrisch</Text>
                    <Text style={styles.coverTitleSub}>materieel op brandrisico</Text>
                    <Text style={styles.coverStandard}>Conform NTA 8220</Text>

                    {/* HIER STAAT HET LOGO NU VEILIG IN DE BLAUWE BALK */}
                    <Image 
                      src={window.location.origin + "/scios-logo.png"} 
                      style={styles.coverLogo} 
                    />
                </View>
             </View>

             <View style={styles.coverFooterInternal}>
                <Text style={styles.footerCompanyName}>{companyName}</Text>
                <Text style={styles.footerText}>{meta.inspectionCompanyAddress}</Text>
                <Text style={styles.footerText}>{meta.inspectionCompanyPostalCode} {meta.inspectionCompanyCity}</Text>
                <Text style={styles.footerLabel}>Telefoonnummer:</Text>
                <Text style={styles.footerText}>{meta.inspectionCompanyPhone}</Text>
                <Text style={styles.footerLabel}>Email:</Text>
                <Text style={styles.footerText}>{meta.inspectionCompanyEmail}</Text>
                <Text style={{ fontSize: 7, marginTop: 10, opacity: 0.7 }}>Gegenereerd door SCIOS Inspector App</Text>
             </View>
          </View>

          {/* HET WITTE PROJECT BLOK RECHTS */}
          <View style={styles.coverProjectBox}>
            <Text style={styles.projectBoxLabel}>Betreft:</Text>
            <Text style={styles.projectBoxValue}>Inspectie SCIOS Scope 10</Text>
            <Text style={styles.projectBoxLabel}>Project:</Text>
            <Text style={styles.projectBoxValue}>{meta.projectLocation}</Text>
            <Text style={styles.projectBoxLabel}>Adres:</Text>
            <Text style={styles.projectBoxValue}>{meta.projectAddress}, {meta.projectCity}</Text>
            <Text style={styles.projectBoxLabel}>Datum:</Text>
            <Text style={styles.projectBoxValue}>{meta.date}</Text>
          </View>

     
        </View>
      </Page>

      {/* PAGINA 2: VOORWOORD */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.pageNumber} fixed render={({ pageNumber }) => { return pageNumber > 1 ? `Pagina ${pageNumber - 1}` : ''; }} />
        <Text style={styles.h1}>Voorwoord:</Text>
        <Text style={styles.textBlock}>Het doel van de SCIOS Scope 10 inspectie is om inzicht te krijgen in de belangrijkste elektrische risico's. Het zijn vaak relatief kleine afwijkingen die risico's veroorzaken. U kunt deze echter niet altijd zien of herkennen of u bent zich niet bewust van het feit dat ze een risico vormen. Tijdens de inspectie is niet alleen gefocust op de elektrische installatie, risicovolle apparaten en machines zijn ook bekeken. Deze zijn vaak verantwoordelijk voor het ontstaan van een brand.</Text>
        <Text style={styles.textBlock}>De inhoud van de SCIOS Scope 10 inspectie bestaat uit:</Text>
        <View style={{ marginBottom: 8 }}>
          <Text style={styles.listItem}>• een uitgebreide visuele inspectie van de schakel- en verdeelinrichtingen, elektrische installatie en risicovolle eindgebruikers;</Text>
          <Text style={styles.listItem}>• metingen en beproevingen;</Text>
          <Text style={styles.listItem}>• thermografische inspectie (warmtebeeldopname).</Text>
        </View>
        <Text style={styles.textBlock}><Text style={styles.bold}>Let op:</Text> met deze inspectie voldoet u nog niet aan de Arbowet. Er is geen sprake van een volledige inspectie conform de NEN-EN 50110 / NEN 3140. Deze normen bevatten aanvullende bepalingen om het geheel te voldoen aan artikel 3.4 en 3.5 van het Arbobesluit. Sommige aspecten van deze inspectie van zowel de laagspanningsinstallaties als de elektrische apparaten voldoen niet aan de NEN 3140.</Text>
        <Text style={styles.h3}>Leeswijzer:</Text>
        <Text style={styles.textBlock}>Dit rapport is opgesteld aan de hand van technisch document 14 dat behoort bij een SCIOS Scope 10 inspectie. Het technisch document 14 beschrijft de eisen voor de inspectie van elektrisch materieel op brandrisico’s en behoort bij het hoofddocument "Certificatieregeling voor het kwaliteitsmanagementsysteem ten behoeve van het uitvoeren van onderhoud en inspecties aan technische installaties".</Text>
        <Text style={styles.textBlock}>In Scope 10 is het onderhoud aan elektrisch materieel niet opgenomen.</Text>
        <Text style={styles.textBlock}>Dit document is gebaseerd op de NTA 8220 Beoordelingsmethode op brandrisico van elektrisch materieel en is daarmee in overeenstemming.</Text>
        <View style={{ marginBottom: 8 }}>
          <Text style={styles.listItem}>• Voldoet de installatie wel of niet? In hoofdstuk 3 is een verklaring opgenomen of het elektrisch materieel brand verhogende risico's heeft.</Text>
          <Text style={styles.listItem}>• Inspectietermijn: in hoofdstuk 3 vindt u de geadviseerde inspectiefrequentie, die de inspecteur adviseert op basis van de uitgevoerde inspectie.</Text>
          <Text style={styles.listItem}>• Lijst van afwijkingen: In hoofdstuk 4 zijn de eventueel geconstateerde afwijkingen opgenomen.</Text>
        </View>
        <Text style={styles.textBlock}>{meta.inspectionCompany ? meta.inspectionCompany : 'Het inspectiebedrijf'} heeft deze inspectie uitgevoerd conform een door SCIOS opgesteld en geaccrediteerd kwaliteitsborgingsysteem met de naam "SCIOS Scope 10". Deze werkwijze garandeert een zorgvuldige en uniforme uitvoering van de inspectie en rapportage.</Text>
      </Page>

      {/* PAGINA 3: BASISGEGEVENS */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.pageNumber} fixed render={({ pageNumber }) => { return pageNumber > 1 ? `Pagina ${pageNumber - 1}` : ''; }} />
        <Text style={styles.headerLevel1}>1. Basisgegevens</Text>
        <Text style={styles.headerLevel2}>Opdrachtgever</Text>
        <View style={styles.tableContainer}>
          <View style={styles.tableRow}><Text style={[styles.tableCell, styles.colLabel]}>Naam opdrachtgever:</Text><Text style={[styles.tableCellLast, styles.colValue]}>{meta.clientName}</Text></View>
          <View style={styles.tableRow}><Text style={[styles.tableCell, styles.colLabel]}>Adres:</Text><Text style={[styles.tableCellLast, styles.colValue]}>{meta.clientAddress}</Text></View>
          <View style={styles.tableRow}><Text style={[styles.tableCell, styles.colLabel]}>Postcode / Plaats:</Text><Text style={[styles.tableCellLast, styles.colValue]}>{meta.clientPostalCode}  {meta.clientCity}</Text></View>
          <View style={styles.tableRow}><Text style={[styles.tableCell, styles.colLabel]}>Contactpersoon:</Text><Text style={[styles.tableCellLast, styles.colValue]}>{meta.clientContactPerson}</Text></View>
          <View style={styles.tableRow}><Text style={[styles.tableCell, styles.colLabel]}>Telefoon:</Text><Text style={[styles.tableCellLast, styles.colValue]}>{meta.clientPhone}</Text></View>
          <View style={styles.tableRowLast}><Text style={[styles.tableCell, styles.colLabel]}>Email:</Text><Text style={[styles.tableCellLast, styles.colValue]}>{meta.clientEmail}</Text></View>
        </View>
        <Text style={styles.headerLevel2}>Projectgegevens</Text>
        <View style={styles.tableContainer}>
          <View style={styles.tableRow}><Text style={[styles.tableCell, styles.colLabel]}>Locatie:</Text><Text style={[styles.tableCellLast, styles.colValue]}>{meta.projectLocation}</Text></View>
          <View style={styles.tableRow}><Text style={[styles.tableCell, styles.colLabel]}>Adres:</Text><Text style={[styles.tableCellLast, styles.colValue]}>{meta.projectAddress}</Text></View>
          <View style={styles.tableRow}><Text style={[styles.tableCell, styles.colLabel]}>Postcode / Plaats:</Text><Text style={[styles.tableCellLast, styles.colValue]}>{meta.projectPostalCode}  {meta.projectCity}</Text></View>
          <View style={styles.tableRow}><Text style={[styles.tableCell, styles.colLabel]}>Contactpersoon:</Text><Text style={[styles.tableCellLast, styles.colValue]}>{meta.projectContactPerson}</Text></View>
          <View style={styles.tableRow}><Text style={[styles.tableCell, styles.colLabel]}>Telefoon:</Text><Text style={[styles.tableCellLast, styles.colValue]}>{meta.projectPhone}</Text></View>
          <View style={styles.tableRow}><Text style={[styles.tableCell, styles.colLabel]}>Email:</Text><Text style={[styles.tableCellLast, styles.colValue]}>{meta.projectEmail}</Text></View>
          <View style={styles.tableRow}><Text style={[styles.tableCell, styles.colLabel]}>Installatieverantwoordelijke:</Text><Text style={[styles.tableCellLast, styles.colValue]}>{meta.installationResponsible}</Text></View>
          <View style={styles.tableRowLast}>
            <Text style={[styles.tableCell, styles.colLabel]}>ID Bagviewer:</Text>
            <View style={[styles.tableCellLast, styles.colValue, { flexDirection: 'row', gap: 5 }]}>
              <Text>{meta.idBagviewer}</Text>
              {meta.idBagviewer && (<Link src={`https://bagviewer.kadaster.nl/lvbag/bag-viewer/?zoomlevel=1&objectId=${meta.idBagviewer}`} style={styles.link}>Bag Viewer</Link>)}
            </View>
          </View>
        </View>
        <Text style={styles.headerLevel2}>Inspectiebedrijf</Text>
        <View style={styles.tableContainer}>
          <View style={styles.tableRow}><Text style={[styles.tableCell, styles.colLabel]}>Naam:</Text><Text style={[styles.tableCellLast, styles.colValue]}>{meta.inspectionCompany}</Text></View>
          <View style={styles.tableRow}><Text style={[styles.tableCell, styles.colLabel]}>Adres:</Text><Text style={[styles.tableCellLast, styles.colValue]}>{meta.inspectionCompanyAddress}</Text></View>
          <View style={styles.tableRow}><Text style={[styles.tableCell, styles.colLabel]}>Postcode / Plaats:</Text><Text style={[styles.tableCellLast, styles.colValue]}>{meta.inspectionCompanyPostalCode}  {meta.inspectionCompanyCity}</Text></View>
          <View style={styles.tableRow}><Text style={[styles.tableCell, styles.colLabel]}>Telefoon:</Text><Text style={[styles.tableCellLast, styles.colValue]}>{meta.inspectionCompanyPhone}</Text></View>
          <View style={styles.tableRow}><Text style={[styles.tableCell, styles.colLabel]}>Email:</Text><Text style={[styles.tableCellLast, styles.colValue]}>{meta.inspectionCompanyEmail}</Text></View>
          {/* HIER WORDEN DE NAMEN NETJES GECOMBINEERD */}
          <View style={styles.tableRow}><Text style={[styles.tableCell, styles.colLabel]}>Inspectie uitgevoerd door:</Text><Text style={[styles.tableCellLast, styles.colValue]}>{getInspectorNames()}</Text></View>
          <View style={styles.tableRow}><Text style={[styles.tableCell, styles.colLabel]}>Inspectiedatum:</Text><Text style={[styles.tableCellLast, styles.colValue]}>{meta.date}</Text></View>
          <View style={styles.tableRowLast}><Text style={[styles.tableCell, styles.colLabel]}>SCIOS-registratienummer:</Text><Text style={[styles.tableCellLast, styles.colValue]}>{meta.sciosRegistrationNumber}</Text></View>
        </View>
      </Page>

      {/* PAGINA 4: MEETINSTRUMENTEN */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.pageNumber} fixed render={({ pageNumber }) => { return pageNumber > 1 ? `Pagina ${pageNumber - 1}` : ''; }} />
        <Text style={styles.headerLevel2}>Gebruikte Meetinstrumenten</Text>
        <View style={styles.tableContainer}>
          <View style={[styles.tableRow, { backgroundColor: '#dae3f3' }]}>
            <Text style={[styles.tableCell, styles.instColName, { fontWeight: 'bold' }]}>Meetinstrument</Text>
            <Text style={[styles.tableCell, styles.instColSn, { fontWeight: 'bold' }]}>Serienummer</Text>
            <Text style={[styles.tableCellLast, styles.instColDate, { fontWeight: 'bold' }]}>Kalibratie/Controle</Text>
          </View>
          {measurements.selectedInstruments && measurements.selectedInstruments.length > 0 ? (
            measurements.selectedInstruments.map((inst, index, arr) => (
              <View style={index === arr.length - 1 ? styles.tableRowLast : styles.tableRow} key={inst.id}>
                <Text style={[styles.tableCell, styles.instColName]}>{inst.name}</Text>
                <Text style={[styles.tableCell, styles.instColSn]}>{inst.serialNumber}</Text>
                <Text style={[styles.tableCellLast, styles.instColDate]}>{inst.calibrationDate}</Text>
              </View>
            ))
          ) : (
            <View style={styles.tableRowLast}><Text style={{ padding: 4, fontStyle: 'italic' }}>Geen instrumenten geselecteerd.</Text></View>
          )}
        </View>
        <Text style={{ fontSize: 9, fontStyle: 'italic', color: '#555', marginBottom: 15 }}>Meetmiddelen die worden ingezet voor metingen die selectief zijn, moeten jaarlijks worden gekalibreerd. Indien de leverancier van het meetmiddel een kortere termijn voorschrijft, moet deze worden toegepast.</Text>
        <Text style={styles.headerLevel2}>Energie Opslagsysteem</Text>
        <View style={styles.checkboxRow}><Text style={styles.checkboxLabel}>Is er een Energieopslagsysteem aanwezig?</Text><Text style={styles.checkboxValue}>[{measurements.hasEnergyStorage ? ' X ' : '   '}] Ja   [{!measurements.hasEnergyStorage ? ' X ' : '   '}] Nee</Text></View>
        <Text style={styles.headerLevel2}>Zonnestroominstallatie</Text>
        <View style={styles.checkboxRow}><Text style={styles.checkboxLabel}>Is er een zonnestroominstallatie aanwezig?</Text><Text style={styles.checkboxValue}>[{measurements.hasSolarSystem ? ' X ' : '   '}] Ja   [{!measurements.hasSolarSystem ? ' X ' : '   '}] Nee</Text></View>
        <Text style={{ fontSize: 9, fontStyle: 'italic', color: '#555', marginTop: 4 }}>Bij aanwezigheid van een zonnestroominstallatie is deze tot de omvormer met de hierop aangesloten stekers geïnspecteerd. Inspectie voor zonnestroominstallaties is vastgelegd in SCIOS Scope 12, het is raadzaam deze inspectie uit te laten voeren.</Text>
      </Page>

      {/* PAGINA 5: INSTALLATIEGEGEVENS */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.pageNumber} fixed render={({ pageNumber }) => { return pageNumber > 1 ? `Pagina ${pageNumber - 1}` : ''; }} />
        <Text style={styles.headerLevel1}>2. Installatiegegevens</Text>
        <View style={styles.tableContainer}>
          <View style={styles.tableRow}><Text style={[styles.tableCell, styles.colLabel]}>Stroomstelsel:</Text><Text style={[styles.tableCellLast, styles.colValue]}>{measurements.installationType}</Text></View>
          <View style={styles.tableRow}><Text style={[styles.tableCell, styles.colLabel]}>Netspanning:</Text><Text style={[styles.tableCellLast, styles.colValue]}>{measurements.mainsVoltage || '400 V ~ 3 fase + N'}</Text></View>
          <View style={styles.tableRow}><Text style={[styles.tableCell, styles.colLabel]}>Voorbeveiliging:</Text><Text style={[styles.tableCellLast, styles.colValue]}>{measurements.mainFuse}</Text></View>
          <View style={styles.tableRowLast}><Text style={[styles.tableCell, styles.colLabel]}>Bouwjaar verdeler:</Text><Text style={[styles.tableCellLast, styles.colValue]}>{measurements.yearOfConstruction}</Text></View>
        </View>

        {/* NIEUWE SECTIE: METINGEN PER VERDEELINRICHTING */}
        <Text style={styles.headerLevel2}>Metingen per Verdeelinrichting</Text>
        <View style={styles.tableContainer}>
            <View style={[styles.tableRow, { backgroundColor: '#dae3f3' }]}>
                <Text style={[styles.tableCell, { width: '40%', fontWeight: 'bold' }]}>Verdeelinrichting</Text>
                <Text style={[styles.tableCell, { width: '20%', fontWeight: 'bold' }]}>Temp (°C)</Text>
                <Text style={[styles.tableCell, { width: '20%', fontWeight: 'bold' }]}>Riso (MΩ)</Text>
                <Text style={[styles.tableCellLast, { width: '20%', fontWeight: 'bold' }]}>Zi (Ω)</Text>
            </View>
            {measurements.boards && measurements.boards.length > 0 ? (
                measurements.boards.map((board, i) => (
                    <View key={board.id || i} style={styles.tableRow}>
                        {/* HIER WORDT EVENTUEEL [BIJDRAGE...] uit de naam verwijderd als je dat wilt, 
                            maar meestal wil je bij metingen wél zien van wie de kast was. 
                            De naam van de kast blijft hier gewoon staan. */}
                        <Text style={[styles.tableCell, { width: '40%' }]}>{board.name || `Verdeler ${i+1}`}</Text>
                        <Text style={[styles.tableCell, { width: '20%' }]}>{board.switchboardTemp}</Text>
                        <Text style={[styles.tableCell, { width: '20%' }]}>{board.insulationResistance}</Text>
                        <Text style={[styles.tableCellLast, { width: '20%' }]}>{board.impedance}</Text>
                    </View>
                ))
            ) : (
                <View style={styles.tableRowLast}><Text style={{ padding: 4 }}>Geen verdeelinrichtingen toegevoegd.</Text></View>
            )}
        </View>
        
        <View style={{ marginTop: 20 }}>
          <View style={styles.funcHeaderBlock}>
             <Text>Onderstaande functies volgens het Besluit bouwwerken leefomgeving zijn van toepassing.</Text>
          </View>
          <View style={styles.funcTableBlock}>
            <View style={styles.tableRowStretch}><Text style={[styles.tableCell, styles.ufColLabel]}>Woonfunctie</Text><Text style={[styles.tableCell, styles.ufColCheck]}>{check(meta.usageFunctions.woonfunctie)}</Text><Text style={[styles.tableCell, styles.ufColLabel]}>Logiesfunctie</Text><Text style={[styles.tableCellLast, styles.ufColCheckLast]}>{check(meta.usageFunctions.logiesfunctie)}</Text></View>
            <View style={styles.tableRowStretch}><Text style={[styles.tableCell, styles.ufColLabel]}>Bijeenkomstfunctie</Text><Text style={[styles.tableCell, styles.ufColCheck]}>{check(meta.usageFunctions.bijeenkomstfunctie)}</Text><Text style={[styles.tableCell, styles.ufColLabel]}>Onderwijsfunctie</Text><Text style={[styles.tableCellLast, styles.ufColCheckLast]}>{check(meta.usageFunctions.onderwijsfunctie)}</Text></View>
            <View style={styles.tableRowStretch}><Text style={[styles.tableCell, styles.ufColLabel]}>Celfunctie</Text><Text style={[styles.tableCell, styles.ufColCheck]}>{check(meta.usageFunctions.celfunctie)}</Text><Text style={[styles.tableCell, styles.ufColLabel]}>Sportfunctie</Text><Text style={[styles.tableCellLast, styles.ufColCheckLast]}>{check(meta.usageFunctions.sportfunctie)}</Text></View>
            <View style={styles.tableRowStretch}><Text style={[styles.tableCell, styles.ufColLabel]}>Gezondheidszorgfunctie</Text><Text style={[styles.tableCell, styles.ufColCheck]}>{check(meta.usageFunctions.gezondheidszorgfunctie)}</Text><Text style={[styles.tableCell, styles.ufColLabel]}>Winkelfunctie</Text><Text style={[styles.tableCellLast, styles.ufColCheckLast]}>{check(meta.usageFunctions.winkelfunctie)}</Text></View>
            <View style={styles.tableRowStretch}><Text style={[styles.tableCell, styles.ufColLabel]}>Industriefunctie</Text><Text style={[styles.tableCell, styles.ufColCheck]}>{check(meta.usageFunctions.industriefunctie)}</Text><Text style={[styles.tableCell, styles.ufColLabel]}>Overige gebruiksfunctie</Text><Text style={[styles.tableCellLast, styles.ufColCheckLast]}>{check(meta.usageFunctions.overigeGebruiksfunctie)}</Text></View>
            <View style={{...styles.tableRowStretch, borderBottomWidth: 0}}><Text style={[styles.tableCell, styles.ufColLabel]}>Kantoorfunctie</Text><Text style={[styles.tableCell, styles.ufColCheck]}>{check(meta.usageFunctions.kantoorfunctie)}</Text><Text style={[styles.tableCell, styles.ufColLabel]}>Bouwwerk geen gebouw zijnde</Text><Text style={[styles.tableCellLast, styles.ufColCheckLast]}>{check(meta.usageFunctions.bouwwerkGeenGebouw)}</Text></View>
          </View>
        </View>
      </Page>

      {/* PAGINA 6: INSPECTIE */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.pageNumber} fixed render={({ pageNumber }) => { return pageNumber > 1 ? `Pagina ${pageNumber - 1}` : ''; }} />
        <Text style={styles.headerLevel1}>3: INSPECTIE:</Text>
        <Text style={styles.headerLevel2}>TOEGEPASTE NORMEN:</Text>
        <Text style={{ marginBottom: 5 }}>De inspectie is uitgevoerd op basis van:</Text>
        <View style={styles.normRow}><View style={styles.normColCheck}><Text style={{ fontWeight: 'bold' }}>X</Text></View><Text style={styles.normColName}>NTA 8220: 2017</Text><Text style={styles.normColDesc}>Methode voor het beoordelen van elektrisch materieel op brandrisico</Text></View>
        <View style={styles.normRow}><View style={styles.normColCheck}><Text style={{ fontWeight: 'bold' }}>X</Text></View><Text style={styles.normColName}>SCIOS TD14 Versie 2.10: 2025-04</Text><Text style={styles.normColDesc}>Inspectie van elektrisch materieel op brandrisico’s</Text></View>
        <View style={styles.normRow}><View style={styles.normColCheck}><Text style={{ fontWeight: 'bold' }}>X</Text></View><Text style={styles.normColName}>NPR 8040-1: 2013</Text><Text style={styles.normColDesc}>Thermografie</Text></View>
        
        <Text style={styles.headerLevel2}>INSPECTIEMETHODE:</Text>
        <Text style={styles.headerLevel3}>VISUELE INSPECTIE:</Text>
        <Text style={styles.textBlock}>Voor de beoordeling van elektrisch materieel op brandrisico moet gelet worden op het volgende:</Text>
        <View style={{ marginBottom: 10 }}><Text style={styles.listItem}>• kan er brand ontstaan bij normaal gebruik;</Text><Text style={styles.listItem}>• kan er brand ontstaan door oneigenlijk gebruik;</Text><Text style={styles.listItem}>• kan er brand ontstaan door een defect.</Text></View>
        <Text style={styles.textBlock}>Voor het uitvoeren van de beoordeling wordt het elektrisch materieel beoordeeld op:</Text>
        <View style={{ marginBottom: 10 }}><Text style={styles.listItem}>• bedrijfsomstandigheden;</Text><Text style={styles.listItem}>• wederzijde beïnvloeding;</Text><Text style={styles.listItem}>• uitwendige beïnvloeding;</Text><Text style={styles.listItem}>• automatische uitschakeling van de voeding.</Text></View>
        <Text style={{ marginBottom: 15, fontStyle: 'italic', fontSize: 9 }}>Geconstateerde afwijkingen worden in hoofdstuk 4 weergegeven.</Text>
        <Text style={styles.headerLevel3}>METINGEN EN BEPROEVINGEN:</Text>
        <Text style={styles.textBlock}>De inspectie door meting en beproeving aan de genoemde installatie(delen) wordt gedaan door:</Text>
        <View style={{ marginBottom: 10 }}><Text style={styles.listItem}>• meting van isolatieweerstand;</Text><Text style={styles.listItem}>• het beproeven van de aardlekbeveiligingen;</Text><Text style={styles.listItem}>• meting voor het bepalen de circuitimpedantie;</Text><Text style={styles.listItem}>• meting van temperatuur.</Text></View>
        <Text style={{ fontStyle: 'italic', fontSize: 9 }}>Geconstateerde afwijkingen worden in hoofdstuk 4 weergegeven.</Text>
      </Page>

      {/* PAGINA 7: VERKLARING & HANDTEKENING */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.pageNumber} fixed render={({ pageNumber }) => { return pageNumber > 1 ? `Pagina ${pageNumber - 1}` : ''; }} />
        <Text style={styles.headerLevel1}>VERKLARING BETREFFENDE GEÏNSPECTEERDE INSTALLATIE:</Text>
        <Text style={styles.textBlock}>In overeenstemming met de opdrachtgever is er een inspectieplan opgesteld. Toch blijft er altijd een risico bestaan, omdat de inspectie een momentopname is. Uit praktisch oogpunt is het onmogelijk de gehele installatie uitputtend te inspecteren. Met het inspectieplan wordt gestreefd naar een optimaal risicobeheer en een veiligheidsniveau volgens de wet en regelgeving. {companyName} verklaart dat de inspectie geheel onafhankelijk is uitgevoerd, volgens de methoden beschreven in het inspectieplan.</Text>
        <View style={{ marginVertical: 15 }}>
          <View style={styles.declRow}><Text style={styles.declCheck}>[{hasDefects ? ' X ' : '   '}]</Text><Text style={styles.declText}>Tijdens de inspectie zijn er geconstateerde gebreken, afwijkingen en/of defecten vastgesteld die een mogelijk risico zijn met betrekking tot brand door elektrisch materieel.</Text></View>
          <View style={styles.declRow}><Text style={styles.declCheck}>[{!hasDefects ? ' X ' : '   '}]</Text><Text style={styles.declText}>Er zijn tijdens de inspectie geen geconstateerde gebreken, afwijkingen en/of defecten vastgesteld.</Text></View>
        </View>
        <Text style={styles.textBlock}>Een scope 10 inspectie wordt na uitvoering afgemeld in het landelijk SCIOS portaal, onafhankelijk van het inspectieresultaat. Afmeldingen met of zonder constateringen dienen binnen 28 dagen na afronding werkzaamheden te worden gedaan. Dit dient te gebeuren op naam van de persoon die de inspectie heeft uitgevoerd. Vermelding in het SCIOS-portaal dient te geschieden door {companyName}.</Text>
        <Text style={styles.textBlock}>Een SCIOS gecertificeerd bedrijf mag enkel een afmelding met constateringen aanpassen naar een afmelding zonder constateringen binnen een periode van <Text style={styles.bold}>één jaar</Text>. Hierna dient er een geheel nieuwe inspectie plaats te vinden.</Text>
        <Text style={styles.textBlock}>Wanneer na een inspectie met constateringen vastgesteld wordt dat de constateringen zijn weggenomen, dan wordt de bestaande afmelding met constateringen gewijzigd in een afmelding zonder constateringen. Daarbij wordt aangegeven hoe is vastgesteld dat de constateringen zijn weggenomen:</Text>
        <View style={{ marginLeft: 5, marginBottom: 20 }}>
          <View style={styles.declRow}><Text style={styles.declBullet}>{'>'}</Text><Text style={{ width: '95%', fontSize: 9 }}>Door middel van een her-inspectie door {companyName}. Hieraan zijn kosten verbonden.</Text></View>
          <View style={styles.declRow}><Text style={styles.declBullet}>{'>'}</Text><Text style={{ width: '95%', fontSize: 9 }}>Verklaring omtrent het wegnemen van de constateringen. Vermelding in het SCIOS-portaal dient te geschieden door {companyName}. Hieraan zijn administratieve kosten verbonden. Een ondertekende herstelverklaring, ondersteund met foto’s en een beschrijving van de herstelwijze, wordt enkel geaccepteerd indien alle bedrijfsgegevens van de installateur en een volledig overzicht van de herstelde punten zijn aangeleverd en beoordeeld kunnen worden.</Text></View>
        </View>
        <Text style={styles.textBlock}>Namens toezichtverantwoordelijke:</Text>
        <Text style={{ fontSize: 10, marginBottom: 5 }}>{meta.inspectorName}</Text>
        <Text style={{ fontSize: 10, marginBottom: 10 }}>{companyName}</Text>
        {meta.signatureUrl ? (<Image src={meta.signatureUrl} style={{ width: 150, height: 60 }} />) : (<View style={styles.signatureBox}><Text>Geen handtekening</Text></View>)}
      </Page>

      {/* PAGINA 8: INSPECTIEFREQUENTIE */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.pageNumber} fixed render={({ pageNumber }) => { return pageNumber > 1 ? `Pagina ${pageNumber - 1}` : ''; }} />
        <Text style={styles.headerLevel1}>INSPECTIEFREQUENTIE:</Text>
        <View style={styles.matrixTable}>
          <View style={styles.matrixRow}><View style={[styles.matrixCol1, styles.matrixHeader]}><Text>Object</Text></View><View style={[styles.matrixCol2, styles.matrixHeader]}><Text>Gevolgschade of afbreukrisico (a)</Text></View><View style={[styles.matrixColSmall, styles.matrixHeader]}><Text>Aantal (c) constat. is laag</Text></View><View style={[styles.matrixColSmall, styles.matrixHeader]}><Text>Aantal (c) constat. is hoog</Text></View><View style={[styles.matrixColSmall, styles.matrixHeader]}><Text>Aantal (c) constat. is laag</Text></View><View style={[styles.matrixColSmall, { ...styles.matrixHeader, borderRightWidth: 1 }]}><Text>Aantal (c) constat. is hoog</Text></View></View>
          <View style={styles.matrixRow}><View style={[styles.matrixCol1, styles.matrixHeader]}><Text></Text></View><View style={[styles.matrixCol2, styles.matrixHeader]}><Text>Aantal gelijktijdig bedreigde mensen (b)</Text></View><View style={[styles.matrixColSmall, styles.matrixHeader]}><Text>Met urgentie 2</Text></View><View style={[styles.matrixColSmall, styles.matrixHeader]}><Text>Met urgentie 2</Text></View><View style={[styles.matrixColSmall, styles.matrixHeader]}><Text>Met urgentie 1</Text></View><View style={[styles.matrixColSmall, { ...styles.matrixHeader, borderRightWidth: 1 }]}><Text>Met urgentie 1</Text></View></View>
          <View style={styles.matrixRow}><View style={styles.matrixCol1}><Text>Utiliteit (d)</Text></View><View style={styles.matrixCol2}><Text>Laag</Text></View><View style={styles.matrixColSmall}><Text>5</Text></View><View style={styles.matrixColSmall}><Text>5</Text></View><View style={styles.matrixColSmall}><Text>3</Text></View><View style={[styles.matrixColSmall, { borderRightWidth: 1 }]}><Text>3</Text></View></View>
          <View style={styles.matrixRow}><View style={styles.matrixCol1}><Text></Text></View><View style={styles.matrixCol2}><Text>Hoog</Text></View><View style={styles.matrixColSmall}><Text>5</Text></View><View style={styles.matrixColSmall}><Text>3</Text></View><View style={styles.matrixColSmall}><Text>3</Text></View><View style={[styles.matrixColSmall, { borderRightWidth: 1 }]}><Text>3</Text></View></View>
          <View style={styles.matrixRow}><View style={styles.matrixCol1}><Text>Utiliteit, gebruikers zijn niet zelfredzaam of blijven slapen</Text></View><View style={styles.matrixCol2}><Text>Niet van belang</Text></View><View style={styles.matrixColSmall}><Text>3</Text></View><View style={styles.matrixColSmall}><Text>3</Text></View><View style={styles.matrixColSmall}><Text>3</Text></View><View style={[styles.matrixColSmall, { borderRightWidth: 1 }]}><Text>3</Text></View></View>
          <View style={styles.matrixRow}><View style={styles.matrixCol1}><Text>Industrie</Text></View><View style={styles.matrixCol2}><Text>Laag</Text></View><View style={styles.matrixColSmall}><Text>5</Text></View><View style={styles.matrixColSmall}><Text>5</Text></View><View style={styles.matrixColSmall}><Text>5</Text></View><View style={[styles.matrixColSmall, { borderRightWidth: 1 }]}><Text>3</Text></View></View>
          <View style={styles.matrixRow}><View style={styles.matrixCol1}><Text></Text></View><View style={styles.matrixCol2}><Text>Hoog (e)</Text></View><View style={styles.matrixColSmall}><Text>5</Text></View><View style={styles.matrixColSmall}><Text>3</Text></View><View style={styles.matrixColSmall}><Text>3</Text></View><View style={[styles.matrixColSmall, { borderRightWidth: 1 }]}><Text>3</Text></View></View>
          <View style={{ ...styles.matrixRow, borderBottomWidth: 0 }}><View style={styles.matrixCol1}><Text>Intensieve veehouderij</Text></View><View style={styles.matrixCol2}><Text>Niet van belang</Text></View><View style={styles.matrixColSmall}><Text>3</Text></View><View style={styles.matrixColSmall}><Text>3</Text></View><View style={styles.matrixColSmall}><Text>3</Text></View><View style={[styles.matrixColSmall, { borderRightWidth: 1 }]}><Text>3</Text></View></View>
        </View>
        <View style={{ borderWidth: 1, borderColor: '#000', padding: 5, fontSize: 8, borderTopWidth: 1 }}><Text>(a) Op allerlei gebieden kunnen afbreukrisico’s bestaan, niet alleen in verband met arbeid. Een bedrijf kan ook een afbreukrisico lopen op het gebied van imago.</Text><Text>(b) Het aantal gelijktijdig bedreigde mensen is hoog bij meer dan 75 personen.</Text><Text>(c) Of het aantal laag of hoog is, is afhankelijk van de omvang van de beoordeling van het elektrisch materieel.</Text><Text>(d) Utiliteit zijn gebouwen met een bijeenkomstfunctie, sportfunctie, kantoorfunctie, winkelfunctie.</Text><Text>(e) Brandrisico is hoog bij industrie waar hout, metaal of kunststof wordt verwerkt.</Text></View>
        <Text style={{ marginTop: 10, fontSize: 9 }}>Als er in de overeenkomst een termijn voor de beoordeling is vastgelegd, dan is deze leidend. Voorbeelden van overeenkomsten zijn: een verzekeringspolis, een huurcontract. Als er geen termijn voor de beoordeling is vastgelegd in een overeenkomst, dan kan tabel 3 van de NTA 8220:2017 worden toegepast.</Text>
        <View style={{ marginTop: 15 }}>
          <Text style={{ fontSize: 10, marginBottom: 4 }}>Er wordt een inspectie- interval van 1x per   [{meta.inspectionInterval === 3 ? 'X' : ' '}] 3   [{meta.inspectionInterval === 5 ? 'X' : ' '}] 5 jaar geadviseerd.</Text>
          <Text style={{ fontSize: 10, marginBottom: 2 }}>Conform verzekeringspolis:   [{meta.inspectionBasis.verzekering ? 'X' : ' '}]</Text>
          <Text style={{ fontSize: 10, marginBottom: 10 }}>Conform NTA8220:2017:        [{meta.inspectionBasis.nta8220 ? 'X' : ' '}]</Text>
          <Text style={{ fontSize: 10, fontWeight: 'bold' }}>De volgende inspectie dient uitgevoerd te zijn voor: {meta.nextInspectionDate}</Text>
        </View>
      </Page>

      {/* PAGINA 9: STEEKPROEF */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.pageNumber} fixed render={({ pageNumber }) => { return pageNumber > 1 ? `Pagina ${pageNumber - 1}` : ''; }} />
        <Text style={styles.headerLevel1}>STEEKPROEF:</Text>
        <Text style={styles.bold}>Het bepalen van de steekproef</Text>
        <Text style={styles.textBlock}>Bij de kwaliteitscontrole van producten is een steekproef gebruikelijk. Men wil zekerheid dat een product aan de opgegeven specificaties voldoet. Bij brandrisico-inspecties wil men ook zekerheid.</Text>
        <Text style={styles.textBlock}>Een inspectie op basis van een wiskundig juist bepaalde steekproef geeft die zekerheid. De installatieverantwoordelijke geeft aan welke theoretische risico’s men wil nemen voor de verschillende installaties en de verschillende onderdelen van de installatie. Voor een juiste beoordeling van dit theoretische risico is inzicht nodig in de wiskundige achtergrond van de steekproefmethode, in de kwaliteit van de elektrotechnische installatie en in de gevaren die aan het gebruik van de installatie zijn verbonden.</Text>
        <Text style={styles.textBlock}>De omvang van de partij is de verzameling van op dezelfde wijze gemonteerde producten waaruit de steekproef moet worden genomen en goedgekeurd om te bepalen of aan de goedkeuringscriteria wordt voldaan.</Text>
        <Text style={styles.textBlock}>De minimale omvang van de steekproef wordt bepaald door de tabel 1 op pagina 11 van de NTA 8220:2017. De steekproef beperkt zich tot de 1e steekproefcyclus.</Text>
        <Text style={{ textAlign: 'center', fontWeight: 'bold', marginVertical: 5 }}>Tabel 1 Omvang van de steekproef</Text>
        <View style={styles.steekContainer}>
          <View style={styles.stHeaderBlock}>
            <View style={styles.stHeadColCode}><Text>Code</Text></View>
            <View style={styles.stHeadColOmvang}><View style={styles.stSubRow}><Text>Omvang partij</Text></View><View style={styles.stSubRow}><Text></Text></View><View style={styles.stSubRowLast}><View style={{ width: '50%', height: 18, borderRightWidth: 1, borderColor: '#000', justifyContent: 'center', alignItems: 'center' }}><Text>van</Text></View><View style={{ width: '50%', height: 18, justifyContent: 'center', alignItems: 'center' }}><Text>tot</Text></View></View></View>
            <View style={styles.stHeadColSteek}><Text>Steekproef</Text></View>
            <View style={styles.stHeadCol1000}><View style={styles.stSubRow}><Text>1,000</Text></View><View style={styles.stSubRow}><Text>%</Text></View><View style={styles.stSubRowLast}><View style={{ width: '50%', height: 18, borderRightWidth: 1, borderColor: '#000', justifyContent: 'center', alignItems: 'center' }}><Text>G</Text></View><View style={{ width: '50%', height: 18, justifyContent: 'center', alignItems: 'center' }}><Text>F</Text></View></View></View>
          </View>
          {[
            { code: 'C', van: 5, tot: 25, steek: 5, g: 0, f: 1 },
            { code: 'D', van: 26, tot: 50, steek: 8, g: 0, f: 1 },
            { code: 'E', van: 51, tot: 90, steek: 13, g: 0, f: 1 },
            { code: 'F', van: 91, tot: 150, steek: 20, g: 0, f: 1 },
            { code: 'G', van: 151, tot: 280, steek: 32, g: 1, f: 2 },
            { code: 'H', van: 281, tot: 500, steek: 50, g: 1, f: 2 },
            { code: 'J', van: 501, tot: 1200, steek: 80, g: 2, f: 3 },
            { code: 'K', van: 1201, tot: 3200, steek: 125, g: 3, f: 4 },
            { code: 'L', van: 3201, tot: 10000, steek: 200, g: 5, f: 6 },
            { code: 'M', van: 10001, tot: 35000, steek: 315, g: 7, f: 8 },
          ].map((row, idx, arr) => (
            <View key={idx} style={[styles.stRow, idx === arr.length - 1 ? { borderBottomWidth: 0 } : {}]}>
              <View style={[styles.stCell, { width: '10%' }]}><Text>{row.code}</Text></View>
              <View style={[styles.stCell, { width: '15%' }]}><Text>{row.van}</Text></View>
              <View style={[styles.stCell, { width: '15%' }]}><Text>{row.tot}</Text></View>
              <View style={[styles.stCell, { width: '20%' }]}><Text>{row.steek}</Text></View>
              <View style={[styles.stCell, { width: '20%' }]}><Text>{row.g}</Text></View>
              <View style={[styles.stCell, { width: '20%', borderRightWidth: 0 }]}><Text>{row.f}</Text></View>
            </View>
          ))}
        </View>
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontWeight: 'bold' }}>OPMERKING</Text>
          <Text>G = maximaal aantal constateringen voor acceptatie van de gehele partij;</Text>
          <Text>F = minimaal aantal constateringen voor de afwijzing van de gehele partij.</Text>
        </View>
        <View style={styles.resTableContainer}>
          <View style={styles.resHeaderBlock}><Text>Steekproef</Text></View>
          <View style={styles.resRow}>
            <View style={[styles.resCell, styles.resCol1]}><Text>Onderdeel</Text></View>
            <View style={[styles.resCell, styles.resCol2]}><Text>aansluitpunten</Text></View>
            <View style={[styles.resCell, styles.resCol3]}><Text>steekproef</Text></View>
            <View style={[styles.resCell, styles.resCol4, { borderRightWidth: 0 }]}><Text>Resultaat</Text></View>
          </View>
          <View style={styles.resRowLast}>
            <View style={[styles.resCell, styles.resCol1]}><Text>Contactdozen</Text></View>
            <View style={[styles.resCell, styles.resCol2]}><Text>{sampleInfo.range}</Text></View>
            <View style={[styles.resCell, styles.resCol3]}><Text>{sampleInfo.sample}x</Text></View>
            <View style={[styles.resCell, styles.resCol4, { borderRightWidth: 0 }]}><Text>V</Text></View>
          </View>
        </View>
      </Page>

      {/* PAGINA 10: DE GEBREKEN */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.pageNumber} fixed render={({ pageNumber }) => { return pageNumber > 1 ? `Pagina ${pageNumber - 1}` : ''; }} />

        {/* LEVEL 1 HEADER */}
        <Text style={styles.headerLevel1}>4. VASTGESTELDE GEBREKEN, AFWIJKINGEN EN/OF DEFECTEN:</Text>
        
        <Text style={styles.textBlock}>
          Afwijkingen worden gecategoriseerd conform informatieblad 22 (IB22) van SCIOS. IB22 beschrijft de methode hoe geconstateerde gebreken, afwijkingen en defecten van elektrisch materieel geclassificeerd (Class) worden. De methode van classificatie van geconstateerde gebreken, afwijkingen en defecten, is een systematische, norm-gerelateerde manier van indelen van de effecten die als gevolg van gebreken, afwijkingen en defecten kunnen optreden. Het is geen classificatie van risico’s maar de methode kan wel als basis voor risico-evaluaties dienen.
        </Text>

        {/* TABEL 1: CLASSIFICATIE */}
        <View style={styles.cTableContainer}>
          <View style={[styles.cRow, styles.cHeader]}>
            <Text style={{ width: '8%', borderRightWidth: 1, borderColor: '#000', padding: 4 }}>Nr.</Text>
            <Text style={{ width: '15%', borderRightWidth: 1, borderColor: '#000', padding: 4 }}>Kleur</Text>
            <Text style={{ width: '15%', borderRightWidth: 1, borderColor: '#000', padding: 4 }}>Term</Text>
            <Text style={{ width: '62%', padding: 4 }}>Toelichting</Text>
          </View>
          <View style={styles.cRow}>
            <View style={[styles.cCell, { width: '8%', ...styles.bgRed }]}><Text>1.</Text></View>
            <View style={[styles.cCell, { width: '15%', ...styles.bgRed }]}><Text>Rood</Text></View>
            <View style={[styles.cCell, { width: '15%', ...styles.bgRed }]}><Text>Ernstig</Text></View>
            <View style={[styles.cCellLast, { width: '62%', ...styles.bgRed }]}><Text>• Het gevaar van letsel is voortdurend aanwezig of</Text><Text>• Schade met verstrekkende gevolgen</Text></View>
          </View>
          <View style={styles.cRow}>
            <View style={[styles.cCell, { width: '8%', ...styles.bgOrange }]}><Text>2.</Text></View>
            <View style={[styles.cCell, { width: '15%', ...styles.bgOrange }]}><Text>Oranje</Text></View>
            <View style={[styles.cCell, { width: '15%', ...styles.bgOrange }]}><Text>Serieus</Text></View>
            <View style={[styles.cCellLast, { width: '62%', ...styles.bgOrange }]}><Text>Bij één voorzienbare gebeurtenis of één enkele fout:</Text><Text>• Het gevaar van blijvend letsel/onherstelbaar letsel kan zich voor doen of</Text><Text>• Schade met aanzienlijke gevolgen.</Text></View>
          </View>
          <View style={styles.cRow}>
            <View style={[styles.cCell, { width: '8%', ...styles.bgYellow }]}><Text>3.</Text></View>
            <View style={[styles.cCell, { width: '15%', ...styles.bgYellow }]}><Text>Geel</Text></View>
            <View style={[styles.cCell, { width: '15%', ...styles.bgYellow }]}><Text>Gering</Text></View>
            <View style={[styles.cCellLast, { width: '62%', ...styles.bgYellow }]}><Text>• Het gevaar van herstelbaar letsel kan zich voordoen of</Text><Text>• Schade kan gevolgen hebben.</Text></View>
          </View>
          <View style={styles.cRowLast}>
            <View style={[styles.cCell, { width: '8%', ...styles.bgBlue }]}><Text>4.</Text></View>
            <View style={[styles.cCell, { width: '15%', ...styles.bgBlue }]}><Text>Blauw</Text></View>
            <View style={[styles.cCell, { width: '15%', ...styles.bgBlue }]}><Text>Opmerking</Text></View>
            <View style={[styles.cCellLast, { width: '62%', ...styles.bgBlue }]}><Text>• Er is minimaal gevaar/voldoet niet aan de uitgangspunten van standaarden of</Text><Text>• Het gevolg levert onder normale bedrijfsomstandigheden geen gevaar of schade op.</Text></View>
          </View>
        </View>

        <Text style={{ fontWeight: 'bold', fontSize: 9, marginBottom: 5 }}>Tabel 3: Actie en richttermijnen n.a.v. constateringen</Text>

        {/* TABEL 3: ACTIE EN RICHTTERMIJNEN */}
        <View style={styles.cTableContainer}>
          <View style={[styles.cRow, { backgroundColor: '#ccc' }]}>
            <View style={[styles.cCell, { width: '20%' }]}><Text style={{ fontWeight: 'bold' }}>Classificatie van constatering</Text></View>
            <View style={[styles.cCell, { width: '40%' }]}><Text style={{ fontWeight: 'bold' }}>Actie</Text></View>
            <View style={[styles.cCellLast, { width: '40%', padding: 0 }]}>
               <View style={{ borderBottomWidth: 1, borderColor: '#000', padding: 4 }}>
                  <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>Richttermijn</Text>
               </View>
               <View style={{ flexDirection: 'row' }}>
                  <View style={{ width: '50%', borderRightWidth: 1, borderColor: '#000', padding: 4 }}>
                    <Text style={{ fontWeight: 'bold' }}>Herstel van de constateringen</Text>
                  </View>
                  <View style={{ width: '50%', padding: 4 }}>
                    <Text style={{ fontWeight: 'bold' }}>NTA8220</Text>
                  </View>
               </View>
            </View>
          </View>

          {/* Rood */}
          <View style={[styles.cRow, styles.bgRed]}>
            <View style={[styles.cCell, { width: '20%' }]}><Text>Ernstig</Text></View>
            <View style={[styles.cCell, { width: '40%' }]}>
              <Text>Er moeten direct maatregelen worden genomen.</Text>
              <Text style={{ marginTop: 4 }}>Indien bereikbaar onder normale bedrijfsomstandigheden:</Text>
              <Text>• Deze constatering moet mondeling en schriftelijk worden gemeld.</Text>
              <Text>• Direct veiligstellen/verhelpen/oplossen</Text>
            </View>
            <View style={[styles.cCell, { width: '20%' }]}><Text>Direct veiligstellen/ verhelpen/ oplossen</Text></View>
            <View style={[styles.cCellLast, { width: '20%' }]}><Text>Direct veiligstellen/ verhelpen/oplossen</Text></View>
          </View>

          {/* Oranje */}
          <View style={[styles.cRow, styles.bgOrange]}>
            <View style={[styles.cCell, { width: '20%' }]}><Text>Serieus</Text></View>
            <View style={[styles.cCell, { width: '40%' }]}><Text>Schriftelijk vastleggen in een inspectierapport.</Text></View>
            <View style={[styles.cCell, { width: '20%' }]}><Text>Overeengekomen termijn</Text></View>
            <View style={[styles.cCellLast, { width: '20%' }]}><Text>Binnen 3 maanden</Text></View>
          </View>

          {/* Geel */}
          <View style={[styles.cRow, styles.bgYellow]}>
            <View style={[styles.cCell, { width: '20%' }]}><Text>Gering</Text></View>
            <View style={[styles.cCell, { width: '40%' }]}><Text>Schriftelijk vastleggen in een inspectierapport.</Text></View>
            <View style={[styles.cCell, { width: '20%' }]}><Text>Overeengekomen termijn</Text></View>
            <View style={[styles.cCellLast, { width: '20%' }]}><Text>Binnen 3 maanden</Text></View>
          </View>

          {/* Blauw */}
          <View style={[styles.cRowLast, styles.bgBlue]}>
            <View style={[styles.cCell, { width: '20%' }]}><Text>Opmerking</Text></View>
            <View style={[styles.cCell, { width: '40%' }]}><Text>Schriftelijk vastleggen in een inspectierapport, indien overeengekomen.</Text></View>
            <View style={[styles.cCell, { width: '20%' }]}><Text>Niet van toepassing</Text></View>
            <View style={[styles.cCellLast, { width: '20%' }]}><Text>Niet van toepassing</Text></View>
          </View>
        </View>

        <Text style={styles.textBlock} break>Opmerking</Text>
        <Text style={styles.textBlock}>
          Richttermijn van herstel kunnen zijn opgelegd in privaatrechtelijke overeenkomsten, bijvoorbeeld brandverzekeringen of huurcontracten. Wanneer herstel inclusief herbeoordeling niet binnen 12 maanden na inspectiedatum is uitgevoerd, kan het inspectieresultaat niet worden aangepast. Deze periode staat los van de richttermijn van herstel.
        </Text>

        {/* LEVEL 2 HEADER */}
        <Text style={styles.headerLevel2}>4.1 VASTGESTELDE GEBREKEN, AFWIJKINGEN EN/OF DEFECTEN IN VERDEELINRICHTINGEN</Text>

        {defects.length === 0 ? (<Text style={{ fontStyle: 'italic', marginTop: 10 }}>Geen afwijkingen geconstateerd.</Text>) : (defects.map((d, i) => (
            <View key={d.id} wrap={false} style={styles.defectBlock}>
              {/* AANGEPAST: LOGICA VOOR AMBER / ORANJE */}
              <View style={[styles.defectHeader, d.classification === 'Red' ? styles.bgRedLight : (d.classification === 'Orange' || d.classification === 'Amber') ? styles.bgOrangeLight : styles.bgYellowLight]}>
                <Text style={{ width: '10%', fontWeight: 'bold' }}>{i + 1}.</Text>
                <Text style={{ width: '60%', fontWeight: 'bold' }}>{d.location}</Text>
                <Text style={{ width: '30%', textAlign: 'right', fontWeight: 'bold' }}>{d.classification}</Text>
              </View>
              <View style={styles.defectBody}>
                 {/* HIER GEBRUIKEN WE cleanDescription OM DE PREFIX TE VERWIJDEREN */}
                 <Text style={{ marginBottom: 5 }}>{cleanDescription(d.description)}</Text>
                 <Text style={{ fontSize: 9, color: '#444', fontStyle: 'italic' }}>Actie: {d.action}</Text>
                 <View style={{ flexDirection: 'row', gap: 10, marginTop: 5 }}>
                    {d.photoUrl && <Image src={d.photoUrl} style={styles.defectImage} />}
                    {d.photoUrl2 && <Image src={d.photoUrl2} style={styles.defectImage} />}
                 </View>
              </View>
            </View>
          )))}
      </Page>

      {/* BIJLAGE 1: HERSTELVERKLARING */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.pageNumber} fixed render={({ pageNumber }) => { return pageNumber > 1 ? `Pagina ${pageNumber - 1}` : ''; }} />
        <Text style={styles.headerLevel1}>BIJLAGE 1: HERSTELVERKLARING</Text>
        <Text style={styles.headerLevel2}>PROJECTGEGEVENS</Text>
        <View style={styles.tableContainer}>
          <View style={styles.tableRow}><Text style={[styles.tableCell, styles.colLabel]}>Locatie:</Text><Text style={[styles.tableCellLast, styles.colValue]}>{meta.projectLocation}</Text></View>
          <View style={styles.tableRow}><Text style={[styles.tableCell, styles.colLabel]}>Adres:</Text><Text style={[styles.tableCellLast, styles.colValue]}>{meta.projectAddress}</Text></View>
          <View style={styles.tableRow}><Text style={[styles.tableCell, styles.colLabel]}>Postcode/plaats:</Text><Text style={[styles.tableCellLast, styles.colValue]}>{meta.projectPostalCode} {meta.projectCity}</Text></View>
          <View style={styles.tableRow}><Text style={[styles.tableCell, styles.colLabel]}>Contactpersoon:</Text><Text style={[styles.tableCellLast, styles.colValue]}>{meta.projectContactPerson}</Text></View>
          <View style={styles.tableRow}><Text style={[styles.tableCell, styles.colLabel]}>Telefoon:</Text><Text style={[styles.tableCellLast, styles.colValue]}>{meta.projectPhone}</Text></View>
          <View style={styles.tableRow}><Text style={[styles.tableCell, styles.colLabel]}>Email:</Text><Text style={[styles.tableCellLast, styles.colValue]}>{meta.projectEmail}</Text></View>
          <View style={styles.tableRow}><Text style={[styles.tableCell, styles.colLabel]}>Installatieverantwoordelijke:</Text><Text style={[styles.tableCellLast, styles.colValue]}>{meta.installationResponsible}</Text></View>
          <View style={styles.tableRowLast}>
            <Text style={[styles.tableCell, styles.colLabel]}>ID Bagviewer:</Text>
            <View style={[styles.tableCellLast, styles.colValue, { flexDirection: 'row', gap: 5 }]}>
              <Text>{meta.idBagviewer}</Text>
              {meta.idBagviewer && (<Link src={`https://bagviewer.kadaster.nl/lvbag/bag-viewer/?zoomlevel=1&objectId=${meta.idBagviewer}`} style={styles.link}>Bag Viewer</Link>)}
            </View>
          </View>
        </View>

        <Text style={styles.headerLevel2}>HERSTELVERKLARING DOOR INSTALLATEUR</Text>
        <Text style={styles.textBlock}>Ondergetekende (de installateur) verklaart dat:</Text>
        <View style={{ marginLeft: 5 }}>
          <View style={styles.declRow}>
             <Text style={styles.declBullet}>{'>'}</Text>
             <Text style={{ width: '95%', fontSize: 9 }}>Minimaal alle afwijkingen van classificatie 1, 2 en 3 zoals vastgelegd in het inspectierapport {meta.date} {meta.projectLocation} vakkundig hersteld zijn.</Text>
          </View>
          <View style={styles.declRow}>
             <Text style={styles.declBullet}>{'>'}</Text>
             <Text style={{ width: '95%', fontSize: 9 }}>De werkzaamheden zijn uitgevoerd conform de geldende installatievoorschriften zoals de NEN 1010.</Text>
          </View>
          <View style={styles.declRow}>
             <Text style={styles.declBullet}>{'>'}</Text>
             <Text style={{ width: '95%', fontSize: 9 }}>Indien bij de vervolginspectie wordt geconstateerd dat de mutaties niet overeenkomstig de geldende installatievoorschriften zijn uitgevoerd, deze alsnog dienen te worden hersteld.</Text>
          </View>
          <View style={styles.declRow}>
             <Text style={styles.declBullet}>{'>'}</Text>
             <Text style={{ width: '95%', fontSize: 9 }}>Deze verklaring dient binnen één jaar na inspectie te worden ingezonden en voorzien te zijn van alle begeleidende documentatie, foto’s en begeleidend schrijven om tot een goede herbeoordeling te komen. Het ontbreken van of niet juist kunnen beoordelen van deze documenten zal leiden tot afwijzing.</Text>
          </View>
        </View>

        <Text style={{ fontWeight: 'bold', marginTop: 30, marginBottom: 10 }}>De Installateur</Text>
        
        <View style={styles.formRow}><Text style={styles.formLabel}>Bedrijfsnaam</Text><Text style={styles.formColon}>:</Text><View style={styles.formLine} /></View>
        <View style={styles.formRow}><Text style={styles.formLabel}>Adres</Text><Text style={styles.formColon}>:</Text><View style={styles.formLine} /></View>
        <View style={styles.formRow}><Text style={styles.formLabel}>Postcode/plaats</Text><Text style={styles.formColon}>:</Text><View style={styles.formLine} /></View>
        <View style={styles.formRow}><Text style={styles.formLabel}>Telefoon</Text><Text style={styles.formColon}>:</Text><View style={styles.formLine} /></View>
        <View style={styles.formRow}><Text style={styles.formLabel}>Datum</Text><Text style={styles.formColon}>:</Text><View style={styles.formLine} /></View>
        <View style={styles.formRow}><Text style={styles.formLabel}>Naam</Text><Text style={styles.formColon}>:</Text><View style={styles.formLine} /></View>
        <View style={styles.formRow}><Text style={styles.formLabel}>Functie</Text><Text style={styles.formColon}>:</Text><View style={styles.formLine} /></View>
        <View style={{ ...styles.formRow, marginTop: 15 }}><Text style={styles.formLabel}>Handtekening</Text><Text style={styles.formColon}>:</Text><View style={styles.formLine} /></View>
      </Page>

    </Document>
  );
};
