import { DateTime, Entity } from "owlelia";
import { Repetition } from "../vo/Repetition";

interface Props {
  name: string;
  baseDate?: DateTime;
  repetition?: Repetition;
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

  shouldTry(date: DateTime, holidays: DateTime[]): boolean {
    const p = this._props;

    if (!p.repetition || p.baseDate?.isAfter(date)) {
      return false;
    }

    // TODO: owleliaに実装した方がいい
    const isHoliday = holidays.some((x) => x.equals(date));
    if (isHoliday) {
      if (!p.repetition.dayOfWeekHoliday.includes(date.date.getDay())) {
        return false;
      }
    } else {
      if (!p.repetition.dayOfWeek.includes(date.date.getDay())) {
        return false;
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
