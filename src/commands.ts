import type { Command } from "obsidian";
import { Notice } from "obsidian";
import { DateTime } from "owlelia";
import type { TaskService } from "./app/TaskService";
import type { TimerService } from "./app/TimerService";
import type { AppHelper } from "./appHelper";
import { notifyError } from "./errors";
import type { Settings } from "./settings";

export function createCommands(
  appHelper: AppHelper,
  settings: Settings,
  taskService: TaskService,
  timerService: TimerService,
): Command[] {
  return [
    {
      id: "insert-tasks",
      name: "Insert tasks",
      checkCallback: (checking: boolean) => {
        if (appHelper.getActiveFile() && appHelper.getActiveMarkdownView()) {
          if (!checking) {
            if (!settings.fileDateFormat) {
              return notifyError(
                "『ファイルの日付フォーマット』が設定されていません。",
              );
            }

            const date = DateTime.from(
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              appHelper.getActiveFile()!.basename,
              settings.fileDateFormat,
            );
            if (!date) {
              return notifyError(
                `ファイル名 '${appHelper.getActiveFile()!.basename}' から日付を解析できませんでした。『ファイルの日付フォーマット』の設定を確認してください。`,
              );
            }

            taskService.insertTasksToDailyNote(date).then((err) => {
              if (err) {
                return notifyError(`${err.name}\n\n ${err.message}`);
              }

              new Notice(
                `🌟 ${date.format("YYYY/MM/DD")} のタスクを挿入しました。`,
              );
            });
          }
          return true;
        }
      },
    },
    {
      id: "push-timer",
      name: "Push timer",
      checkCallback: (checking: boolean) => {
        if (appHelper.getActiveFile() && appHelper.getActiveMarkdownView()) {
          if (!checking) {
            timerService.execute({
              openAfterRecording: false,
              marks: settings.enableMarks ? settings.marks : undefined,
            });
          }
          return true;
        }
      },
    },
    {
      id: "push-timer-and-open",
      name: "Push timer and open",
      checkCallback: (checking: boolean) => {
        if (appHelper.getActiveFile() && appHelper.getActiveMarkdownView()) {
          if (!checking) {
            timerService.execute({
              openAfterRecording: true,
              marks: settings.enableMarks ? settings.marks : undefined,
            });
          }
          return true;
        }
      },
    },
    {
      id: "cycle-bullet-checkbox",
      name: "Cycle bullet/checkbox",
      checkCallback: (checking: boolean) => {
        if (appHelper.getActiveFile() && appHelper.getActiveMarkdownView()) {
          if (!checking) {
            timerService.cycleBulletCheckbox({
              startNextTaskAutomatically:
                settings.startNextTaskAutomaticallyAfterDone,
              marks: settings.enableMarks ? settings.marks : undefined,
            });
          }
          return true;
        }
      },
    },
    {
      id: "move-to-recording",
      name: "Move to recording",
      checkCallback: (checking: boolean) => {
        if (appHelper.getActiveFile() && appHelper.getActiveMarkdownView()) {
          if (!checking) {
            timerService.moveToRecording();
          }
          return true;
        }
      },
    },
    {
      id: "force-stop-recording",
      name: "Force stop recording",
      checkCallback: (checking: boolean) => {
        if (appHelper.getActiveFile() && appHelper.getActiveMarkdownView()) {
          if (!checking) {
            timerService.forceStopRecording();
          }
          return true;
        }
      },
    },
    {
      id: "insert-current-time",
      name: "Insert current time",
      checkCallback: (checking: boolean) => {
        if (appHelper.getActiveFile() && appHelper.getActiveMarkdownView()) {
          if (!checking) {
            timerService.insertCurrentTime();
          }
          return true;
        }
      },
    },
  ];
}
