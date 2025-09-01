// KORREKTE IMPORTS
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

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
      
    
      doc.setFont('helvetica', 'normal'); 
      doc.setFontSize(11);
      doc.text(`Schulname: ${schulname || 'N/A'}`, 14, 15);
      doc.text(`Lehrkraft: ${lehrername || 'N/A'}`, 14, 22);
      
      const pageDimensions = doc.internal.pageSize;
      const pageWidth = pageDimensions.getWidth();
      const formattedDate = new Date(datum).toLocaleDateString('de-DE');
      doc.text(`Datum: ${formattedDate}`, pageWidth - 14, 15, { align: 'right' });
      
      doc.setFont('helvetica', 'bold'); 
      doc.setFontSize(14);
      doc.text(stundenthema || 'Kein Thema angegeben', pageWidth / 2, 35, { align: 'center' });
      
      let currentY = 35; 

      if (lernziele && lernziele.length > 0) {
        currentY += 10; // 10mm Abstand nach dem Titel
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('Lernziele:', 14, currentY);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        lernziele.forEach((lernziel) => {
          currentY += 6; // 6mm Abstand für jede neue Zeile
          doc.text(`• ${lernziel.text}`, 16, currentY);
        });
      }

      // --- Tabelle ---
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

      
      autoTable(doc, {
        head: head,
        body: body,
        startY: currentY + 10, // Startet 10mm unter dem letzten Lernziel
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

        columnStyles: {
          0: { cellWidth: 15 }, 1: { cellWidth: 15 }, 2: { cellWidth: 40 }, 3: { cellWidth: 'auto' },
          4: { cellWidth: 30 }, 5: { cellWidth: 30 }, 6: { cellWidth: 40 },
        }
      });

      const pdf_name = `verlaufsplan_${stundenthema}.pdf`
      doc.save(pdf_name);
    } catch (error) {
      console.error("Fehler beim PDF-Export:", error);
    }
  }

  return {
    generatePdf
  };
}