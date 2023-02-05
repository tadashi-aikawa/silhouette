import { DateTime, ValueObject } from "owlelia";

interface Props {
  name: string;
  accumulatedSeconds: number;
  startTime?: DateTime;
}

const _brand = Symbol();
export class Timer extends ValueObject<Props> {
  private [_brand]: void;

  static of(props: Props): Timer {
    return new Timer(props);
  }

  stop(now: DateTime): Timer {
    return new Timer({
      ...this._value,
      startTime: undefined,
      accumulatedSeconds:
        now.diffSeconds(this._value.startTime!) +
        this._value.accumulatedSeconds,
    });
  }

  get accumulatedSeconds(): Props["accumulatedSeconds"] {
    return this._value.accumulatedSeconds;
  }
}
