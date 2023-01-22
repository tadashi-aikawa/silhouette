import { describe, expect, test } from "@jest/globals";
import { DateTime } from "owlelia";
import { RepetitionTask } from "./RepetitionTask";
import { Repetition } from "../vo/Repetition";

const d = DateTime.of;

// 2023/01/01(日)
describe("shouldTry", () => {
  describe.each<{
    date: DateTime;
    baseDate?: DateTime;
    repetitionWord: string;
    expected: boolean;
  }>`
    date               | baseDate           | repetitionWord   | expected
    ${d("2023-01-01")} | ${undefined}       | ${"every day"}   | ${true}
    ${d("2023-01-01")} | ${undefined}       | ${"weekday"}     | ${false}
    ${d("2023-01-01")} | ${undefined}       | ${"holiday"}     | ${true}
    ${d("2023-01-01")} | ${undefined}       | ${"sun"}         | ${true}
    ${d("2023-01-01")} | ${undefined}       | ${"sun/mon"}     | ${true}
    ${d("2023-01-01")} | ${undefined}       | ${"mon/sun"}     | ${true}
    ${d("2023-01-01")} | ${undefined}       | ${"mon"}         | ${false}
    ${d("2023-01-01")} | ${undefined}       | ${"mon/tue"}     | ${false}
    ${d("2023-01-01")} | ${undefined}       | ${"1d"}          | ${true}
    ${d("2023-01-01")} | ${undefined}       | ${"1d/2d"}       | ${true}
    ${d("2023-01-01")} | ${undefined}       | ${"2d/1d"}       | ${true}
    ${d("2023-01-01")} | ${undefined}       | ${"11d"}         | ${false}
    ${d("2023-01-01")} | ${undefined}       | ${"11d/21d"}     | ${false}
    ${d("2023-01-01")} | ${d("2023-01-01")} | ${"every 2 day"} | ${true}
    ${d("2023-01-02")} | ${d("2023-01-01")} | ${"every 2 day"} | ${false}
    ${d("2023-01-03")} | ${d("2023-01-01")} | ${"every 2 day"} | ${true}
    ${d("2023-01-04")} | ${d("2023-01-01")} | ${"every 2 day"} | ${false}
    ${d("2023-01-01")} | ${d("2023-01-01")} | ${"every 3 day"} | ${true}
    ${d("2023-01-02")} | ${d("2023-01-01")} | ${"every 3 day"} | ${false}
    ${d("2023-01-03")} | ${d("2023-01-01")} | ${"every 3 day"} | ${false}
    ${d("2023-01-04")} | ${d("2023-01-01")} | ${"every 3 day"} | ${true}
    ${d("2023-01-05")} | ${d("2023-01-01")} | ${"every 3 day"} | ${false}
    ${d("2023-01-06")} | ${d("2023-01-01")} | ${"every 3 day"} | ${false}
    ${d("2023-01-07")} | ${d("2023-01-01")} | ${"every 3 day"} | ${true}
    ${d("2023-01-01")} | ${d("2023-01-15")} | ${"every 2 day"} | ${false}
    ${d("2023-01-02")} | ${d("2023-01-15")} | ${"every 2 day"} | ${false}
    ${d("2023-01-03")} | ${d("2023-01-15")} | ${"every 2 day"} | ${false}
    ${d("2023-01-13")} | ${d("2023-01-15")} | ${"every 2 day"} | ${false}
    ${d("2023-01-14")} | ${d("2023-01-15")} | ${"every 2 day"} | ${false}
    ${d("2023-01-15")} | ${d("2023-01-15")} | ${"every 2 day"} | ${true}
    ${d("2023-01-16")} | ${d("2023-01-15")} | ${"every 2 day"} | ${false}
    ${d("2023-01-17")} | ${d("2023-01-15")} | ${"every 2 day"} | ${true}
  `(
    "RepetitionTask.shouldTry",
    ({ date, baseDate, repetitionWord, expected }) => {
      test(`(baseDate=${baseDate}, repetitionWord=${repetitionWord}) RepetitionTask.shouldTry(${date}) = ${expected}`, () => {
        const task = RepetitionTask.of({
          repetition: Repetition.from(repetitionWord),
          baseDate,
          name: "hoge",
        });
        expect(task.shouldTry(date)).toBe(expected);
      });
    }
  );
});
