/**
 * テキストが正規表現パターンにマッチしているかどうかを返却します
 */
export function match(text: string, pattern: RegExp): boolean {
  return Boolean(text.match(pattern));
}

export function pickPatterns(
  str: string,
  pattern: RegExp,
): { [key: string]: string } {
  return Array.from(str.matchAll(pattern))?.[0]?.groups ?? {};
}
