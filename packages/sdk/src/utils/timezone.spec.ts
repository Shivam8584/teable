import { describe, expect, it } from 'vitest';
import { fromZonedTime, toDate, toZonedTime, formatInTimeZone } from './timezone';

// Expected values below were captured directly from the real `date-fns-tz@3.2.0` implementation
// (fromZonedTime/toZonedTime/formatInTimeZone/toDate) for the same inputs, so these tests pin the
// dayjs-based replacements to bit-identical behavior for every case that matters in this codebase.

describe('fromZonedTime (wall-clock string/Date -> UTC instant)', () => {
  it('handles America/New_York spring-forward (2026-03-08, clocks jump 02:00 -> 03:00)', () => {
    // Just before the jump: still EST (-05:00)
    expect(fromZonedTime('2026-03-08 01:30:00.000', 'America/New_York').toISOString()).toBe(
      '2026-03-08T06:30:00.000Z'
    );
    // Just after the jump: now EDT (-04:00)
    expect(fromZonedTime('2026-03-08 03:30:00.000', 'America/New_York').toISOString()).toBe(
      '2026-03-08T07:30:00.000Z'
    );
  });

  it('handles America/New_York fall-back (2026-11-01, clocks fall 02:00 -> 01:00)', () => {
    // Before fall-back: still EDT (-04:00)
    expect(fromZonedTime('2026-11-01 00:30:00.000', 'America/New_York').toISOString()).toBe(
      '2026-11-01T04:30:00.000Z'
    );
    // After fall-back: now EST (-05:00)
    expect(fromZonedTime('2026-11-01 02:30:00.000', 'America/New_York').toISOString()).toBe(
      '2026-11-01T07:30:00.000Z'
    );
  });

  it('handles Asia/Kolkata (fixed UTC+5:30, no DST)', () => {
    expect(fromZonedTime('2026-07-27 12:00:00.000', 'Asia/Kolkata').toISOString()).toBe(
      '2026-07-27T06:30:00.000Z'
    );
    expect(fromZonedTime('2026-01-15 00:15:00.000', 'Asia/Kolkata').toISOString()).toBe(
      '2026-01-14T18:45:00.000Z'
    );
  });

  it('handles Pacific/Chatham (unusual +12:45 / +13:45 DST offset)', () => {
    // January = southern-hemisphere summer = Chatham DST active = +13:45
    expect(fromZonedTime('2026-01-15 12:00:00.000', 'Pacific/Chatham').toISOString()).toBe(
      '2026-01-14T22:15:00.000Z'
    );
    // July = southern-hemisphere winter = Chatham standard time = +12:45
    expect(fromZonedTime('2026-07-15 12:00:00.000', 'Pacific/Chatham').toISOString()).toBe(
      '2026-07-14T23:15:00.000Z'
    );
  });

  it('reinterprets a Date object`s own local-getter fields as wall-clock time in timeZone', () => {
    // Construct a Date via local setters, mirroring how call sites build the input (e.g. date-fns `set()`).
    const local = new Date(2026, 6, 27, 15, 45, 30, 0); // 2026-07-27 15:45:30 in the *runtime's* local zone
    const expected = fromZonedTime('2026-07-27 15:45:30.000', 'Asia/Kolkata');
    expect(fromZonedTime(local, 'Asia/Kolkata').getTime()).toBe(expected.getTime());
  });
});

describe('toZonedTime (UTC instant -> Date with local-getter fields = zoned wall clock)', () => {
  const readFields = (d: Date) =>
    [
      d.getFullYear(),
      d.getMonth() + 1,
      d.getDate(),
      d.getHours(),
      d.getMinutes(),
      d.getSeconds(),
    ].join('-');

  it('handles America/New_York spring-forward boundary', () => {
    expect(readFields(toZonedTime('2026-03-08T06:30:00.000Z', 'America/New_York'))).toBe(
      '2026-3-8-1-30-0'
    );
    expect(readFields(toZonedTime('2026-03-08T07:30:00.000Z', 'America/New_York'))).toBe(
      '2026-3-8-3-30-0'
    );
  });

  it('handles America/New_York fall-back boundary', () => {
    expect(readFields(toZonedTime('2026-11-01T04:30:00.000Z', 'America/New_York'))).toBe(
      '2026-11-1-0-30-0'
    );
    expect(readFields(toZonedTime('2026-11-01T07:30:00.000Z', 'America/New_York'))).toBe(
      '2026-11-1-2-30-0'
    );
  });

  it('handles Asia/Kolkata half-hour offset', () => {
    expect(readFields(toZonedTime('2026-07-27T06:30:00.000Z', 'Asia/Kolkata'))).toBe(
      '2026-7-27-12-0-0'
    );
  });

  it('handles Pacific/Chatham +12:45 / +13:45 offsets', () => {
    expect(readFields(toZonedTime('2026-01-15T00:00:00.000Z', 'Pacific/Chatham'))).toBe(
      '2026-1-15-13-45-0'
    );
    expect(readFields(toZonedTime('2026-07-15T00:00:00.000Z', 'Pacific/Chatham'))).toBe(
      '2026-7-15-12-45-0'
    );
  });

  it('round-trips with fromZonedTime for a plain non-boundary instant', () => {
    const original = '2026-07-27 09:15:00.000';
    const utcDate = fromZonedTime(original, 'America/New_York');
    const zoned = toZonedTime(utcDate, 'America/New_York');
    expect(readFields(zoned)).toBe('2026-7-27-9-15-0');
  });
});

describe('formatInTimeZone', () => {
  it('formats using dayjs tokens across the America/New_York DST boundary', () => {
    expect(
      formatInTimeZone('2026-03-08T06:30:00.000Z', 'America/New_York', 'YYYY-MM-DD HH:mm')
    ).toBe('2026-03-08 01:30');
    expect(
      formatInTimeZone('2026-03-08T07:30:00.000Z', 'America/New_York', 'YYYY-MM-DD HH:mm')
    ).toBe('2026-03-08 03:30');
  });

  it('formats 12-hour time with meridiem for Asia/Kolkata', () => {
    expect(formatInTimeZone('2026-07-27T18:45:00.000Z', 'Asia/Kolkata', 'YYYY-MM-DD hh:mm A')).toBe(
      '2026-07-28 12:15 AM'
    );
  });

  it('formats the unusual Pacific/Chatham offset', () => {
    expect(
      formatInTimeZone('2026-01-15T00:00:00.000Z', 'Pacific/Chatham', 'YYYY-MM-DD HH:mm')
    ).toBe('2026-01-15 13:45');
  });
});

describe('toDate', () => {
  it('clones a Date object', () => {
    const d = new Date('2026-07-27T12:34:56.000Z');
    const cloned = toDate(d);
    expect(cloned).not.toBe(d);
    expect(cloned.getTime()).toBe(d.getTime());
  });

  it('ignores the timeZone option when the string already carries an explicit zone suffix', () => {
    // Matches date-fns-tz's own precedence: an explicit offset/zone in the string wins.
    expect(toDate('2026-07-27T12:34:56.000Z', { timeZone: 'America/New_York' }).toISOString()).toBe(
      '2026-07-27T12:34:56.000Z'
    );
  });

  it('interprets a zone-less string as wall-clock time in the given timeZone', () => {
    expect(toDate('2026-07-27 12:34:56', { timeZone: 'Asia/Kolkata' }).toISOString()).toBe(
      '2026-07-27T07:04:56.000Z'
    );
  });
});
