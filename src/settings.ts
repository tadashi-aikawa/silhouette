import { App, PluginSettingTab, Setting } from "obsidian";
import SilhouettePlugin from "./main";

export interface Settings {
  taskFilePath: string;
}

export const DEFAULT_SETTINGS: Settings = {
  taskFilePath: "",
};

export class SilhouetteSettingTab extends PluginSettingTab {
  plugin: SilhouettePlugin;

  constructor(app: App, plugin: SilhouettePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl("h2", { text: "General" });

    new Setting(containerEl).setName("Task file path").addText((text) =>
      text
        .setPlaceholder("ex: taskfile.md")
        .setValue(this.plugin.settings.taskFilePath)
        .onChange(async (value) => {
          this.plugin.settings.taskFilePath = value;
          await this.plugin.saveSettings();
        })
    );
  }
}
