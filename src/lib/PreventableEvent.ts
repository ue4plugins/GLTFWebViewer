export type PreventableEvent<TEvent extends Event = Event> = TEvent & {
  prevent: boolean;
};
