import type { AsyncResult, BaseError, DateTime, Nullable } from "owlelia";
import type { RepetitionTask } from "../domain/entity/RepetitionTask";
import type { TaskRepository } from "../repository/TaskRepository";

export interface TaskService {
  serRepository(repository: TaskRepository): void;
  insertTasksToDailyNote(date: DateTime): Promise<Nullable<BaseError>>;
  loadRepetitionTasks(): AsyncResult<RepetitionTask[], BaseError>;
  calcDatesInFuture(task: RepetitionTask, holidays: DateTime[]): DateTime[];
  loadHolidays(): AsyncResult<DateTime[], BaseError>;
}
