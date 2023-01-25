import { DateTime, Entity } from "owlelia";
import { Repetition } from "../vo/Repetition";

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
        !this._props.repetition.dayOfWeekHoliday.includes(date.date.getDay())
      ) {
        return false;
      }
    } else {
      if (!this._props.repetition.dayOfWeek.includes(date.date.getDay())) {
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

    if (p.repetition.endOfMonth) {
      // 月末まで曜日パターンに引っかからなければOK
      let d = date.plusDays(1);
      while (d.isBefore(date.endOfMonth())) {
        if (this.includesDay(d, holidays)) {
          return false;
        }
        d = d.plusDays(1);
      }
    }

    if (p.repetition.day.type === "period") {
      if (p.repetition.day.period === 1) {
        return true;
      }
      if (!p.baseDate) {
        throw new Error(`起点日が登録されていません: ${p.name}`);
      }
      return date.diffDays(p.baseDate) % p.repetition.day.period === 0;
    }

    return p.repetition.day.values.includes(date.day);
  }
}
