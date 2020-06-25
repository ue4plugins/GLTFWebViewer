/* istanbul ignore file */
import { createMuiTheme } from "@material-ui/core/styles";

declare module "@material-ui/core/styles" {
  interface Theme {
    sidebarWidth: number;
  }
  interface ThemeOptions {
    sidebarWidth: number;
  }
}

export const theme = createMuiTheme({
  palette: {
    background: {
      default: "#fff",
    },
  },
  sidebarWidth: 300,
});
