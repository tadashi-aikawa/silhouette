import { TaskService } from "./TaskService";
import { TaskRepository } from "../repository/TaskRepository";
import { BaseError, DateTime, Nullable } from "owlelia";
import { AppHelper } from "../app-helper";

export class TaskServiceImpl implements TaskService {
  constructor(
    private appHelper: AppHelper,
    private repository: TaskRepository
  ) {}
  async insertTasksToDailyNote(date: DateTime): Promise<Nullable<BaseError>> {
    const tasksOrErr = await this.repository.loadRepetitionTasks();
    if (tasksOrErr.isErr()) {
      return tasksOrErr.error;
    }

    this.appHelper.insertStringToActiveFile(
      tasksOrErr.value.map((x) => `- ${x.name}`).join("\n")
    );
  }
}
