import { ValueObject } from "owlelia";

type Days =
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "11"
  | "12"
  | "13"
  | "14"
  | "15"
  | "16"
  | "17"
  | "18"
  | "19"
  | "20"
  | "21"
  | "22"
  | "23"
  | "24"
  | "25"
  | "26"
  | "27"
  | "28"
  | "29"
  | "30"
  | "31";

export type Pattern =
  | { type: "period"; period: number }
  | { type: "specific"; values: number[] };
export type Token =
  | "every day"
  | "weekday"
  | "weekend"
  | "weekday!"
  | "weekend/holiday"
  | "sun"
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri"
  | "sat"
  | "sun!"
  | "mon!"
  | "tue!"
  | "wed!"
  | "thu!"
  | "fri!"
  | "sat!"
  | `${Days}d`
  | `every ${Days} days`;

interface Props {
  day: Pattern;
  // 0: Sun, 1: Mon, ... 6: Sat
  dayOfWeek: number[];
  dayOfWeekHoliday: number[];
  week: Pattern;
  month: Pattern;
}

const DAY_OF_WEEK_MAPPINGS: { [key: string]: number } = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

const DAY_OF_WEEK_HOLIDAY_MAPPINGS: { [key: string]: number } = {
  "sun!": 0,
  "mon!": 1,
  "tue!": 2,
  "wed!": 3,
  "thu!": 4,
  "fri!": 5,
  "sat!": 6,
};

const _brand = Symbol();
export class Repetition extends ValueObject<Props> {
  private [_brand]: void;

  static get everyDay(): Repetition {
    return new Repetition({
      day: { type: "period", period: 1 },
      dayOfWeek: [0, 1, 2, 3, 4, 5, 6],
      dayOfWeekHoliday: [0, 1, 2, 3, 4, 5, 6],
      week: { type: "period", period: 1 },
      month: { type: "period", period: 1 },
    });
  }

  static get weekday(): Repetition {
    return new Repetition({
      day: { type: "period", period: 1 },
      dayOfWeek: [1, 2, 3, 4, 5],
      dayOfWeekHoliday: [1, 2, 3, 4, 5],
      week: { type: "period", period: 1 },
      month: { type: "period", period: 1 },
    });
  }

  static get weekend(): Repetition {
    return new Repetition({
      day: { type: "period", period: 1 },
      dayOfWeek: [0, 6],
      dayOfWeekHoliday: [0, 6],
      week: { type: "period", period: 1 },
      month: { type: "period", period: 1 },
    });
  }

  static get weekdayNotHoliday(): Repetition {
    return new Repetition({
      day: { type: "period", period: 1 },
      dayOfWeek: [1, 2, 3, 4, 5],
      dayOfWeekHoliday: [],
      week: { type: "period", period: 1 },
      month: { type: "period", period: 1 },
    });
  }

  static get weekendAndHoliday(): Repetition {
    return new Repetition({
      day: { type: "period", period: 1 },
      dayOfWeek: [0, 6],
      dayOfWeekHoliday: [0, 1, 2, 3, 4, 5, 6],
      week: { type: "period", period: 1 },
      month: { type: "period", period: 1 },
    });
  }

  static everyNDay(nDay: number): Repetition {
    return new Repetition({
      day: { type: "period", period: nDay },
      dayOfWeek: [0, 1, 2, 3, 4, 5, 6],
      dayOfWeekHoliday: [0, 1, 2, 3, 4, 5, 6],
      week: { type: "period", period: 1 },
      month: { type: "period", period: 1 },
    });
  }

  get day(): Pattern {
    return this._value.day;
  }
  get dayOfWeek(): number[] {
    return this._value.dayOfWeek;
  }
  get dayOfWeekHoliday(): number[] {
    return this._value.dayOfWeekHoliday;
  }
  get week(): Pattern {
    return this._value.week;
  }
  get month(): Pattern {
    return this._value.month;
  }

  static from(str: string): Repetition | undefined {
    if (!str) {
      return undefined;
    }

    switch (str as Token | string) {
      case "every day":
        return Repetition.everyDay;
      case "weekday":
        return Repetition.weekday;
      case "weekend":
        return Repetition.weekend;
      case "weekday!":
        return Repetition.weekdayNotHoliday;
      case "weekend/holiday":
        return Repetition.weekendAndHoliday;
      default:
        const dayPeriod = str.match(/every (?<period>\d+) day/)?.groups?.period;
        if (dayPeriod) {
          return Repetition.everyNDay(Number(dayPeriod));
        }
    }

    // TODO: しっかりバリデートしたい
    const tokens: Token[] = str.split("/") as Token[];

    const dayOfWeek = tokens
      .map((x) => DAY_OF_WEEK_MAPPINGS[x] ?? DAY_OF_WEEK_HOLIDAY_MAPPINGS[x])
      .filter((x) => x !== undefined);
    const dayOfWeekHoliday = tokens
      .map((x) => DAY_OF_WEEK_MAPPINGS[x])
      .filter((x) => x !== undefined);
    if (dayOfWeek.length > 0 || dayOfWeekHoliday.length > 0) {
      return new Repetition({
        day: { type: "period", period: 1 },
        dayOfWeek,
        dayOfWeekHoliday,
        week: { type: "period", period: 1 },
        month: { type: "period", period: 1 },
      });
    }

    const days = tokens
      .filter((x) => Boolean(x.match(/^[0-9]+d$/)))
      .map((x) => Number(x.slice(0, -1)));
    const to = (x: number[]): Pattern =>
      x.length > 0
        ? { type: "specific", values: x }
        : { type: "period", period: 1 };
    return new Repetition({
      day: to(days),
      dayOfWeek: [0, 1, 2, 3, 4, 5, 6],
      dayOfWeekHoliday: [0, 1, 2, 3, 4, 5, 6],
      week: { type: "period", period: 1 },
      month: { type: "period", period: 1 },
    });
  }
}
