import { jsPDF } from "jspdf";
import type {CalculationResult} from "@/types/calculation/ui/CalculationResult.ts";
import type {BaseData} from "@/types/basedata/BaseData.ts";
import {CalculationMethod} from "@/types/calculation/CalculationMethod.ts";

const marginLeft = 10;
const marginRight = 200;
const boxPadding = 2;
const lineHeight = 7;
const headerLine = 0.1;

const headerSize = 11;
const headerFontSize = 16;
const dataTextSize = 9;
const parameterBoxHeight = 15;
const boxLine = 0.5;

let currentY: number;

interface PartyEntry {
    nr: number;
    name: string;
    votes: number;
}

export function useGeneratePDF() {
    //Parameter- baseDataTest: BaseData, calculationResult: CalculationResult, calculationMethod: CalculationMethod

    let doc = new jsPDF({
        unit: 'mm',
        format: 'a4',
    });

    const usedCalculationMethod = CalculationMethod.SAINTE_LAGUE_SCHEPERS;

    //Nimm DummybaseData und bringe sie in die richtige Form
    const baseData: BaseData = {
        name: "Beispiel",
        committeeSize: 40,
        groups: [
            { name: "Gruppe A", seatsOrVotes: 10 },
            { name: "Gruppe B", seatsOrVotes: 5 },
            { name: "Gruppe C", seatsOrVotes: 8 },
        ],
        unions: [],
    };

    //DummyCalculationResults
    const calculationResult: CalculationResult = [
        {
            groupName: "DieMittelgroßePartei",
            amountSeats: 2,
            proportion: 2,
            calculationMethodResults: {
                [CalculationMethod.HARE_NIEMEYER]: {
                    isValid: true,
                    amountAllocatedSeats: 3,
                    isStale: "KeinStaleHier",
                    arrangement: [
                        {
                            seatNumber: 3,
                            quotient: 2,
                        }
                    ]
                },
                [CalculationMethod.D_HONDT]: {
                    isValid: true,
                    amountAllocatedSeats: 3,
                    isStale: "KeinStaleHier",
                    arrangement: [
                        {
                            seatNumber: 3,
                            quotient: 2,
                        }
                    ]
                },
                [CalculationMethod.SAINTE_LAGUE_SCHEPERS]: {
                    isValid: true,
                    amountAllocatedSeats: 3,
                    isStale: "KeinStaleHier",
                    arrangement: [
                        {
                            seatNumber: 3,
                            quotient: 2,
                        }
                    ]
                },
            }
        },
        {
            groupName: "DieGroeßerePartei",
            amountSeats: 4,
            proportion: 2,
            calculationMethodResults: {
                [CalculationMethod.HARE_NIEMEYER]: {
                    isValid: true,
                    amountAllocatedSeats: 3,
                    isStale: "KeinStaleHier",
                    arrangement: [
                        {
                            seatNumber: 3,
                            quotient: 2,
                        }
                    ]
                },
                [CalculationMethod.D_HONDT]: {
                    isValid: true,
                    amountAllocatedSeats: 3,
                    isStale: "KeinStaleHier",
                    arrangement: [
                        {
                            seatNumber: 3,
                            quotient: 2,
                        }
                    ]
                },
                [CalculationMethod.SAINTE_LAGUE_SCHEPERS]: {
                    isValid: true,
                    amountAllocatedSeats: 3,
                    isStale: "KeinStaleHier",
                    arrangement: [
                        {
                            seatNumber: 3,
                            quotient: 2,
                        }
                    ]
                },
            }
        },
        {
            groupName: "DieKleinerePartei",
            amountSeats: 1,
            proportion: 2,
            calculationMethodResults: {
                [CalculationMethod.HARE_NIEMEYER]: {
                    isValid: true,
                    amountAllocatedSeats: 3,
                    isStale: "KeinStaleHier",
                    arrangement: [
                        {
                            seatNumber: 3,
                            quotient: 2,
                        }
                    ]
                },
                [CalculationMethod.D_HONDT]: {
                    isValid: true,
                    amountAllocatedSeats: 3,
                    isStale: "KeinStaleHier",
                    arrangement: [
                        {
                            seatNumber: 3,
                            quotient: 2,
                        }
                    ]
                },
                [CalculationMethod.SAINTE_LAGUE_SCHEPERS]: {
                    isValid: true,
                    amountAllocatedSeats: 3,
                    isStale: "KeinStaleHier",
                    arrangement: [
                        {
                            seatNumber: 3,
                            quotient: 2,
                        }
                    ]
                },
            }
        }
    ];

    //Dummyquotients
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


    // header mit Zeitstempel
    doc.setFontSize(8);
    doc.text(new Date().toLocaleDateString('de-DE'), 200, 5, {align: 'right'});

    // header
    doc.setFontSize(headerFontSize);
    doc.text('Sitzverteilung', 105, 10, {align: 'center'});
    doc.setLineWidth(boxLine);
    doc.line(marginLeft, parameterBoxHeight, marginRight, parameterBoxHeight);

    // calculation
    doc.setFontSize(headerSize);
    doc.text('Berechnung', marginLeft, 25);

    doc = generateParameterBox(doc, baseData, usedCalculationMethod);

    const [partysLeft, partysRight] = getAndSortGroupsFromBaseData(baseData);
    const partysCount = Math.max(partysLeft.length, partysRight.length);
    const partysBoxHeight = partysCount * lineHeight + boxPadding * 2 + 10;

    doc = generateLeftAndRightPartyBox(doc, partysLeft, partysRight, partysBoxHeight);

    doc = generateSeatDistribution(doc, calculationResult, partysBoxHeight);

    doc = generateQuotientBox(doc, quotients);

// save pdf
    doc.save('seatDistribution.pdf');
}

