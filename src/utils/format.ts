/** 1 → "1st", 2 → "2nd", 3 → "3rd", 4 → "4th", 11 → "11th" … */
export function ordinal(value: number): string {
  const lastTwo = value % 100
  if (lastTwo >= 11 && lastTwo <= 13) return `${value}th`
  const suffix = { 1: 'st', 2: 'nd', 3: 'rd' }[value % 10] ?? 'th'
  return `${value}${suffix}`
}

export function roundLabel(roundNumber: number, distance: number): string {
  return `${ordinal(roundNumber)} Lap - ${distance}m`
}
