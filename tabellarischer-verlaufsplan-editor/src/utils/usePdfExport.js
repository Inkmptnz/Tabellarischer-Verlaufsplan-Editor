// KORREKTE IMPORTS
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { sanitizeFilename } from './useFileHandler.js'

export function usePdfExport() {
  async function generatePdf(exportData) {
    try {
      const { schulname, lehrername, datum, stundenthema, phasenMitUhrzeit, lernziele, spalten } =
        exportData
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.text(`Schulname: ${schulname || 'N/A'}`, 14, 15)
      doc.text(`Lehrkraft: ${lehrername || 'N/A'}`, 14, 22)

      const pageDimensions = doc.internal.pageSize
      const pageWidth = pageDimensions.getWidth()
      const formattedDate = new Date(datum).toLocaleDateString('de-DE')
      doc.text(`Datum: ${formattedDate}`, pageWidth - 14, 15, { align: 'right' })

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.text(stundenthema || 'Kein Thema angegeben', pageWidth / 2, 35, { align: 'center' })

      let currentY = 35

      if (lernziele && lernziele.length > 0) {
        currentY += 10 // 10mm Abstand nach dem Titel
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.text('Lernziele:', 14, currentY)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        lernziele.forEach((lernziel) => {
          currentY += 6 // 6mm Abstand für jede neue Zeile
          doc.text(`• ${lernziel.text}`, 16, currentY)
        })
      }

      // --- Tabelle ---
      // Uhr/Zeit sind wie in der Weboberfläche feste Spalten, der Rest kommt
      // aus dem aktiven Preset. Preset-Breiten sind relative Gewichte (siehe
      // PlanTabelle.vue) und werden hier genauso auf die verfügbare Breite
      // umgerechnet.
      const UHR_BREITE_MM = 15
      const ZEIT_BREITE_MM = 15
      const marge = 14
      const verfuegbareBreite = pageWidth - marge * 2 - UHR_BREITE_MM - ZEIT_BREITE_MM
      const gesamtGewicht = spalten.reduce((summe, spalte) => summe + spalte.width, 0)

      const head = [['Uhr', 'Zeit (Min)', ...spalten.map((spalte) => spalte.label)]]
      const body = phasenMitUhrzeit.map((phase) => [
        phase.uhrzeit,
        phase.dauer,
        ...spalten.map((spalte) => phase[spalte.id]),
      ])

      const columnStyles = {
        0: { cellWidth: UHR_BREITE_MM },
        1: { cellWidth: ZEIT_BREITE_MM },
      }
      spalten.forEach((spalte, index) => {
        columnStyles[index + 2] = {
          cellWidth: gesamtGewicht > 0 ? (spalte.width / gesamtGewicht) * verfuegbareBreite : 'auto',
        }
      })

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

        columnStyles,
      })

      const pdf_name = `${sanitizeFilename('verlaufsplan_' + stundenthema)}.pdf`
      doc.save(pdf_name)
    } catch (error) {
      console.error('Fehler beim PDF-Export:', error)
    }
  }

  return {
    generatePdf,
  }
}
