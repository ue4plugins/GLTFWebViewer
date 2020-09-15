/* istanbul ignore file */
import { createMuiTheme } from "@material-ui/core/styles";

declare module "@material-ui/core/styles" {
  interface Theme {
    topbarHeight: number;
    sidebarWidth: number;
  }
  interface ThemeOptions {
    topbarHeight: number;
    sidebarWidth: number;
  }
}

const epicBlue = "#3393FA";
const panel = "#262A2E";
const grey1 = "#1C1E22";
const grey2 = "#20262C";
const grey3 = "#2B323B";
const grey4 = "#8F8F8F";
const white = "#FFFFFF";
const black = "#000000";

export const theme = createMuiTheme({
  palette: {
    type: "dark",
    text: {
      primary: white,
      secondary: grey4,
      disabled: grey4,
    },
    background: {
      default: panel,
      paper: grey1,
    },
    divider: black,
    action: {
      active: white,
    },
    common: {
      black,
      white,
    },
    grey: {
      50: grey4,
      100: grey4,
      200: grey3,
      300: grey3,
      400: grey2,
      500: grey2,
      600: grey2,
      700: grey1,
      800: grey1,
      900: grey1,
    },
    primary: {
      main: epicBlue,
      contrastText: white,
    },
  },
  typography: {
    fontFamily: "'Open Sans', 'Helvetica', 'Arial', sans-serif",
    fontWeightBold: 700,
    fontWeightMedium: 600,
    fontWeightRegular: 400,
    fontWeightLight: 300,
  },
  topbarHeight: 52,
  sidebarWidth: 340,
});
