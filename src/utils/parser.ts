export function parseMarkdownList(text: string): {
  prefix: string;
  content: string;
} {
  const result = Array.from(
    text.matchAll(/^(?<prefix>[ \t\s]*([-*] (\[.] |)|))(?<content>.*)$/g)
  ).at(0);

  return {
    prefix: result?.groups?.prefix ?? "",
    content: result?.groups?.content ?? "",
  };
}
