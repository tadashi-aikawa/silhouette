import { DateTime, Entity } from "owlelia";
import type { Repetition } from "../vo/Repetition";
import { ExhaustiveError } from "../../errors";

interface Props {
  name: string;
  repetition: Repetition;
  baseDate?: DateTime;
}

const _brand = Symbol();
export class RepetitionTask extends Entity<Props> {
  private [_brand]: void;

  static of(props: Props): RepetitionTask {
    return new RepetitionTask(props.name, props);
  }

  get name(): string {
    return this._props.name;
  }

  includesDay(date: DateTime, holidays: DateTime[]): boolean {
    // TODO: owleliaに実装した方がいい
    const isHoliday = holidays.some((x) => x.equals(date));
    if (isHoliday) {
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

  shouldTry(date: DateTime, holidays: DateTime[]): boolean {
    const p = this._props;

    if (p.baseDate?.isAfter(date)) {
      return false;
    }

    // TODO: owleliaに実装した方がいい
    if (!this.includesDay(date, holidays)) {
      return false;
    }

    switch (p.repetition.special) {
      case undefined:
        break;
      case "beginning of month":
        // 月初まで曜日パターンに引っかからなければOK
        let beginD = date.minusDays(1);
        while (beginD.isAfterOrEquals(date.replaceDay(1), true)) {
          if (this.includesDay(beginD, holidays)) {
            return false;
          }
          beginD = beginD.minusDays(1);
        }
        break;
      case "end of month":
        // 月末まで曜日パターンに引っかからなければOK
        let endD = date.plusDays(1);
        while (endD.isBeforeOrEquals(date.endOfMonth(), true)) {
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
      return date.diffDays(p.baseDate) % p.repetition.day.period === 0;
    }

    return p.repetition.day.values.includes(date.day);
  }
}
