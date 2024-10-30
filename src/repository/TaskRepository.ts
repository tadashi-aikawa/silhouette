import type { RepetitionTask } from "@tadashi-aikawa/silhouette-core";
import type { AsyncResult, BaseError, DateTime } from "owlelia";

export interface TaskRepository {
  loadRepetitionTasks(): AsyncResult<RepetitionTask[], BaseError>;
  loadHolidays(): AsyncResult<DateTime[], BaseError>;
}
