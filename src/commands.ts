import type { Command } from "obsidian";
import { Notice } from "obsidian";
import { DateTime } from "owlelia";
import type { AppHelper } from "./app-helper";
import type { TaskService } from "./app/TaskService";
import type { TimerService } from "./app/TimerService";
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
            const date = DateTime.from(
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              appHelper.getActiveFile()!.basename,
              settings.fileDateFormat || undefined,
            );

            taskService.insertTasksToDailyNote(date).then((err) => {
              if (err) {
                new Notice(`[エラー] ${err.name}\n\n ${err.message}`, 0);
                return;
              }

              new Notice(
                `Insert tasks that should do on ${date.format("YYYY/MM/DD")}`,
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
