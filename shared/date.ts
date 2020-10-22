/**
 * Parses duration in this format: `HH:MM:SS.cs`- C
 *
 * For example: `01:33:20.85` results in: _1 hours, 33 minutes, 20 seconds, 850 milliseconds_
 * @param text - Text to parse
 * @returns Duration in seconds
 */
export function parseDuration(text: string) {
  if (text.length !== 11) {
    console.warn(`Failed to parse duration, text length is not 11`);
    return 0;
  }

  const [hours, minutes, seconds, cs] = text.split(/[:\.]/).map(Number);
  return hours * 60 * 60 + minutes * 60 + seconds + cs / 100;
}

/**
 * Converts seconds to "HM:MM:SS" duration string
 *
 * @param inputSeconds - Amount of seconds to convert duration from
 * @returns Seconds converted to "HH:MM:SS" format
 */
export function secondsToDuration(inputSeconds: number | string | undefined) {
  const seconds = Number(inputSeconds || 0);
  return new Date(seconds * 1000).toISOString().substr(11, 12);
}
