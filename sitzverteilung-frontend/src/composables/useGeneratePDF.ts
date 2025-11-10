import type { BaseData } from "@/types/basedata/BaseData.ts";
import type { CalculationResult } from "@/types/calculation/internal/CalculationResult.ts";

import { jsPDF } from "jspdf";

import { CalculationMethod } from "@/types/calculation/CalculationMethod.ts";

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

interface PartyEntry {
  nr: number;
  name: string;
  votes: number;
}

export function useGeneratePDF(
  baseData: BaseData,
  calculationResult: CalculationResult,
  usedCalculationMethod: CalculationMethod
) {
  let doc = new jsPDF({
    unit: "mm",
    format: "a4",
  });

  // Header
  doc.setFontSize(8);
  doc.text(new Date().toLocaleDateString("de-DE"), 200, 5, { align: "right" });
  doc.setFontSize(headerFontSize);
  doc.text("Sitzverteilung", 105, 10, { align: "center" });
  doc.setLineWidth(boxLine);
  doc.line(marginLeft, parameterBoxHeight, marginRight, parameterBoxHeight);

  // Parameter Box
  doc.setFontSize(headerSize);
  doc.text("Berechnung", marginLeft, 25);
  doc = generateParameterBox(doc, baseData, usedCalculationMethod);

  // Parteien-Boxen
  const [partysLeft, partysRight] = getAndSortGroupsFromBaseData(baseData);
  const partysCount = Math.max(partysLeft.length, partysRight.length);
  const partysBoxHeight = partysCount * lineHeight + boxPadding * 2 + 10;

  doc = generateLeftAndRightPartyBox(
    doc,
    partysLeft,
    partysRight,
    partysBoxHeight
  );

  let currentY = 70 + partysBoxHeight + parameterBoxHeight;

  ({ doc, currentY } = generateSeatDistribution(
    doc,
    calculationResult,
    currentY
  ));

  ({ doc } = generateQuotientBox(
    doc,
    calculationResult,
    usedCalculationMethod,
    currentY
  ));

  // save pdf
  const timestamp = new Date().toISOString().slice(0, 10);
  doc.save(`Sitzverteilung_${usedCalculationMethod}_${timestamp}.pdf`);
}

function generateParameterBox(
  doc: jsPDF,
  baseData: BaseData,
  usedCalculationMethod: CalculationMethod
): jsPDF {
  doc.setDrawColor(0);
  doc.setLineWidth(boxLine);
  doc.rect(marginLeft, 35, 140, parameterBoxHeight);
  doc.setFontSize(headerSize);
  doc.text("Parameter", marginLeft + 2, 40);
  doc.setLineWidth(headerLine);
  doc.line(marginLeft + 2, 42, marginLeft + 138, 42);

  doc.setFontSize(dataTextSize);
  doc.setLineWidth(boxLine);

  const paramText =
    "Anzahl der Sitze: " +
    (baseData.committeeSize !== undefined
      ? baseData.committeeSize
      : "Kein Hauptorgan angegeben") +
    "   " +
    "Berechnungsverfahren: " +
    usedCalculationMethod;
  doc.text(paramText, marginLeft + 2, 48);

  return doc;
}

