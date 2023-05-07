import { DateTime, Entity } from "owlelia";
import type { Repetition } from "../vo/Repetition";
import { ExhaustiveError } from "../../errors";
import { isHoliday, reverseOffsetWorkdays } from "../../utils/dates";

interface Props {
  name: string;
  repetition: Repetition;
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

  shouldTry(date: DateTime, holidays: DateTime[]): boolean {
    const p = this._props;

    let targetDate = date.clone();
    if (p.repetition.dayOffset !== 0) {
      targetDate = date.minusDays(p.repetition.dayOffset);
    }
    if (p.repetition.workdayOffset !== 0) {
      const targetDates = reverseOffsetWorkdays(
        date,
        p.repetition.workdayOffset,
        holidays
      );
      if (targetDates.length === 0) {
        return false;
      }

      const cloned = this.cloneWith({
        repetition: p.repetition.withOffset({
          dayOffset: 0,
          workdayOffset: 0,
        }),
      });
      return targetDates.some((d) => cloned.shouldTry(d, holidays));
    }

    if (p.baseDate?.isAfter(targetDate)) {
      return false;
    }

    if (!this.includesDay(targetDate, holidays)) {
      return false;
    }

    switch (p.repetition.special) {
      case undefined:
        break;
      case "beginning of month":
        // 月初まで曜日パターンに引っかからなければOK
        let beginD = targetDate.minusDays(1);
        while (beginD.isAfterOrEquals(targetDate.replaceDay(1), true)) {
          if (this.includesDay(beginD, holidays)) {
            return false;
          }
          beginD = beginD.minusDays(1);
        }
        break;
      case "end of month":
        // 月末まで曜日パターンに引っかからなければOK
        let endD = targetDate.plusDays(1);
        while (endD.isBeforeOrEquals(targetDate.endOfMonth(), true)) {
          if (this.includesDay(endD, holidays)) {
            return false;
          }
          endD = endD.plusDays(1);
        }
        break;
      default:
        throw new ExhaustiveError(p.repetition.special);
    }

    if (p.repetition.day.type === "period") {
      if (p.repetition.day.period === 1) {
        return true;
      }
      if (!p.baseDate) {
        return false;
      }
      return targetDate.diffDays(p.baseDate) % p.repetition.day.period === 0;
    }

    return p.repetition.day.values.includes(targetDate.day);
  }

  private includesDay(date: DateTime, holidays: DateTime[]): boolean {
    if (isHoliday(date, holidays)) {
      if (
        !this._props.repetition.dayOfWeekHoliday.includes(date.date.getDay()) &&
        !this._props.repetition.dayOfWeekHoliday.includes(
          date.date.getDay() + 10 * date.nthDayOfWeek
        )
      ) {
        return false;
      }
    } else {
      if (
        !this._props.repetition.dayOfWeek.includes(date.date.getDay()) &&
        !this._props.repetition.dayOfWeek.includes(
          date.date.getDay() + 10 * date.nthDayOfWeek
        )
      ) {
        return false;
      }
    }

    return true;
  }
}
