import { App, PluginSettingTab, Setting } from "obsidian";
import type SilhouettePlugin from "./main";
import { TextComponentEvent } from "./settings-helper";

export interface Settings {
  taskFilePath: string;
  holidayFilePath: string;
  fileDateFormat: string;
  timerStorageFilePath: string;
}

export const DEFAULT_SETTINGS: Settings = {
  taskFilePath: "",
  holidayFilePath: "",
  fileDateFormat: "",
  timerStorageFilePath: "",
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
      TextComponentEvent.onChange(text, async (value) => {
        this.plugin.settings.taskFilePath = value;
        await this.plugin.saveSettings();
      })
        .setPlaceholder("ex: taskfile.md")
        .setValue(this.plugin.settings.taskFilePath)
    );

    new Setting(containerEl).setName("Holiday file path").addText((text) =>
      TextComponentEvent.onChange(text, async (value) => {
        this.plugin.settings.holidayFilePath = value;
        await this.plugin.saveSettings();
      })
        .setPlaceholder("ex: holiday.md")
        .setValue(this.plugin.settings.holidayFilePath)
    );

    new Setting(containerEl).setName("File date format").addText((text) =>
      TextComponentEvent.onChange(text, async (value) => {
        this.plugin.settings.fileDateFormat = value;
        await this.plugin.saveSettings();
      })
        .setPlaceholder("ex: MM-DD-YYYY")
        .setValue(this.plugin.settings.fileDateFormat)
    );

    new Setting(containerEl)
      .setName("Timer storage JSON file path")
      .addText((text) =>
        TextComponentEvent.onChange(text, async (value) => {
          this.plugin.settings.timerStorageFilePath = value;
          await this.plugin.saveSettings();
        })
          .setPlaceholder("ex: timer.json")
          .setValue(this.plugin.settings.timerStorageFilePath)
      );
  }
}