function getAndSortGroupsFromBaseData(
  baseData: BaseData
): [PartyEntry[], PartyEntry[]] {
  const groups = baseData.groups;
  const sortedGroups = [...groups].sort((a, b) => {
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
    if (group) {
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
  }
  return [partysLeft, partysRight];
}

function generateLeftAndRightPartyBox(
  doc: jsPDF,
  partysLeft: PartyEntry[],
  partysRight: PartyEntry[],
  partysBoxHeight: number
): jsPDF {
  doc.setFontSize(12);
  doc.text("Parteien", marginLeft, 65, { align: "left" });

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

function generatePartyBoxText(
  doc: jsPDF,
  partys: PartyEntry[],
  x: number
): void {
  doc.setFontSize(headerSize);
  doc.text("Nr.", x + 2, 75);
  doc.text("Name", x + 10, 75);
  doc.text("Stimmen/Sitze", x + 60, 75);
  doc.setLineWidth(0.1);
  doc.line(x + 2, 77, x + 88, 77);

  let currentY = 85;
  doc.setFontSize(dataTextSize);

  partys.forEach((p) => {
    doc.text(String(p.nr), x + 2, currentY);
    doc.text(p.name, x + 10, currentY);
    doc.text(String(p.votes), x + 60, currentY);
    currentY += lineHeight;
  });
}

function generateSeatDistribution(
  doc: jsPDF,
  calculationResult: CalculationResult,
  currentY: number
): { doc: jsPDF; currentY: number } {
  const seatDistribution = Object.entries(calculationResult.seats)
    .map(([groupName, seats]) => ({ name: groupName, seats }))
    .sort((a, b) => b.seats - a.seats);

  const seatBoxX = marginLeft;
  const seatBoxY = currentY;
  const seatBoxWidth = 190;

  const pageHeight = doc.internal.pageSize.height;
  const bottomMargin = 25;
  const maxY = pageHeight - bottomMargin;

  const seatBoxHeight = Math.min(
    seatDistribution.length * (lineHeight + 3),
    maxY - (seatBoxY + 20)
  );

  doc.setLineWidth(boxLine);
  doc.rect(seatBoxX, seatBoxY, seatBoxWidth, seatBoxHeight + 10);
  doc.setFontSize(headerSize);
  doc.text("Sitzverteilung", seatBoxX + 2, seatBoxY + 8);
  doc.setLineWidth(headerLine);
  doc.line(seatBoxX + 2, seatBoxY + 10, seatBoxX + 188, seatBoxY + 10);

  let y = seatBoxY + 18;
  const seatBoxHeightPerItem = lineHeight + 3;
  const maxSeats = Math.max(...seatDistribution.map((s) => s.seats));

  seatDistribution.forEach((item) => {
    if (y + seatBoxHeightPerItem > maxY) {
      doc.addPage();
      y = 20;
      doc.setFontSize(headerSize);
      doc.text("Sitzverteilung (Fortsetzung)", marginLeft + 2, y - 10);
    }

    doc.setFontSize(dataTextSize);
    doc.text(item.name, marginLeft + 2, y);
    doc.text(String(item.seats), marginLeft + 55, y);

    const barMaxWidth = seatBoxWidth - 65;
    const barWidth = (item.seats / maxSeats) * barMaxWidth;
    doc.setFillColor(150, 150, 150);
    doc.rect(marginLeft + 60, y - 4, barWidth, 5, "F");
    y += seatBoxHeightPerItem;
  });

  return { doc, currentY: y };
}

function generateQuotientBox(
  doc: jsPDF,
  calculationResult: CalculationResult,
  calculationMethod: CalculationMethod,
  currentY: number
): { doc: jsPDF } {
  const methodResult = calculationResult.methods[calculationMethod];
  if (!methodResult) {
    doc.text(
      "Keine Berechnung für dieses Verfahren gefunden.",
      marginLeft + 2,
      currentY + 15
    );
    return { doc };
  }

  const seatCalculationX = marginLeft;
  let seatCalculationY = currentY + 15;
  const seatCalculationWidth = 190;
  const seatCalculationHeight =
    methodResult.order.length * lineHeight + boxPadding * 2 + 10;

  const pageHeight = doc.internal.pageSize.height;
  if (seatCalculationY + seatCalculationHeight > pageHeight - 15) {
    doc.addPage();
    seatCalculationY = 20;
  }

  doc.setDrawColor(0);
  doc.setLineWidth(boxLine);
  doc.rect(
    seatCalculationX,
    seatCalculationY,
    seatCalculationWidth,
    seatCalculationHeight
  );
  doc.setFontSize(headerSize);
  doc.text(
    "Sitzreihung (Quotient)",
    seatCalculationX + 2,
    seatCalculationY + 8
  );
  doc.setLineWidth(headerLine);
  doc.line(
    seatCalculationX + 2,
    seatCalculationY + 10,
    seatCalculationX + 188,
    seatCalculationY + 10
  );

  let y = seatCalculationY + 16;
  doc.setFontSize(dataTextSize);

  methodResult.order.forEach((item, index) => {
    const seatNumber = index + 1;
    doc.text(
      `${seatNumber}. Sitz: ${item.groupName} (${item.value.toFixed(3)})`,
      seatCalculationX + 2,
      y
    );
    y += lineHeight;
  });

  return { doc };
}
