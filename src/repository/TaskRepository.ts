import { AsyncResult, BaseError } from "owlelia";
import { RepetitionTask } from "../domain/entity/RepetitionTask";

export interface TaskRepository {
  loadRepetitionTasks(): AsyncResult<RepetitionTask[], BaseError>;
}
