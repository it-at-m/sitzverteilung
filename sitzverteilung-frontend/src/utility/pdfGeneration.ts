import type { CalculationResult } from "@/types/calculation/internal/CalculationResult.ts";
import type { CalculationSeatDistribution } from "@/types/calculation/internal/CalculationSeatDistribution.ts";
import type { CalculationSeatOrder } from "@/types/calculation/internal/CalculationSeatOrder.ts";
import type { CalculationStale } from "@/types/calculation/internal/CalculationStale.ts";

import { jsPDF } from "jspdf";

import { PDF_CONFIGURATIONS } from "@/constants.ts";
import { CalculationMethod } from "@/types/calculation/CalculationMethod.ts";

interface PartyEntry {
  name: string;
  votes: number;
}

export function generatePDF(
  targetSize: number | undefined,
  committeeSize: number | undefined,
  calculationResult: CalculationResult,
  usedCalculationMethod: CalculationMethod
): void {
  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    putOnlyUsedFonts: true,
    compress: true,
  });

  const timestamp = new Date();
  generateHeader(doc, timestamp);

  generateParameter(doc, committeeSize, targetSize, usedCalculationMethod);

  const [partysLeft, partysRight] = getAndSortGroups(calculationResult);

  const partysCount = Math.max(partysLeft.length, partysRight.length);
  const partysHeight = partysCount * PDF_CONFIGURATIONS.lineHeight + 10;

  generateLeftAndRightParties(doc, partysLeft, partysRight);

  let currentY = 95 + partysHeight;

  generateHeaderForCalculationResults(doc, currentY);

  const seatDistribution =
    calculationResult.methods[usedCalculationMethod]?.distribution;
  if (seatDistribution) {
    currentY = generateSeatDistribution(doc, seatDistribution, currentY);
  }

  const stale = calculationResult.methods[usedCalculationMethod]?.stale;
  if (stale) {
    generateSeatDistributionFooter(doc, stale, currentY);
  }

  const seatOrder = calculationResult.methods[usedCalculationMethod]?.order;
  if (seatOrder) {
    generateRatios(doc, seatOrder, currentY);
  }

  const timeStampForExport = timestamp.toISOString().slice(0, 10);
  const exportFileName = `Sitzverteilung_${usedCalculationMethod}_${timeStampForExport}.pdf`;

  doc.save(exportFileName);
}

function generateHeader(doc: jsPDF, timestamp: Date): void {
  doc.setFontSize(PDF_CONFIGURATIONS.timestampSize);
  doc.text(timestamp.toLocaleDateString("de-DE"), 200, 5, {
    align: "right",
  });
  doc.setFontSize(PDF_CONFIGURATIONS.headerFontSize);
  doc.text("Sitzverteilung", 105, 10, { align: "center" });
  doc.setLineWidth(PDF_CONFIGURATIONS.headerLine);
  doc.line(
    PDF_CONFIGURATIONS.marginLeft,
    25,
    PDF_CONFIGURATIONS.marginRight,
    25
  );
  doc.setFontSize(PDF_CONFIGURATIONS.sizeSmallHeader);
  doc.text("Berechnungsbasis", PDF_CONFIGURATIONS.marginLeft, 20);
}

