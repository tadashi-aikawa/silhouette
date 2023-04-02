import type { TimerRepository } from "src/repository/TimerRepository";

export interface TimerService {
  serRepository(repository: TimerRepository): void;
  execute(option: { openAfterRecording?: boolean }): Promise<void>;
  cycleBulletCheckbox(): Promise<void>;
  moveToRecording(): void;
}
