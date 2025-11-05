export enum CalculationMethod {
  D_HONDT = "D'Hondt",
  HARE_NIEMEYER = "Hare/Niemeyer",
  SAINTE_LAGUE_SCHEPERS = "Sainte-Laguë/Schepers",
}

export const CALCULATION_METHOD_SHORT_FORMS: Record<CalculationMethod, string> =
  {
    [CalculationMethod.D_HONDT]: "d/H",
    [CalculationMethod.HARE_NIEMEYER]: "H/N",
    [CalculationMethod.SAINTE_LAGUE_SCHEPERS]: "SL/S",
  };

export const AVAILABLE_METHODS = [
  CalculationMethod.D_HONDT,
  CalculationMethod.HARE_NIEMEYER,
  CalculationMethod.SAINTE_LAGUE_SCHEPERS,
];