function generateParameter(
  doc: jsPDF,
  committeeSize: number | undefined,
  targetSize: number | undefined,
  usedCalculationMethod: CalculationMethod
): void {
  doc.setFontSize(PDF_CONFIGURATIONS.sizeSmallHeader);
  doc.text("Parameter", PDF_CONFIGURATIONS.marginLeft + 2, 35);
  doc.setLineWidth(PDF_CONFIGURATIONS.smallHeaderLine);
  doc.line(
    PDF_CONFIGURATIONS.marginLeft + 2,
    37,
    PDF_CONFIGURATIONS.marginRight,
    37
  );

  doc.setFontSize(PDF_CONFIGURATIONS.dataTextSize);
  doc.setLineWidth(PDF_CONFIGURATIONS.headerLine);

  const paramText =
    "Größe des Hauptorgans: " +
    (committeeSize ? committeeSize : "Keine Angabe");
  doc.text(paramText, PDF_CONFIGURATIONS.marginLeft + 2, 43);
  doc.text(
    "Ausschussgröße: " + targetSize,
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

  // @ts-expect-error newer API is not picked up by TS compiler, but available in browser
  const sortedGroups = groups.toSorted((a, b) => {
    const aSeatsOrVotes = a.seatsOrVotes ?? 0;
    const bSeatsOrVotes = b.seatsOrVotes ?? 0;
    return bSeatsOrVotes - aSeatsOrVotes;
  });

  const partysLeft: PartyEntry[] = [];
  const partysRight: PartyEntry[] = [];

  const totalGroups = sortedGroups.length;
  const midIndex = Math.ceil(totalGroups / 2);

  for (let i = 0; i < totalGroups; i++) {
    const group = sortedGroups[i];
    if (group) {
      const entry: PartyEntry = {
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

function generateLeftAndRightParties(
  doc: jsPDF,
  partysLeft: PartyEntry[],
  partysRight: PartyEntry[]
): void {
  doc.setFontSize(12);
  doc.text("Zusammensetzung", PDF_CONFIGURATIONS.marginLeft, 65, {
    align: "left",
  });

  generateParties(doc, partysLeft, PDF_CONFIGURATIONS.marginLeft);

  generateParties(doc, partysRight, PDF_CONFIGURATIONS.marginLeft + 100);
}

function generateParties(doc: jsPDF, partys: PartyEntry[], x: number): void {
  doc.setFontSize(PDF_CONFIGURATIONS.sizeSmallHeader);
  doc.text("Name", x + 5, 75);
  doc.text("Stimmen/Sitze", x + 60, 75);
  doc.setLineWidth(0.1);
  doc.line(x + 5, 77, x + 85, 77);

  let currentY = 85;
  doc.setFontSize(PDF_CONFIGURATIONS.dataTextSize);

  const seatsHeightPerItem = PDF_CONFIGURATIONS.lineHeight;

  partys.forEach((p) => {
    if (currentY + seatsHeightPerItem > doc.internal.pageSize.height - 25) {
      doc.addPage();
      currentY = 20;
      doc.setFontSize(PDF_CONFIGURATIONS.sizeSmallHeader);
      doc.text("Parteien (Fortsetzung)", x + 2, currentY - 10);
    }
    doc.text(p.name, x + 5, currentY);
    doc.text(String(p.votes), x + 60, currentY);
    currentY += seatsHeightPerItem;
  });
}

function generateHeaderForCalculationResults(doc: jsPDF, currentY: number) {
  doc.setLineWidth(PDF_CONFIGURATIONS.headerLine);
  doc.line(
    PDF_CONFIGURATIONS.marginLeft,
    currentY - 5,
    PDF_CONFIGURATIONS.marginRight,
    currentY - 5
  );
  doc.setFontSize(PDF_CONFIGURATIONS.sizeSmallHeader);
  doc.text("Berechnungsergebnis", PDF_CONFIGURATIONS.marginLeft, currentY - 10);
}

function generateSeatDistribution(
  doc: jsPDF,
  seatDistributionFromCalculation: CalculationSeatDistribution,
  currentY: number
): number {
  const seatDistribution = Object.entries(seatDistributionFromCalculation)
    .map(([groupName, seats]) => ({ name: groupName, seats }))
    .sort((a, b) => b.seats - a.seats);

  const seatsX = PDF_CONFIGURATIONS.marginLeft;
  const seatsY = currentY;
  const seatsWidth = 190;

  const pageHeight = doc.internal.pageSize.height;
  const bottomMargin = 25;
  const maxY = pageHeight - bottomMargin;

  doc.setFontSize(PDF_CONFIGURATIONS.sizeSmallHeader);
  doc.text("Sitzverteilung", seatsX + 2, seatsY + 8);
  doc.setLineWidth(PDF_CONFIGURATIONS.smallHeaderLine);
  doc.line(seatsX + 2, seatsY + 10, seatsX + 188, seatsY + 10);

  let y = seatsY + 18;
  const seatsHeightPerItem = PDF_CONFIGURATIONS.lineHeight + 3;
  const maxSeats = Math.max(...seatDistribution.map((s) => s.seats));
  const validMaxSeats = maxSeats > 0 ? maxSeats : 1;

  seatDistribution.forEach((item) => {
    if (y + seatsHeightPerItem > maxY) {
      doc.addPage();
      y = 20;
      doc.setFontSize(PDF_CONFIGURATIONS.sizeSmallHeader);
      doc.text(
        "Sitzverteilung (Fortsetzung)",
        PDF_CONFIGURATIONS.marginLeft + 2,
        y - 10
      );
      doc.setLineWidth(PDF_CONFIGURATIONS.smallHeaderLine);
      doc.line(
        PDF_CONFIGURATIONS.marginLeft + 2,
        y - 8,
        PDF_CONFIGURATIONS.marginRight,
        y - 8
      );
    }

    doc.setFontSize(PDF_CONFIGURATIONS.dataTextSize);
    doc.text(item.name, PDF_CONFIGURATIONS.marginLeft + 2, y);
    doc.text(String(item.seats), PDF_CONFIGURATIONS.marginLeft + 105, y);

    const barMaxWidth = seatsWidth - 115;
    const barWidth = (item.seats / validMaxSeats) * barMaxWidth;
    doc.setFillColor(150, 150, 150);
    doc.rect(PDF_CONFIGURATIONS.marginLeft + 110, y - 4, barWidth, 5, "F");
    y += seatsHeightPerItem;
  });
  return y;
}

function generateSeatDistributionFooter(
  doc: jsPDF,
  stale: CalculationStale,
  currentY: number
): void {
  doc.setFontSize(PDF_CONFIGURATIONS.footerTextSize);
  doc.setTextColor(255, 0, 0);
  doc.text(
    "Patt zwischen: " +
      stale.groupNames +
      " bei " +
      stale.amountSeats +
      " Sitzen",
    PDF_CONFIGURATIONS.marginLeft + 2,
    currentY - 2
  );
  doc.setTextColor(0, 0, 0);
}

function generateRatios(
  doc: jsPDF,
  seatOrder: CalculationSeatOrder,
  currentY: number
): void {
  const seatCalculationX = PDF_CONFIGURATIONS.marginLeft;
  let seatCalculationY = currentY + 15;
  const seatCalculationHeight =
    seatOrder.length * PDF_CONFIGURATIONS.lineHeight + 10;

  const pageHeight = doc.internal.pageSize.height;
  const bottomMargin = 25;
  const maxY = pageHeight - bottomMargin;

  if (seatCalculationY + seatCalculationHeight > maxY) {
    doc.addPage();
    seatCalculationY = 20;
  }

  doc.setFontSize(PDF_CONFIGURATIONS.sizeSmallHeader);
  doc.text(
    "Sitzreihung (Quotient)",
    seatCalculationX + 2,
    seatCalculationY + 8
  );
  doc.setLineWidth(PDF_CONFIGURATIONS.smallHeaderLine);
  doc.line(
    seatCalculationX + 2,
    seatCalculationY + 10,
    seatCalculationX + 188,
    seatCalculationY + 10
  );

  let y = seatCalculationY + 16;
  doc.setFontSize(PDF_CONFIGURATIONS.dataTextSize);

  if (seatOrder.length === 0) {
    doc.text(
      "Es konnte kein Sitz eindeutig vergeben werden.",
      seatCalculationX + 2,
      seatCalculationY + 15
    );
    return;
  }

  seatOrder.forEach((item, index) => {
    if (y > maxY - 10) {
      doc.addPage();
      seatCalculationY = 20;
      y = seatCalculationY + 16;

      doc.setFontSize(PDF_CONFIGURATIONS.sizeSmallHeader);
      doc.text(
        "Sitzreihung (Fortsetzung)",
        seatCalculationX + 2,
        seatCalculationY + 8
      );
      doc.setLineWidth(PDF_CONFIGURATIONS.smallHeaderLine);
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
