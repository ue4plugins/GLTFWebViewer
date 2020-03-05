type AnyContext = any; // eslint-disable-line
type AnyParameter = any; // eslint-disable-line

export class AnimationEvent {
  public triggered = false;
  public triggerTime = -1;

  public constructor(
    public name: string,
    public time: number,
    public fnCallback: AnimationEventCallback,
    public context: AnyContext,
    public parameter: AnyParameter,
  ) {
    if (!this.context) {
      this.context = this;
    }
  }

  public invoke() {
    if (this.fnCallback) {
      this.fnCallback.call(this.context, this.parameter);
      this.triggered = true;
    }
  }

  public clone() {
    return new AnimationEvent(
      this.name,
      this.time,
      this.fnCallback,
      this.context,
      this.parameter,
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnimationEventCallback = (param?: any) => void;
