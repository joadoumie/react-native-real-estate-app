export function getOrdinalSuffix(rank: number) {
  const suffixes = ["th", "st", "nd", "rd"];
  const value = rank % 100;
  return suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0];
}
