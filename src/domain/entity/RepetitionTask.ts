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

  shouldTry(date: DateTime): boolean {
    const p = this._props;

    if (!p.repetition || p.baseDate?.isAfter(date)) {
      return false;
    }

    // TODO: owleliaに実装した方がいい
    if (!p.repetition.dayOfWeek.includes(date.date.getDay())) {
      return false;
    }

    if (p.repetition.day === "every") {
      return true;
    }
    if (p.repetition.day === "every other") {
      if (!p.baseDate) {
        throw new Error(`起点日が登録されていません: ${p.name}`)
      }
      return date.diffDays(p.baseDate) % 2 === 0
    }

    return p.repetition.day.includes(date.day);
  }
}
