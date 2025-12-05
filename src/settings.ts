import { App, PluginSettingTab, Setting } from "obsidian";
import type SilhouettePlugin from "./main";
import { TextAreaComponentEvent, TextComponentEvent } from "./settings-helper";

export interface Settings {
  taskFilePath: string;
  holidayFilePath: string;
  fileDateFormat: string;
  timerStorageFilePath: string;
  showTimeOnStatusBar: boolean;
  alertTimes: string[];
  startNextTaskAutomaticallyAfterDone: boolean;
  enableMarks: boolean;
  marks: {
    recording: string;
    stop: string;
    done: string;
  };
}

export const DEFAULT_SETTINGS: Settings = {
  taskFilePath: "",
  holidayFilePath: "",
  fileDateFormat: "",
  timerStorageFilePath: "",
  alertTimes: [],
  showTimeOnStatusBar: false,
  startNextTaskAutomaticallyAfterDone: false,
  enableMarks: false,
  marks: {
    recording: "~",
    stop: "_",
    done: "x",
  },
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

    // ╭─────────────────────────────────────────────────────────╮
    // │                         タスク                          │
    // ╰─────────────────────────────────────────────────────────╯

    containerEl.createEl("h3", { text: "✅ タスク" });

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

    // ╭─────────────────────────────────────────────────────────╮
    // │                          計測                           │
    // ╰─────────────────────────────────────────────────────────╯

    containerEl.createEl("h3", { text: "⏲️ 計測" });

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
      .setName("アラートを通知する計測時間")
      .setDesc(
        "指定した計測時間に達したときに通知が表示されます。HH:MM形式で指定し、改行区切りで複数指定できます。(例: 00:30\n01:00 なら30分と1時間で通知されます)。⚠️ モバイル版は未対応です",
      )
      .addTextArea((tc) =>
        TextAreaComponentEvent.onChange(tc, async (value) => {
          this.plugin.settings.alertTimes = value.trim().split("\n");
          await this.plugin.saveSettings();
        })
          .setPlaceholder("ex:\n00:30\n01:00")
          .setValue(this.plugin.settings.alertTimes.join("\n")),
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

    new Setting(containerEl)
      .setName("チェックボックスのマークも更新する")
      .setDesc(
        "有効にすると `Push timer` や `Cycle bullet/checkbox` などで計測開始/終了したときに、チェックボックスのマークを更新します。",
      )
      .addToggle((tc) => {
        tc.setValue(this.plugin.settings.enableMarks).onChange(
          async (value) => {
            this.plugin.settings.enableMarks = value;
            await this.plugin.saveSettings();
            this.display();
          },
        );
      });

    if (this.plugin.settings.enableMarks) {
      const nestDiv = containerEl.createDiv({
        cls: "silhouette__setting__nest",
      });

      new Setting(nestDiv)
        .setName("計測中のマーク")
        .setDesc("タスクが計測中であることを示すマークを指定します。")
        .addText((text) =>
          TextComponentEvent.onChange(text, async (value) => {
            this.plugin.settings.marks.recording = value;
            await this.plugin.saveSettings();
          })
            .setPlaceholder("ex: ~")
            .setValue(this.plugin.settings.marks.recording),
        );

      new Setting(nestDiv)
        .setName("計測停止のマーク")
        .setDesc("タスクが計測停止であることを示すマークを指定します。")
        .addText((text) =>
          TextComponentEvent.onChange(text, async (value) => {
            this.plugin.settings.marks.stop = value;
            await this.plugin.saveSettings();
          })
            .setPlaceholder("ex: _")
            .setValue(this.plugin.settings.marks.stop),
        );

      new Setting(nestDiv)
        .setName("完了のマーク")
        .setDesc("タスクが完了であることを示すマークを指定します。")
        .addText((text) =>
          TextComponentEvent.onChange(text, async (value) => {
            this.plugin.settings.marks.done = value;
            await this.plugin.saveSettings();
          })
            .setPlaceholder("ex: x")
            .setValue(this.plugin.settings.marks.done),
        );
    }
  }
}
