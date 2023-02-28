import { type Command, type EventRef, Plugin } from "obsidian";
import {
  DEFAULT_SETTINGS,
  type Settings,
  SilhouetteSettingTab,
} from "./settings";
import { AppHelper } from "./app-helper";
import { TaskRepositoryImpl } from "./repository/TaskRepositoryImpl";
import type { TaskService } from "./app/TaskService";
import { TaskServiceImpl } from "./app/TaskServiceImpl";
import {
  REPETITION_TASK_VIEW_TYPE,
  RepetitionTaskItemView,
} from "./ui/RepetitionTaskItemView";
import type { TimerService } from "./app/TimerService";
import { TimerServiceImpl } from "./app/TimerServiceImpl";
import { createCommands } from "./commands";

export default class SilhouettePlugin extends Plugin {
  settings: Settings;
  appHelper: AppHelper;
  taskService: TaskService;
  timerService: TimerService;
  repetitionTaskView: RepetitionTaskItemView;
  fileEventRef: EventRef | undefined;
  commands: Command[] = [];

  async onload() {
    await this.loadSettings();
    this.appHelper = new AppHelper(this.app);
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

    this.commands.forEach((x) => this.appHelper.removeCommand(x.id));
    this.commands = createCommands(
      this.appHelper,
      this.settings,
      this.taskService,
      this.timerService
    ).map((x) => this.addCommand(x));

    this.addSettingTab(new SilhouetteSettingTab(this.app, this));
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
    await this.reset();
  }

  async reset() {
    const repository = new TaskRepositoryImpl(
      this.appHelper,
      this.settings.taskFilePath,
      this.settings.holidayFilePath
    );
    this.taskService.serRepository(repository);
    await this.activateView();
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
