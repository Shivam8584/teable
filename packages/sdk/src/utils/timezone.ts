import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

// Matches date-fns-tz's own `tzPattern`: identifies an explicit zone/offset suffix in a date string
// (e.g. "Z", "+05:30", "-0800").
const TZ_SUFFIX_PATTERN = /(?:Z|[+-]\d{2}(?::?\d{2})?)$/;

/**
 * Drop-in dayjs-based replacement for date-fns-tz's `fromZonedTime`, covering the call shapes used in
 * this codebase: a `Date` object, or a wall-clock date string with no embedded zone/offset (e.g.
 * "2026-07-27 00:00:00").
 *
 * Interprets `date` as wall-clock time IN `timeZone` and returns the equivalent UTC instant as a real
 * `Date` object.
 *
 * - String input (no zone/offset suffix): the digits are read as the wall-clock time in `timeZone`.
 * - `Date` object input: its OWN local-getter fields (year/month/date/hours/minutes/seconds/ms, read
 *   via the runtime's local time zone — exactly like calling `date.getHours()`) are reinterpreted as
 *   the wall-clock time in `timeZone`. This matches date-fns-tz's `fromZonedTime` behavior for `Date`
 *   inputs.
 *
 * Note: this intentionally does not replicate date-fns-tz's quirky handling of strings that already
 * carry an explicit zone/offset suffix (e.g. a full ISO "...Z" string) — none of the call sites in
 * this codebase pass such strings to `fromZonedTime`, and that path in date-fns-tz depends on the
 * executing machine's own local time zone, which is not a sane contract to reproduce.
 */
export const fromZonedTime = (date: Date | string, timeZone: string): Date => {
  if (typeof date === 'string') {
    return dayjs.tz(date, timeZone).toDate();
  }
  // Read the Date's own local wall-clock fields (as `date.getHours()` etc. would), then reinterpret
  // those digits as wall-clock time in `timeZone`.
  const localWallClock = dayjs(date).format('YYYY-MM-DD HH:mm:ss.SSS');
  return dayjs.tz(localWallClock, timeZone).toDate();
};

/**
 * Drop-in dayjs-based replacement for date-fns-tz's `toZonedTime`.
 *
 * Takes a real UTC instant (`Date`, ISO string, or timestamp) and returns a plain `Date` object whose
 * OWN local-getter fields (`getFullYear`/`getMonth`/`getDate`/`getHours`/`getMinutes`/`getSeconds`/
 * `getMilliseconds`, read via the runtime's local time zone) reflect the wall-clock time in
 * `timeZone`. This mirrors a date-fns-tz quirk relied on by UI code in this codebase (react-day-picker's
 * `Calendar`, FullCalendar event fields, etc.) that reads the returned `Date` directly with local
 * getters rather than re-applying `.tz()`/`.format()`.
 */
export const toZonedTime = (date: Date | string | number, timeZone: string): Date => {
  const zoned = dayjs(date).tz(timeZone);
  return new Date(
    zoned.year(),
    zoned.month(),
    zoned.date(),
    zoned.hour(),
    zoned.minute(),
    zoned.second(),
    zoned.millisecond()
  );
};

/**
 * Drop-in dayjs-based replacement for date-fns-tz's `formatInTimeZone`.
 *
 * IMPORTANT: `formatStr` must use dayjs format tokens (`YYYY`, `MM`, `DD`, `HH`, `mm`, `ss`, ...), NOT
 * date-fns tokens (`yyyy`, `MM`, `dd`, `HH`, `mm`, `ss`, ...) — the two libraries use different token
 * vocabularies for otherwise similarly-named concepts (e.g. dayjs day-of-month is `DD`, date-fns is
 * `dd`; dayjs 4-digit year is `YYYY`, date-fns is `yyyy`).
 */
export const formatInTimeZone = (
  date: Date | string | number,
  timeZone: string,
  formatStr: string
): string => dayjs(date).tz(timeZone).format(formatStr);

/**
 * Narrow dayjs-based replacement for date-fns-tz's `toDate(dateString, { timeZone })`, covering only
 * the shapes used in this codebase: a `Date`, or a date string with an optional `timeZone` option.
 *
 * Matches date-fns-tz's precedence rule: if the string carries its own explicit zone/offset suffix
 * (e.g. a full ISO "...Z" string), that wins over the `timeZone` option and the string is parsed as an
 * absolute instant, exactly as `new Date(dateString)` would.
 */
export const toDate = (date: Date | string, options?: { timeZone?: string }): Date => {
  if (date instanceof Date) {
    return new Date(date.getTime());
  }
  if (TZ_SUFFIX_PATTERN.test(date) || !options?.timeZone) {
    return new Date(date);
  }
  return dayjs.tz(date, options.timeZone).toDate();
};
