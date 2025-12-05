import type { CalculationResult } from "@/types/calculation/internal/CalculationResult.ts";
import type { CalculationSeatDistribution } from "@/types/calculation/internal/CalculationSeatDistribution.ts";
import type { CalculationSeatOrder } from "@/types/calculation/internal/CalculationSeatOrder.ts";
import type { CalculationStale } from "@/types/calculation/internal/CalculationStale.ts";
import type { ValidationData } from "@/types/calculation/internal/CalculationValidation.ts";

import { jsPDF } from "jspdf";

import { PDF_CONFIGURATIONS } from "@/constants.ts";
import { CalculationMethod } from "@/types/calculation/CalculationMethod.ts";
import { mapSeatOrder } from "@/utility/resultMapping.ts";

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

  const validationOfGroups =
    calculationResult.methods[usedCalculationMethod]?.validation;
  let isMethodValid = false;
  if (validationOfGroups) {
    isMethodValid = Object.values<ValidationData>(validationOfGroups).every(
      (entry) =>
        !entry.overRounding &&
        !entry.lostSafeSeat &&
        entry.committeeInvalid.length === 0
    );
  }
  generateParameter(
    doc,
    committeeSize,
    targetSize,
    usedCalculationMethod,
    isMethodValid
  );

  const [partysLeft, partysRight] = getAndSortGroups(calculationResult);

  const partysCount = Math.max(partysLeft.length, partysRight.length);
  const partysHeight = partysCount * PDF_CONFIGURATIONS.lineHeight + 10;
  let currentY = PDF_CONFIGURATIONS.parameterHeight + partysHeight;

  generateLeftAndRightParties(doc, partysLeft, partysRight, committeeSize);

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
  const seats = calculationResult.seats;
  if (seatOrder && seats) {
    currentY = generateSeatOrder(doc, seatOrder, seats, currentY);

    if (stale) {
      generateSeatOrderFooter(doc, currentY);
    }
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
    27,
    PDF_CONFIGURATIONS.marginRight,
    27
  );
  doc.setFontSize(PDF_CONFIGURATIONS.sizeSmallHeader);
  doc.text("Berechnungsbasis", PDF_CONFIGURATIONS.marginLeft, 24);
}

function generateParameter(
  doc: jsPDF,
  committeeSize: number | undefined,
  targetSize: number | undefined,
  usedCalculationMethod: CalculationMethod,
  isCalculationMethodValid: boolean
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
    PDF_CONFIGURATIONS.marginLeft + 102,
    43
  );
  doc.text("Zulässigkeit:", PDF_CONFIGURATIONS.marginLeft + 102, 48);
  doc.setTextColor(
    isCalculationMethodValid ? 0 : 255,
    isCalculationMethodValid ? 140 : 0,
    0
  );
  doc.text(
    isCalculationMethodValid ? "zulässig" : "unzulässig",
    PDF_CONFIGURATIONS.marginLeft + 121,
    48
  );
  doc.setTextColor(0, 0, 0);
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
  partysRight: PartyEntry[],
  committeeSize: number | undefined
): void {
  doc.setFontSize(PDF_CONFIGURATIONS.sizeSmallHeader);
  doc.text("Zusammensetzung", PDF_CONFIGURATIONS.marginLeft, 64, {
    align: "left",
  });
  doc.setLineWidth(PDF_CONFIGURATIONS.headerLine);
  doc.line(
    PDF_CONFIGURATIONS.marginLeft,
    67,
    PDF_CONFIGURATIONS.marginRight,
    67
  );

  generateParties(
    doc,
    partysLeft,
    PDF_CONFIGURATIONS.marginLeft,
    committeeSize
  );

  generateParties(
    doc,
    partysRight,
    PDF_CONFIGURATIONS.marginLeft + 100,
    committeeSize
  );
}

function generateParties(
  doc: jsPDF,
  partys: PartyEntry[],
  x: number,
  committeeSize: number | undefined
): void {
  doc.setFontSize(PDF_CONFIGURATIONS.sizeSmallHeader);
  doc.text("Name", x + 2, 75);

  const isCommitteeSizeGiven =
    typeof committeeSize === "number" && committeeSize > 0;
  doc.text(
    isCommitteeSizeGiven ? "Sitze" : "Stimmen",
    x + (isCommitteeSizeGiven ? 80 : 74),
    75
  );
  doc.setLineWidth(0.1);
  doc.line(x + 2, 77, x + 90, 77);

  let currentY = 85;
  doc.setFontSize(PDF_CONFIGURATIONS.dataTextSize);

  const partysHeightPerItem = PDF_CONFIGURATIONS.lineHeight;

  partys.forEach((p) => {
    if (
      currentY + partysHeightPerItem >
      doc.internal.pageSize.height - PDF_CONFIGURATIONS.bottomMargin
    ) {
      doc.addPage();
      currentY = 20;
      doc.setFontSize(PDF_CONFIGURATIONS.sizeSmallHeader);
      doc.text(
        "Parteien (Fortsetzung)",
        x + 2,
        currentY - PDF_CONFIGURATIONS.upperMargin
      );
    }
    doc.text(p.name, x + 2, currentY);
    doc.text(String(p.votes), x + 80, currentY);
    currentY += partysHeightPerItem;
  });
}

