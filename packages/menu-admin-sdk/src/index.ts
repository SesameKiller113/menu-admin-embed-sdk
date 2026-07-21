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
  renderPlaceholder(shadowRoot, normalizedOptions);

  return {
    unmount() {
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
    restaurantId,
    theme: {
      ...defaultTheme,
      ...options.theme,
      borderRadius: normalizeBorderRadius(options.theme?.borderRadius)
    }
  };
}

function renderPlaceholder(
  shadowRoot: ShadowRoot,
  { apiBaseUrl, restaurantId, theme }: NormalizedOptions
) {
  const style = document.createElement("style");
  style.textContent = `
    :host {
      all: initial;
      color: var(--menu-admin-sdk-text);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    * {
      box-sizing: border-box;
    }

    .placeholder {
      background: var(--menu-admin-sdk-background);
      border: 1px solid rgba(36, 90, 66, 0.18);
      border-radius: var(--menu-admin-sdk-radius);
      display: grid;
      gap: 8px;
      padding: 20px;
    }

    .eyebrow {
      color: var(--menu-admin-sdk-primary);
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0;
      margin: 0;
      text-transform: uppercase;
    }

    h2,
    p {
      margin: 0;
    }

    h2 {
      font-size: 20px;
      line-height: 1.2;
    }

    p {
      color: color-mix(in srgb, var(--menu-admin-sdk-text) 72%, transparent);
      font-size: 14px;
      line-height: 1.45;
    }
  `;

  const wrapper = document.createElement("section");
  wrapper.className = "placeholder";
  wrapper.style.setProperty("--menu-admin-sdk-background", theme.backgroundColor);
  wrapper.style.setProperty("--menu-admin-sdk-primary", theme.primaryColor);
  wrapper.style.setProperty("--menu-admin-sdk-radius", `${theme.borderRadius}px`);
  wrapper.style.setProperty("--menu-admin-sdk-text", theme.textColor);

  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = "Menu Admin SDK";

  const title = document.createElement("h2");
  title.textContent = "SDK contract ready";

  const body = document.createElement("p");
  body.textContent = `Ready to mount menu-admin for ${restaurantId}.`;

  const api = document.createElement("p");
  api.textContent = `API: ${apiBaseUrl}`;

  wrapper.append(eyebrow, title, body, api);
  shadowRoot.append(style, wrapper);
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
