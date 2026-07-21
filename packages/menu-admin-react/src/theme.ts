import { createTheme } from "@mui/material/styles";

export const menuAdminTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2563eb"
    },
    secondary: {
      main: "#0f766e"
    },
    background: {
      default: "#f6f7fb",
      paper: "#ffffff"
    }
  },
  shape: {
    borderRadius: 8
  },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontSize: "2rem",
      fontWeight: 700,
      letterSpacing: 0
    },
    h2: {
      fontSize: "1.25rem",
      fontWeight: 700,
      letterSpacing: 0
    }
  }
});
