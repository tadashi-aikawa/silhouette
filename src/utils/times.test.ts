import { describe, expect, test } from "@jest/globals";
import { toHHmmss } from "owlelia/dist/bundle/datetime";

describe("toHHmmss", () => {
  describe.each<{
    seconds: number;
    expected: string;
  }>`
    seconds         | expected
    ${1}            | ${"00:00:01"}
    ${59}           | ${"00:00:59"}
    ${60}           | ${"00:01:00"}
    ${60 * 60 - 1}  | ${"00:59:59"}
    ${60 * 60}      | ${"01:00:00"}
    ${60 * 60 * 25} | ${"25:00:00"}
  `("toHHmmss", ({ seconds, expected }) => {
    test(`seconds=${seconds}, expected=${expected}`, () => {
      expect(toHHmmss(seconds)).toBe(expected);
    });
  });
});