function generateParameterBox(doc: jsPDF, baseData: BaseData, usedCalculationMethod: CalculationMethod): jsPDF {
    doc.setDrawColor(0);
    doc.setLineWidth(boxLine);
    doc.rect(marginLeft, 35, 110, parameterBoxHeight);
    doc.setFontSize(headerSize);
    doc.text('Parameter', marginLeft + 2, 40);
    doc.setLineWidth(headerLine);
    doc.line(marginLeft + 2, 42, marginLeft + 108, 42);

    doc.setFontSize(dataTextSize);
    doc.setLineWidth(boxLine);
    const paramText = "Anzahl der Sitze:" + baseData.committeeSize + "   " + "Berechnungsverfahren:" + usedCalculationMethod;
    doc.text(paramText, marginLeft + 2, 48);

    return doc;
}

function getAndSortGroupsFromBaseData(baseData: BaseData): [PartyEntry[], PartyEntry[]] {
    const groups = baseData.groups;
    const sortedGroups = groups.sort((a, b) => {
        const aSeatsOrVotes = a.seatsOrVotes || 0;
        const bSeatsOrVotes = b.seatsOrVotes || 0;
        return aSeatsOrVotes - bSeatsOrVotes;
    });

    const partysLeft = [];
    const partysRight = [];

    const totalGroups = sortedGroups.length;
    const midIndex = Math.ceil(totalGroups / 2);

    for (let i = 0; i < totalGroups; i++) {
        const group = sortedGroups[i];
        const entry = {
            nr: i + 1,
            name: group.name,
            votes: group.seatsOrVotes || 0,
        };

        if (i < midIndex) {
            partysLeft.push(entry);
        } else {
            partysRight.push(entry);
        }
    }
    return [partysLeft, partysRight];
}

function generateLeftAndRightPartyBox(doc: jsPDF, partysLeft: PartyEntry[], partysRight: PartyEntry[], partysBoxHeight: number): jsPDF {
    doc.setFontSize(12);
    doc.text('Parteien', marginLeft, 65, {align: 'left'});

    const leftBoxX = marginLeft;
    doc.setLineWidth(0.5);
    doc.rect(leftBoxX, 70, 90, partysBoxHeight);

    generatePartyBoxText(doc, partysLeft, leftBoxX);

    const rightBoxX = marginLeft + 100;
    doc.setLineWidth(0.5);
    doc.rect(rightBoxX, 70, 90, partysBoxHeight);

    generatePartyBoxText(doc, partysRight, rightBoxX);

    return doc;
}

