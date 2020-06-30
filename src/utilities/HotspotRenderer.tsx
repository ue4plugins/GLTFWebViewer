import React from "react";
import { render } from "react-dom";
import { ThemeProvider } from "@material-ui/core/styles";
import { HotspotProps, Hotspot } from "../components";
import { theme } from "../theme";

export class HotspotRenderer {
  private _element: HTMLDivElement;

  public constructor(private _parentElem: HTMLElement) {
    this._element = document.createElement("div");
    this._element.style.position = "absolute";
    this._element.style.top = "0px";
    this._element.style.left = "0px";
    this._parentElem.appendChild(this._element);
  }

  public get element() {
    return this._element;
  }

  public render(props: HotspotProps) {
    render(
      <ThemeProvider theme={theme}>
        <Hotspot {...props} />
      </ThemeProvider>,
      this._element,
    );
  }

  public move(x: number, y: number) {
    this._element.style.transform = `translateX(${x}px) translateY(${y}px)`;
  }

  public destroy() {
    this._parentElem.removeChild(this._element);
  }
}
