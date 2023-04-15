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

type WeekNo = 1 | 2 | 3 | 4 | 5;
type DayOfWeekShortName = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";
export type Pattern =
  | { type: "period"; period: number }
  | { type: "specific"; values: number[] };
export type Token =
  | "every day"
  | "weekday"
  | "weekend"
  | "workday"
  | "non workday"
  | DayOfWeekShortName
  | `${DayOfWeekShortName}!`
  | `${WeekNo}${DayOfWeekShortName}`
  | `${WeekNo}${DayOfWeekShortName}!`
  | `${Days}d`
  | `every ${Days} days`
  | "end of month"
  | "workday end of month";

interface Props {
  day: Pattern;
  dayOfWeek: DayOfWeek[];
  dayOfWeekHoliday: DayOfWeek[];
  week: Pattern;
  month: Pattern;
  dayOffset: number;
  special?: "end of month" | "beginning of month";
}

// 0: Sun, 1: Mon, ... 6: Sat
// 10: First sun, 11: First Mon, ...
// 20: Second sun, 21: Second Mon, ...
type DayOfWeek =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 30
  | 31
  | 32
  | 33
  | 34
  | 35
  | 36
  | 40
  | 41
  | 42
  | 43
  | 44
  | 45
  | 46
  | 50
  | 51
  | 52
  | 53
  | 54
  | 55
  | 56;
const DAY_OF_WEEK_MAPPINGS: { [key: string]: DayOfWeek } = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  "1sun": 10,
  "1mon": 11,
  "1tue": 12,
  "1wed": 13,
  "1thu": 14,
  "1fri": 15,
  "1sat": 16,
  "2sun": 20,
  "2mon": 21,
  "2tue": 22,
  "2wed": 23,
  "2thu": 24,
  "2fri": 25,
  "2sat": 26,
  "3sun": 30,
  "3mon": 31,
  "3tue": 32,
  "3wed": 33,
  "3thu": 34,
  "3fri": 35,
  "3sat": 36,
  "4sun": 40,
  "4mon": 41,
  "4tue": 42,
  "4wed": 43,
  "4thu": 44,
  "4fri": 45,
  "4sat": 46,
  "5sun": 50,
  "5mon": 51,
  "5tue": 52,
  "5wed": 53,
  "5thu": 54,
  "5fri": 55,
  "5sat": 56,
};

const DAY_OF_WEEK_HOLIDAY_MAPPINGS: { [key: string]: DayOfWeek } = {
  "sun!": 0,
  "mon!": 1,
  "tue!": 2,
  "wed!": 3,
  "thu!": 4,
  "fri!": 5,
  "sat!": 6,
  "1sun!": 10,
  "1mon!": 11,
  "1tue!": 12,
  "1wed!": 13,
  "1thu!": 14,
  "1fri!": 15,
  "1sat!": 16,
  "2sun!": 20,
  "2mon!": 21,
  "2tue!": 22,
  "2wed!": 23,
  "2thu!": 24,
  "2fri!": 25,
  "2sat!": 26,
  "3sun!": 30,
  "3mon!": 31,
  "3tue!": 32,
  "3wed!": 33,
  "3thu!": 34,
  "3fri!": 35,
  "3sat!": 36,
  "4sun!": 40,
  "4mon!": 41,
  "4tue!": 42,
  "4wed!": 43,
  "4thu!": 44,
  "4fri!": 45,
  "4sat!": 46,
  "5sun!": 50,
  "5mon!": 51,
  "5tue!": 52,
  "5wed!": 53,
  "5thu!": 54,
  "5fri!": 55,
  "5sat!": 56,
};

const repetitionBase = {
  day: { type: "period", period: 1 },
  dayOfWeek: [0, 1, 2, 3, 4, 5, 6] as DayOfWeek[],
  dayOfWeekHoliday: [0, 1, 2, 3, 4, 5, 6] as DayOfWeek[],
  week: { type: "period", period: 1 },
  month: { type: "period", period: 1 },
  dayOffset: 0,
} as const;

