import { observable, action } from "mobx";

export class SettingsStore {
  public constructor() {
    const urlParams = new URLSearchParams(window.location.search);
    this.showUI = !urlParams.get("hideUI");
    this.showFpsMeter = !!urlParams.get("showFpsMeter");
  }

  @observable
  public showUI: boolean;

  @observable
  public showFpsMeter = false;

  @action.bound
  public toggleFpsMeter(show: boolean) {
    this.showFpsMeter = show;
  }
}
