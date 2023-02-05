import { type EventRef, Notice, Plugin } from "obsidian";
import {
  DEFAULT_SETTINGS,
  type Settings,
  SilhouetteSettingTab,
} from "./settings";
import { AppHelper } from "./app-helper";
import { TaskRepositoryImpl } from "./repository/TaskRepositoryImpl";
import type { TaskService } from "./app/TaskService";
import { TaskServiceImpl } from "./app/TaskServiceImpl";
import { DateTime } from "owlelia";
import {
  RepetitionTaskItemView,
  REPETITION_TASK_VIEW_TYPE,
} from "./ui/RepetitionTaskItemView";
import type { TimerService } from "./app/TimerService";
import { TimerServiceImpl } from "./app/TimerServiceImpl";

export default class SilhouettePlugin extends Plugin {
  settings: Settings;
  appHelper: AppHelper;
  taskService: TaskService;
  timerService: TimerService;
  repetitionTaskView: RepetitionTaskItemView;
  fileEventRef: EventRef | undefined;

  async onload() {
    await this.loadSettings();
    this.appHelper = new AppHelper(this.app);
    this.init();

    this.addCommand({
      id: "insert-tasks",
      name: "Insert tasks",
      checkCallback: (checking: boolean) => {
        if (
          this.appHelper.getActiveFile() &&
          this.appHelper.getActiveMarkdownView()
        ) {
          if (!checking) {
            const date = DateTime.from(
              this.appHelper.getActiveFile()!.basename,
              this.settings.fileDateFormat || undefined
            );

            this.taskService.insertTasksToDailyNote(date).then((err) => {
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
    });

    this.addCommand({
      id: "push-timer",
      name: "Push timer",
      checkCallback: (checking: boolean) => {
        if (
          this.appHelper.getActiveFile() &&
          this.appHelper.getActiveMarkdownView()
        ) {
          if (!checking) {
            this.timerService.execute();
          }
          return true;
        }
      },
    });

    this.addSettingTab(new SilhouetteSettingTab(this.app, this));
  }

  private init() {
    const repository = new TaskRepositoryImpl(
      this.appHelper,
      this.settings.taskFilePath,
      this.settings.holidayFilePath
    );
    this.taskService = new TaskServiceImpl(this.appHelper, repository);
    this.timerService = new TimerServiceImpl(this.appHelper);

    this.registerView(REPETITION_TASK_VIEW_TYPE, (leaf) => {
      this.repetitionTaskView = new RepetitionTaskItemView(
        leaf,
        this.taskService
      );

      if (this.fileEventRef) {
        this.app.vault.offref(this.fileEventRef);
      }
      this.fileEventRef = this.app.vault.on("modify", async (file) => {
        if (
          file.path === this.settings.taskFilePath ||
          file.path === this.settings.holidayFilePath
        ) {
          await this.repetitionTaskView.refreshData();
        }
      });

      return this.repetitionTaskView;
    });
    this.addRibbonIcon("cloud-fog", "Activate view", async () => {
      await this.activateView();
    });
  }

  async onunload() {
    if (this.fileEventRef) {
      this.app.vault.offref(this.fileEventRef);
    }
    this.app.workspace.detachLeavesOfType(REPETITION_TASK_VIEW_TYPE);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.init();
  }

  async activateView() {
    this.app.workspace.detachLeavesOfType(REPETITION_TASK_VIEW_TYPE);

    await this.app.workspace.getRightLeaf(false).setViewState({
      type: REPETITION_TASK_VIEW_TYPE,
      active: true,
    });

    this.app.workspace.revealLeaf(
      this.app.workspace.getLeavesOfType(REPETITION_TASK_VIEW_TYPE)[0]
    );
  }
}
