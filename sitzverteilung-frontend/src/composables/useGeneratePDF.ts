import {jsPDF} from "jspdf";

export function useGeneratePDF() {
    const doc = new jsPDF({
        unit: 'mm',
        format: 'a4',
    });

    // dummy data
    const partysLeft = [
        { nr: 1, name: 'Gr + RL', votes: 24 },
        { nr: 2, name: 'CSU + FW', votes: 22 },
        { nr: 3, name: 'SPD + Volt', votes: 19 },
        { nr: 4, name: 'ÖDP + ML', votes: 4 },
        { nr: 5, name: 'FDP + BP', votes: 4 },
        { nr: 6, name: 'Linke + Die Partei', votes: 4 },
        { nr: 7, name: 'AfD', votes: 3 },
    ];
    const partysRight = [
        { nr: 10, name: '', votes: '' },
        { nr: 11, name: '', votes: '' },
        { nr: 12, name: '', votes: '' },
        { nr: 13, name: '', votes: '' },
        { nr: 14, name: '', votes: '' },
        { nr: 15, name: '', votes: '' },
        { nr: 16, name: '', votes: '' },
        { nr: 17, name: '', votes: '' },
        { nr: 18, name: '', votes: '' },
    ];
    const seatDistribution = [
        { name: 'FG: CSU+ÖDP', seats: 5 },
        { name: 'GRÜNE', seats: 5 },
        { name: 'FDP', seats: 3 },
        { name: 'AG: SPD+Volt', seats: 2 },
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

    // header
    doc.setFontSize(14);
    doc.text('Sitzverteilung', 105, 10, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.line(marginLeft, 15, marginRight, 15);

    // calculation
    doc.setFontSize(10);
    doc.text('Berechnung', marginLeft, 25);
    doc.setLineWidth(0.1);
    doc.line(marginLeft, 27, marginLeft + 50, 27);
    doc.text('Geben Sie bitte die gewünschten Werte ein.', marginLeft, 33);

    // parameter box
    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    const parameterBoxHeight = 15;
    doc.rect(marginLeft, 35, 90, parameterBoxHeight);
    doc.setFontSize(9);
    doc.text('Parameter', marginLeft + 2, 40);

    // number of seats and calculation method
    const paramText = "Anzahl der Sitze: 50    d'Hondt'sche Verfahren";
    doc.text(paramText, marginLeft + 2, 48);

    // party boxes, dynamic height
    const partysCount = Math.max(partysLeft.length, partysRight.length);
    const partysBoxHeight = partysCount * lineHeight + boxPadding * 2 + 10;

    // left party box
    doc.rect(marginLeft, 55, 90, partysBoxHeight);
    doc.setFontSize(9);
    doc.text('Parteien', marginLeft + 2, 60);

    let currentY = 70;
    partysLeft.forEach(p => {
        doc.text(`${p.nr}`, marginLeft + 2, currentY);
        doc.text(p.name, marginLeft + 8, currentY);
        doc.text(String(p.votes), marginLeft + 85, currentY, { align: 'right' });
        currentY += lineHeight;
    });

    // right party box
    const rightBoxX = marginLeft + 100;
    doc.rect(rightBoxX, 55, 90, partysBoxHeight);
    doc.text('Nr.', rightBoxX + 2, 60);
    doc.text('Name', rightBoxX + 10, 60);
    doc.text('Stimmen/Sitze', rightBoxX + 60, 60);

    currentY = 70;
    partysRight.forEach(p => {
        doc.text(String(p.nr), rightBoxX + 2, currentY);
        doc.text(p.name, rightBoxX + 10, currentY);
        doc.text(String(p.votes), rightBoxX + 60, currentY);
        currentY += lineHeight;
    });

    // box for seatDistribution
    const seatBoxX = marginLeft;
    const seatBoxY = 55 + partysBoxHeight + 10;
    const sitzBoxWidth = 180;
    const sitzBoxHeight = seatDistribution.length * (lineHeight + 5) + 15;

    doc.rect(seatBoxX, seatBoxY, sitzBoxWidth, sitzBoxHeight);
    doc.setFontSize(8);
    doc.text('Sitzverteilung', seatBoxX + 2, seatBoxY + 8);

    const barMaxWidth = 60;
    const maxSitze = Math.max(...seatDistribution.map(s => s.seats));

    currentY = seatBoxY + 18;
    seatDistribution.forEach(item => {
        doc.text(item.name, seatBoxX + 2, currentY);
        doc.text(String(item.seats), seatBoxX + 55, currentY);

        // Balken
        const barWidth = (item.seats / maxSitze) * barMaxWidth;
        doc.setFillColor(150, 150, 150);
        doc.rect(seatBoxX + 60, currentY - 4, barWidth, 5, 'F');

        currentY += lineHeight + 5;
    });

    // footer for seatDistribution
    doc.setFontSize(6);
    doc.text("Loseverfahren für 2 Sitze: maximaler FDP-Sitz · ÖDP-NL · LINKE-Partei", seatBoxX + 2, seatBoxY + sitzBoxHeight + 6);

    // quotient
    const seatCalculationX = marginLeft;
    const seatCalculationY = seatBoxY + sitzBoxHeight + 15;
    const seatCalculationWidth = 190;
    const seatCalculationHeight = quotients.length * lineHeight;

    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    doc.rect(seatCalculationX, seatCalculationY, seatCalculationWidth, seatCalculationHeight);
    doc.setFontSize(9);
    doc.text('Sitzrechnung (Quotient)', seatCalculationX + 2, seatCalculationY + 8);

    currentY = seatCalculationY + 16;
    doc.setFontSize(7);
    quotients.forEach(line => {
        doc.text(line, seatCalculationX + 2, currentY);
        currentY += lineHeight;
    });

    // save pdf
    doc.save('seatDistribution.pdf');
}