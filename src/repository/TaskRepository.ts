import type { AsyncResult, BaseError, DateTime } from "owlelia";
import type { RepetitionTask } from "../domain/entity/RepetitionTask";

export interface TaskRepository {
  loadRepetitionTasks(): AsyncResult<RepetitionTask[], BaseError>;
  loadHolidays(): AsyncResult<DateTime[], BaseError>;
}
