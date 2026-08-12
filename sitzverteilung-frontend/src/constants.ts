export const SNACKBAR_DEFAULT_TIMEOUT = 5000;

export const enum STATUS_INDICATORS {
  SUCCESS = "success",
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
}

export const PDF_CONFIGURATIONS = {
  marginLeft: 10,
  marginRight: 200,
  bottomMargin: 25,
  upperMargin: 10,
  parameterHeight: 95,
  dHondtMargin: 0,
  hareNiemayerMargin: 40,
  sainteLagueSchepersMargin: 80,

  lineHeight: 7,
  smallHeaderLine: 0.1,
  headerLine: 0.5,

  sizeSmallHeader: 11,
  headerFontSize: 16,
  dataTextSize: 9,
  timestampSize: 8,
  methodCalculationHeaderSize: 7,
  methodCalculationSize: 6,
};

export const methodMargins: Record<string, number> = {
  "D'Hondt": 0,
  "Hare/Niemeyer": 40,
  "Sainte-Laguë/Schepers": 80,
};
