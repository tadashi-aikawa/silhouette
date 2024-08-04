import { DateTime, Entity } from "owlelia";
import type { Repetition } from "../vo/Repetition";
import { ExhaustiveError } from "../../errors";
import { isHoliday, reverseOffsetWorkdays } from "../../utils/dates";

interface Props {
  name: string;
  repetitions: Repetition[];
  indent?: string;
  baseDate?: DateTime;
}

const _brand = Symbol();
export class RepetitionTask extends Entity<Props> {
  private [_brand]: void;

  static of(props: Props): RepetitionTask {
    return new RepetitionTask(props.name, props);
  }

  cloneWith(partial: Partial<Props>): RepetitionTask {
    return RepetitionTask.of({ ...this._props, ...partial });
  }

  get name(): string {
    return this._props.name;
  }

  get indent(): string {
    return this._props.indent ?? "";
  }

  /**
   * エディタに挿入する形式に変換する
   * WARN: これは必ずしもワンタイムタスクに変換されるわけではない
   */
  toString(): string {
    // XXX: 箇条書きと会社できるタスク名の場合は、タスクではなくメタデータとして扱う
    // XXX: 設計として明らかに問題だが #4 のIssueに最小限のコストで対応するため
    // XXX: 今後、機能追加のために大きな設計/実装変更を行わなければ多分平気
    if (this.name.startsWith("- ") || this.name.startsWith("* ")) {
      return `${this.indent}${this.name}`;
    }

    return `${this.indent}- [ ] ${this.name}`;
  }

  shouldTry(date: DateTime, holidays: DateTime[]): boolean {
    return this._props.repetitions.some((r) =>
      needTaskBy(date, holidays, r, this._props.baseDate),
    );
  }
}

function needTaskBy(
  date: DateTime,
  holidays: DateTime[],
  repetition: Repetition,
  baseDate?: DateTime,
): boolean {
  let targetDate = date.clone();
  if (repetition.dayOffset !== 0) {
    targetDate = date.minusDays(repetition.dayOffset);
  }
  if (repetition.workdayOffset !== 0) {
    const targetDates = reverseOffsetWorkdays(
      date,
      repetition.workdayOffset,
      holidays,
    );
    if (targetDates.length === 0) {
      return false;
    }

    return targetDates.some((d) =>
      needTaskBy(
        d,
        holidays,
        repetition.withOffset({
          dayOffset: 0,
          workdayOffset: 0,
        }),
        baseDate,
      ),
    );
  }

  if (baseDate?.isAfter(targetDate)) {
    return false;
  }

  if (!includesDay(targetDate, holidays, repetition)) {
    return false;
  }

  switch (repetition.special) {
    case undefined:
      break;
    case "beginning of month":
      // 月初まで曜日パターンに引っかからなければOK
      let beginD = targetDate.minusDays(1);
      while (beginD.isAfterOrEquals(targetDate.replaceDay(1), true)) {
        if (includesDay(beginD, holidays, repetition)) {
          return false;
        }
        beginD = beginD.minusDays(1);
      }
      break;
    case "end of month":
      // 月末まで曜日パターンに引っかからなければOK
      let endD = targetDate.plusDays(1);
      while (endD.isBeforeOrEquals(targetDate.endOfMonth(), true)) {
        if (includesDay(endD, holidays, repetition)) {
          return false;
        }
        endD = endD.plusDays(1);
      }
      break;
    default:
      throw new ExhaustiveError(repetition.special);
  }

  if (repetition.day.type === "period") {
    if (repetition.day.period === 1) {
      return true;
    }
    if (!baseDate) {
      return false;
    }
    return targetDate.diffDays(baseDate) % repetition.day.period === 0;
  }

  return repetition.day.values.includes(targetDate.day);
}

function includesDay(
  date: DateTime,
  holidays: DateTime[],
  repetition: Repetition,
): boolean {
  if (isHoliday(date, holidays)) {
    if (
      !repetition.dayOfWeekHoliday.includes(date.date.getDay()) &&
      !repetition.dayOfWeekHoliday.includes(
        date.date.getDay() + 10 * date.nthDayOfWeek,
      )
    ) {
      return false;
    }
  } else {
    if (
      !repetition.dayOfWeek.includes(date.date.getDay()) &&
      !repetition.dayOfWeek.includes(
        date.date.getDay() + 10 * date.nthDayOfWeek,
      )
    ) {
      return false;
    }
  }

  return true;
}
