import type { TextAreaComponent, TextComponent } from "obsidian";

export namespace TextComponentEvent {
  export function onChange(
    component: TextComponent,
    handler: (value: string) => void,
  ): TextComponent {
    component.inputEl.addEventListener("change", async (ev) => {
      if (!(ev.target instanceof HTMLInputElement)) {
        return;
      }

      handler(ev.target.value);
    });
    return component;
  }
}

export namespace TextAreaComponentEvent {
  export function onChange(
    component: TextAreaComponent,
    handler: (value: string) => void,
  ): TextAreaComponent {
    component.inputEl.addEventListener("change", async (ev) => {
      if (!(ev.target instanceof HTMLTextAreaElement)) {
        return;
      }

      handler(ev.target.value);
    });
    return component;
  }
}
