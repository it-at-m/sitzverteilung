export enum CalculationMethod {
  D_HONDT = "D'Hondt",
  HARE_NIEMEYER = "Hare/Niemeyer",
  SAINTE_LAGUE_SCHEPERS = "Sainte-Laguë/Schepers",
}

export const AVAILABLE_METHODS = [
  CalculationMethod.D_HONDT,
  CalculationMethod.HARE_NIEMEYER,
  CalculationMethod.SAINTE_LAGUE_SCHEPERS,
];
