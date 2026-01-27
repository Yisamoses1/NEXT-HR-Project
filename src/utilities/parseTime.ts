import { BadRequestException } from '@nestjs/common'

export function parseTime(time: string): [number, number, 'AM' | 'PM'] {
  const match = time.match(/(\d+):(\d+)(am|pm)/i)
  if (!match) throw new BadRequestException('Invalid time format')

  let hour = parseInt(match[1], 10)
  const minute = parseInt(match[2], 10)
  const ampm = match[3].toUpperCase() as 'AM' | 'PM'

  // Convert 12-hour to 24-hour
  if (ampm === 'PM' && hour !== 12) hour += 12
  if (ampm === 'AM' && hour === 12) hour = 0

  return [hour, minute, ampm]
  // return [parseInt(hour), parseInt(minute), ampm.toUpperCase() as 'AM' | 'PM']
}
