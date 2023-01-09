import { BaseError, DateTime, Nullable } from "owlelia";

export interface TaskService {
  insertTasksToDailyNote(date: DateTime): Promise<Nullable<BaseError>>;
}
