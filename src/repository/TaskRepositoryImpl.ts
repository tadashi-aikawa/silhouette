import { AppHelper } from "../app-helper";
import { TaskRepository } from "./TaskRepository";
import { AsyncResult, BaseError, DateTime, fromPromise } from "owlelia";
import { RepetitionTask } from "../domain/entity/RepetitionTask";
import { Repetition } from "../domain/vo/Repetition";

export class TaskRepositoryImpl implements TaskRepository {
  constructor(
    private appHelper: AppHelper,
    private repetitionTasksFilePath: string,
    private holidaysFilePath: string
  ) {}

  loadRepetitionTasks(): AsyncResult<RepetitionTask[], BaseError> {
    return fromPromise(
      this.appHelper.loadFile(this.repetitionTasksFilePath).then((tasksStr) =>
        tasksStr
          .split("\n")
          .filter((line) => !line.startsWith("//") && line.trim() !== "")
          .map((line) => {
            const [name, repetition, baseDate] = line.split(",");
            return RepetitionTask.of({
              name,
              repetition: Repetition.from(repetition),
              baseDate: baseDate ? DateTime.of(baseDate) : undefined,
            });
          })
      )
    );
  }

  loadHolidays(): AsyncResult<DateTime[], BaseError> {
    return fromPromise(
      this.holidaysFilePath
        ? this.appHelper.loadFile(this.holidaysFilePath).then((holidaysStr) =>
            holidaysStr
              .split("\n")
              .filter((line) => !line.startsWith("//") && line.trim() !== "")
              .map(DateTime.of)
          )
        : Promise.resolve([])
    );
  }
}
