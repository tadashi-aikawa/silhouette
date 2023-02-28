import type { TaskService } from "./TaskService";
import type { TaskRepository } from "../repository/TaskRepository";
import { type AsyncResult, BaseError, DateTime, type Nullable } from "owlelia";
import type { AppHelper } from "../app-helper";
import type { RepetitionTask } from "../domain/entity/RepetitionTask";

export class TaskServiceImpl implements TaskService {
  constructor(
    private appHelper: AppHelper,
    private repository: TaskRepository
  ) {}

  serRepository(repository: TaskRepository): void {
    this.repository = repository;
  }

  async insertTasksToDailyNote(date: DateTime): Promise<Nullable<BaseError>> {
    const [tasks, err] = (await this.loadRepetitionTasks()).unwrap();
    if (err) {
      return err;
    }

    const [holidays, err2] = (await this.loadHolidays()).unwrap();
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

  async loadRepetitionTasks(): AsyncResult<RepetitionTask[], BaseError> {
    return this.repository.loadRepetitionTasks();
  }

  async loadHolidays(): AsyncResult<DateTime[], BaseError> {
    return this.repository.loadHolidays();
  }

  calcDatesInFuture(task: RepetitionTask, holidays: DateTime[]): DateTime[] {
    const today = DateTime.today();
    return today
      .toDate(today.plusMonths(3))
      .filter((x) => task.shouldTry(x, holidays));
  }
}
