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
    const [tasks, err] = (await this.repository.loadRepetitionTasks()).unwrap();
    if (err) {
      return err;
    }

    const [holidays, err2] = (await this.repository.loadHolidays()).unwrap();
    if (err2) {
      return err2;
    }

    this.appHelper.insertStringToActiveFile(
      tasks
        .filter((x) => x.shouldTry(date, holidays))
        .map((x) => `- [ ] ${x.name}`)
        .join("\n")
    );
  }
}
