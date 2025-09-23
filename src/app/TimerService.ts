import type { Timer } from "../domain/vo/Timer";
import type { TimerRepository } from "../repository/TimerRepository";
import type { Settings } from "../settings";

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

  /**
   * タイマーのボタンを押したときの動作を実行します
   * ステータスが切り替わります
   */
  execute(option: {
    openAfterRecording: boolean;
    marks?: Settings["marks"] | undefined;
    // タスクの完了を意図した操作かどうか (微妙なIFだが...)
    done?: boolean;
  }): Promise<void>;

  cycleBulletCheckbox(option?: {
    startNextTaskAutomatically?: boolean;
    marks?: Settings["marks"] | undefined;
  }): Promise<void>;

  moveToRecording(): void;
  forceStopRecording(): Promise<void>;
  insertCurrentTime(): void;
}
