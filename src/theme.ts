/* istanbul ignore file */
import { createMuiTheme } from "@material-ui/core/styles";

declare module "@material-ui/core/styles" {
  interface Theme {
    sidebarWidth: number;
    hotspotSize: number;
  }
  interface ThemeOptions {
    sidebarWidth: number;
    hotspotSize: number;
  }
}

export const theme = createMuiTheme({
  palette: {
    background: {
      default: "#fff",
    },
  },
  sidebarWidth: 300,
  hotspotSize: 40,
});
