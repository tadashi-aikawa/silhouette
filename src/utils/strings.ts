/**
 * テキストが正規表現パターンにマッチしているかどうかを返却します
 */
export function match(text: string, pattern: RegExp): boolean {
  return Boolean(text.match(pattern));
}

/**
 * テキスト配列の中で、最初に正規表現パターンにマッチしないものを返却します
 */
export function findInvalidPattern(
  text: string[],
  pattern: RegExp,
  options?: { allowEmpty?: boolean },
): string | null {
  return (
    text.find((line) => {
      if (options?.allowEmpty && line.trim() === "") {
        return false;
      }
      return !match(line, pattern);
    }) ?? null
  );
}

export function pickPatterns(
  str: string,
  pattern: RegExp,
): { [key: string]: string } {
  return Array.from(str.matchAll(pattern))?.[0]?.groups ?? {};
}

export function smartCommaSplit(text: string): string[] {
  return text
    .split(",")
    .map((x) => x.trim())
    .filter((x) => x);
}

export function smartLineSplit(text: string): string[] {
  return text
    .split("\n")
    .map((x) => x.trim())
    .filter((x) => x);
}
