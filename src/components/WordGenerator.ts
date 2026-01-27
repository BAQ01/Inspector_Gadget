// src/components/WordGenerator.ts
import { 
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
  WidthType, HeadingLevel, ImageRun, AlignmentType, PageBreak, 
  Footer, PageNumber, VerticalAlign 
} from "docx";
import { saveAs } from "file-saver";
import { InspectionState } from "../types"; 

// --- HULPFUNCTIES & STIJLEN ---

const getColor = (classification: string) => {
  switch (classification) {
    case 'Red': return "FF0000";
    case 'Orange': return "ED7D31";
    case 'Yellow': return "FFC000";
    case 'Blue': return "4472C4";
    default: return "000000";
  }
};

const getDutchClassification = (c: string) => {
  switch (c) {
    case 'Red': return 'Ernstig (Direct actie vereist)';
    case 'Orange': return 'Serieus (Herstellen op termijn)';
    case 'Yellow': return 'Gering (Aandachtspunt)';
    case 'Blue': return 'Informatief';
    default: return c;
  }
};

const base64ToUint8Array = (base64: string) => {
  try {
      if (!base64) return new Uint8Array(0);
      const parts = base64.split(',');
      const binaryString = window.atob(parts.length > 1 ? parts[1] : parts[0]);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
  } catch (e) {
      console.error("Fout bij converteren afbeelding", e);
      return new Uint8Array(0);
  }
};

const createRow = (label: string, value: string | undefined | null, boldLabel: boolean = true) => {
  return new TableRow({
    children: [
      new TableCell({ 
          children: [new Paragraph({ children: [new TextRun({ text: label, bold: boldLabel })] })], 
          width: { size: 4000, type: WidthType.DXA },
          verticalAlign: VerticalAlign.CENTER
      }),
      new TableCell({ 
          children: [new Paragraph(value || "-")],
          verticalAlign: VerticalAlign.CENTER
      }),
    ],
  });
};

const createTextPara = (text: string, isBold: boolean = false) => {
    return new Paragraph({
        children: [new TextRun({ text: text, bold: isBold })],
        spacing: { after: 120 }
    });
};

// ==========================================
// HOOFDFUNCTIE GENERATOR
// ==========================================

