import type { TextComponent } from "obsidian";

export namespace TextComponentEvent {
  export function onChange(
    component: TextComponent,
    handler: (value: string) => void
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
