import { describe, expect, test } from "@jest/globals";
import { DateTime } from "owlelia";
import { RepetitionTask } from "./RepetitionTask";
import { Repetition } from "../vo/Repetition";

const d = DateTime.of;
const holidays = [d("2023-01-01"), d("2023-01-04")];

// 2022/12/31(土)
// 2023/01/01(日)
// 2023/01/02(月)
// 2023/01/04(水)
// 2023/01/08(日)
describe("shouldTry", () => {
  describe.each<{
    date: DateTime;
    holidays: DateTime[];
    baseDate?: DateTime;
    repetitionWord: string;
    expected: boolean;
  }>`
    date               | holidays    | baseDate           | repetitionWord   | expected
    ${d("2022-12-31")} | ${holidays} | ${undefined}       | ${"every day"}   | ${true}
    ${d("2023-01-01")} | ${holidays} | ${undefined}       | ${"every day"}   | ${true}
    ${d("2023-01-02")} | ${holidays} | ${undefined}       | ${"every day"}   | ${true}
    ${d("2023-01-04")} | ${holidays} | ${undefined}       | ${"every day"}   | ${true}
    ${d("2022-12-31")} | ${holidays} | ${undefined}       | ${"weekday"}     | ${false}
    ${d("2023-01-01")} | ${holidays} | ${undefined}       | ${"weekday"}     | ${false}
    ${d("2023-01-02")} | ${holidays} | ${undefined}       | ${"weekday"}     | ${true}
    ${d("2023-01-04")} | ${holidays} | ${undefined}       | ${"weekday"}     | ${true}
    ${d("2022-12-31")} | ${holidays} | ${undefined}       | ${"weekend"}     | ${true}
    ${d("2023-01-01")} | ${holidays} | ${undefined}       | ${"weekend"}     | ${true}
    ${d("2023-01-02")} | ${holidays} | ${undefined}       | ${"weekend"}     | ${false}
    ${d("2023-01-04")} | ${holidays} | ${undefined}       | ${"weekend"}     | ${false}
    ${d("2022-12-31")} | ${holidays} | ${undefined}       | ${"workday"}     | ${false}
    ${d("2023-01-01")} | ${holidays} | ${undefined}       | ${"workday"}     | ${false}
    ${d("2023-01-02")} | ${holidays} | ${undefined}       | ${"workday"}     | ${true}
    ${d("2023-01-04")} | ${holidays} | ${undefined}       | ${"workday"}     | ${false}
    ${d("2022-12-31")} | ${holidays} | ${undefined}       | ${"non workday"} | ${true}
    ${d("2023-01-01")} | ${holidays} | ${undefined}       | ${"non workday"} | ${true}
    ${d("2023-01-02")} | ${holidays} | ${undefined}       | ${"non workday"} | ${false}
    ${d("2023-01-04")} | ${holidays} | ${undefined}       | ${"non workday"} | ${true}
    ${d("2023-01-01")} | ${holidays} | ${undefined}       | ${"sun"}         | ${true}
    ${d("2023-01-04")} | ${holidays} | ${undefined}       | ${"sun"}         | ${false}
    ${d("2023-01-08")} | ${holidays} | ${undefined}       | ${"sun"}         | ${true}
    ${d("2023-01-01")} | ${holidays} | ${undefined}       | ${"mon"}         | ${false}
    ${d("2023-01-02")} | ${holidays} | ${undefined}       | ${"mon"}         | ${true}
    ${d("2023-01-04")} | ${holidays} | ${undefined}       | ${"mon"}         | ${false}
    ${d("2023-01-01")} | ${holidays} | ${undefined}       | ${"wed"}         | ${false}
    ${d("2023-01-02")} | ${holidays} | ${undefined}       | ${"wed"}         | ${false}
    ${d("2023-01-04")} | ${holidays} | ${undefined}       | ${"wed"}         | ${true}
    ${d("2023-01-01")} | ${holidays} | ${undefined}       | ${"mon/tue"}     | ${false}
    ${d("2023-01-02")} | ${holidays} | ${undefined}       | ${"mon/tue"}     | ${true}
    ${d("2023-01-03")} | ${holidays} | ${undefined}       | ${"mon/tue"}     | ${true}
    ${d("2023-01-04")} | ${holidays} | ${undefined}       | ${"mon/tue"}     | ${false}
    ${d("2023-01-01")} | ${holidays} | ${undefined}       | ${"sun!"}        | ${false}
    ${d("2023-01-04")} | ${holidays} | ${undefined}       | ${"sun!"}        | ${false}
    ${d("2023-01-08")} | ${holidays} | ${undefined}       | ${"sun!"}        | ${true}
    ${d("2023-01-01")} | ${holidays} | ${undefined}       | ${"mon!"}        | ${false}
    ${d("2023-01-02")} | ${holidays} | ${undefined}       | ${"mon!"}        | ${true}
    ${d("2023-01-04")} | ${holidays} | ${undefined}       | ${"mon!"}        | ${false}
    ${d("2023-01-01")} | ${holidays} | ${undefined}       | ${"wed!"}        | ${false}
    ${d("2023-01-02")} | ${holidays} | ${undefined}       | ${"wed!"}        | ${false}
    ${d("2023-01-04")} | ${holidays} | ${undefined}       | ${"wed!"}        | ${false}
    ${d("2023-01-11")} | ${holidays} | ${undefined}       | ${"wed!"}        | ${true}
    ${d("2023-01-01")} | ${holidays} | ${undefined}       | ${"tue!/wed!"}   | ${false}
    ${d("2023-01-02")} | ${holidays} | ${undefined}       | ${"tue!/wed!"}   | ${false}
    ${d("2023-01-03")} | ${holidays} | ${undefined}       | ${"tue!/wed!"}   | ${true}
    ${d("2023-01-04")} | ${holidays} | ${undefined}       | ${"tue!/wed!"}   | ${false}
    ${d("2023-01-01")} | ${holidays} | ${undefined}       | ${"1d"}          | ${true}
    ${d("2023-01-01")} | ${holidays} | ${undefined}       | ${"1d/2d"}       | ${true}
    ${d("2023-01-01")} | ${holidays} | ${undefined}       | ${"2d/1d"}       | ${true}
    ${d("2023-01-01")} | ${holidays} | ${undefined}       | ${"11d"}         | ${false}
    ${d("2023-01-01")} | ${holidays} | ${undefined}       | ${"11d/21d"}     | ${false}
    ${d("2023-01-01")} | ${holidays} | ${d("2023-01-01")} | ${"every 2 day"} | ${true}
    ${d("2023-01-02")} | ${holidays} | ${d("2023-01-01")} | ${"every 2 day"} | ${false}
    ${d("2023-01-03")} | ${holidays} | ${d("2023-01-01")} | ${"every 2 day"} | ${true}
    ${d("2023-01-04")} | ${holidays} | ${d("2023-01-01")} | ${"every 2 day"} | ${false}
    ${d("2023-01-01")} | ${holidays} | ${d("2023-01-01")} | ${"every 3 day"} | ${true}
    ${d("2023-01-02")} | ${holidays} | ${d("2023-01-01")} | ${"every 3 day"} | ${false}
    ${d("2023-01-03")} | ${holidays} | ${d("2023-01-01")} | ${"every 3 day"} | ${false}
    ${d("2023-01-04")} | ${holidays} | ${d("2023-01-01")} | ${"every 3 day"} | ${true}
    ${d("2023-01-05")} | ${holidays} | ${d("2023-01-01")} | ${"every 3 day"} | ${false}
    ${d("2023-01-06")} | ${holidays} | ${d("2023-01-01")} | ${"every 3 day"} | ${false}
    ${d("2023-01-07")} | ${holidays} | ${d("2023-01-01")} | ${"every 3 day"} | ${true}
    ${d("2023-01-01")} | ${holidays} | ${d("2023-01-15")} | ${"every 2 day"} | ${false}
    ${d("2023-01-02")} | ${holidays} | ${d("2023-01-15")} | ${"every 2 day"} | ${false}
    ${d("2023-01-03")} | ${holidays} | ${d("2023-01-15")} | ${"every 2 day"} | ${false}
    ${d("2023-01-13")} | ${holidays} | ${d("2023-01-15")} | ${"every 2 day"} | ${false}
    ${d("2023-01-14")} | ${holidays} | ${d("2023-01-15")} | ${"every 2 day"} | ${false}
    ${d("2023-01-15")} | ${holidays} | ${d("2023-01-15")} | ${"every 2 day"} | ${true}
    ${d("2023-01-16")} | ${holidays} | ${d("2023-01-15")} | ${"every 2 day"} | ${false}
    ${d("2023-01-17")} | ${holidays} | ${d("2023-01-15")} | ${"every 2 day"} | ${true}
  `(
    "RepetitionTask.shouldTry",
    ({ date, holidays, baseDate, repetitionWord, expected }) => {
      test(`(baseDate=${baseDate}, holidays=${holidays}, repetitionWord=${repetitionWord}) RepetitionTask.shouldTry(${date}) = ${expected}`, () => {
        const task = RepetitionTask.of({
          repetition: Repetition.from(repetitionWord),
          baseDate,
          name: "hoge",
        });
        expect(task.shouldTry(date, holidays)).toBe(expected);
      });
    }
  );
});
