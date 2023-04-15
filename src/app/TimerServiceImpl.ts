import { Timer } from "../domain/vo/Timer";
import type { TimerService } from "./TimerService";
import type { AppHelper } from "../app-helper";
import { DateTime } from "owlelia";
import { isLineRecording, TimerStatus } from "../domain/vo/TimerStatus";
import type { TimerRepository } from "src/repository/TimerRepository";

export class TimerServiceImpl implements TimerService {
  constructor(
    private appHelper: AppHelper,
    private repository: TimerRepository
  ) {}

  static create(
    appHelper: AppHelper,
    repository: TimerRepository
  ): TimerService {
    return new TimerServiceImpl(appHelper, repository);
  }

  serRepository(repository: TimerRepository): void {
    this.repository = repository;
  }

  private async getTimer(): Promise<Timer> {
    return (await this.repository.loadTimer()).orThrow();
  }

  private hasTimer(): Promise<boolean> {
    return this.repository.hasTimer();
  }

  private async hasNotTimer(): Promise<boolean> {
    return !(await this.hasTimer());
  }

  async execute(option: {
    openAfterRecording?: boolean | undefined;
  }): Promise<void> {
    const line = this.appHelper.getActiveLine() || "";
    const lineTimeStatus = TimerStatus.fromLine(line);
    if (lineTimeStatus.name === "notTask") {
      return;
    }

    switch (lineTimeStatus.name) {
      case "recording":
        if (await this.hasNotTimer()) {
          return;
        }
        this.appHelper.replaceStringInActiveLine(
          lineTimeStatus.getNextStatusLine(
            line,
            (await this.getTimer()).stop(DateTime.now())
          )
        );

        await this.repository.clearTimer();
        break;
      case "neverRecorded":
        if (await this.hasTimer()) {
          return;
        }
        await this.repository.saveTimer(
          Timer.of({
            name: lineTimeStatus.parse(line).name,
            startTime: DateTime.now(),
            accumulatedSeconds: 0,
          })
        );

        this.appHelper.replaceStringInActiveLine(
          lineTimeStatus.getNextStatusLine(line)
        );

        if (option.openAfterRecording) {
          this.appHelper.openLinkInActiveLine({ leaf: "same-tab" });
        }
        break;
      case "recorded":
        if (await this.hasTimer()) {
          return;
        }
        const { name, seconds: accumulatedSeconds } =
          lineTimeStatus.parse(line);

        this.appHelper.replaceStringInActiveLine(
          lineTimeStatus.getNextStatusLine(line)
        );

        await this.repository.saveTimer(
          Timer.of({
            name,
            startTime: DateTime.now(),
            accumulatedSeconds,
          })
        );

        if (option.openAfterRecording) {
          this.appHelper.openLinkInActiveLine({ leaf: "same-tab" });
        }
        break;
    }
  }

  async cycleBulletCheckbox(): Promise<void> {
    if (!this.appHelper.cycleListCheckList()) {
      return;
    }

    if (!this.appHelper.isCheckedCurrentLineTask()) {
      return;
    }

    const line = this.appHelper.getActiveLine() || "";
    const lineTimeStatus = TimerStatus.fromLine(line);
    if (lineTimeStatus.name === "recording") {
      await this.execute({ openAfterRecording: false });
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

  async forceStopRecording(): Promise<void> {
    await this.repository.clearTimer();
  }
}
