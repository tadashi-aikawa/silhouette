import { App, Editor, MarkdownView, TFile } from "obsidian";
import type { RegExpMatchedArray } from "./types";
import { ExhaustiveError } from "./errors";

type LeafType = "same-tab" | "new-tab";
type CoreCommand =
  | "editor:open-link-in-new-leaf"
  | "editor:follow-link"
  | string;
interface UnsafeAppInterface {
  commands: {
    commands: { [commandId: string]: any };
    executeCommandById(commandId: string): boolean;
    removeCommand(id: string): void;
  };
}

function createCommand(leaf: LeafType): string {
  switch (leaf) {
    case "same-tab":
      return "editor:follow-link";
    case "new-tab":
      return "editor:open-link-in-new-leaf";
    default:
      throw new ExhaustiveError(leaf);
  }
}

export class AppHelper {
  private unsafeApp: App & UnsafeAppInterface;

  constructor(app: App) {
    this.unsafeApp = app as any;
  }

  async loadFile(path: string): Promise<string> {
    const exists = await this.unsafeApp.vault.adapter.exists(path);
    if (!exists) {
      throw Error(`The file is not found: ${path}`);
    }
    return this.unsafeApp.vault.adapter.read(path);
  }

  getActiveFile(): TFile | null {
    // noinspection TailRecursionJS
    return this.unsafeApp.workspace.getActiveFile();
  }

  getActiveMarkdownView(): MarkdownView | null {
    return this.unsafeApp.workspace.getActiveViewOfType(MarkdownView);
  }

  getActiveMarkdownEditor(): Editor | null {
    return this.getActiveMarkdownView()?.editor ?? null;
  }

  getActiveFileContent(): string | null {
    const editor = this.getActiveMarkdownEditor();
    if (!editor) {
      return null;
    }

    return editor.getValue();
  }

  getActiveLine(): string | null {
    const editor = this.getActiveMarkdownEditor();
    if (!editor) {
      return null;
    }

    return editor.getLine(editor.getCursor().line);
  }

  openLinkInActiveLine(option: { leaf: LeafType }): void {
    const editor = this.getActiveMarkdownEditor();
    if (!editor) {
      return;
    }

    const line = this.getActiveLine();
    if (!line) {
      return;
    }

    const linksMatches = Array.from(
      line.matchAll(
        /(?<link>\[\[[^\]]+]])|[ |\n|^|\(](?<url>https?:\/\/[^ )\n]+)/g
      )
    ) as RegExpMatchedArray[];
    const firstIndex = linksMatches.map((x) => x.index).at(0);
    if (firstIndex === undefined) {
      return;
    }

    editor.setCursor({ line: editor.getCursor().line, ch: firstIndex + 3 });
    this.executeCoreCommand(createCommand(option.leaf));
  }

  insertStringToActiveFile(str: string): void {
    this.getActiveMarkdownEditor()?.replaceSelection(str);
  }

  replaceStringInActiveLine(str: string): void {
    const editor = this.getActiveMarkdownEditor();
    if (!editor) {
      return;
    }

    const { line, ch } = editor.getCursor();
    editor.setLine(line, str);
    editor.setCursor({ line, ch: Math.min(ch, str.length - 1) });
  }

  cycleListCheckList(): boolean {
    return this.unsafeApp.commands.executeCommandById(
      "editor:cycle-list-checklist"
    );
  }

  isCheckedCurrentLineTask(): boolean {
    const line = this.getActiveLine();
    return line ? /[-*] \[x] .+/.test(line) : false;
  }

  executeCoreCommand(command: CoreCommand): boolean {
    return this.unsafeApp.commands.executeCommandById(command);
  }

  removeCommand(commandId: string) {
    this.unsafeApp.commands.removeCommand(commandId);
  }
}
