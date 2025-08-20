// KORREKTE IMPORTS
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable' // Importiere die Funktion explizit

export function usePdfExport() {
  
  async function generatePdf(exportData) {
    try {
      const { 
        schulname, 
        lehrername, 
        datum, 
        stundenthema, 
        phasenMitUhrzeit, 
        lernziele 
      } = exportData;
      
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Header-Informationen
      // ERSETZE 'arial' DURCH 'helvetica'
      doc.setFont('helvetica', 'normal'); 
      doc.setFontSize(11);
      doc.text(`Schulname: ${schulname || 'N/A'}`, 14, 15);
      doc.text(`Lehrkraft: ${lehrername || 'N/A'}`, 14, 22);
      
      const pageDimensions = doc.internal.pageSize;
      const pageWidth = pageDimensions.getWidth();
      const formattedDate = new Date(datum).toLocaleString('de-DE');
      doc.text(`Datum: ${formattedDate}`, pageWidth - 14, 15, { align: 'right' });
      
      // Stundenthema
      doc.setFont('helvetica', 'bold'); // ERSETZE 'arial' DURCH 'helvetica'
      doc.setFontSize(14);
      doc.text(stundenthema || 'Kein Thema angegeben', pageWidth / 2, 35, { align: 'center' });

      // Tabellendaten vorbereiten (unverändert)
      const head = [['Uhr', 'Zeit (Min)', 'Phase', 'Handlung', 'Methode', 'Mittel', 'Bemerkung']];
      const body = phasenMitUhrzeit.map(phase => [
        phase.uhrzeit,
        phase.dauer,
        phase.phase,
        phase.handlung,
        phase.methode,
        phase.mittel,
        phase.bemerkung
      ]);

      // KORRIGIERTER AUFRUF VON autoTable
      autoTable(doc, {
        head: head,
        body: body,
        startY: 45,
        theme: 'grid',
        styles: {
          font: 'helvetica',
          fontSize: 10,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [220, 220, 220],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { cellWidth: 15 }, 1: { cellWidth: 15 }, 2: { cellWidth: 40 }, 3: { cellWidth: 'auto' },
          4: { cellWidth: 30 }, 5: { cellWidth: 30 }, 6: { cellWidth: 40 },
        }
      });

      // Lernziele unter der Tabelle hinzufügen
      const finalY = doc.lastAutoTable.finalY; // Dies funktioniert weiterhin, da autoTable das doc-Objekt modifiziert
      if (lernziele && lernziele.length > 0) {
        doc.setFont('helvetica', 'bold'); // ERSETZE 'arial' DURCH 'helvetica'
        doc.setFontSize(11);
        doc.text('Lernziele:', 14, finalY + 10);
        
        doc.setFont('helvetica', 'normal'); // ERSETZE 'arial' DURCH 'helvetica'
        doc.setFontSize(10);
        lernziele.forEach((lernziel, index) => {
          doc.text(`• ${lernziel.text}`, 16, finalY + 16 + (index * 6));
        });
      }

      doc.save('Verlaufsplan.pdf');

    } catch (error) {
      console.error("Fehler beim PDF-Export:", error);
    }
  }

  return {
    generatePdf
  };
}