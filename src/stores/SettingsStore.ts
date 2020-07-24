import { observable, action } from "mobx";

export class SettingsStore {
  public constructor() {
    const urlParams = new URLSearchParams(window.location.search);
    this.showUI = !urlParams.get("hideUI");
  }

  @observable
  public showUI: boolean;

  @observable
  public showFpsMeter = true;

  @action.bound
  public toggleFpsMeter(show: boolean) {
    this.showFpsMeter = show;
  }
}
