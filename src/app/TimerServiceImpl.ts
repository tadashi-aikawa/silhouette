import { Timer } from "../domain/vo/Timer";
import type { TimerService } from "./TimerService";
import type { AppHelper } from "../app-helper";
import { DateTime } from "owlelia";
import { TimerStatus } from "../domain/vo/TimerStatus";

export class TimerServiceImpl implements TimerService {
  // timerがあるとレコーディング中
  timer?: Timer;

  constructor(private appHelper: AppHelper) {}

  execute() {
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

        this.appHelper.replaceStringInActiveLine(
          lineTimeStatus.getNextStatusLine(line)
        );
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
      this.execute();
      return;
    }
  }
}
