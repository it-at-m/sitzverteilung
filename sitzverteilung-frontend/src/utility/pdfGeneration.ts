import type { CalculationResult } from "@/types/calculation/internal/CalculationResult.ts";

import { jsPDF } from "jspdf";

import { PDF_CONFIGURATIONS } from "@/constants.ts";
import { CalculationMethod } from "@/types/calculation/CalculationMethod.ts";

interface PartyEntry {
  nr: number;
  name: string;
  votes: number;
}

export function generatePDF(
  targetSize: number | undefined,
  committeeSize: number | undefined,
  calculationResult: CalculationResult,
  usedCalculationMethod: CalculationMethod
): void {
  try {
    const doc = new jsPDF({
      unit: "mm",
      format: "a4",
      putOnlyUsedFonts: true,
      compress: true,
    });

    const timestamp = new Date();
    generateHeader(doc, timestamp);

    // Parameter Box
    doc.setFontSize(PDF_CONFIGURATIONS.sizeForBoxHeader);
    doc.text("Berechnung", PDF_CONFIGURATIONS.marginLeft, 20);
    generateParameterBox(doc, committeeSize, targetSize, usedCalculationMethod);

    const [partysLeft, partysRight] = getAndSortGroups(calculationResult);

    // Calculate Party Box Height
    const partysCount = Math.max(partysLeft.length, partysRight.length);
    const partysBoxHeight =
      partysCount * PDF_CONFIGURATIONS.lineHeight +
      PDF_CONFIGURATIONS.boxPadding * 2 +
      10;

    generateLeftAndRightPartyBox(doc, partysLeft, partysRight, partysBoxHeight);

    let currentY = 70 + partysBoxHeight + PDF_CONFIGURATIONS.parameterBoxHeight;

    currentY = generateSeatDistribution(doc, calculationResult, currentY);

    generateQuotientBox(
      doc,
      calculationResult,
      usedCalculationMethod,
      currentY
    );

    doc.save(
      `Sitzverteilung_${usedCalculationMethod}_${timestamp.toISOString().slice(0, 10)}.pdf`
    );
  } catch (error) {
    throw new Error("Failed to generate PDF. Error:" + error);
  }
}

function generateHeader(doc: jsPDF, timestamp: Date): void {
  doc.setFontSize(PDF_CONFIGURATIONS.timestampSize);
  doc.text(timestamp.toLocaleDateString("de-DE"), 200, 5, {
    align: "right",
  });
  doc.setFontSize(PDF_CONFIGURATIONS.headerFontSize);
  doc.text("Sitzverteilung", 105, 10, { align: "center" });
  doc.setLineWidth(PDF_CONFIGURATIONS.boxLine);
  doc.line(
    PDF_CONFIGURATIONS.marginLeft,
    25,
    PDF_CONFIGURATIONS.marginRight,
    25
  );
}

function generateParameterBox(
  doc: jsPDF,
  committeeSize: number | undefined,
  targetSize: number | undefined,
  usedCalculationMethod: CalculationMethod
): void {
  doc.setDrawColor(0);
  doc.setLineWidth(PDF_CONFIGURATIONS.boxLine);
  doc.rect(
    PDF_CONFIGURATIONS.marginLeft,
    30,
    140,
    PDF_CONFIGURATIONS.parameterBoxHeight
  );
  doc.setFontSize(PDF_CONFIGURATIONS.sizeForBoxHeader);
  doc.text("Parameter", PDF_CONFIGURATIONS.marginLeft + 2, 35);
  doc.setLineWidth(PDF_CONFIGURATIONS.headerLine);
  doc.line(
    PDF_CONFIGURATIONS.marginLeft + 2,
    37,
    PDF_CONFIGURATIONS.marginLeft + 138,
    37
  );

  doc.setFontSize(PDF_CONFIGURATIONS.dataTextSize);
  doc.setLineWidth(PDF_CONFIGURATIONS.boxLine);

  const paramText =
    "Anzahl der Sitze: " +
    (committeeSize !== undefined ? committeeSize : "Kein Hauptorgan angegeben");
  doc.text(paramText, PDF_CONFIGURATIONS.marginLeft + 2, 43);
  doc.text(
    "Ausschussgröße: " +
      (targetSize !== undefined ? targetSize : "Keine Angabe"),
    PDF_CONFIGURATIONS.marginLeft + 2,
    48
  );
  doc.text(
    "Berechnungsverfahren: " + usedCalculationMethod,
    PDF_CONFIGURATIONS.marginLeft + 2,
    53
  );
}

