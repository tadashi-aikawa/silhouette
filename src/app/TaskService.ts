import type { RepetitionTask } from "@tadashi-aikawa/silhouette-core";
import type { AsyncResult, BaseError, DateTime, Nullable } from "owlelia";
import type { TaskRepository } from "../repository/TaskRepository";

export interface TaskService {
  serRepository(repository: TaskRepository): void;
  insertTasksToDailyNote(date: DateTime): Promise<Nullable<BaseError>>;
  loadRepetitionTasks(): AsyncResult<RepetitionTask[], BaseError>;
  calcDatesInFuture(
    task: RepetitionTask,
    holidays: DateTime[],
    monthsAhead: number,
  ): DateTime[];
  loadHolidays(): AsyncResult<DateTime[], BaseError>;
}
