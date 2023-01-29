import "@event-calendar/core/index.css";
import { ItemView, WorkspaceLeaf } from "obsidian";
import type { TaskService } from "../app/TaskService";
import RepetitionTaskView from "../component/RepetitionTaskView.svelte";

export const REPETITION_TASK_VIEW_TYPE = "repetition-task";

export class RepetitionTaskItemView extends ItemView {
  taskService: TaskService;
  view: RepetitionTaskView;

  constructor(leaf: WorkspaceLeaf, taskService: TaskService) {
    super(leaf);
    this.taskService = taskService;
  }

  getViewType(): string {
    return REPETITION_TASK_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Silhouette";
  }

  getIcon(): string {
    return "cloud-fog";
  }

  async onclose() {
    this.view.$destroy();
  }

  async onOpen(): Promise<void> {
    this.view = new RepetitionTaskView({
      target: this.containerEl.children[1],
      props: {
        taskService: this.taskService,
      },
    });
    await this.refreshData();
  }

  async refreshData() {
    const [tasks, taskError] = await this.taskService
      .loadRepetitionTasks()
      .then((x) => x.unwrap());

    const [holidays, holidaysError] = (
      await this.taskService.loadHolidays()
    ).unwrap();

    this.view.$set({
      tasks,
      holidays,
    });
  }
}
