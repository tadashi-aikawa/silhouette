import { type Command, type EventRef, Plugin } from "obsidian";
import {
  DEFAULT_SETTINGS,
  type Settings,
  SilhouetteSettingTab,
} from "./settings";
import { AppHelper } from "./app-helper";
import { TaskRepositoryImpl } from "./repository/TaskRepositoryImpl";
import { TimerRepositoryImpl } from "./repository/TimerRepositoryImpl";
import type { TaskService } from "./app/TaskService";
import { TaskServiceImpl } from "./app/TaskServiceImpl";
import {
  REPETITION_TASK_VIEW_TYPE,
  RepetitionTaskItemView,
} from "./ui/RepetitionTaskItemView";
import type { TimerService } from "./app/TimerService";
import { TimerServiceImpl } from "./app/TimerServiceImpl";
import { createCommands } from "./commands";
import { DateTime } from "owlelia";
import { toDisplayFooter } from "./utils/times";

export default class SilhouettePlugin extends Plugin {
  settings: Settings;
  appHelper: AppHelper;
  taskService: TaskService;
  timerService: TimerService;
  repetitionTaskView: RepetitionTaskItemView;
  fileEventRef: EventRef | undefined;
  commands: Command[] = [];
  timerStatusBar?: HTMLElement;

  async onload() {
    await this.loadSettings();
    this.appHelper = new AppHelper(this.app);

    this.taskService = new TaskServiceImpl(
      this.appHelper,
      new TaskRepositoryImpl(
        this.appHelper,
        this.settings.taskFilePath,
        this.settings.holidayFilePath,
      ),
    );

    this.timerService = TimerServiceImpl.create(
      this.appHelper,
      new TimerRepositoryImpl(
        this.appHelper,
        this.settings.timerStorageFilePath || `${this.manifest.dir}/timer.json`,
      ),
    );

    if (this.settings.showTimeOnStatusBar) {
      this.addStatusBar();
    }

    this.registerView(REPETITION_TASK_VIEW_TYPE, (leaf) => {
      this.repetitionTaskView = new RepetitionTaskItemView(
        leaf,
        this.taskService,
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
      this.timerService,
    ).map((x) => this.addCommand(x));

    this.addSettingTab(new SilhouetteSettingTab(this.app, this));
  }

  async onunload() {
    this.timerService.terminate();
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

  addStatusBar() {
    this.timerStatusBar = this.addStatusBarItem();
    const timerStatusItem = this.timerStatusBar.createEl("span", {
      text: "未測定",
      cls: "silhouette__footer silhouette__footer__timer",
    });
    this.timerService.setOnTimerHandler((timer) => {
      const timerText = timer
        ? toDisplayFooter(timer.getPastSeconds(DateTime.now()))
        : "未測定";
      timerStatusItem.setText(timerText);
    }, 30 * 1000);
  }

  async reset() {
    this.taskService.serRepository(
      new TaskRepositoryImpl(
        this.appHelper,
        this.settings.taskFilePath,
        this.settings.holidayFilePath,
      ),
    );
    this.timerService.serRepository(
      new TimerRepositoryImpl(
        this.appHelper,
        this.settings.timerStorageFilePath || `${this.manifest.dir}/timer.json`,
      ),
    );
    this.timerService.terminate();
    this.timerStatusBar?.remove();

    if (this.settings.showTimeOnStatusBar) {
      this.addStatusBar();
    }
  }

  async activateView() {
    this.app.workspace.detachLeavesOfType(REPETITION_TASK_VIEW_TYPE);

    await this.app.workspace.getRightLeaf(false).setViewState({
      type: REPETITION_TASK_VIEW_TYPE,
      active: true,
    });

    this.app.workspace.revealLeaf(
      this.app.workspace.getLeavesOfType(REPETITION_TASK_VIEW_TYPE)[0],
    );
  }
}
