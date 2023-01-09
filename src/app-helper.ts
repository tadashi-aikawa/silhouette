import { App, Editor, MarkdownView } from "obsidian";

export class AppHelper {
  private unsafeApp: App;

  constructor(app: App) {
    this.unsafeApp = app as any;
  }

  async loadFile(path: string): Promise<string> {
    return this.unsafeApp.vault.adapter.read(path);
  }

  getActiveMarkdownView(): MarkdownView | null {
    return this.unsafeApp.workspace.getActiveViewOfType(MarkdownView);
  }

  getActiveMarkdownEditor(): Editor | null {
    return this.getActiveMarkdownView()?.editor ?? null;
  }

  insertStringToActiveFile(str: string): void {
    this.getActiveMarkdownEditor()?.replaceSelection(str);
  }
}
