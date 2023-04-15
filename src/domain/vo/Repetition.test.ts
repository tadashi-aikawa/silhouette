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
    dayOffset: Repetition["dayOffset"];
    workdayOffset: Repetition["workdayOffset"];
    special: Repetition["special"];
  }>`
    value                           | day            | dayOfWeek          | dayOfWeekHoliday   | week    | month   | dayOffset | workdayOffset | special
    ${"every day"}                  | ${p(1)}        | ${all}             | ${all}             | ${p(1)} | ${p(1)} | ${0}      | ${0}          | ${undefined}
    ${"weekday"}                    | ${p(1)}        | ${[1, 2, 3, 4, 5]} | ${[1, 2, 3, 4, 5]} | ${p(1)} | ${p(1)} | ${0}      | ${0}          | ${undefined}
    ${"weekend"}                    | ${p(1)}        | ${[0, 6]}          | ${[0, 6]}          | ${p(1)} | ${p(1)} | ${0}      | ${0}          | ${undefined}
    ${"workday"}                    | ${p(1)}        | ${[1, 2, 3, 4, 5]} | ${[]}              | ${p(1)} | ${p(1)} | ${0}      | ${0}          | ${undefined}
    ${"non workday"}                | ${p(1)}        | ${[0, 6]}          | ${all}             | ${p(1)} | ${p(1)} | ${0}      | ${0}          | ${undefined}
    ${"sun"}                        | ${p(1)}        | ${[0]}             | ${[0]}             | ${p(1)} | ${p(1)} | ${0}      | ${0}          | ${undefined}
    ${"sun/mon"}                    | ${p(1)}        | ${[0, 1]}          | ${[0, 1]}          | ${p(1)} | ${p(1)} | ${0}      | ${0}          | ${undefined}
    ${"tue/wed/thu/fri/sat"}        | ${p(1)}        | ${[2, 3, 4, 5, 6]} | ${[2, 3, 4, 5, 6]} | ${p(1)} | ${p(1)} | ${0}      | ${0}          | ${undefined}
    ${"1sun/2mon/tue"}              | ${p(1)}        | ${[10, 21, 2]}     | ${[10, 21, 2]}     | ${p(1)} | ${p(1)} | ${0}      | ${0}          | ${undefined}
    ${"sun!"}                       | ${p(1)}        | ${[0]}             | ${[]}              | ${p(1)} | ${p(1)} | ${0}      | ${0}          | ${undefined}
    ${"sun!/mon!"}                  | ${p(1)}        | ${[0, 1]}          | ${[]}              | ${p(1)} | ${p(1)} | ${0}      | ${0}          | ${undefined}
    ${"tue!/wed!/thu!/fri!/sat!"}   | ${p(1)}        | ${[2, 3, 4, 5, 6]} | ${[]}              | ${p(1)} | ${p(1)} | ${0}      | ${0}          | ${undefined}
    ${"1sun!/2mon!/tue!"}           | ${p(1)}        | ${[10, 21, 2]}     | ${[]}              | ${p(1)} | ${p(1)} | ${0}      | ${0}          | ${undefined}
    ${"sun!/mon"}                   | ${p(1)}        | ${[0, 1]}          | ${[1]}             | ${p(1)} | ${p(1)} | ${0}      | ${0}          | ${undefined}
    ${"sun!/mon/2tue/5wed!"}        | ${p(1)}        | ${[0, 1, 22, 53]}  | ${[1, 22]}         | ${p(1)} | ${p(1)} | ${0}      | ${0}          | ${undefined}
    ${"10d"}                        | ${s([10])}     | ${all}             | ${all}             | ${p(1)} | ${p(1)} | ${0}      | ${0}          | ${undefined}
    ${"10d/20d"}                    | ${s([10, 20])} | ${all}             | ${all}             | ${p(1)} | ${p(1)} | ${0}      | ${0}          | ${undefined}
    ${"every 3 day"}                | ${p(3)}        | ${all}             | ${all}             | ${p(1)} | ${p(1)} | ${0}      | ${0}          | ${undefined}
    ${"weekday<1"}                  | ${p(1)}        | ${[1, 2, 3, 4, 5]} | ${[1, 2, 3, 4, 5]} | ${p(1)} | ${p(1)} | ${-1}     | ${0}          | ${undefined}
    ${"weekday>2"}                  | ${p(1)}        | ${[1, 2, 3, 4, 5]} | ${[1, 2, 3, 4, 5]} | ${p(1)} | ${p(1)} | ${2}      | ${0}          | ${undefined}
    ${"1sun!/2mon!/tue!<1"}         | ${p(1)}        | ${[10, 21, 2]}     | ${[]}              | ${p(1)} | ${p(1)} | ${-1}     | ${0}          | ${undefined}
    ${"weekday<1!"}                 | ${p(1)}        | ${[1, 2, 3, 4, 5]} | ${[1, 2, 3, 4, 5]} | ${p(1)} | ${p(1)} | ${0}      | ${-1}         | ${undefined}
    ${"weekday>2!"}                 | ${p(1)}        | ${[1, 2, 3, 4, 5]} | ${[1, 2, 3, 4, 5]} | ${p(1)} | ${p(1)} | ${0}      | ${2}          | ${undefined}
    ${"1sun!/2mon!/tue!<1!"}        | ${p(1)}        | ${[10, 21, 2]}     | ${[]}              | ${p(1)} | ${p(1)} | ${0}      | ${-1}         | ${undefined}
    ${"end of month"}               | ${p(1)}        | ${all}             | ${all}             | ${p(1)} | ${p(1)} | ${0}      | ${0}          | ${"end of month"}
    ${"workday end of month"}       | ${p(1)}        | ${[1, 2, 3, 4, 5]} | ${[]}              | ${p(1)} | ${p(1)} | ${0}      | ${0}          | ${"end of month"}
    ${"beginning of month"}         | ${p(1)}        | ${all}             | ${all}             | ${p(1)} | ${p(1)} | ${0}      | ${0}          | ${"beginning of month"}
    ${"workday beginning of month"} | ${p(1)}        | ${[1, 2, 3, 4, 5]} | ${[]}              | ${p(1)} | ${p(1)} | ${0}      | ${0}          | ${"beginning of month"}
  `(
    "Repetition.from",
    ({
      value,
      day,
      dayOfWeek,
      dayOfWeekHoliday,
      week,
      month,
      dayOffset,
      workdayOffset,
      special,
    }) => {
      test(`Repetition.from(${value}) = day=${day}, dayOfWeek=${dayOfWeek}, dayOfWeekHoliday=${dayOfWeekHoliday} week=${week}, month=${month}, dayOffset=${dayOffset}, workdayOffset=${workdayOffset}, special=${special}`, () => {
        const actual = Repetition.from(value);
        expect(actual?.day).toStrictEqual(day);
        expect(actual?.dayOfWeek).toStrictEqual(dayOfWeek);
        expect(actual?.dayOfWeekHoliday).toStrictEqual(dayOfWeekHoliday);
        expect(actual?.week).toStrictEqual(week);
        expect(actual?.month).toStrictEqual(month);
        expect(actual?.dayOffset).toStrictEqual(dayOffset);
        expect(actual?.workdayOffset).toStrictEqual(workdayOffset);
        expect(actual?.special).toStrictEqual(special);
      });
    }
  );
});