function getAndSortGroups(
  calculationResult: CalculationResult
): [PartyEntry[], PartyEntry[]] {
  const groups = Object.keys(calculationResult.proportions).map((groupName) => {
    const seatsOrVotes = calculationResult.seats[groupName];

    return {
      name: groupName,
      seatsOrVotes: seatsOrVotes ?? 0,
    };
  });

  const sortedGroups = [...groups].sort((a, b) => {
    const aSeatsOrVotes = a.seatsOrVotes || 0;
    const bSeatsOrVotes = b.seatsOrVotes || 0;
    return aSeatsOrVotes - bSeatsOrVotes;
  });

  const partysLeft: PartyEntry[] = [];
  const partysRight: PartyEntry[] = [];

  const totalGroups = sortedGroups.length;
  const midIndex = Math.ceil(totalGroups / 2);

  for (let i = 0; i < totalGroups; i++) {
    const group = sortedGroups[i];
    if (group) {
      const entry: PartyEntry = {
        nr: i + 1,
        name: group.name,
        votes: group.seatsOrVotes,
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
): void {
  doc.setFontSize(12);
  doc.text("Parteien", PDF_CONFIGURATIONS.marginLeft, 65, { align: "left" });

  const leftBoxX = PDF_CONFIGURATIONS.marginLeft;
  doc.setLineWidth(0.5);
  doc.rect(leftBoxX, 70, 90, partysBoxHeight);

  generatePartyBoxText(doc, partysLeft, leftBoxX);

  const rightBoxX = PDF_CONFIGURATIONS.marginLeft + 100;
  doc.setLineWidth(0.5);
  doc.rect(rightBoxX, 70, 90, partysBoxHeight);

  generatePartyBoxText(doc, partysRight, rightBoxX);
}

function generatePartyBoxText(
  doc: jsPDF,
  partys: PartyEntry[],
  x: number
): void {
  doc.setFontSize(PDF_CONFIGURATIONS.sizeForBoxHeader);
  doc.text("Nr.", x + 2, 75);
  doc.text("Name", x + 10, 75);
  doc.text("Stimmen/Sitze", x + 60, 75);
  doc.setLineWidth(0.1);
  doc.line(x + 2, 77, x + 88, 77);

  let currentY = 85;
  doc.setFontSize(PDF_CONFIGURATIONS.dataTextSize);

  partys.forEach((p) => {
    doc.text(String(p.nr), x + 2, currentY);
    doc.text(p.name, x + 10, currentY);
    doc.text(String(p.votes), x + 60, currentY);
    currentY += PDF_CONFIGURATIONS.lineHeight;
  });
}

function generateSeatDistribution(
  doc: jsPDF,
  calculationResult: CalculationResult,
  currentY: number
): number {
  const seatDistribution = Object.entries(calculationResult.seats)
    .map(([groupName, seats]) => ({ name: groupName, seats }))
    .sort((a, b) => b.seats - a.seats);

  const seatBoxX = PDF_CONFIGURATIONS.marginLeft;
  const seatBoxY = currentY;
  const seatBoxWidth = 190;

  const pageHeight = doc.internal.pageSize.height;
  const bottomMargin = 25;
  const maxY = pageHeight - bottomMargin;

  const seatBoxHeight = Math.min(
    seatDistribution.length * (PDF_CONFIGURATIONS.lineHeight + 3),
    maxY - (seatBoxY + 20)
  );

  doc.setLineWidth(PDF_CONFIGURATIONS.boxLine);
  doc.rect(seatBoxX, seatBoxY, seatBoxWidth, seatBoxHeight + 10);
  doc.setFontSize(PDF_CONFIGURATIONS.sizeForBoxHeader);
  doc.text("Sitzverteilung", seatBoxX + 2, seatBoxY + 8);
  doc.setLineWidth(PDF_CONFIGURATIONS.headerLine);
  doc.line(seatBoxX + 2, seatBoxY + 10, seatBoxX + 188, seatBoxY + 10);

  let y = seatBoxY + 18;
  const seatBoxHeightPerItem = PDF_CONFIGURATIONS.lineHeight + 3;
  const maxSeats = Math.max(...seatDistribution.map((s) => s.seats));
  const validMaxSeats = maxSeats > 0 ? maxSeats : 1;

  seatDistribution.forEach((item) => {
    if (y + seatBoxHeightPerItem > maxY) {
      doc.addPage();
      y = 20;
      doc.setFontSize(PDF_CONFIGURATIONS.sizeForBoxHeader);
      doc.text(
        "Sitzverteilung (Fortsetzung)",
        PDF_CONFIGURATIONS.marginLeft + 2,
        y - 10
      );
    }

    doc.setFontSize(PDF_CONFIGURATIONS.dataTextSize);
    doc.text(item.name, PDF_CONFIGURATIONS.marginLeft + 2, y);
    doc.text(String(item.seats), PDF_CONFIGURATIONS.marginLeft + 55, y);

    const barMaxWidth = seatBoxWidth - 65;
    const barWidth = (item.seats / validMaxSeats) * barMaxWidth;
    doc.setFillColor(150, 150, 150);
    doc.rect(PDF_CONFIGURATIONS.marginLeft + 60, y - 4, barWidth, 5, "F");
    y += seatBoxHeightPerItem;
  });

  return y;
}

function generateQuotientBox(
  doc: jsPDF,
  calculationResult: CalculationResult,
  calculationMethod: CalculationMethod,
  currentY: number
): void {
  const methodResult = calculationResult.methods[calculationMethod];
  if (!methodResult) {
    doc.text(
      "Keine Berechnung für dieses Verfahren gefunden.",
      PDF_CONFIGURATIONS.marginLeft + 2,
      currentY + 15
    );
    return;
  }

  const seatCalculationX = PDF_CONFIGURATIONS.marginLeft;
  let seatCalculationY = currentY + 15;
  const seatCalculationWidth = 190;
  const seatCalculationHeight =
    methodResult.order.length * PDF_CONFIGURATIONS.lineHeight +
    PDF_CONFIGURATIONS.boxPadding * 2 +
    10;

  const pageHeight = doc.internal.pageSize.height;
  const bottomMargin = 25;
  const maxY = pageHeight - bottomMargin;

  if (seatCalculationY + seatCalculationHeight > maxY) {
    doc.addPage();
    seatCalculationY = 20;
  }

  doc.setDrawColor(0);
  doc.setLineWidth(PDF_CONFIGURATIONS.boxLine);
  doc.rect(
    seatCalculationX,
    seatCalculationY,
    seatCalculationWidth,
    seatCalculationHeight
  );

  doc.setFontSize(PDF_CONFIGURATIONS.sizeForBoxHeader);
  doc.text(
    "Sitzreihung (Quotient)",
    seatCalculationX + 2,
    seatCalculationY + 8
  );
  doc.setLineWidth(PDF_CONFIGURATIONS.headerLine);
  doc.line(
    seatCalculationX + 2,
    seatCalculationY + 10,
    seatCalculationX + 188,
    seatCalculationY + 10
  );

  let y = seatCalculationY + 16;
  doc.setFontSize(PDF_CONFIGURATIONS.dataTextSize);

  methodResult.order.forEach((item, index) => {
    if (y > maxY - 10) {
      doc.addPage();
      seatCalculationY = 20;
      y = seatCalculationY + 16;

      doc.setLineWidth(PDF_CONFIGURATIONS.boxLine);
      doc.rect(seatCalculationX, seatCalculationY, seatCalculationWidth, 12);
      doc.setFontSize(PDF_CONFIGURATIONS.sizeForBoxHeader);
      doc.text(
        "Sitzreihung (Fortsetzung)",
        seatCalculationX + 2,
        seatCalculationY + 8
      );
      doc.setLineWidth(PDF_CONFIGURATIONS.headerLine);
      doc.line(
        seatCalculationX + 2,
        seatCalculationY + 10,
        seatCalculationX + 188,
        seatCalculationY + 10
      );
      doc.setFontSize(PDF_CONFIGURATIONS.dataTextSize);
    }

    const seatNumber = index + 1;
    doc.text(
      `${seatNumber}. Sitz: ${item.groupName} (${item.value.toFixed(3)})`,
      seatCalculationX + 2,
      y
    );
    y += PDF_CONFIGURATIONS.lineHeight;
  });
}
