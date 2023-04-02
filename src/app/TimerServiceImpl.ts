import { Timer } from "../domain/vo/Timer";
import type { TimerService } from "./TimerService";
import type { AppHelper } from "../app-helper";
import { BaseError, DateTime, ok, err, type AsyncResult } from "owlelia";
import { isLineRecording, TimerStatus } from "../domain/vo/TimerStatus";
import type { TimerRepository } from "src/repository/TimerRepository";

export class TimerServiceImpl implements TimerService {
  // timerがあるとレコーディング中
  timer?: Timer;

  constructor(
    private appHelper: AppHelper,
    private repository: TimerRepository
  ) {}

  static async create(
    appHelper: AppHelper,
    repository: TimerRepository
  ): AsyncResult<TimerService, BaseError> {
    const ins = new TimerServiceImpl(appHelper, repository);

    if (await ins.repository.hasTimer()) {
      const timerOrErr = await ins.repository.loadTimer();
      if (timerOrErr.isErr()) {
        return err(timerOrErr.error);
      }

      ins.timer = timerOrErr.value;
    }

    return ok(ins);
  }

  serRepository(repository: TimerRepository): void {
    this.repository = repository;
  }

  execute(option: { openAfterRecording?: boolean | undefined }): void {
    const line = this.appHelper.getActiveLine() || "";
    const lineTimeStatus = TimerStatus.fromLine(line);
    if (lineTimeStatus.name === "notTask") {
      return;
    }

    switch (lineTimeStatus.name) {
      case "recording":
        if (!this.timer) {
          return;
        }
        this.appHelper.replaceStringInActiveLine(
          lineTimeStatus.getNextStatusLine(
            line,
            this.timer.stop(DateTime.now())
          )
        );

        this.timer = undefined;
        this.repository.clearTimer();
        break;
      case "neverRecorded":
        if (this.timer) {
          return;
        }
        this.timer = Timer.of({
          name: lineTimeStatus.parse(line).name,
          startTime: DateTime.now(),
          accumulatedSeconds: 0,
        });
        this.repository.saveTimer(this.timer);

        this.appHelper.replaceStringInActiveLine(
          lineTimeStatus.getNextStatusLine(line)
        );

        if (option.openAfterRecording) {
          this.appHelper.openLinkInActiveLine({ leaf: "same-tab" });
        }
        break;
      case "recorded":
        if (this.timer) {
          return;
        }
        const { name, seconds: accumulatedSeconds } =
          lineTimeStatus.parse(line);

        this.appHelper.replaceStringInActiveLine(
          lineTimeStatus.getNextStatusLine(line)
        );

        this.timer = Timer.of({
          name,
          startTime: DateTime.now(),
          accumulatedSeconds,
        });
        this.repository.saveTimer(this.timer);

        if (option.openAfterRecording) {
          this.appHelper.openLinkInActiveLine({ leaf: "same-tab" });
        }
        break;
    }
  }

  cycleBulletCheckbox(): void {
    if (!this.appHelper.cycleListCheckList()) {
      return;
    }

    if (!this.appHelper.isCheckedCurrentLineTask()) {
      return;
    }

    const line = this.appHelper.getActiveLine() || "";
    const lineTimeStatus = TimerStatus.fromLine(line);
    if (lineTimeStatus.name === "recording") {
      this.execute({ openAfterRecording: false });
      return;
    }
  }

  moveToRecording(): void {
    const content = this.appHelper.getActiveFileContent();
    if (!content) {
      return;
    }

    const recordingLineIndex = content.split("\n").findIndex(isLineRecording);
    if (recordingLineIndex !== -1) {
      this.appHelper
        .getActiveMarkdownEditor()
        ?.setCursor({ line: recordingLineIndex, ch: 0 });
    }
  }
}