function generateHeaderForCalculationResults(doc: jsPDF, currentY: number) {
  doc.setLineWidth(PDF_CONFIGURATIONS.headerLine);
  doc.line(
    PDF_CONFIGURATIONS.marginLeft,
    currentY,
    PDF_CONFIGURATIONS.marginRight,
    currentY
  );
  doc.setFontSize(PDF_CONFIGURATIONS.sizeSmallHeader);
  doc.text("Berechnungsergebnis", PDF_CONFIGURATIONS.marginLeft, currentY - 3);
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
  doc.line(seatsX + 2, seatsY + 10, seatsX + 190, seatsY + 10);

  let y = seatsY + 18;
  const seatsHeightPerItem = PDF_CONFIGURATIONS.lineHeight + 2;
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
        y - PDF_CONFIGURATIONS.upperMargin
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
    doc.text(String(item.seats), PDF_CONFIGURATIONS.marginLeft + 101, y);

    const barMaxWidth = seatsWidth - 114;
    const barWidth = (item.seats / validMaxSeats) * barMaxWidth;
    doc.setFillColor(150, 150, 150);
    doc.rect(PDF_CONFIGURATIONS.marginLeft + 106, y - 4, barWidth, 5, "F");
    y += seatsHeightPerItem;
  });
  return y;
}

function generateSeatDistributionFooter(
  doc: jsPDF,
  stale: CalculationStale,
  currentY: number
): void {
  doc.setFontSize(PDF_CONFIGURATIONS.dataTextSize);
  doc.setTextColor(255, 0, 0);
  doc.text(
    "Patt zwischen: " +
      stale.groupNames +
      " bei " +
      stale.amountSeats +
      (stale.amountSeats === 1 ? " Sitz" : " Sitzen") +
      " (Quotient: " +
      stale.ratio +
      ")",
    PDF_CONFIGURATIONS.marginLeft + 2,
    currentY - 2
  );
  doc.setTextColor(0, 0, 0);
}

function generateSeatOrder(
  doc: jsPDF,
  seatOrder: CalculationSeatOrder,
  seats: CalculationSeatDistribution,
  currentY: number
): number {
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
  doc.text("Sitzreihung", seatCalculationX + 2, seatCalculationY + 8);
  doc.text("Quotient", seatCalculationX + 105, seatCalculationY + 8);
  doc.setLineWidth(PDF_CONFIGURATIONS.smallHeaderLine);
  doc.line(
    seatCalculationX + 2,
    seatCalculationY + PDF_CONFIGURATIONS.upperMargin,
    seatCalculationX + 188,
    seatCalculationY + PDF_CONFIGURATIONS.upperMargin
  );

  currentY = seatCalculationY + 16;
  doc.setFontSize(PDF_CONFIGURATIONS.dataTextSize);

  if (seatOrder.length === 0) {
    doc.text(
      "Es konnte kein Sitz eindeutig vergeben werden.",
      seatCalculationX + 2,
      seatCalculationY + 15
    );
    return 0;
  }

  const sortedSeatOrder = mapSeatOrder(seatOrder, seats, false);
  sortedSeatOrder.forEach((item) => {
    if (currentY > maxY - 10) {
      doc.addPage();
      seatCalculationY = 20;
      currentY = seatCalculationY + 16;

      doc.setFontSize(PDF_CONFIGURATIONS.sizeSmallHeader);
      doc.text(
        "Sitzreihung (Fortsetzung)",
        seatCalculationX + 2,
        seatCalculationY + 8
      );
      doc.setLineWidth(PDF_CONFIGURATIONS.smallHeaderLine);
      doc.line(
        seatCalculationX + 2,
        seatCalculationY + PDF_CONFIGURATIONS.upperMargin,
        seatCalculationX + 188,
        seatCalculationY + PDF_CONFIGURATIONS.upperMargin
      );
      doc.setFontSize(PDF_CONFIGURATIONS.dataTextSize);
    }

    const splittedSeatOrders = item.name.split(",").map((s) => s.trim());

    if (splittedSeatOrders.length === 1) {
      doc.text(
        `${item.seatNumber}. Sitz: ${item.name}`,
        seatCalculationX + 2,
        currentY
      );
      doc.text(item.ratio, seatCalculationX + 105, currentY);
      currentY += PDF_CONFIGURATIONS.lineHeight;
    } else {
      doc.text(`${item.seatNumber}. Sitz:`, seatCalculationX + 2, currentY);
      doc.text(item.ratio, seatCalculationX + 105, currentY);
      splittedSeatOrders.forEach((partyInOrder) => {
        doc.text(` - ${partyInOrder}`, seatCalculationX + 22, currentY);
        currentY += PDF_CONFIGURATIONS.lineHeight;
      });
    }
  });

  return currentY;
}

function generateSeatOrderFooter(doc: jsPDF, currentY: number): void {
  doc.setFontSize(PDF_CONFIGURATIONS.dataTextSize);
  doc.setTextColor(255, 0, 0);
  doc.text(
    "Aufgrund eines Patts bei der Sitzverteilung enthält die Sitzreihung nicht die vollständige Anzahl",
    PDF_CONFIGURATIONS.marginLeft + 2,
    currentY
  );
  doc.text(
    "an Sitzen entsprechend der eingegebenen Ausschussgröße.",
    PDF_CONFIGURATIONS.marginLeft + 2,
    currentY + 5
  );
  doc.setTextColor(0, 0, 0);
}
