import type { AppHelper } from "../app-helper";
import { type AsyncResult, BaseError, DateTime, fromPromise } from "owlelia";
import type { TimerRepository } from "./TimerRepository";
import { Timer } from "src/domain/vo/Timer";
import { normalizePath } from "obsidian";

interface TimerDict {
  name: string;
  accumulatedSeconds: number;
  startTime?: number;
}

export class TimerRepositoryImpl implements TimerRepository {
  constructor(
    private appHelper: AppHelper,
    private timerStorageFilePath: string,
  ) {}

  get normalizedTimerStoragePath(): string {
    return normalizePath(this.timerStorageFilePath);
  }

  hasTimer(): Promise<boolean> {
    return this.appHelper.exists(this.normalizedTimerStoragePath);
  }

  loadTimer(): AsyncResult<Timer, BaseError> {
    return fromPromise(
      this.appHelper
        .loadJson<TimerDict>(this.normalizedTimerStoragePath)
        .then((x) =>
          Timer.of({
            name: x.name,
            accumulatedSeconds: x.accumulatedSeconds,
            startTime: x.startTime ? DateTime.of(x.startTime) : undefined,
          }),
        ),
    );
  }

  saveTimer(timer: Timer): AsyncResult<void, BaseError> {
    return fromPromise(
      this.appHelper.saveJson<TimerDict>(this.normalizedTimerStoragePath, {
        name: timer.name,
        accumulatedSeconds: timer.accumulatedSeconds,
        startTime: timer.startTime?.unix,
      }),
    );
  }

  clearTimer(): AsyncResult<void, BaseError> {
    return fromPromise(
      this.appHelper.deleteFileIfExists(this.normalizedTimerStoragePath),
    );
  }
}
