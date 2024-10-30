import { Repetition, RepetitionTask } from "@tadashi-aikawa/silhouette-core";
import { BaseError, DateTime, fromPromise, type AsyncResult } from "owlelia";
import type { AppHelper } from "../app-helper";
import type { TaskRepository } from "./TaskRepository";

export class TaskRepositoryImpl implements TaskRepository {
  constructor(
    private appHelper: AppHelper,
    private repetitionTasksFilePath: string,
    private holidaysFilePath: string,
  ) {}

  loadRepetitionTasks(): AsyncResult<RepetitionTask[], BaseError> {
    // TODO: 起点日登録ミスは警告したい
    return fromPromise(
      this.appHelper.loadFile(this.repetitionTasksFilePath).then((tasksStr) =>
        tasksStr
          .split("\n")
          .filter((line) => !line.startsWith("//") && line.trim() !== "")
          .map((line) => line.split(","))
          .filter((cols) => cols.length > 1)
          .map(([name, repetitions, baseDate]) => {
            return RepetitionTask.of({
              name: name.replace(/^[ \t]+/, ""),
              repetitions: Repetition.fromRepetitionsStr(repetitions),
              baseDate: baseDate ? DateTime.of(baseDate) : undefined,
              indent: name.match("^[ \t]+")?.at(0) ?? "",
            });
          }),
      ),
    );
  }

  loadHolidays(): AsyncResult<DateTime[], BaseError> {
    // TODO: 日付フォーマットミスは警告したい
    return fromPromise(
      this.holidaysFilePath
        ? this.appHelper.loadFile(this.holidaysFilePath).then(
            (holidaysStr) =>
              holidaysStr
                .split("\n")
                .filter((line) => !line.startsWith("//") && line.trim() !== "")
                .map(DateTime.of)
                .filter((x) => !Number.isNaN(x.date.getTime())), // TODO: owleliaに実装する
          )
        : Promise.resolve([]),
    );
  }
}
