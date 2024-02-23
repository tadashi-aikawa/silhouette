import { App, PluginSettingTab, Setting } from "obsidian";
import type SilhouettePlugin from "./main";
import { TextComponentEvent } from "./settings-helper";

export interface Settings {
  taskFilePath: string;
  holidayFilePath: string;
  fileDateFormat: string;
  timerStorageFilePath: string;
  showTimeOnStatusBar: boolean;
  startNextTaskAutomaticallyAfterDone: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  taskFilePath: "",
  holidayFilePath: "",
  fileDateFormat: "",
  timerStorageFilePath: "",
  showTimeOnStatusBar: false,
  startNextTaskAutomaticallyAfterDone: false,
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

    new Setting(containerEl)
      .setName("繰り返しタスクファイルのパス")
      .setDesc(
        "繰り返しタスクファイルのパスをVault rootからの相対パスとして指定します。",
      )
      .addText((text) =>
        TextComponentEvent.onChange(text, async (value) => {
          this.plugin.settings.taskFilePath = value;
          await this.plugin.saveSettings();
        })
          .setPlaceholder("ex: taskfile.md")
          .setValue(this.plugin.settings.taskFilePath),
      );

    new Setting(containerEl)
      .setName("休日設定ファイルのパス")
      .setDesc(
        "休日設定ファイルのパスをVault rootからの相対パスとして指定します。",
      )
      .addText((text) =>
        TextComponentEvent.onChange(text, async (value) => {
          this.plugin.settings.holidayFilePath = value;
          await this.plugin.saveSettings();
        })
          .setPlaceholder("ex: holiday.md")
          .setValue(this.plugin.settings.holidayFilePath),
      );

    new Setting(containerEl)
      .setName("ファイルの日付フォーマット")
      .setDesc(
        "タスクを挿入する日付を判断するために必要なファイル名のフォーマットを指定します。",
      )
      .addText((text) =>
        TextComponentEvent.onChange(text, async (value) => {
          this.plugin.settings.fileDateFormat = value;
          await this.plugin.saveSettings();
        })
          .setPlaceholder("ex: MM-DD-YYYY")
          .setValue(this.plugin.settings.fileDateFormat),
      );

    new Setting(containerEl)
      .setName("計測状態を記録したJSONファイルのパス")
      .setDesc(
        "計測中の状態を記録したJSONファイルを保存するパスを、Vault rootからの相対パスとして指定します。指定しなかった場合は`.obsidian/plugins/silhouette/timer.json`に保存されます。",
      )
      .addText((text) =>
        TextComponentEvent.onChange(text, async (value) => {
          this.plugin.settings.timerStorageFilePath = value;
          await this.plugin.saveSettings();
        })
          .setPlaceholder("ex: timer.json")
          .setValue(this.plugin.settings.timerStorageFilePath),
      );

    new Setting(containerEl)
      .setName("ステータスバーに計測時間を表示する")
      .setDesc(
        "有効にすると計測中タスクの計測時間が表示されます。更新頻度は30秒に1回です。",
      )
      .addToggle((tc) => {
        tc.setValue(this.plugin.settings.showTimeOnStatusBar).onChange(
          async (value) => {
            this.plugin.settings.showTimeOnStatusBar = value;
            await this.plugin.saveSettings();
          },
        );
      });

    new Setting(containerEl)
      .setName("完了したら次のタスクを自動で計測開始する")
      .setDesc(
        "有効にすると『cycle bullet/checkbox』コマンドでタスクを完了したあと、次の行に未完了のタスクが存在するなら、次の行のタスクを自動で計測開始します。",
      )
      .addToggle((tc) => {
        tc.setValue(
          this.plugin.settings.startNextTaskAutomaticallyAfterDone,
        ).onChange(async (value) => {
          this.plugin.settings.startNextTaskAutomaticallyAfterDone = value;
          await this.plugin.saveSettings();
        });
      });
  }
}
