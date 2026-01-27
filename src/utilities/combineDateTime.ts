export function combineDateTime(
  date: string,
  hour: number,
  minute: number,
  ampm: 'AM' | 'PM',
) {
  if (ampm === 'PM' && hour !== 12) hour += 12
  if (ampm === 'AM' && hour === 12) hour = 0

  const d = new Date(date)
  d.setHours(hour, minute, 0, 0)
  return d
}
