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
      text: "SCIOS Scope 10",
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
              createRow("INSPECTIEBEDRIJF:", meta.inspectionCompany || "Van Gestel Inspectie en Advies B.V."),
          ]
      })
  );

  sectionsChildren.push(new Paragraph({ children: [new PageBreak()] }));

  // -------------------------------------------------------------------------
  // PAGINA 2: VOORWOORD & LEESWIJZER
  // -------------------------------------------------------------------------
  
  sectionsChildren.push(
      new Paragraph({ text: "Voorwoord", heading: HeadingLevel.HEADING_1 }),
      createTextPara("Het doel van de SCIOS Scope 10 inspectie is om inzicht te krijgen in de belangrijkste elektrische risico's. Het zijn vaak relatief kleine afwijkingen die risico's veroorzaken."),
      createTextPara("Tijdens de inspectie is niet alleen gefocust op de elektrische installatie, risicovolle apparaten en machines zijn ook bekeken. Deze zijn vaak verantwoordelijk voor het ontstaan van een brand."),
      createTextPara("De inhoud van de SCIOS Scope 10 inspectie bestaat uit:"),
      new Paragraph({ text: "• een uitgebreide visuele inspectie;", bullet: { level: 0 } }),
      new Paragraph({ text: "• metingen en beproevingen;", bullet: { level: 0 } }),
      new Paragraph({ text: "• thermografische inspectie (warmtebeeldopname).", bullet: { level: 0 } }),
      
      new Paragraph({ text: "", spacing: { after: 200 } }),
      createTextPara("Let op: met deze inspectie voldoet u nog niet aan de Arbowet (NEN 3140). Dit is puur gericht op brandrisico.", true),
      
      new Paragraph({ text: "Leeswijzer", heading: HeadingLevel.HEADING_1, spacing: { before: 300 } }),
      createTextPara("Dit rapport is opgesteld aan de hand van technisch document 14 dat behoort bij een SCIOS Scope 10 inspectie."),
      createTextPara("Dit document is gebaseerd op de NTA 8220 Beoordelingsmethode op brandrisico van elektrisch materieel."),
      new Paragraph({ text: "• Hoofdstuk 1: Basisgegevens", bullet: { level: 0 } }),
      new Paragraph({ text: "• Hoofdstuk 2: Installatiegegevens", bullet: { level: 0 } }),
      new Paragraph({ text: "• Hoofdstuk 3: Inspectieresultaten & Advies", bullet: { level: 0 } }),
      new Paragraph({ text: "• Hoofdstuk 4: Geconstateerde gebreken", bullet: { level: 0 } }),
  );

  sectionsChildren.push(new Paragraph({ children: [new PageBreak()] }));

  // -------------------------------------------------------------------------
  // PAGINA 3: BASISGEGEVENS
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
  
  sectionsChildren.push(new Paragraph({ text: "AANVULLENDE INSTALLATIES", heading: HeadingLevel.HEADING_3, spacing: { before: 300 } }));
  sectionsChildren.push(new Paragraph({ text: `Energieopslagsysteem aanwezig? ${measurements.hasEnergyStorage === true ? "[X] Ja" : "[ ] Nee"}` }));
  sectionsChildren.push(new Paragraph({ text: `Zonnestroominstallatie aanwezig? ${measurements.hasSolarSystem === true ? "[X] Ja" : "[ ] Nee"}` }));

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
      ]
  }));

  sectionsChildren.push(new Paragraph({ text: "GEBRUIKSFUNCTIES (BBL)", heading: HeadingLevel.HEADING_3, spacing: { before: 300 } }));
  
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

  sectionsChildren.push(new Paragraph({ text: "3. INSPECTIE RESULTATEN", heading: HeadingLevel.HEADING_1 }));
  
  createTextPara("De inspectie is uitgevoerd op basis van NTA 8220 en SCIOS TD14.");
  createTextPara("Inspectiemethoden: Visuele inspectie, Metingen en beproevingen, Thermografie.");

  sectionsChildren.push(new Paragraph({ text: "VERKLARING", heading: HeadingLevel.HEADING_3, spacing: { before: 200 } }));
  
  const hasDefects = defects && defects.length > 0;
  
  sectionsChildren.push(new Paragraph({ 
      children: [
          new TextRun({ 
              text: hasDefects 
                ? "[X] Tijdens de inspectie zijn er gebreken vastgesteld die een risico vormen." 
                : "[X] Er zijn tijdens de inspectie GEEN gebreken vastgesteld.",
              bold: true 
          })
      ]
  }));

  sectionsChildren.push(new Paragraph({ text: "CONCLUSIE & ADVIES", heading: HeadingLevel.HEADING_3, spacing: { before: 300 } }));
  
  sectionsChildren.push(new Paragraph({ text: `Geadviseerde inspectiefrequentie: ${meta.inspectionInterval} jaar.` }));
  sectionsChildren.push(new Paragraph({ text: `Grondslag: ${meta.inspectionBasis.nta8220 ? "NTA 8220" : ""} ${meta.inspectionBasis.verzekering ? "+ Verzekeringseis" : ""}` }));
  sectionsChildren.push(new Paragraph({ 
      children: [
          new TextRun({ text: "Volgende inspectie uiterlijk: ", bold: true }),
          new TextRun({ text: meta.nextInspectionDate || "Nader te bepalen" })
      ]
  }));

  // Handtekening
  sectionsChildren.push(new Paragraph({ text: "Voor akkoord,", spacing: { before: 300 } }));
  sectionsChildren.push(new Paragraph({ children: [new TextRun({ text: meta.inspectorName, bold: true })] }));
  
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

  // -------------------------------------------------------------------------
  // PAGINA 8: STEEKPROEF & CLASSIFICATIE LEGENDA
  // -------------------------------------------------------------------------

  sectionsChildren.push(new Paragraph({ text: "TOELICHTING STEEKPROEF & CLASSIFICATIES", heading: HeadingLevel.HEADING_2 }));
  createTextPara("De omvang van de steekproef is bepaald conform Tabel 1 van de NTA 8220:2017.");
  
  sectionsChildren.push(new Paragraph({ text: "CLASSIFICATIE VAN GEBREKEN", heading: HeadingLevel.HEADING_3, spacing: { before: 200 } }));
  
  sectionsChildren.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
          new TableRow({ children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Kleur", bold: true })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Betekenis", bold: true })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Actie", bold: true })] })] }),
          ]}),
          new TableRow({ children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Rood", color: "FF0000", bold: true })] })] }),
              new TableCell({ children: [new Paragraph("Ernstig gevaar / Direct letselrisico")] }),
              new TableCell({ children: [new Paragraph("Direct veiligstellen/herstellen")] }),
          ]}),
          new TableRow({ children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Oranje", color: "ED7D31", bold: true })] })] }),
              new TableCell({ children: [new Paragraph("Serieus gebrek / Gevaar bij één fout")] }),
              new TableCell({ children: [new Paragraph("Binnen 3 maanden herstellen")] }),
          ]}),
          new TableRow({ children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Geel", color: "FFC000", bold: true })] })] }),
              new TableCell({ children: [new Paragraph("Gering gebrek / Afwijking norm")] }),
              new TableCell({ children: [new Paragraph("Herstellen bij onderhoud")] }),
          ]}),
      ]
  }));

  sectionsChildren.push(new Paragraph({ children: [new PageBreak()] }));

  // -------------------------------------------------------------------------
  // PAGINA 9+: GEBREKENLIJST
  // -------------------------------------------------------------------------

  sectionsChildren.push(new Paragraph({ text: "4. VASTGESTELDE GEBREKEN", heading: HeadingLevel.HEADING_1 }));

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

  // -------------------------------------------------------------------------
  // LAATSTE PAGINA: HERSTELVERKLARING
  // -------------------------------------------------------------------------

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