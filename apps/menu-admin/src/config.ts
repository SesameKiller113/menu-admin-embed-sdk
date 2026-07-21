export type MenuAdminConfig = {
  apiBaseUrl: string;
  restaurantId: string;
};

export const menuAdminConfig: MenuAdminConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:4000",
  restaurantId: import.meta.env.VITE_RESTAURANT_ID || "demo-restaurant"
};
