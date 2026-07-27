import { CellValueType, exactFormatDate, FieldType, isNot, isNotExactly } from '@teable/core';
import type { IFieldInstance } from '../features/field/model/factory';
import { generateFilterItem } from './filter';

const createField = (partial: Partial<IFieldInstance>): IFieldInstance =>
  ({
    id: 'fld_test',
    type: FieldType.SingleSelect,
    cellValueType: CellValueType.String,
    isMultipleCellValue: false,
    ...partial,
  }) as IFieldInstance;

describe('generateFilterItem', () => {
  it('uses isNotExactly for multi-value singleSelect fields', () => {
    const field = createField({
      type: FieldType.SingleSelect,
      cellValueType: CellValueType.String,
      isMultipleCellValue: true,
    });

    const result = generateFilterItem(field, ['Supplier A']);

    expect(result.operator).toBe(isNotExactly.value);
    expect(result.value).toEqual(['Supplier A']);
  });

  it('keeps isNot for single-value singleSelect fields', () => {
    const field = createField({
      type: FieldType.SingleSelect,
      cellValueType: CellValueType.String,
      isMultipleCellValue: false,
    });

    const result = generateFilterItem(field, 'Supplier A');

    expect(result.operator).toBe(isNot.value);
    expect(result.value).toBe('Supplier A');
  });

  describe('date field time zone conversion (dayjs.tz replaces date-fns-tz fromZonedTime)', () => {
    const createDateField = (timeZone: string): IFieldInstance =>
      createField({
        id: 'fld_date',
        type: FieldType.Date,
        cellValueType: CellValueType.DateTime,
        isMultipleCellValue: false,
        options: { formatting: { timeZone } },
      } as Partial<IFieldInstance>);

    // Values below are cross-checked against date-fns-tz's `fromZonedTime` output for the
    // same (value, timeZone) pair to guarantee the dayjs migration is behavior-preserving.
    it.each([
      // Normal (non-DST-boundary) instants
      ['2024-01-15T12:00:00', 'America/New_York', '2024-01-15T17:00:00.000Z'], // EST (UTC-5)
      ['2024-07-15T12:00:00', 'America/New_York', '2024-07-15T16:00:00.000Z'], // EDT (UTC-4)
      // Spring-forward boundary (clocks jump 2024-03-10 02:00 -> 03:00 in America/New_York):
      // the instants immediately surrounding the gap are unambiguous and must match exactly.
      ['2024-03-10T01:59:00', 'America/New_York', '2024-03-10T06:59:00.000Z'], // still EST
      ['2024-03-10T03:00:00', 'America/New_York', '2024-03-10T07:00:00.000Z'], // now EDT
      ['2024-03-10', 'America/New_York', '2024-03-10T05:00:00.000Z'], // date-only, on the DST day
      // Fall-back boundary (clocks repeat 2024-11-03 01:00 -> 01:00 in America/New_York):
      // the instants immediately surrounding the repeated hour are unambiguous.
      ['2024-11-03T00:30:00', 'America/New_York', '2024-11-03T04:30:00.000Z'], // still EDT
      ['2024-11-03T02:30:00', 'America/New_York', '2024-11-03T07:30:00.000Z'], // now EST
      ['2024-11-03', 'America/New_York', '2024-11-03T04:00:00.000Z'], // date-only, on the DST day
    ])('converts %s in %s to %s', (value, timeZone, expected) => {
      const field = createDateField(timeZone);
      const result = generateFilterItem(field, value);

      expect(result.value).toEqual({
        exactDate: expected,
        mode: exactFormatDate.value,
        timeZone,
      });
    });
  });
});
