// src/components/WordGenerator.ts
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, HeadingLevel, ImageRun } from "docx";
import { saveAs } from "file-saver";
import { InspectionState } from "../types";

// Hulpfunctie om Base64 plaatjes om te zetten naar een formaat dat Word snapt
const base64ToUint8Array = (base64: string) => {
  // Split op de komma om de metadata (data:image/jpeg;base64,) te verwijderen als die er is
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
  
  // 1. Bouw de secties (Paragrafen)
  const children: any[] = [];

  // --- TITEL PAGINA ---
  children.push(
    new Paragraph({
      text: "SCIOS Scope 10 Inspectierapport",
      heading: HeadingLevel.TITLE,
      spacing: { after: 300 },
    }),
    new Paragraph({
      text: `Datum inspectie: ${meta.date}`,
      heading: HeadingLevel.HEADING_2,
    }),
    new Paragraph({ text: "" }) // Witregel
  );

  // --- PROJECT GEGEVENS TABEL ---
  const createRow = (label: string, value: string) => {
    return new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: label, bold: true })] })], width: { size: 3000, type: WidthType.DXA } }),
        new TableCell({ children: [new Paragraph(value || "-")] }),
      ],
    });
  };

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        createRow("Opdrachtgever", meta.clientName),
        createRow("Projectlocatie", meta.projectLocation),
        createRow("Adres", `${meta.projectAddress}, ${meta.projectCity}`),
        createRow("Inspecteur", meta.inspectorName),
      ],
    }),
    new Paragraph({ text: "", spacing: { after: 300 } }) // Witregel
  );

  // --- GEBREKEN LIJST ---
  children.push(
    new Paragraph({
      text: "Geconstateerde Gebreken",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    })
  );

  if (defects.length === 0) {
    children.push(new Paragraph({ text: "Geen gebreken geconstateerd." }));
  } else {
    defects.forEach((defect, index) => {
      // Titel van gebrek
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${index + 1}. ${defect.location}`, bold: true, size: 28 }),
          ],
          spacing: { before: 300, after: 100 },
        })
      );

      // Omschrijving tabel
      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            createRow("Omschrijving", defect.description),
            createRow("Classificatie", defect.classification),
            createRow("Actie", defect.action),
          ],
        })
      );

      // Foto's toevoegen (als ze er zijn)
      const photos = [];
      if (defect.photoUrl) photos.push(defect.photoUrl);
      if (defect.photoUrl2) photos.push(defect.photoUrl2);

      if (photos.length > 0) {
        children.push(new Paragraph({ text: "Foto's:", spacing: { before: 100 } }));
        
        photos.forEach(photo => {
          try {
            // Check of het een PNG of JPEG is
            const isPng = photo.startsWith("data:image/png");

            children.push(
              new Paragraph({
                children: [
                  new ImageRun({
                    data: base64ToUint8Array(photo),
                    transformation: { width: 300, height: 200 }, 
                    // OPLOSSING: We gebruiken 'as any' om TypeScript te forceren het te accepteren.
                    type: (isPng ? "png" : "jpeg") as any, 
                  }),
                ],
                spacing: { after: 100 },
              })
            );
          } catch (e) {
            console.error("Fout bij laden foto voor Word", e);
          }
        });
      }
      
      children.push(new Paragraph({ text: "---------------------------------------------------", spacing: { before: 200 } }));
    });
  }

  // 2. Maak het document
  const doc = new Document({
    sections: [{
      properties: {},
      children: children,
    }],
  });

  // 3. Genereer Blob en Download
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Scope10_${meta.clientName || 'Rapport'}_${meta.date}.docx`);
};