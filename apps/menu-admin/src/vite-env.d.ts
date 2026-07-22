/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_MENU_ADMIN_ACCESS_TOKEN?: string;
  readonly VITE_RESTAURANT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
