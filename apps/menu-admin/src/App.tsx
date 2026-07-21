import { useMemo } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import { createMenuItemsClient } from "@menu-admin-embed-sdk/core";
import {
  MenuAdminApp,
  menuAdminTheme
} from "@menu-admin-embed-sdk/menu-admin-react";
import { menuAdminConfig } from "./config";

export default function App() {
  const client = useMemo(() => createMenuItemsClient(menuAdminConfig), []);

  return (
    <ThemeProvider theme={menuAdminTheme}>
      <CssBaseline />
      <MenuAdminApp
        client={client}
        restaurantId={menuAdminConfig.restaurantId}
      />
    </ThemeProvider>
  );
}
