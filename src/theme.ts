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
const white = "#FFFFFF";
const grey50 = "#EFEFF0";
const grey100 = "#EFEFF0";
const grey200 = "#BBBBBD";
const grey300 = "#93989F";
const grey400 = "#464E59";
const grey500 = "#2B323B";
const grey600 = "#252B32";
const grey700 = "#20262C";
const grey800 = "#1D2126";
const grey900 = "#1C1E22";
const black = "#000000";

export const theme = createMuiTheme({
  palette: {
    type: "dark",
    text: {
      primary: white,
      secondary: grey200,
      disabled: grey300,
    },
    background: {
      default: grey900,
      paper: grey900,
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
      50: grey50,
      100: grey100,
      200: grey200,
      300: grey300,
      400: grey400,
      500: grey500,
      600: grey600,
      700: grey700,
      800: grey800,
      900: grey900,
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
