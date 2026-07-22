import type { MenuItemsClientConfig } from "@menu-admin-embed-sdk/core";

export type MenuAdminConfig = {
  apiBaseUrl: string;
  getAccessToken: NonNullable<MenuItemsClientConfig["getAccessToken"]>;
  restaurantId: string;
};

export const menuAdminConfig: MenuAdminConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:4000",
  getAccessToken: async () =>
    import.meta.env.VITE_MENU_ADMIN_ACCESS_TOKEN?.trim() || null,
  restaurantId: import.meta.env.VITE_RESTAURANT_ID || "demo-restaurant"
};
