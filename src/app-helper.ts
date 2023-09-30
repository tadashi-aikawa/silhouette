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

  async exists(path: string): Promise<boolean> {
    return await this.unsafeApp.vault.adapter.exists(path);
  }

  async deleteFile(path: string): Promise<void> {
    await this.unsafeApp.vault.adapter.remove(path);
  }

  async deleteFileIfExists(path: string): Promise<void> {
    if (await this.exists(path)) {
      await this.deleteFile(path);
    }
  }

  async loadFile(path: string): Promise<string> {
    if (!(await this.exists(path))) {
      throw Error(`The file is not found: ${path}`);
    }
    return this.unsafeApp.vault.adapter.read(path);
  }

  async loadJson<T>(path: string): Promise<T> {
    return JSON.parse(await this.loadFile(path)) as T;
  }

  async saveJson<T>(path: string, data: T): Promise<void> {
    await this.unsafeApp.vault.adapter.write(
      path,
      JSON.stringify(data, null, 2)
    );
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

  getActiveNextLine(): string | null {
    const editor = this.getActiveMarkdownEditor();
    if (!editor) {
      return null;
    }

    return editor.getLine(editor.getCursor().line + 1);
  }

  moveNextLine(): void {
    const editor = this.getActiveMarkdownEditor();
    if (!editor) {
      return;
    }

    const { line } = editor.getCursor();
    return editor.setCursor({ line: line + 1, ch: 0 });
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

  replaceStringInActiveLine(str: string, option?: { cursor?: "last" }): void {
    const editor = this.getActiveMarkdownEditor();
    if (!editor) {
      return;
    }

    const { line, ch } = editor.getCursor();
    editor.setLine(line, str);

    // XXX: lastのときは最後の空白手前で止まってしまうので-1を消す
    const afterCh =
      option?.cursor === "last" ? str.length : Math.min(ch, str.length - 1);

    editor.setCursor({ line, ch: afterCh });
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
