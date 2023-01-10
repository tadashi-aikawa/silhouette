import { AppHelper } from "../app-helper";
import { TaskRepository } from "./TaskRepository";
import { AsyncResult, BaseError, fromPromise } from "owlelia";
import { RepetitionTask } from "../domain/entity/RepetitionTask";
import { Repetition } from "../domain/vo/Repetition";

export class TaskRepositoryImpl implements TaskRepository {
  constructor(
    private appHelper: AppHelper,
    private repetitionTasksFilePath: string
  ) {}

  loadRepetitionTasks(): AsyncResult<RepetitionTask[], BaseError> {
    return fromPromise(
      this.appHelper.loadFile(this.repetitionTasksFilePath).then((tasksStr) =>
        tasksStr.split("\n").map((line) => {
          const [name, repetition] = line.split(",");
          return RepetitionTask.of({
            name,
            repetition: Repetition.from(repetition),
          });
        })
      )
    );
  }
}
