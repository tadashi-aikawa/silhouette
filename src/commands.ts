import type { Settings } from "./settings";
import type { Command } from "obsidian";
import { DateTime } from "owlelia";
import { Notice } from "obsidian";
import type { TaskService } from "./app/TaskService";
import type { TimerService } from "./app/TimerService";
import type { AppHelper } from "./app-helper";

export function createCommands(
  appHelper: AppHelper,
  settings: Settings,
  taskService: TaskService,
  timerService: TimerService
): Command[] {
  return [
    {
      id: "insert-tasks",
      name: "Insert tasks",
      checkCallback: (checking: boolean) => {
        if (appHelper.getActiveFile() && appHelper.getActiveMarkdownView()) {
          if (!checking) {
            const date = DateTime.from(
              appHelper.getActiveFile()!.basename,
              settings.fileDateFormat || undefined
            );

            taskService.insertTasksToDailyNote(date).then((err) => {
              if (err) {
                new Notice(`[Error] ${err.name}: ${err.message}`, 0);
                return;
              }

              new Notice(
                `Insert tasks that should do on ${date.format("YYYY/MM/DD")}`
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
            timerService.execute();
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
            timerService.cycleBulletCheckbox();
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
  ];
}
