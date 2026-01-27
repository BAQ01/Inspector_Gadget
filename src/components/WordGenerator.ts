// src/components/WordGenerator.ts
import { 
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
  WidthType, HeadingLevel, ImageRun, AlignmentType, PageBreak, 
  Footer, PageNumber, VerticalAlign 
} from "docx";
import { saveAs } from "file-saver";
import { InspectionState } from "../types";

// Hulpfunctie: Converteer kleuren naar HEX voor Word (zonder #)
const getColor = (classification: string) => {
  switch (classification) {
    case 'Red': return "FF0000";    // Rood
    case 'Orange': return "ED7D31"; // Oranje
    case 'Yellow': return "FFC000"; // Goud/Geel
    case 'Blue': return "4472C4";   // Blauw
    default: return "000000";       // Zwart
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

// Hulpfunctie om Base64 plaatjes om te zetten
const base64ToUint8Array = (base64: string) => {
  const parts = base64.split(',');
  const binaryString = window.atob(parts.length > 1 ? parts[1] : parts[0]);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const generateWordDocument = async (meta: InspectionState['meta'], defects: InspectionState['defects'], measurements: InspectionState['measurements']) => {
  
  const sectionsChildren: any[] = [];

  // ==========================================
  // 1. VOORBLAD
  // ==========================================
  
  // Titel
  sectionsChildren.push(
    new Paragraph({
      text: "SCIOS Scope 10",
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 },
    }),
    new Paragraph({
      text: "Inspectierapport Elektrisch Materieel",
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Foto van het pand (indien aanwezig)
  if (meta.locationPhotoUrl) {
    try {
      const isPng = meta.locationPhotoUrl.startsWith("data:image/png");
      sectionsChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              data: base64ToUint8Array(meta.locationPhotoUrl),
              transformation: { width: 400, height: 300 },
              type: (isPng ? "png" : "jpeg") as any,
            }),
          ],
          spacing: { after: 400 }
        })
      );
    } catch (e) { console.error("Fout bij voorblad foto", e); }
  }

  // Projectgegevens Tabel op voorblad
  const createMetaRow = (label: string, value: string) => {
    return new TableRow({
      children: [
        new TableCell({ 
            children: [new Paragraph({ children: [new TextRun({ text: label, bold: true })] })], 
            width: { size: 3500, type: WidthType.DXA },
            verticalAlign: VerticalAlign.CENTER
        }),
        new TableCell({ 
            children: [new Paragraph(value || "-")],
            verticalAlign: VerticalAlign.CENTER
        }),
      ],
    });
  };

  sectionsChildren.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        createMetaRow("Datum Inspectie", meta.date),
        createMetaRow("Opdrachtgever", meta.clientName),
        createMetaRow("Projectlocatie", meta.projectLocation),
        createMetaRow("Adres", `${meta.projectAddress}, ${meta.projectCity}`),
        createMetaRow("Inspecteur", meta.inspectorName),
        createMetaRow("SCIOS Registratie", meta.sciosRegistrationNumber),
      ],
    }),
    new Paragraph({ children: [new PageBreak()] }) // --- NIEUWE PAGINA ---
  );

  // ==========================================
  // 2. METINGEN & OBSERVATIES
  // ==========================================
  
  sectionsChildren.push(
    new Paragraph({
      text: "1. Metingen & Technische Gegevens",
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
    })
  );

  sectionsChildren.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        createMetaRow("Type Stroomstelsel", measurements.installationType),
        createMetaRow("Bouwjaar (schatting)", measurements.yearOfConstruction),
        createMetaRow("Hoofdbeveiliging", measurements.mainFuse),
        createMetaRow("Temperatuur Verdeelkast", `${measurements.switchboardTemp || '-'} °C`),
        createMetaRow("Isolatieweerstand (Riso)", `${measurements.insulationResistance || '-'} MΩ`),
        createMetaRow("Impedantie (Zi)", `${measurements.impedance || '-'} Ω`),
        createMetaRow("Zonnepanelen aanwezig?", measurements.hasSolarSystem === true ? "Ja" : measurements.hasSolarSystem === false ? "Nee" : "-"),
        createMetaRow("Energieopslag aanwezig?", measurements.hasEnergyStorage === true ? "Ja" : measurements.hasEnergyStorage === false ? "Nee" : "-"),
      ],
    }),
    new Paragraph({ text: "", spacing: { after: 300 } })
  );

  // ==========================================
  // 3. GEBREKEN LIJST
  // ==========================================

  sectionsChildren.push(
    new Paragraph({
      text: "2. Geconstateerde Gebreken",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    })
  );

  if (defects.length === 0) {
    // FIX: Italics moet in TextRun
    sectionsChildren.push(new Paragraph({ 
        children: [new TextRun({ text: "Er zijn geen gebreken geconstateerd tijdens deze inspectie.", italics: true })]
    }));
  } else {
    defects.forEach((defect, index) => {
      // Kopje: Locatie
      sectionsChildren.push(
        new Paragraph({
          text: `${index + 1}. ${defect.location}`,
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 300, after: 100 },
        })
      );

      // Tabel met details
      sectionsChildren.push(
        new Table({
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
            createMetaRow("Omschrijving", defect.description),
            createMetaRow("Actie", defect.action),
          ],
        })
      );

      // Foto's
      const photos = [];
      if (defect.photoUrl) photos.push(defect.photoUrl);
      if (defect.photoUrl2) photos.push(defect.photoUrl2);

      if (photos.length > 0) {
        sectionsChildren.push(new Paragraph({ text: "Foto's:", spacing: { before: 100 } }));
        photos.forEach(photo => {
          try {
            const isPng = photo.startsWith("data:image/png");
            sectionsChildren.push(
              new Paragraph({
                children: [
                  new ImageRun({
                    data: base64ToUint8Array(photo),
                    transformation: { width: 300, height: 200 }, 
                    type: (isPng ? "png" : "jpeg") as any, 
                  }),
                ],
                spacing: { after: 100 },
              })
            );
          } catch (e) { console.error("Fout bij foto", e); }
        });
      }
      
      // FIX: Kleur moet in TextRun, niet in Paragraph
      sectionsChildren.push(new Paragraph({ 
          children: [new TextRun({ text: "__________________________________________________________________________", color: "CCCCCC" })],
          spacing: { before: 100, after: 200 } 
      }));
    });
  }

  // ==========================================
  // 4. CONCLUSIE & ONDERTEKENING
  // ==========================================
  
  sectionsChildren.push(new Paragraph({ children: [new PageBreak()] }));

  sectionsChildren.push(
    new Paragraph({
      text: "3. Conclusie & Advies",
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
    })
  );

  sectionsChildren.push(
    new Paragraph({
      children: [
        new TextRun({ text: "Inspectiefrequentie: ", bold: true }),
        new TextRun({ text: `Geadviseerd wordt een herinspectie termijn van ${meta.inspectionInterval} jaar.` })
      ],
      spacing: { after: 100 }
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Grondslag: ", bold: true }),
        new TextRun({ text: `${meta.inspectionBasis.nta8220 ? "Conform NTA 8220. " : ""}${meta.inspectionBasis.verzekering ? "Conform vereisten verzekeraar." : ""}` })
      ],
      spacing: { after: 100 }
    }),
     new Paragraph({
      children: [
        new TextRun({ text: "Volgende inspectie uiterlijk: ", bold: true }),
        new TextRun({ text: meta.nextInspectionDate || "Nader te bepalen" })
      ],
      spacing: { after: 300 }
    })
  );

  // Handtekening
  sectionsChildren.push(
    new Paragraph({
      text: "Voor akkoord,",
      spacing: { after: 100 }
    }),
    // FIX: Bold in TextRun
    new Paragraph({
      children: [new TextRun({ text: meta.inspectorName, bold: true })],
      spacing: { after: 100 }
    })
  );

  if (meta.signatureUrl) {
    try {
        const isPng = meta.signatureUrl.startsWith("data:image/png");
        sectionsChildren.push(
            new Paragraph({
                children: [
                    new ImageRun({
                        data: base64ToUint8Array(meta.signatureUrl),
                        transformation: { width: 200, height: 100 },
                        type: (isPng ? "png" : "jpeg") as any,
                    })
                ]
            })
        );
    } catch (e) { console.error("Fout bij handtekening", e); }
  }


  // ==========================================
  // DOCUMENT GENEREREN MET FOOTER
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
              // FIX: Paginanummers in TextRun children
              children: [
                new TextRun("Pagina "),
                new TextRun({
                    children: [PageNumber.CURRENT],
                }),
                new TextRun(" van "),
                new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                }),
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