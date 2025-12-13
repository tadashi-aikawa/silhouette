import { Notice } from "obsidian";

export class ExhaustiveError extends Error {
  constructor(value: never, message = `Unsupported type: ${value}`) {
    super(message);
  }
}

export function notifyError(err: string): void {
  new Notice(`❌ [エラー] ${err}`, 0);
}
