import type { TimerRepository } from "src/repository/TimerRepository";

export interface TimerService {
  serRepository(repository: TimerRepository): void;
  execute(option: { openAfterRecording?: boolean }): void;
  cycleBulletCheckbox(): void;
  moveToRecording(): void;
}
