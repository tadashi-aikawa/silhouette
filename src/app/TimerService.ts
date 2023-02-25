export interface TimerService {
  execute(option: { openAfterRecording?: boolean }): void;
  cycleBulletCheckbox(): void;
  moveToRecording(): void;
}