function generatePartyBoxText(doc: jsPDF, partys: PartyEntry[], x: number): void {
    doc.setFontSize(headerSize);
    doc.text('Nr.', x + 2, 75);
    doc.text('Name', x + 10, 75);
    doc.text('Stimmen/Sitze', x + 60, 75);
    doc.setLineWidth(0.1);
    doc.line(x + 2, 77, x + 88, 77);

    let currentY = 85;
    doc.setFontSize(dataTextSize);
    partys.forEach(p => {
        doc.text(String(p.nr), x + 2, currentY);
        doc.text(p.name, x + 10, currentY);
        doc.text(String(p.votes), x + 60, currentY);
        currentY += lineHeight;
    });
}

function generateSeatDistribution(doc: jsPDF, calculationResult: CalculationResult, partysBoxHeight: number): jsPDF {
    const seatDistribution = calculationResult.map(row => ({
        name: row.groupName,
        seats: row.amountSeats
    })).sort((a, b) => b.seats - a.seats);

    doc.setLineWidth(boxLine);
    const seatBoxX = marginLeft;
    const seatBoxY = 70 + partysBoxHeight + parameterBoxHeight;
    const seatBoxWidth = 190;
    const seatBoxHeight = seatDistribution.length * (lineHeight + 5) + parameterBoxHeight;

    doc.rect(seatBoxX, seatBoxY, seatBoxWidth, seatBoxHeight);
    doc.setFontSize(headerSize);
    doc.text('Sitzverteilung', seatBoxX + 2, seatBoxY + 8);
    doc.setLineWidth(headerLine);
    doc.line(seatBoxX + 2, seatBoxY + 10, seatBoxX + 188, seatBoxY + 10);

    const seatBoxStartY = seatBoxY + 18;
    const seatBoxHeightPerItem = lineHeight + 5;
    const pageHeight = doc.internal.pageSize.height;
    const bottomMargin = 25;
    const maxY = pageHeight - bottomMargin;

    currentY = seatBoxStartY;

    seatDistribution.forEach((item) => {
        // Prüfen ob Balken + Text auf der aktuellen Seite noch reinpassen
        if (currentY + seatBoxHeightPerItem > maxY) {
            doc.addPage();
            currentY = 20; // oberer Rand nach Seitenumbruch

            // Header für Sitzverteilung auf neuer Seite neu zeichnen falls die fehlen
            doc.setFontSize(headerSize);
            doc.text('Sitzverteilung (Fortsetzung)', marginLeft + 2, currentY - 10);
        }

        // Text und Balken zeichnen
        doc.setFontSize(dataTextSize);
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

    return doc;
}

function generateQuotientBox(doc: jsPDF, quotients: string[]): jsPDF {
    // quotient
    const seatCalculationX = marginLeft;
    let seatCalculationY = currentY + 15; // Startposition nach Sitzverteilung
    const seatCalculationWidth = 190;

// Dynamische Höhe basierend auf der Anzahl der Quotienten
    const seatCalculationHeight = quotients.length * lineHeight + boxPadding * 2 + 10; // +10 für Header

// Prüfen ob genug Platz auf der aktuellen Seite ist
    const pageHeight = doc.internal.pageSize.height;
    if (seatCalculationY + seatCalculationHeight > pageHeight - 15) {
        doc.addPage();
        seatCalculationY = 20; // Neuer Start auf neuer Seite
    }

    doc.setDrawColor(0);
    doc.setLineWidth(boxLine);
    doc.rect(seatCalculationX, seatCalculationY, seatCalculationWidth, seatCalculationHeight);
    doc.setFontSize(headerSize);
    doc.text('Sitzreihung (Quotient)', seatCalculationX + 2, seatCalculationY + 8);
    doc.setLineWidth(headerLine);
    doc.line(seatCalculationX + 2, seatCalculationY + 10, seatCalculationX + 188, seatCalculationY + 10);

    let currentYQuotient = seatCalculationY + 16; // Start nach Header
    doc.setFontSize(dataTextSize);
    quotients.forEach(line => {
        doc.text(line, seatCalculationX + 2, currentYQuotient);
        currentYQuotient += lineHeight;
    });

    return doc;
}