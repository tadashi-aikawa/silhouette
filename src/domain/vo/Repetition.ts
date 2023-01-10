import { ValueObject } from "owlelia";

export type Pattern = "every" | "every other";
export type Token =
  | "every day"
  | "weekday"
  | "holiday"
  | "every other day"
  | "sun"
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri"
  | "sat"
  | "1d"
  | "2d"
  | "3d"
  | "4d"
  | "5d"
  | "6d"
  | "7d"
  | "8d"
  | "9d"
  | "10d"
  | "11d"
  | "12d"
  | "13d"
  | "14d"
  | "15d"
  | "16d"
  | "17d"
  | "18d"
  | "19d"
  | "20d"
  | "21d"
  | "22d"
  | "23d"
  | "24d"
  | "25d"
  | "26d"
  | "27d"
  | "28d"
  | "29d"
  | "30d"
  | "31d";

interface Props {
  day: number[] | Pattern;
  // 0: Sun, 1: Mon, ... 6: Sat
  dayOfWeek: number[];
  week: number[] | Pattern;
  month: number[] | Pattern;
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
const ALL_DAY_OF_WEEK = [0, 1, 2, 3, 4, 5, 6];

const _brand = Symbol();
export class Repetition extends ValueObject<Props> {
  private [_brand]: void;

  static get everyDay() {
    return new Repetition({
      day: "every",
      dayOfWeek: ALL_DAY_OF_WEEK,
      week: "every",
      month: "every",
    });
  }

  static get everyOtherDay() {
    return new Repetition({
      day: "every other",
      dayOfWeek: ALL_DAY_OF_WEEK,
      week: "every",
      month: "every",
    });
  }

  static get everyWeekDay() {
    return new Repetition({
      day: "every",
      dayOfWeek: [1, 2, 3, 4, 5],
      week: "every",
      month: "every",
    });
  }

  static get everyHoliday() {
    return new Repetition({
      day: "every",
      dayOfWeek: [0, 6],
      week: "every",
      month: "every",
    });
  }

  get day(): number[] | Pattern {
    return this._value.day;
  }
  get dayOfWeek(): number[] {
    return this._value.dayOfWeek;
  }

  static from(str: string): Repetition | undefined {
    if (!str) {
      return undefined;
    }

    // TODO: しっかりバリデートしたい
    const tokens: Token[] = str.split("/") as Token[];

    if (tokens.length === 1) {
      switch (tokens[0]) {
        case "every day":
          return Repetition.everyDay;
        case "weekday":
          return Repetition.everyWeekDay;
        case "holiday":
          return Repetition.everyHoliday;
        case "every other day":
          return Repetition.everyOtherDay;
      }
    }

    const dayOfWeeks = tokens
      .filter((x) => DAY_OF_WEEK_MAPPINGS[x] !== undefined)
      .map((x) => DAY_OF_WEEK_MAPPINGS[x]);
    const days = tokens
      .filter((x) => x.endsWith("d"))
      .map((x) => Number(x.slice(0, -1)));
    return new Repetition({
      day: days.length > 0 ? days : "every",
      dayOfWeek: dayOfWeeks.length > 0 ? dayOfWeeks : ALL_DAY_OF_WEEK,
      week: "every",
      month: "every",
    });
  }
}
