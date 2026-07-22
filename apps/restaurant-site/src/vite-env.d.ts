/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MENU_ADMIN_ACCESS_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
