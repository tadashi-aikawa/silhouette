import { AsyncResult, BaseError, DateTime, Nullable } from "owlelia";
import { RepetitionTask } from "../domain/entity/RepetitionTask";

export interface TaskService {
  insertTasksToDailyNote(date: DateTime): Promise<Nullable<BaseError>>;
  loadRepetitionTasks(): AsyncResult<RepetitionTask[], BaseError>;
  calcDatesInFuture(task: RepetitionTask, holidays: DateTime[]): DateTime[];
  loadHolidays(): AsyncResult<DateTime[], BaseError>;
}
