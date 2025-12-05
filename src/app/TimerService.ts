import type { Timer } from "../domain/vo/Timer";
import type { TimerRepository } from "../repository/TimerRepository";
import type { Settings } from "../settings";

/**
 * ready: タイマー準備完了
 * started: タイマー開始
 * stopped: タイマー停止
 * tick: タイマー計測中の定期イベント
 */
export type TimerEvent = "ready" | "started" | "stopped" | "tick";

export interface TimerService {
  terminate(): void;
  /**
   * 計測開始/終了時、および計測中の一定間隔ごとに実行するハンドラーを設定します
   */
  setOnTimerHandler(
    handler: (timer: Timer | null, event: TimerEvent) => void,
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
