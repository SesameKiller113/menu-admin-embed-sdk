import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  createMenuItemsClient,
  MenuItemsApiError
} from "@menu-admin-embed-sdk/core";
import {
  MenuAdminApp,
  menuAdminTheme
} from "@menu-admin-embed-sdk/menu-admin-react";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import type {
  MenuAdminHandle,
  MenuAdminMountOptions,
  MenuAdminSdkError,
  MenuAdminTheme
} from "./types";

export type {
  MaybePromise,
  MenuAdminAuth,
  MenuAdminHandle,
  MenuAdminMountOptions,
  MenuAdminSdkError,
  MenuAdminTheme
} from "./types";

type NormalizedOptions = {
  apiBaseUrl: string;
  getAccessToken?: NonNullable<MenuAdminMountOptions["auth"]>["getAccessToken"];
  onError?: MenuAdminMountOptions["onError"];
  restaurantId: string;
  theme: Required<MenuAdminTheme>;
};

const defaultTheme: Required<MenuAdminTheme> = {
  backgroundColor: "#ffffff",
  borderRadius: 8,
  primaryColor: "#245a42",
  textColor: "#1f2c27"
};

export function mountMenuAdmin(
  options: MenuAdminMountOptions
): MenuAdminHandle {
  const normalizedOptions = normalizeOptions(options);
  const shadowHost = document.createElement("div");

  shadowHost.setAttribute("data-menu-admin-sdk", "root");
  options.container.append(shadowHost);

  const shadowRoot = shadowHost.attachShadow({ mode: "open" });
  const mountPoint = createShadowMount(shadowRoot);
  const root = createRoot(mountPoint);
  const client = createMenuItemsClient({
    apiBaseUrl: normalizedOptions.apiBaseUrl,
    getAccessToken: normalizedOptions.getAccessToken,
    restaurantId: normalizedOptions.restaurantId
  });
  const emotionCache = createCache({
    container: shadowRoot,
    key: "menu-admin-sdk"
  });
  const theme = createSdkTheme(normalizedOptions.theme, mountPoint);
  let isMounted = true;

  root.render(
    createElement(
      CacheProvider,
      { value: emotionCache },
      createElement(
        ThemeProvider,
        { theme },
        createElement(CssBaseline),
        createElement(MenuAdminApp, {
          client,
          onError: (error) =>
            normalizedOptions.onError?.(toSdkError(error)),
          restaurantId: normalizedOptions.restaurantId
        })
      )
    )
  );

  return {
    unmount() {
      if (!isMounted) {
        return;
      }

      isMounted = false;
      root.unmount();
      shadowHost.remove();
    }
  };
}

function normalizeOptions(options: MenuAdminMountOptions): NormalizedOptions {
  if (!isHTMLElement(options.container)) {
    throw createSdkError({
      kind: "config",
      message: "MenuAdmin SDK requires a valid HTMLElement container."
    });
  }

  const restaurantId = normalizeRequiredString(
    options.restaurantId,
    "restaurantId"
  );
  const apiBaseUrl = normalizeApiBaseUrl(options.apiBaseUrl);

  return {
    apiBaseUrl,
    getAccessToken: options.auth?.getAccessToken,
    onError: options.onError,
    restaurantId,
    theme: {
      ...defaultTheme,
      ...options.theme,
      borderRadius: normalizeBorderRadius(options.theme?.borderRadius)
    }
  };
}

function createShadowMount(shadowRoot: ShadowRoot) {
  const style = document.createElement("style");
  style.textContent = `
    :host {
      all: initial;
      display: block;
    }
  `;

  const mountPoint = document.createElement("div");
  mountPoint.setAttribute("data-menu-admin-sdk-mount", "");
  shadowRoot.append(style, mountPoint);

  return mountPoint;
}

function createSdkTheme(
  theme: Required<MenuAdminTheme>,
  portalContainer: HTMLElement
) {
  return createTheme(menuAdminTheme, {
    components: {
      MuiModal: {
        defaultProps: {
          container: portalContainer
        }
      },
      MuiPopover: {
        defaultProps: {
          container: portalContainer
        }
      },
      MuiPopper: {
        defaultProps: {
          container: portalContainer
        }
      }
    },
    palette: {
      background: {
        default: theme.backgroundColor,
        paper: theme.backgroundColor
      },
      primary: {
        main: theme.primaryColor
      },
      text: {
        primary: theme.textColor
      }
    },
    shape: {
      borderRadius: theme.borderRadius
    }
  });
}

function normalizeRequiredString(value: string, fieldName: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    throw createSdkError({
      kind: "config",
      message: `MenuAdmin SDK requires ${fieldName}.`
    });
  }

  return normalizedValue;
}

function normalizeApiBaseUrl(value: string) {
  const normalizedValue = normalizeRequiredString(value, "apiBaseUrl");

  try {
    const baseUrl = new URL(normalizedValue, globalThis.location?.href);
    return baseUrl.toString().replace(/\/+$/, "");
  } catch {
    throw createSdkError({
      kind: "config",
      message: "MenuAdmin SDK requires apiBaseUrl to be a valid URL."
    });
  }
}

function normalizeBorderRadius(value: number | undefined) {
  if (value === undefined) {
    return defaultTheme.borderRadius;
  }

  if (!Number.isFinite(value) || value < 0) {
    throw createSdkError({
      kind: "config",
      message: "MenuAdmin SDK theme.borderRadius must be a non-negative number."
    });
  }

  return value;
}

function isHTMLElement(value: unknown): value is HTMLElement {
  return typeof HTMLElement !== "undefined" && value instanceof HTMLElement;
}

function createSdkError(error: MenuAdminSdkError) {
  const runtimeError = new Error(error.message) as Error & MenuAdminSdkError;

  runtimeError.name = "MenuAdminSdkError";
  runtimeError.kind = error.kind;
  runtimeError.status = error.status;
  runtimeError.code = error.code;

  return runtimeError;
}

function toSdkError(error: Error): MenuAdminSdkError {
  if (error instanceof MenuItemsApiError) {
    return {
      code: error.code,
      kind: getSdkErrorKind(error),
      message: error.message,
      status: error.status
    };
  }

  return {
    kind: "unknown",
    message: error.message
  };
}

function getSdkErrorKind(error: MenuItemsApiError): MenuAdminSdkError["kind"] {
  if (error.code === "auth_error") {
    return "auth";
  }

  if (error.status === 0) {
    return "network";
  }

  return "api";
}
