import type { AsyncResult, BaseError } from "owlelia";
import type { Timer } from "../domain/vo/Timer";

export interface TimerRepository {
  hasTimer(): Promise<boolean>;
  loadTimer(): AsyncResult<Timer, BaseError>;
  saveTimer(timer: Timer): AsyncResult<void, BaseError>;
  clearTimer(): AsyncResult<void, BaseError>;
}
