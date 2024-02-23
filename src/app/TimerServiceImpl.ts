import { Timer } from "../domain/vo/Timer";
import type { TimerService } from "./TimerService";
import type { AppHelper } from "../app-helper";
import { DateTime } from "owlelia";
import { isLineRecording, TimerStatus } from "../domain/vo/TimerStatus";
import type { TimerRepository } from "src/repository/TimerRepository";
import { Notice } from "obsidian";

export class TimerServiceImpl implements TimerService {
  intervalHandler: number | null;
  handleEvent: () => Promise<void>;

  constructor(
    private appHelper: AppHelper,
    private repository: TimerRepository,
  ) {}

  static create(
    appHelper: AppHelper,
    repository: TimerRepository,
  ): TimerService {
    return new TimerServiceImpl(appHelper, repository);
  }

  terminate() {
    if (this.intervalHandler) {
      window.clearInterval(this.intervalHandler);
    }
  }

  setOnTimerHandler(
    handler: (timer: Timer | null) => void,
    intervalMilliSec: number,
  ): void {
    this.handleEvent = async () => {
      const timer = (await this.repository.loadTimer()).orNull();
      handler(timer);
    };
    this.handleEvent();
    this.intervalHandler = window.setInterval(
      () => this.handleEvent(),
      intervalMilliSec,
    );
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
            "計測中のタスクがないため、カーソル配下のタスクを計測済にできません。",
            0,
          );
          return;
        }
        this.appHelper.replaceStringInActiveLine(
          lineTimeStatus.getNextStatusLine(
            line,
            (await this.getTimer()).stop(DateTime.now()),
          ),
        );

        await this.repository.clearTimer();
        break;
      case "neverRecorded":
        if (await this.hasTimer()) {
          new Notice(
            "計測中のタスクがあるため、新たなタスクを計測開始できません。計測中のタスクを思い出せない場合は 'Force stop recording' コマンドを実行し、強制的に計測中のタスクを計測完了させてください。",
            0,
          );
          return;
        }
        await this.repository.saveTimer(
          Timer.of({
            name: lineTimeStatus.parse(line).name,
            startTime: DateTime.now(),
            accumulatedSeconds: 0,
          }),
        );

        this.appHelper.replaceStringInActiveLine(
          lineTimeStatus.getNextStatusLine(line),
        );

        if (option.openAfterRecording) {
          this.appHelper.openLinkInActiveLine({ leaf: "same-tab" });
        }
        break;
      case "recorded":
        if (await this.hasTimer()) {
          new Notice(
            "計測中のタスクがあるため、新たなタスクを計測開始できません。計測中のタスクを思い出せない場合は 'Force stop recording' コマンドを実行し、強制的に計測中のタスクを計測完了させてください。",
            0,
          );
          return;
        }
        const { name, seconds: accumulatedSeconds } =
          lineTimeStatus.parse(line);

        this.appHelper.replaceStringInActiveLine(
          lineTimeStatus.getNextStatusLine(line),
        );

        await this.repository.saveTimer(
          Timer.of({
            name,
            startTime: DateTime.now(),
            accumulatedSeconds,
          }),
        );

        if (option.openAfterRecording) {
          this.appHelper.openLinkInActiveLine({ leaf: "same-tab" });
        }
        break;
    }

    this.handleEvent();
  }

  async cycleBulletCheckbox(
    startNextTaskAutomatically: boolean,
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
