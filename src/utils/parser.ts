export function parseMarkdownList(text: string): {
  prefix: string;
  content: string;
} {
  const { groups } = Array.from(
    text.matchAll(/^(?<prefix> *([-*] (\[.] |)|))(?<content>.*)$/g)
  ).at(0) as any;

  return { prefix: groups.prefix, content: groups.content };
}
