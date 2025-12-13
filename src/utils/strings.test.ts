import { expect, test } from "bun:test";
import {
  findInvalidPattern,
  match,
  pickPatterns,
  smartCommaSplit,
  smartLineSplit,
} from "./strings";

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
  [["- task 1", "- task 2"], /^- .+/, undefined, null],
  [["- task 1", "invalid task"], /^- .+/, undefined, "invalid task"],
  [["", "- task 2"], /^- .+/, undefined, ""],
  [["- task 1", "invalid task"], /^- .+/, { allowEmpty: true }, "invalid task"],
  [["", "- task 2"], /^- .+/, { allowEmpty: true }, null],
])(
  `findInvalidPattern("%s", "%s", "%s"))`,
  (
    text: Parameters<typeof findInvalidPattern>[0],
    pattern: Parameters<typeof findInvalidPattern>[1],
    options: Parameters<typeof findInvalidPattern>[2],
    expected: ReturnType<typeof findInvalidPattern>,
  ) => {
    expect(findInvalidPattern(text, pattern, options)).toBe(expected);
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
  [" aa , bb ", ["aa", "bb"]],
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

test.each([
  ["aa\nbb", ["aa", "bb"]],
  [" aa \n bb ", ["aa", "bb"]],
  ["", []],
])(
  `smartLineSplit("%s", "%s")`,
  (
    text: Parameters<typeof smartLineSplit>[0],
    expected: ReturnType<typeof smartLineSplit>,
  ) => {
    expect(smartLineSplit(text)).toStrictEqual(expected);
  },
);
