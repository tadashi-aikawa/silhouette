import { Timer } from "../domain/vo/Timer";
import type { TimerService } from "./TimerService";
import type { AppHelper } from "../app-helper";
import { DateTime } from "owlelia";
import { isLineRecording, TimerStatus } from "../domain/vo/TimerStatus";
import type { TimerRepository } from "src/repository/TimerRepository";
import { Notice } from "obsidian";

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
          new Notice(
            "No recording tasks exist, so you can't stop a task under the cursor.",
            0
          );
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
          new Notice(
            "There is a recording task, so you can't start a new task without stopping the recording task. If you don't remember, use the 'Force stop recording' command to make it stop right away.",
            0
          );
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
          new Notice(
            "There is a recording task, so you can't start a new task without stopping the recording task. If you don't remember, use the 'Force stop recording' command to make it stop right away.",
            0
          );
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

  async cycleBulletCheckbox(
    startNextTaskAutomatically: boolean
  ): Promise<void> {
    if (!this.appHelper.cycleListCheckList()) {
      return;
    }

    if (!this.appHelper.isCheckedCurrentLineTask()) {
      return;
    }

    const line = this.appHelper.getActiveLine() || "";
    const lineTimeStatus = TimerStatus.fromLine(line);
    if (lineTimeStatus.name !== "recording") {
      return;
    }
    await this.execute({ openAfterRecording: false });

    if (!startNextTaskAutomatically) {
      return;
    }

    const nextLine = this.appHelper.getActiveNextLine() || "";
    const nextLineTimeStatus = TimerStatus.fromLine(nextLine);
    if (nextLineTimeStatus.name === "notTask") {
      return;
    }

    this.appHelper.moveNextLine();
    if (this.appHelper.isCheckedCurrentLineTask()) {
      return;
    }

    await this.execute({ openAfterRecording: false });
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
