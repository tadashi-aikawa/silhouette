import { TaskService } from "./TaskService";
import { TaskRepository } from "../repository/TaskRepository";
import { AsyncResult, BaseError, DateTime, Nullable } from "owlelia";
import { AppHelper } from "../app-helper";
import { RepetitionTask } from "../domain/entity/RepetitionTask";

export class TaskServiceImpl implements TaskService {
  constructor(
    private appHelper: AppHelper,
    private repository: TaskRepository
  ) {}

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
