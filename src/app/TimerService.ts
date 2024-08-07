import type { TimerRepository } from "../repository/TimerRepository";
import type { Timer } from "../domain/vo/Timer";

export interface TimerService {
  terminate(): void;
  /**
   * 計測開始/終了時、および計測中の一定間隔ごとに実行するハンドラーを設定します
   */
  setOnTimerHandler(
    handler: (timer: Timer | null) => void,
    intervalMilliSec: number,
  ): void;
  serRepository(repository: TimerRepository): void;
  execute(option: { openAfterRecording?: boolean }): Promise<void>;
  cycleBulletCheckbox(startNextTaskAutomatically: boolean): Promise<void>;
  moveToRecording(): void;
  forceStopRecording(): Promise<void>;
  insertCurrentTime(): void;
}
