import { Notice } from "obsidian";
import { DateTime } from "owlelia";
import type { AppHelper } from "../app-helper";
import { Timer } from "../domain/vo/Timer";
import { isLineRecording, TimerStatus } from "../domain/vo/TimerStatus";
import type { TimerRepository } from "../repository/TimerRepository";
import type { Settings } from "../settings";
import { parseMarkdownList } from "../utils/parser";
import { pickPatterns } from "../utils/strings";
import type { TimerEvent, TimerService } from "./TimerService";

export class TimerServiceImpl implements TimerService {
  intervalHandler: number | null = null;
  handleEvent: (timerEvent: TimerEvent) => Promise<void> = async () => {};

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
    this.intervalHandler = null;
  }

  setOnTimerHandler(
    handler: (timer: Timer | null, event: TimerEvent) => void,
    intervalMilliSec: number,
  ): void {
    this.handleEvent = async (timerEvent: TimerEvent) => {
      const timer = (await this.repository.loadTimer()).orNull();
      handler(timer, timerEvent);
    };
    this.handleEvent?.("ready");
    this.intervalHandler = window.setInterval(
      () => this.handleEvent?.("tick"),
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
    openAfterRecording: boolean;
    marks: Settings["marks"] | undefined;
    done?: boolean;
  }): Promise<void> {
    const { openAfterRecording, marks, done = false } = option;

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
        const newMark = marks ? (done ? marks.done : marks.stop) : undefined;
        this.appHelper.replaceStringInActiveLine(
          lineTimeStatus.getNextStatusLine(
            line,
            (await this.getTimer()).stop(DateTime.now()),
            newMark,
          ),
        );

        await this.repository.clearTimer();
        this.handleEvent?.("stopped");
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
          lineTimeStatus.getNextStatusLine(line, option.marks?.recording),
        );

        if (openAfterRecording) {
          this.appHelper.openLinkInActiveLine({ leaf: "same-tab" });
        }

        this.handleEvent?.("started");
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
          lineTimeStatus.getNextStatusLine(line, option.marks?.recording),
        );

        await this.repository.saveTimer(
          Timer.of({
            name,
            startTime: DateTime.now(),
            accumulatedSeconds,
          }),
        );

        if (openAfterRecording) {
          this.appHelper.openLinkInActiveLine({ leaf: "same-tab" });
        }
        this.handleEvent?.("started");
        break;
    }
  }

  async cycleBulletCheckbox(option?: {
    startNextTaskAutomatically?: boolean;
    marks?: Settings["marks"] | undefined;
  }): Promise<void> {
    const { startNextTaskAutomatically = false, marks } = option || {};

    const line = this.appHelper.getActiveLine() || "";
    const lineTimeStatus = TimerStatus.fromLine(line);
    if (lineTimeStatus.name !== "recording") {
      this.appHelper.cycleListCheckList();
      return;
    }

    await this.execute({
      openAfterRecording: false,
      marks,
      done: true,
    });

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

    await this.execute({
      openAfterRecording: false,
      marks,
    });
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

  insertCurrentTime(): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const activeLine = this.appHelper.getActiveLine() ?? "";
    const { prefix, content } = parseMarkdownList(activeLine);

    const { startTime, contentWithoutTime } = pickPatterns(
      content,
      /^((?<startTime>\d{2}:\d{2}) |)(- (?<endTime>\d{2}:\d{2}) |)(?<contentWithoutTime>.+)/g,
    );

    const now = DateTime.now().format("HH:mm");

    this.appHelper.replaceStringInActiveLine(
      startTime
        ? `${prefix}${startTime} - ${now} ${contentWithoutTime ?? ""}`
        : `${prefix}${now} ${contentWithoutTime ?? ""}`,
      { cursor: "last" },
    );
  }
}
