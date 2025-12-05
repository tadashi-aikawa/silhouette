import { expect, test } from "@jest/globals";
import { match, pickPatterns, smartCommaSplit } from "./strings";

test.each([
  ["abc123cdf", /\d+/, true],
  ["abc123cdf", /[a-z]+/, true],
  ["abc123cdf", /^\d+/, false],
])(
  `match("%s", "%s"))`,
  (
    text: Parameters<typeof match>[0],
    pattern: Parameters<typeof match>[1],
    expected: ReturnType<typeof match>,
  ) => {
    expect(match(text, pattern)).toBe(expected);
  },
);

test.each([
  ["- hoge hoge", /^- (?<name>.+)/g, { name: "hoge hoge" }],
  ["* hoge hoge", /^- (?<name>.+)/g, {}],
])(
  `pickPatterns("%s", "%s"))`,
  (
    str: Parameters<typeof pickPatterns>[0],
    pattern: Parameters<typeof pickPatterns>[1],
    expected: ReturnType<typeof pickPatterns>,
  ) => {
    expect(pickPatterns(str, pattern)).toEqual(expected);
  },
);

test.each([
  ["aa,bb", ["aa", "bb"]],
  ["", []],
])(
  `smartCommaSplit("%s", "%s")`,
  (
    text: Parameters<typeof smartCommaSplit>[0],
    expected: ReturnType<typeof smartCommaSplit>,
  ) => {
    expect(smartCommaSplit(text)).toStrictEqual(expected);
  },
);
