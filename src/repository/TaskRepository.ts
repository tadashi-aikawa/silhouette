import { AsyncResult, BaseError, DateTime } from "owlelia";
import { RepetitionTask } from "../domain/entity/RepetitionTask";

export interface TaskRepository {
  loadRepetitionTasks(): AsyncResult<RepetitionTask[], BaseError>;
  loadHolidays(): AsyncResult<DateTime[], BaseError>;
}
