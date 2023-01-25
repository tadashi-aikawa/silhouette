import { describe, expect, test } from "@jest/globals";
import { Repetition } from "./Repetition";

const p = (nDay: number) => ({ type: "period", period: nDay });
const s = (days: number[]) => ({ type: "specific", values: days });
const all = [0, 1, 2, 3, 4, 5, 6];

describe("from", () => {
  describe.each<{
    value: string;
    day: Repetition["day"];
    dayOfWeek: Repetition["dayOfWeek"];
    dayOfWeekHoliday: Repetition["dayOfWeekHoliday"];
    week: Repetition["week"];
    month: Repetition["month"];
    endOfMonth: boolean;
  }>`
    value                         | day            | dayOfWeek          | dayOfWeekHoliday   | week    | month   | endOfMonth
    ${"every day"}                | ${p(1)}        | ${all}             | ${all}             | ${p(1)} | ${p(1)} | ${false}
    ${"weekday"}                  | ${p(1)}        | ${[1, 2, 3, 4, 5]} | ${[1, 2, 3, 4, 5]} | ${p(1)} | ${p(1)} | ${false}
    ${"weekend"}                  | ${p(1)}        | ${[0, 6]}          | ${[0, 6]}          | ${p(1)} | ${p(1)} | ${false}
    ${"workday"}                  | ${p(1)}        | ${[1, 2, 3, 4, 5]} | ${[]}              | ${p(1)} | ${p(1)} | ${false}
    ${"non workday"}              | ${p(1)}        | ${[0, 6]}          | ${all}             | ${p(1)} | ${p(1)} | ${false}
    ${"sun"}                      | ${p(1)}        | ${[0]}             | ${[0]}             | ${p(1)} | ${p(1)} | ${false}
    ${"sun/mon"}                  | ${p(1)}        | ${[0, 1]}          | ${[0, 1]}          | ${p(1)} | ${p(1)} | ${false}
    ${"tue/wed/thu/fri/sat"}      | ${p(1)}        | ${[2, 3, 4, 5, 6]} | ${[2, 3, 4, 5, 6]} | ${p(1)} | ${p(1)} | ${false}
    ${"sun!"}                     | ${p(1)}        | ${[0]}             | ${[]}              | ${p(1)} | ${p(1)} | ${false}
    ${"sun!/mon!"}                | ${p(1)}        | ${[0, 1]}          | ${[]}              | ${p(1)} | ${p(1)} | ${false}
    ${"tue!/wed!/thu!/fri!/sat!"} | ${p(1)}        | ${[2, 3, 4, 5, 6]} | ${[]}              | ${p(1)} | ${p(1)} | ${false}
    ${"sun!/mon"}                 | ${p(1)}        | ${[0, 1]}          | ${[1]}             | ${p(1)} | ${p(1)} | ${false}
    ${"10d"}                      | ${s([10])}     | ${all}             | ${all}             | ${p(1)} | ${p(1)} | ${false}
    ${"10d/20d"}                  | ${s([10, 20])} | ${all}             | ${all}             | ${p(1)} | ${p(1)} | ${false}
    ${"every 3 day"}              | ${p(3)}        | ${all}             | ${all}             | ${p(1)} | ${p(1)} | ${false}
    ${"end of month"}             | ${p(1)}        | ${all}             | ${all}             | ${p(1)} | ${p(1)} | ${true}
    ${"workday end of month"}     | ${p(1)}        | ${[1, 2, 3, 4, 5]} | ${[]}              | ${p(1)} | ${p(1)} | ${true}
  `(
    "Repetition.from",
    ({ value, day, dayOfWeek, dayOfWeekHoliday, week, month, endOfMonth }) => {
      test(`Repetition.from(${value}) = day=${day}, dayOfWeek=${dayOfWeek}, dayOfWeekHoliday=${dayOfWeekHoliday} week=${week}, month=${month}, endOfMonth=${endOfMonth}`, () => {
        const actual = Repetition.from(value);
        expect(actual?.day).toStrictEqual(day);
        expect(actual?.dayOfWeek).toStrictEqual(dayOfWeek);
        expect(actual?.dayOfWeekHoliday).toStrictEqual(dayOfWeekHoliday);
        expect(actual?.week).toStrictEqual(week);
        expect(actual?.month).toStrictEqual(month);
        expect(actual?.endOfMonth).toStrictEqual(endOfMonth);
      });
    }
  );
});
