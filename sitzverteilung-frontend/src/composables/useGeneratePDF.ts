import { jsPDF } from "jspdf";

export function useGeneratePDF() {
    const doc = new jsPDF({
        unit: 'mm',
        format: 'a4',
    });

    // dummy data
    const partysLeft = [
        {nr: 1, name: 'Gr + RL', votes: 24},
        {nr: 2, name: 'CSU + FW', votes: 22},
        {nr: 3, name: 'SPD + Volt', votes: 19},
        {nr: 4, name: 'ÖDP + ML', votes: 4},
        {nr: 5, name: 'FDP + BP', votes: 4},
        {nr: 6, name: 'Linke + Die Partei', votes: 4},
        {nr: 7, name: 'AfD', votes: 3},
    ];
    const partysRight = [
        {nr: 10, name: '', votes: ''},
        {nr: 11, name: '', votes: ''},
        {nr: 12, name: '', votes: ''},
        {nr: 13, name: '', votes: ''},
        {nr: 14, name: '', votes: ''},
        {nr: 15, name: '', votes: ''},
        {nr: 16, name: '', votes: ''},
        {nr: 17, name: '', votes: ''},
        {nr: 18, name: '', votes: ''},
    ];
    const seatDistribution = [
        {name: 'FG: CSU+ÖDP', seats: 5},
        {name: 'GRÜNE', seats: 5},
        {name: 'FDP', seats: 3},
        {name: 'AG: SPD+Volt', seats: 2},
    ];
    const quotients = [
        '1. Sitz: Gr + RL (24,000)',
        '2. Sitz: CSU + FW (22,000)',
        '3. Sitz: SPD + Volt (19,000)',
        '4. Sitz: Gr + RL (12,000)',
        '5. Sitz: CSU + FW (11,000)',
        '6. Sitz: SPD + Volt (9,500)',
        '7. Sitz: Gr + RL (8,000)',
        '8. Sitz: CSU + FW (7,333)',
        '9. Sitz: SPD + Volt (6,333)',
        '10. Sitz: Gr + RL (6,000)',
        '11. Sitz: CSU + FW (5,500)',
        '12. Sitz: Gr + RL (4,800)',
        '13. Sitz: SPD + Volt (4,750)',
        '14. Sitz: CSU + FW (4,400)',
        '15. Sitz: Gr + RL (4,000)',
        '16. Sitz: ÖDP+ML (4,000)',
    ];

    // layout constants
    const marginLeft = 10;
    const marginRight = 200;
    const boxPadding = 2;
    const lineHeight = 7;

    // header mit Zeitstempel
    doc.setFontSize(8);
    doc.text(new Date().toLocaleDateString('de-DE'), 190, 5, {align: 'right'});

    // header
    doc.setFontSize(14);
    doc.text('Sitzverteilung', 105, 10, {align: 'center'});
    doc.setLineWidth(0.5);
    doc.line(marginLeft, 15, marginRight, 15);

    // calculation
    doc.setFontSize(12);
    doc.text('Berechnung', marginLeft, 25);

    // parameter box
    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    const parameterBoxHeight = 15;
    doc.rect(marginLeft, 35, 90, parameterBoxHeight);
    doc.setFontSize(12);
    doc.text('Parameter', marginLeft + 2, 40);
    doc.setLineWidth(0.1);
    doc.line(marginLeft, 42, marginLeft + 88, 42);

    doc.setFontSize(9);
    doc.setLineWidth(0.5);
    const paramText = "Anzahl der Sitze: 50    d'Hondt'sche Verfahren";
    doc.text(paramText, marginLeft + 2, 48);

// party boxes, dynamic height
    const partysCount = Math.max(partysLeft.length, partysRight.length);
    const partysBoxHeight = partysCount * lineHeight + boxPadding * 2 + 10;

// Hauptüberschrift "Parteien" - um 10mm nach unten verschoben
    doc.setFontSize(11);
    doc.text('Parteien', marginLeft + 45, 65, {align: 'center'});
    doc.setLineWidth(0.1);
    doc.line(marginLeft, 67, marginRight - 10, 67);

// left party box - um 10mm nach unten verschoben
    doc.rect(marginLeft, 70, 90, partysBoxHeight);
    doc.setFontSize(11);
    doc.text('Nr.', marginLeft + 2, 75);
    doc.text('Name', marginLeft + 10, 75);
    doc.text('Stimmen/Sitze', marginLeft + 60, 75);
    doc.setLineWidth(0.1);
    doc.line(marginLeft, 77, marginLeft + 88, 77);

    doc.setFontSize(9);
    doc.setLineWidth(0.5);
    let currentY = 85; // Startposition um 10mm nach unten verschoben
    const maxWidth = 70;
    partysLeft.forEach(p => {
        doc.text(String(p.nr), marginLeft + 2, currentY);
        const splittedText = doc.splitTextToSize(p.name, maxWidth);
        doc.text(splittedText, marginLeft + 10, currentY);
        doc.text(String(p.votes), marginLeft + 60, currentY);
        currentY += lineHeight;
    });

// right party box - um 10mm nach unten verschoben
    const rightBoxX = marginLeft + 100;
    doc.rect(rightBoxX, 70, 90, partysBoxHeight);
    doc.setFontSize(11);
    doc.text('Nr.', rightBoxX + 2, 75);
    doc.text('Name', rightBoxX + 10, 75);
    doc.text('Stimmen/Sitze', rightBoxX + 60, 75);
    doc.setLineWidth(0.1);
    doc.line(rightBoxX + 2, 77, rightBoxX + 88, 77);

    doc.setFontSize(9);
    currentY = 85; // Startposition um 10mm nach unten verschoben
    partysRight.forEach(p => {
        doc.text(String(p.nr), rightBoxX + 2, currentY);
        doc.text(p.name, rightBoxX + 10, currentY);
        doc.text(String(p.votes), rightBoxX + 60, currentY);
        currentY += lineHeight;
    });

// box for seatDistribution - um 10mm nach unten verschoben
    doc.setLineWidth(0.5);
    const seatBoxX = marginLeft;
    const seatBoxY = 70 + partysBoxHeight + 15; // Startposition um 10mm nach unten verschoben
    const seatBoxWidth = 190;
    const seatBoxHeight = seatDistribution.length * (lineHeight + 5) + 15;

    doc.rect(seatBoxX, seatBoxY, seatBoxWidth, seatBoxHeight);
    doc.setFontSize(11);
    doc.text('Sitzverteilung', seatBoxX + 2, seatBoxY + 8);
    doc.setLineWidth(0.1);
    doc.line(seatBoxX + 2, seatBoxY + 10, seatBoxX + 188, seatBoxY + 10);

    const seatBoxStartY = seatBoxY + 18; // Startposition um 10mm nach unten verschoben
    const seatBoxHeightPerItem = lineHeight + 5;
    const pageHeight = doc.internal.pageSize.height;
    const bottomMargin = 25; // Erhöhter unterer Rand für bessere Platzierung
    const maxY = pageHeight - bottomMargin;

    currentY = seatBoxStartY;

    seatDistribution.forEach((item) => {
        // Prüfen ob Balken + Text auf der aktuellen Seite noch reinpassen
        if (currentY + seatBoxHeightPerItem > maxY) {
            doc.addPage();
            currentY = 20; // oberer Rand nach Seitenumbruch

            // Header für Sitzverteilung auf neuer Seite neu zeichnen falls die fehlen
            doc.setFontSize(11);
            doc.text('Sitzverteilung (Fortsetzung)', marginLeft + 2, currentY - 10);
        }

        // Text und Balken zeichnen
        doc.setFontSize(9);
        doc.text(item.name, marginLeft + 2, currentY);
        doc.text(String(item.seats), marginLeft + 55, currentY);

        const barMaxWidth = seatBoxWidth - 65;
        const maxSitze = Math.max(...seatDistribution.map(s => s.seats));
        const barWidth = (item.seats / maxSitze) * barMaxWidth;

        doc.setFillColor(150, 150, 150);
        doc.rect(marginLeft + 60, currentY - 4, barWidth, 5, 'F');

        currentY += seatBoxHeightPerItem;
    });

// footer for seatDistribution
    doc.setFontSize(6);
    doc.text("Loseverfahren für 2 Sitze: maximaler FDP-Sitz · ÖDP-NL · LINKE-Partei",
        seatBoxX + 2, currentY + 6);

// quotient
    const seatCalculationX = marginLeft;
    let seatCalculationY = currentY + 15; // Startposition nach Sitzverteilung
    const seatCalculationWidth = 190;

// Dynamische Höhe basierend auf der Anzahl der Quotienten
    const seatCalculationHeight = quotients.length * lineHeight + boxPadding * 2 + 10; // +10 für Header

// Prüfen ob genug Platz auf der aktuellen Seite ist
    if (seatCalculationY + seatCalculationHeight > pageHeight - 15) {
        doc.addPage();
        seatCalculationY = 20; // Neuer Start auf neuer Seite
    }

    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    doc.rect(seatCalculationX, seatCalculationY, seatCalculationWidth, seatCalculationHeight);
    doc.setFontSize(11);
    doc.text('Sitzrechnung (Quotient)', seatCalculationX + 2, seatCalculationY + 8);
    doc.setLineWidth(0.1);
    doc.line(seatCalculationX + 2, seatCalculationY + 10, seatCalculationX + 188, seatCalculationY + 10);

    let currentYQuotient = seatCalculationY + 16; // Start nach Header
    doc.setFontSize(9);
    quotients.forEach(line => {
        doc.text(line, seatCalculationX + 2, currentYQuotient);
        currentYQuotient += lineHeight;
    });

// save pdf
    doc.save('seatDistribution.pdf');
}