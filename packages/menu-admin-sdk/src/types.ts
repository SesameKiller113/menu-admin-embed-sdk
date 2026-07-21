export type MaybePromise<T> = T | Promise<T>;

export type MenuAdminAuth = {
  getAccessToken: () => MaybePromise<string | null>;
};

export type MenuAdminTheme = {
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: number;
};

export type MenuAdminSdkError = {
  kind: "config" | "auth" | "network" | "api" | "unknown";
  message: string;
  status?: number;
  code?: string;
};

export type MenuAdminMountOptions = {
  container: HTMLElement;
  restaurantId: string;
  apiBaseUrl: string;
  auth?: MenuAdminAuth;
  theme?: MenuAdminTheme;
  onError?: (error: MenuAdminSdkError) => void;
};

export type MenuAdminHandle = {
  unmount: () => void;
};