export const generateWordDocument = async (
    meta: InspectionState['meta'], 
    defects: InspectionState['defects'], 
    measurements: InspectionState['measurements']
) => {
  
  const sectionsChildren: any[] = [];

  // -------------------------------------------------------------------------
  // PAGINA 1: VOORBLAD
  // -------------------------------------------------------------------------
  
  sectionsChildren.push(
    new Paragraph({
      text: "SCIOS Scope 10 - v1",
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.RIGHT,
      spacing: { before: 200, after: 100 },
    }),
    new Paragraph({
      text: "INSPECTIE RAPPORT",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.RIGHT,
      spacing: { after: 200 },
    }),
    new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
            new TextRun({ text: "Beoordeling elektrisch materieel op brandrisico" }),
            new TextRun({ text: "\nConform NTA 8220", italics: true, size: 20 })
        ]
    })
  );

  if (meta.locationPhotoUrl) {
    try {
      const isPng = meta.locationPhotoUrl.startsWith("data:image/png");
      sectionsChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              data: base64ToUint8Array(meta.locationPhotoUrl),
              transformation: { width: 500, height: 350 },
              type: (isPng ? "png" : "jpeg") as any,
            }),
          ],
          spacing: { before: 400, after: 400 }
        })
      );
    } catch (e) { }
  } else {
      sectionsChildren.push(new Paragraph({ text: "", spacing: { after: 2000 } }));
  }

  sectionsChildren.push(
      new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
              createRow("BETREFT:", "Inspectie SCIOS Scope 10"),
              createRow("PROJECT:", meta.projectLocation),
              createRow("ADRES:", `${meta.projectAddress}, ${meta.projectCity}`),
              createRow("DATUM:", meta.date),
              createRow("INSPECTIEBEDRIJF:", meta.inspectionCompany || "Uw Inspectiebedrijf"),
          ]
      })
  );

  sectionsChildren.push(new Paragraph({ children: [new PageBreak()] }));

  // -------------------------------------------------------------------------
  // PAGINA 2: VOORWOORD & LEESWIJZER (AANGEPAST AAN PDF)
  // -------------------------------------------------------------------------
  
  sectionsChildren.push(
      new Paragraph({ text: "Voorwoord", heading: HeadingLevel.HEADING_1 }),
      
      createTextPara("Het doel van de SCIOS Scope 10 inspectie is om inzicht te krijgen in de belangrijkste elektrische risico's. Het zijn vaak relatief kleine afwijkingen die risico's veroorzaken. U kunt deze echter niet altijd zien of herkennen of u bent zich niet bewust van het feit dat ze een risico vormen."),
      
      createTextPara("Tijdens de inspectie is niet alleen gefocust op de elektrische installatie, risicovolle apparaten en machines zijn ook bekeken. Deze zijn vaak verantwoordelijk voor het ontstaan van een brand."),
      
      createTextPara("De inhoud van de SCIOS Scope 10 inspectie bestaat uit:"),
      new Paragraph({ text: "• een uitgebreide visuele inspectie van de schakel- en verdeelinrichtingen, elektrische installatie en risicovolle eindgebruikers;", bullet: { level: 0 } }),
      new Paragraph({ text: "• metingen en beproevingen;", bullet: { level: 0 } }),
      new Paragraph({ text: "• thermografische inspectie (warmtebeeldopname).", bullet: { level: 0 } }),
      
      new Paragraph({ text: "", spacing: { after: 200 } }),
      
      createTextPara("Let op: met deze inspectie voldoet u nog niet aan de Arbowet.", true),
      
      createTextPara("Er is geen sprake van een volledige inspectie conform de NEN-EN 50110/NEN 3140. Deze normen bevatten aanvullende bepalingen om het geheel te voldoen aan artikel 3.4 en 3.5 van het Arbobesluit."),
      
      createTextPara("Sommige aspecten van deze inspectie van zowel de laagspanningsinstallaties als de elektrische apparaten voldoen niet aan de NEN 3140."),
      
      // --- LEESWIJZER ---
      new Paragraph({ text: "Leeswijzer", heading: HeadingLevel.HEADING_1, spacing: { before: 300 } }),
      
      createTextPara("Dit rapport is opgesteld aan de hand van technisch document 14 dat behoort bij een SCIOS Scope 10 inspectie."),
      
      createTextPara("Het technisch document 14 beschrijft de eisen voor de inspectie van elektrisch materieel op brandrisico's en behoort bij het hoofddocument \"Certificatieregeling voor het kwaliteitsmanagementsysteem ten behoeve van het uitvoeren van onderhoud en inspecties aan technische installaties\"."),
      
      createTextPara("In Scope 10 is het onderhoud aan elektrisch materieel niet opgenomen."),
      
      createTextPara("Dit document is gebaseerd op de NTA 8220 Beoordelingsmethode op brandrisico van elektrisch materieel en is daarmee in overeenstemming."),
      
      new Paragraph({ text: "• Voldoet de installatie wel of niet? In hoofdstuk 3 is een verklaring opgenomen of het elektrisch materieel brand verhogende risico's heeft.", bullet: { level: 0 } }),
      new Paragraph({ text: "• Inspectietermijn: in hoofdstuk 3 vindt u de geadviseerde inspectiefrequentie, die de inspecteur adviseert op basis van de uitgevoerde inspectie.", bullet: { level: 0 } }),
      new Paragraph({ text: "• Lijst van afwijkingen: In hoofdstuk 4 zijn de eventueel geconstateerde afwijkingen opgenomen.", bullet: { level: 0 } }),
      
      new Paragraph({ text: "", spacing: { after: 200 } }),
      
      createTextPara(`${meta.inspectionCompany || "Het inspectiebedrijf"} heeft deze inspectie uitgevoerd conform een door SCIOS opgesteld en geaccrediteerd kwaliteitsborgingsysteem met de naam "SCIOS Scope 10". Deze werkwijze garandeert een zorgvuldige en uniforme uitvoering van de inspectie en rapportage.`)
  );

  sectionsChildren.push(new Paragraph({ children: [new PageBreak()] }));

  // -------------------------------------------------------------------------
  // PAGINA 3: HOOFDSTUK 1 - BASISGEGEVENS
  // -------------------------------------------------------------------------

  sectionsChildren.push(new Paragraph({ text: "1. BASISGEGEVENS", heading: HeadingLevel.HEADING_1 }));
  
  sectionsChildren.push(new Paragraph({ text: "OPDRACHTGEVER", heading: HeadingLevel.HEADING_3 }));
  sectionsChildren.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
          createRow("Naam opdrachtgever:", meta.clientName),
          createRow("Adres:", meta.clientAddress),
          createRow("Postcode / Plaats:", `${meta.clientPostalCode} ${meta.clientCity}`),
          createRow("Contactpersoon:", meta.clientContactPerson),
          createRow("Telefoon:", meta.clientPhone),
          createRow("Email:", meta.clientEmail),
      ]
  }));

  sectionsChildren.push(new Paragraph({ text: "PROJECTGEGEVENS", heading: HeadingLevel.HEADING_3, spacing: { before: 200 } }));
  sectionsChildren.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
          createRow("Locatie:", meta.projectLocation),
          createRow("Adres:", meta.projectAddress),
          createRow("Postcode / Plaats:", `${meta.projectPostalCode} ${meta.projectCity}`),
          createRow("Contactpersoon:", meta.projectContactPerson),
          createRow("Installatieverantwoordelijke (IV):", meta.installationResponsible),
          createRow("ID Bagviewer:", meta.idBagviewer),
      ]
  }));

  sectionsChildren.push(new Paragraph({ text: "INSPECTIEBEDRIJF", heading: HeadingLevel.HEADING_3, spacing: { before: 200 } }));
  sectionsChildren.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
          createRow("Naam:", meta.inspectionCompany),
          createRow("Adres:", meta.inspectionCompanyAddress),
          createRow("Postcode / Plaats:", `${meta.inspectionCompanyPostalCode} ${meta.inspectionCompanyCity}`),
          createRow("Telefoon:", meta.inspectionCompanyPhone),
          createRow("Inspecteur:", meta.inspectorName),
          createRow("SCIOS Registratie:", meta.sciosRegistrationNumber),
      ]
  }));

  sectionsChildren.push(new Paragraph({ children: [new PageBreak()] }));

  // -------------------------------------------------------------------------
  // PAGINA 4: MEETINSTRUMENTEN
  // -------------------------------------------------------------------------

  sectionsChildren.push(new Paragraph({ text: "GEBRUIKTE MEETINSTRUMENTEN", heading: HeadingLevel.HEADING_2 }));
  
  const instrumentRows = [
      new TableRow({
          children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Meetinstrument", bold: true })] })], width: { size: 4000, type: WidthType.DXA } }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Serienummer", bold: true })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Kalibratie", bold: true })] })] }),
          ]
      })
  ];

  (measurements.selectedInstruments || []).forEach(inst => {
      instrumentRows.push(new TableRow({
          children: [
              new TableCell({ children: [new Paragraph(inst.name)] }),
              new TableCell({ children: [new Paragraph(inst.serialNumber)] }),
              new TableCell({ children: [new Paragraph(inst.calibrationDate || "-")] }),
          ]
      }));
  });

  sectionsChildren.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: instrumentRows }));
  
  createTextPara("Meetmiddelen die worden ingezet voor metingen die selectief zijn, moeten jaarlijks worden gekalibreerd. Indien de leverancier van het meetmiddel een kortere termijn voorschrijft, moet deze worden toegepast.");

  sectionsChildren.push(new Paragraph({ text: "AANVULLENDE INSTALLATIES", heading: HeadingLevel.HEADING_3, spacing: { before: 300 } }));
  sectionsChildren.push(new Paragraph({ text: `Energieopslagsysteem aanwezig? ${measurements.hasEnergyStorage === true ? "[X] Ja" : "[ ] Nee"}` }));
  sectionsChildren.push(new Paragraph({ text: `Zonnestroominstallatie aanwezig? ${measurements.hasSolarSystem === true ? "[X] Ja" : "[ ] Nee"}` }));
  if(measurements.hasSolarSystem) {
      createTextPara("Bij aanwezigheid van een zonnestroominstallatie is deze tot de omvormer met de hierop aangesloten stekers geïnspecteerd. Inspectie voor zonnestroominstallaties is vastgelegd in SCIOS Scope 12, het is raadzaam deze inspectie uit te laten voeren.");
  }

  sectionsChildren.push(new Paragraph({ children: [new PageBreak()] }));

  // -------------------------------------------------------------------------
  // PAGINA 5: INSTALLATIEGEGEVENS & GEBRUIKSFUNCTIES
  // -------------------------------------------------------------------------

  sectionsChildren.push(new Paragraph({ text: "2. INSTALLATIEGEGEVENS", heading: HeadingLevel.HEADING_1 }));
  
  sectionsChildren.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
          createRow("Stroomstelsel:", measurements.installationType),
          createRow("Voorbeveiliging:", measurements.mainFuse),
          createRow("Bouwjaar (schatting):", measurements.yearOfConstruction),
          createRow("Impedantie (Zi):", `${measurements.impedance || '-'} Ω`),
          createRow("Isolatieweerstand:", `${measurements.insulationResistance || '-'} MΩ`),
          createRow("Temp. Verdeler:", `${measurements.switchboardTemp || '-'} °C`),
      ]
  }));

  sectionsChildren.push(new Paragraph({ text: "GEBRUIKSFUNCTIES (BBL)", heading: HeadingLevel.HEADING_3, spacing: { before: 300 } }));
  createTextPara("Onderstaande functies volgens het Besluit bouwwerken leefomgeving zijn van toepassing:");
  
  const usageKeys = Object.keys(meta.usageFunctions) as Array<keyof typeof meta.usageFunctions>;
  const activeFunctions = usageKeys.filter(key => meta.usageFunctions[key]);
  
  if (activeFunctions.length > 0) {
      activeFunctions.forEach(func => {
          const label = func.charAt(0).toUpperCase() + func.slice(1);
          sectionsChildren.push(new Paragraph({ text: `[X] ${label}`, spacing: { after: 50 } }));
      });
  } else {
      sectionsChildren.push(new Paragraph({ text: "Geen specifieke gebruiksfunctie geselecteerd." }));
  }

  sectionsChildren.push(new Paragraph({ children: [new PageBreak()] }));

  // -------------------------------------------------------------------------
  // PAGINA 6 & 7: INSPECTIE METHODE & RESULTAAT
  // -------------------------------------------------------------------------

  sectionsChildren.push(new Paragraph({ text: "3. INSPECTIE", heading: HeadingLevel.HEADING_1 }));
  
  sectionsChildren.push(new Paragraph({ text: "TOEGEPASTE NORMEN", heading: HeadingLevel.HEADING_3 }));
  createTextPara("De inspectie is uitgevoerd op basis van:");
  sectionsChildren.push(new Paragraph({ text: "• NTA 8220: 2017", bullet: { level: 0 } }));
  sectionsChildren.push(new Paragraph({ text: "• SCIOS TD14 Versie 2.10", bullet: { level: 0 } }));
  sectionsChildren.push(new Paragraph({ text: "• NPR 8040-1:2013", bullet: { level: 0 } }));

  sectionsChildren.push(new Paragraph({ text: "VISUELE INSPECTIE", heading: HeadingLevel.HEADING_3, spacing: { before: 200 } }));
  createTextPara("Voor de beoordeling van elektrisch materieel op brandrisico moet gelet worden op het volgende:");
  sectionsChildren.push(new Paragraph({ text: "• kan er brand ontstaan bij normaal gebruik;", bullet: { level: 0 } }));
  sectionsChildren.push(new Paragraph({ text: "• kan er brand ontstaan door oneigenlijk gebruik;", bullet: { level: 0 } }));
  sectionsChildren.push(new Paragraph({ text: "• kan er brand ontstaan door een defect.", bullet: { level: 0 } }));
  
  createTextPara("Voor het uitvoeren van de beoordeling wordt het elektrisch materieel beoordeeld op: bedrijfsomstandigheden, wederzijdse beïnvloeding, uitwendige beïnvloeding en automatische uitschakeling van de voeding.");

  sectionsChildren.push(new Paragraph({ text: "METINGEN EN BEPROEVINGEN", heading: HeadingLevel.HEADING_3, spacing: { before: 200 } }));
  createTextPara("De inspectie door meting en beproeving aan de genoemde installatie(delen) wordt gedaan door:");
  sectionsChildren.push(new Paragraph({ text: "• meting van isolatieweerstand;", bullet: { level: 0 } }));
  sectionsChildren.push(new Paragraph({ text: "• het beproeven van de aardlekbeveiligingen;", bullet: { level: 0 } }));
  sectionsChildren.push(new Paragraph({ text: "• meting voor het bepalen van de circuitimpedantie;", bullet: { level: 0 } }));
  sectionsChildren.push(new Paragraph({ text: "• meting van temperatuur.", bullet: { level: 0 } }));

  sectionsChildren.push(new Paragraph({ children: [new PageBreak()] }));

  // ==========================================
  // PAGINA 7: RESULTAAT VERKLARING
  // ==========================================

  sectionsChildren.push(new Paragraph({ text: "VERKLARING BETREFFENDE GEÏNSPECTEERDE INSTALLATIE", heading: HeadingLevel.HEADING_2 }));
  
  createTextPara("In overeenstemming met de opdrachtgever is er een inspectieplan opgesteld. Toch blijft er altijd een risico bestaan, omdat de inspectie een momentopname is. Uit praktisch oogpunt is het onmogelijk de gehele installatie uitputtend te inspecteren.");
  createTextPara(`${meta.inspectionCompany || "Het inspectiebedrijf"} verklaart dat de inspectie geheel onafhankelijk is uitgevoerd, volgens de methoden beschreven in het inspectieplan.`);
  
  const hasDefects = defects && defects.length > 0;
  
  sectionsChildren.push(new Paragraph({ 
      children: [
          new TextRun({ 
              text: hasDefects 
                ? "[X] Tijdens de inspectie zijn er geconstateerde gebreken, afwijkingen en/of defecten vastgesteld die een mogelijk risico zijn met betrekking tot brand door elektrisch materieel." 
                : "[ ] Tijdens de inspectie zijn er geconstateerde gebreken, afwijkingen en/of defecten vastgesteld die een mogelijk risico zijn met betrekking tot brand door elektrisch materieel.",
              bold: true 
          })
      ],
      spacing: { before: 200 }
  }));
  
  sectionsChildren.push(new Paragraph({ 
      children: [
          new TextRun({ 
              text: !hasDefects 
                ? "[X] Er zijn tijdens de inspectie GEEN geconstateerde gebreken, afwijkingen en/of defecten vastgesteld." 
                : "[ ] Er zijn tijdens de inspectie GEEN geconstateerde gebreken, afwijkingen en/of defecten vastgesteld.",
              bold: true 
          })
      ]
  }));

  createTextPara("Een scope 10 inspectie wordt na uitvoering afgemeld in het landelijk SCIOS portaal, onafhankelijk van het inspectieresultaat. Afmeldingen met of zonder constateringen dienen binnen 28 dagen na afronding werkzaamheden te worden gedaan.");

  sectionsChildren.push(new Paragraph({ text: "Namens toezichtverantwoordelijke:", spacing: { before: 300 } }));
  sectionsChildren.push(new Paragraph({ children: [new TextRun({ text: meta.inspectorName, bold: true })] }));
  sectionsChildren.push(new Paragraph({ children: [new TextRun({ text: meta.inspectionCompany || "" })] }));
  
  if (meta.signatureUrl) {
      try {
          const isPng = meta.signatureUrl.startsWith("data:image/png");
          sectionsChildren.push(
              new Paragraph({
                  children: [new ImageRun({
                      data: base64ToUint8Array(meta.signatureUrl),
                      transformation: { width: 200, height: 100 },
                      type: (isPng ? "png" : "jpeg") as any,
                  })]
              })
          );
      } catch (e) {}
  }

  sectionsChildren.push(new Paragraph({ children: [new PageBreak()] }));

  // ==========================================
  // PAGINA 8: FREQUENTIE MATRIX
  // ==========================================

  sectionsChildren.push(new Paragraph({ text: "INSPECTIEFREQUENTIE & ADVIES", heading: HeadingLevel.HEADING_2 }));
  
  sectionsChildren.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
          new TableRow({ children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Object / Gebruik", bold: true })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Risico Laag (aantal constateringen)", bold: true })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Risico Hoog (aantal constateringen)", bold: true })] })] }),
          ]}),
          new TableRow({ children: [
              new TableCell({ children: [new Paragraph("Utiliteit")] }),
              new TableCell({ children: [new Paragraph("5 jaar")] }),
              new TableCell({ children: [new Paragraph("3 jaar")] }),
          ]}),
          new TableRow({ children: [
              new TableCell({ children: [new Paragraph("Industrie")] }),
              new TableCell({ children: [new Paragraph("5 jaar")] }),
              new TableCell({ children: [new Paragraph("3 jaar")] }),
          ]}),
          new TableRow({ children: [
              new TableCell({ children: [new Paragraph("Utiliteit met slapen")] }),
              new TableCell({ children: [new Paragraph("3 jaar")] }),
              new TableCell({ children: [new Paragraph("3 jaar")] }),
          ]}),
      ]
  }));

  createTextPara("Als er in de overeenkomst een termijn is vastgelegd (bijv. verzekering), dan is deze leidend. Anders geldt tabel 3 van de NTA 8220:2017.");

  sectionsChildren.push(new Paragraph({ text: "ADVIES", heading: HeadingLevel.HEADING_3, spacing: { before: 200 } }));
  sectionsChildren.push(new Paragraph({ text: `Er wordt een inspectie-interval geadviseerd van: ${meta.inspectionInterval} jaar.` }));
  sectionsChildren.push(new Paragraph({ text: `Grondslag: ${meta.inspectionBasis.nta8220 ? "NTA 8220" : ""} ${meta.inspectionBasis.verzekering ? "+ Verzekeringseis" : ""}` }));
  sectionsChildren.push(new Paragraph({ 
      children: [
          new TextRun({ text: "Volgende inspectie uiterlijk: ", bold: true }),
          new TextRun({ text: meta.nextInspectionDate || "Nader te bepalen" })
      ]
  }));

  sectionsChildren.push(new Paragraph({ children: [new PageBreak()] }));

  // ==========================================
  // PAGINA 9: STEEKPROEF
  // ==========================================

  sectionsChildren.push(new Paragraph({ text: "STEEKPROEF", heading: HeadingLevel.HEADING_2 }));
  createTextPara("De minimale omvang van de steekproef wordt bepaald door tabel 1 van de NTA 8220:2017. De steekproef beperkt zich tot de 1e steekproefcyclus.");

  sectionsChildren.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
          new TableRow({ children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Omvang Partij", bold: true })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Steekproef", bold: true })] })] }),
          ]}),
          new TableRow({ children: [ new TableCell({ children: [new Paragraph("26 - 50")] }), new TableCell({ children: [new Paragraph("8")] }) ]}),
          new TableRow({ children: [ new TableCell({ children: [new Paragraph("51 - 90")] }), new TableCell({ children: [new Paragraph("13")] }) ]}),
          new TableRow({ children: [ new TableCell({ children: [new Paragraph("91 - 150")] }), new TableCell({ children: [new Paragraph("20")] }) ]}),
          new TableRow({ children: [ new TableCell({ children: [new Paragraph("151 - 280")] }), new TableCell({ children: [new Paragraph("32")] }) ]}),
          new TableRow({ children: [ new TableCell({ children: [new Paragraph("281 - 500")] }), new TableCell({ children: [new Paragraph("50")] }) ]}),
          new TableRow({ children: [ new TableCell({ children: [new Paragraph("> 500")] }), new TableCell({ children: [new Paragraph("80+")] }) ]}),
      ]
  }));

  createTextPara(`Totaal aantal componenten opgegeven: ${meta.totalComponents}`);

  sectionsChildren.push(new Paragraph({ children: [new PageBreak()] }));

  // ==========================================
  // PAGINA 10: CLASSIFICATIE LEGENDA
  // ==========================================

  sectionsChildren.push(new Paragraph({ text: "CLASSIFICATIE VAN GEBREKEN", heading: HeadingLevel.HEADING_2 }));
  createTextPara("Afwijkingen worden gecategoriseerd conform informatieblad 22 (IB22) van SCIOS.");
  
  sectionsChildren.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
          new TableRow({ children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Kleur", bold: true })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Term", bold: true })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Richttermijn herstel", bold: true })] })] }),
          ]}),
          new TableRow({ children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Rood", color: "FF0000", bold: true })] })] }),
              new TableCell({ children: [new Paragraph("Ernstig")] }),
              new TableCell({ children: [new Paragraph("Direct veiligstellen/herstellen")] }),
          ]}),
          new TableRow({ children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Oranje", color: "ED7D31", bold: true })] })] }),
              new TableCell({ children: [new Paragraph("Serieus")] }),
              new TableCell({ children: [new Paragraph("Binnen 3 maanden herstellen")] }),
          ]}),
          new TableRow({ children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Geel", color: "FFC000", bold: true })] })] }),
              new TableCell({ children: [new Paragraph("Gering")] }),
              new TableCell({ children: [new Paragraph("Herstellen bij onderhoud")] }),
          ]}),
      ]
  }));

  sectionsChildren.push(new Paragraph({ children: [new PageBreak()] }));

  // ==========================================
  // PAGINA 11+: HOOFDSTUK 4 - GEBREKEN
  // ==========================================

  sectionsChildren.push(new Paragraph({ text: "4. VASTGESTELDE GEBREKEN, AFWIJKINGEN EN/OF DEFECTEN", heading: HeadingLevel.HEADING_1 }));

  if (!defects || defects.length === 0) {
      sectionsChildren.push(new Paragraph({ 
          children: [new TextRun({ text: "Geen gebreken geconstateerd.", italics: true })] 
      }));
  } else {
      defects.forEach((defect, index) => {
          sectionsChildren.push(new Paragraph({ 
              text: `${index + 1}. ${defect.location}`, 
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 300, after: 100 }
          }));

          sectionsChildren.push(new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                  new TableRow({
                      children: [
                          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Classificatie", bold: true })] })], width: { size: 3000, type: WidthType.DXA } }),
                          new TableCell({ children: [new Paragraph({ 
                              children: [new TextRun({ 
                                  text: getDutchClassification(defect.classification), 
                                  bold: true, 
                                  color: getColor(defect.classification) 
                              })] 
                          })] }),
                      ]
                  }),
                  createRow("Omschrijving", defect.description),
                  createRow("Actie", defect.action),
              ]
          }));

          if (defect.photoUrl || defect.photoUrl2) {
              sectionsChildren.push(new Paragraph({ text: "Foto's:", spacing: { before: 100 } }));
              const photos = [defect.photoUrl, defect.photoUrl2].filter(Boolean) as string[];
              
              photos.forEach(photo => {
                  try {
                      const isPng = photo.startsWith("data:image/png");
                      sectionsChildren.push(new Paragraph({
                          children: [new ImageRun({
                              data: base64ToUint8Array(photo),
                              transformation: { width: 300, height: 200 },
                              type: (isPng ? "png" : "jpeg") as any,
                          })],
                          spacing: { after: 100 }
                      }));
                  } catch (e) {}
              });
          }
          
          sectionsChildren.push(new Paragraph({ 
              children: [new TextRun({ text: "__________________________________________________________________________", color: "CCCCCC" })],
              spacing: { before: 100, after: 200 } 
          }));
      });
  }

  sectionsChildren.push(new Paragraph({ children: [new PageBreak()] }));

  // ==========================================
  // LAATSTE PAGINA: HERSTELVERKLARING
  // ==========================================

  sectionsChildren.push(new Paragraph({ text: "BIJLAGE 1: HERSTELVERKLARING", heading: HeadingLevel.HEADING_1 }));
  
  sectionsChildren.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
          createRow("Locatie:", meta.projectLocation),
          createRow("Adres:", meta.projectAddress),
          createRow("Contactpersoon:", meta.projectContactPerson),
      ]
  }));

  sectionsChildren.push(new Paragraph({ text: "HERSTELVERKLARING DOOR INSTALLATEUR", heading: HeadingLevel.HEADING_3, spacing: { before: 300 } }));
  
  createTextPara("Ondergetekende (de installateur) verklaart dat:");
  createTextPara("> Minimaal alle afwijkingen van classificatie Rood en Oranje zoals vastgelegd in dit inspectierapport vakkundig hersteld zijn.");
  createTextPara("> De werkzaamheden zijn uitgevoerd conform de geldende installatievoorschriften zoals de NEN 1010.");
  createTextPara("> Indien bij de vervolginspectie wordt geconstateerd dat de mutaties niet overeenkomstig de geldende installatievoorschriften zijn uitgevoerd, deze alsnog dienen te worden hersteld.");
  
  sectionsChildren.push(new Paragraph({ children: [new TextRun({ text: "Gegevens Installateur:", bold: true })], spacing: { before: 200 } }));
  
  sectionsChildren.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
          createRow("Bedrijfsnaam:", ""),
          createRow("Naam monteur:", ""),
          createRow("Datum herstel:", ""),
          createRow("Handtekening:", ""),
      ]
  }));

  // ==========================================
  // DOCUMENT GENEREREN
  // ==========================================
  
  const doc = new Document({
    sections: [{
      properties: {},
      children: sectionsChildren,
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun("Pagina "),
                new TextRun({ children: [PageNumber.CURRENT] }),
                new TextRun(" van "),
                new TextRun({ children: [PageNumber.TOTAL_PAGES] }),
              ],
            }),
          ],
        }),
      },
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Scope10_${meta.clientName || 'Rapport'}_${meta.date}.docx`);
};