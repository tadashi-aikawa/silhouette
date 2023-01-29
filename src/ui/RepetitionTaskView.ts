import { ItemView, Notice, WorkspaceLeaf } from "obsidian";
import { TaskService } from "../app/TaskService";

export const REPETITION_TASK_VIEW_TYPE = "repetition-task";

export class RepetitionTaskView extends ItemView {
  taskService: TaskService;

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

  async onOpen(): Promise<void> {
    const container = this.containerEl.children[1];
    container.empty();

    const [tasks, err] = (
      await this.taskService.loadRepetitionTasks()
    ).unwrap();
    if (err) {
      new Notice(`[Error] ${err.name}: ${err.message}`, 0);
      return;
    }

    const tasksDiv = container.createDiv({
      attr: { style: "height: 50%; overflow: scroll;" },
    });
    const datesDiv = container.createDiv({
      attr: { style: "height: 50%; overflow: scroll;" },
    });

    const ul = tasksDiv.createEl("ul");
    tasks.forEach((task) => {
      const li = ul.createEl("li", { text: task.name });
      li.addEventListener("click", async () => {
        const [holidays, err] = (
          await this.taskService.loadHolidays()
        ).unwrap();
        if (err) {
          new Notice(`[Error] ${err.name}: ${err.message}`, 0);
          return;
        }

        datesDiv.empty();
        const ul = datesDiv.createEl("ul");
        this.taskService.calcDatesInFuture(task, holidays).forEach((date) => {
          ul.createEl("li", { text: date.displayDate });
        });
      });
    });
  }
}
