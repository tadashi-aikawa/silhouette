import { App, Editor, MarkdownView, TFile } from "obsidian";

interface UnsafeAppInterface {
  commands: {
    commands: { [commandId: string]: any };
    executeCommandById(commandId: string): boolean;
  };
}

export class AppHelper {
  private unsafeApp: App & UnsafeAppInterface;

  constructor(app: App) {
    this.unsafeApp = app as any;
  }

  async loadFile(path: string): Promise<string> {
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

  getActiveLine(): string | null {
    const editor = this.getActiveMarkdownEditor();
    if (!editor) {
      return null;
    }

    return editor.getLine(editor.getCursor().line);
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
}
