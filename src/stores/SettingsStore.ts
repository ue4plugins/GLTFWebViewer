import { observable, action, computed } from "mobx";
import { Config } from "../config";

export class SettingsStore {
  @observable
  private _showUI: boolean;

  @observable
  private _showFpsMeter: boolean;

  @observable
  private _showTopbar = false;

  @observable
  private _showSidebar = false;

  @observable
  private _showCameras = false;

  public constructor() {
    const urlParams = new URLSearchParams(window.location.search);
    this._showUI = !urlParams.get("hideUI");
    this._showFpsMeter = !!urlParams.get("showFpsMeter");
  }

  @observable
  public enableDragAndDrop = false;

  @observable
  public topbarTitle?: string;

  @observable
  public topbarLogoUrl?: string;

  @computed
  public get showTopbar(): boolean {
    return this._showUI && this._showTopbar;
  }

  @computed
  public get showSidebar(): boolean {
    return this._showUI && this._showSidebar;
  }

  @computed
  public get showCameras(): boolean {
    return this._showUI && this._showCameras;
  }

  @computed
  public get showFpsMeter(): boolean {
    return this._showUI && this._showFpsMeter;
  }

  @action.bound
  public initFromConfig(config: Config) {
    this.enableDragAndDrop = config.dragAndDrop;
    this.topbarTitle = config.topbarTitle;
    this.topbarLogoUrl = config.topbarLogoUrl;
    this._showTopbar = config.topbar;
    this._showSidebar = config.sidebar;
    this._showCameras = config.cameras;
  }
}
