import { expect, test } from "bun:test";
import { toHHmmss } from "owlelia/dist/bundle/datetime";

test.each<[seconds: number, expected: string]>(
  // prettier-ignore
  [
      [1,            "00:00:01"],
      [59,           "00:00:59"],
      [60,           "00:01:00"],
      [60 * 60 - 1,  "00:59:59"],
      [60 * 60,      "01:00:00"],
      [60 * 60 * 25, "25:00:00"],
    ],
)(`seconds=%s, expected=%s`, (seconds, expected) => {
  expect(toHHmmss(seconds)).toBe(expected);
});
