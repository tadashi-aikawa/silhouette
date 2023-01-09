import { Entity } from "owlelia";

interface Props {
  name: string;
  // FIXME: あとで実装する
  repetition?: any;
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
}