const _brand = Symbol();
export class Repetition extends ValueObject<Props> {
  private [_brand]: void;

  static get everyDay(): Repetition {
    return new Repetition(repetitionBase);
  }

  static get weekday(): Repetition {
    return new Repetition({
      ...repetitionBase,
      dayOfWeek: [1, 2, 3, 4, 5],
      dayOfWeekHoliday: [1, 2, 3, 4, 5],
    });
  }

  static get weekend(): Repetition {
    return new Repetition({
      ...repetitionBase,
      dayOfWeek: [0, 6],
      dayOfWeekHoliday: [0, 6],
    });
  }

  static get workday(): Repetition {
    return new Repetition({
      ...repetitionBase,
      dayOfWeek: [1, 2, 3, 4, 5],
      dayOfWeekHoliday: [],
    });
  }

  static get nonWorkday(): Repetition {
    return new Repetition({
      ...repetitionBase,
      dayOfWeek: [0, 6],
      dayOfWeekHoliday: [0, 1, 2, 3, 4, 5, 6],
    });
  }

  static everyNDay(nDay: number): Repetition {
    return new Repetition({
      ...repetitionBase,
      day: { type: "period", period: nDay },
    });
  }

  static get endOfMonth(): Repetition {
    return new Repetition({
      ...repetitionBase,
      special: "end of month",
    });
  }

  static get workdayEndOfMonth(): Repetition {
    return new Repetition({
      ...repetitionBase,
      dayOfWeek: [1, 2, 3, 4, 5],
      dayOfWeekHoliday: [],
      special: "end of month",
    });
  }

  static get beginningOfMonth(): Repetition {
    return new Repetition({
      ...repetitionBase,
      special: "beginning of month",
    });
  }

  static get workdayBeginningOfMonth(): Repetition {
    return new Repetition({
      ...repetitionBase,
      dayOfWeek: [1, 2, 3, 4, 5],
      dayOfWeekHoliday: [],
      special: "beginning of month",
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
  get dayOffset(): number {
    return this._value.dayOffset;
  }
  get special(): Props["special"] {
    return this._value.special;
  }

  withDayOffset(dayOffset: number): Repetition {
    return new Repetition({ ...this._value, dayOffset });
  }

  private static divideTokenWithOffset(
    token: string
  ): [token: string, offset: number] {
    const [tp, pastOffset] = token.split("<");
    if (pastOffset) {
      return [tp, -1 * Number(pastOffset)];
    }

    const [tf, futureOffset] = token.split(">");
    if (futureOffset) {
      return [tf, Number(futureOffset)];
    }

    return [token, 0];
  }

  static from(str: string): Repetition {
    const [token, dayOffset] = this.divideTokenWithOffset(str);

    switch (token as Token | string) {
      case "every day":
        return Repetition.everyDay.withDayOffset(dayOffset);
      case "weekday":
        return Repetition.weekday.withDayOffset(dayOffset);
      case "weekend":
        return Repetition.weekend.withDayOffset(dayOffset);
      case "workday":
        return Repetition.workday.withDayOffset(dayOffset);
      case "non workday":
        return Repetition.nonWorkday.withDayOffset(dayOffset);
      case "end of month":
        return Repetition.endOfMonth.withDayOffset(dayOffset);
      case "workday end of month":
        return Repetition.workdayEndOfMonth.withDayOffset(dayOffset);
      case "beginning of month":
        return Repetition.beginningOfMonth.withDayOffset(dayOffset);
      case "workday beginning of month":
        return Repetition.workdayBeginningOfMonth.withDayOffset(dayOffset);
      default:
        const dayPeriod = token.match(/every (?<period>\d+) day/)?.groups
          ?.period;
        if (dayPeriod) {
          return Repetition.everyNDay(Number(dayPeriod)).withDayOffset(
            dayOffset
          );
        }
    }

    // TODO: しっかりバリデートしたい
    const tokens: Token[] = token.split("/") as Token[];

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
        dayOffset,
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
      dayOffset,
    });
  }
}
