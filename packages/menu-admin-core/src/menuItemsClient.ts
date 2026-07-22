import { MenuItemsApiError } from "./errors";
import type {
  ApiErrorResponse,
  DeleteMenuItemResponse,
  GetAccessToken,
  MenuItem,
  MenuItemInput,
  MenuItemListResponse,
  MenuItemResponse
} from "./types";

export type MenuItemsClient = {
  listMenuItems(): Promise<MenuItem[]>;
  createMenuItem(input: MenuItemInput): Promise<MenuItem>;
  updateMenuItem(itemId: string, input: MenuItemInput): Promise<MenuItem>;
  deleteMenuItem(itemId: string): Promise<void>;
};

export type MenuItemsClientConfig = {
  apiBaseUrl: string;
  restaurantId: string;
  getAccessToken?: GetAccessToken;
  requestTimeoutMs?: number;
};

type RequestJsonOptions = {
  body?: unknown;
  getAccessToken?: GetAccessToken;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  requestTimeoutMs: number;
};

const defaultRequestTimeoutMs = 8000;

export function createMenuItemsClient({
  apiBaseUrl,
  getAccessToken,
  restaurantId,
  requestTimeoutMs
}: MenuItemsClientConfig): MenuItemsClient {
  const baseUrl = apiBaseUrl.trim().replace(/\/+$/, "");
  const timeoutMs = requestTimeoutMs ?? defaultRequestTimeoutMs;
  const menuItemsUrl = `${baseUrl}/api/restaurants/${encodeURIComponent(
    restaurantId
  )}/menu-items`;

  return {
    async listMenuItems() {
      const response = await requestJson<MenuItemListResponse>(menuItemsUrl, {
        getAccessToken,
        method: "GET",
        requestTimeoutMs: timeoutMs
      });
      return response.data;
    },

    async createMenuItem(input) {
      const response = await requestJson<MenuItemResponse>(menuItemsUrl, {
        body: input,
        getAccessToken,
        method: "POST",
        requestTimeoutMs: timeoutMs
      });
      return response.data;
    },

    async updateMenuItem(itemId, input) {
      const response = await requestJson<MenuItemResponse>(
        `${menuItemsUrl}/${encodeURIComponent(itemId)}`,
        {
          body: input,
          getAccessToken,
          method: "PATCH",
          requestTimeoutMs: timeoutMs
        }
      );
      return response.data;
    },

    async deleteMenuItem(itemId) {
      await requestJson<DeleteMenuItemResponse>(
        `${menuItemsUrl}/${encodeURIComponent(itemId)}`,
        {
          getAccessToken,
          method: "DELETE",
          requestTimeoutMs: timeoutMs
        }
      );
    }
  };
}

async function requestJson<T>(
  url: string,
  { body, getAccessToken, method, requestTimeoutMs }: RequestJsonOptions
): Promise<T> {
  let response: Response;
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => {
    controller.abort();
  }, requestTimeoutMs);

  try {
    response = await fetch(url, {
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: await createHeaders(body !== undefined, getAccessToken),
      method,
      signal: controller.signal
    });
  } catch (error) {
    if (error instanceof MenuItemsApiError) {
      throw error;
    }

    if (isAbortError(error)) {
      throw new MenuItemsApiError(
        0,
        "timeout_error",
        "The menu API took too long to respond."
      );
    }

    throw new MenuItemsApiError(
      0,
      "network_error",
      "Could not reach the menu API. Check that the backend is running."
    );
  } finally {
    globalThis.clearTimeout(timeoutId);
  }

  const payload = await parseJson<T | ApiErrorResponse>(response);

  if (!response.ok) {
    const error = isApiErrorResponse(payload)
      ? payload.error
      : {
          code: "server_error",
          message: "The menu API returned an unexpected error."
        };

    throw new MenuItemsApiError(
      response.status,
      error.code,
      error.message,
      error.details
    );
  }

  return payload as T;
}

async function createHeaders(
  hasBody: boolean,
  getAccessToken: GetAccessToken | undefined
) {
  const headers: Record<string, string> = {
    Accept: "application/json"
  };

  if (hasBody) {
    headers["Content-Type"] = "application/json";
  }

  const token = await getToken(getAccessToken);

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function getToken(getAccessToken: GetAccessToken | undefined) {
  if (!getAccessToken) {
    return null;
  }

  try {
    return (await getAccessToken())?.trim() || null;
  } catch {
    throw new MenuItemsApiError(
      0,
      "auth_error",
      "Could not get an access token for the menu API."
    );
  }
}

async function parseJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw new MenuItemsApiError(
      response.status,
      "invalid_json",
      "The menu API returned invalid JSON."
    );
  }
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as ApiErrorResponse).error?.message === "string"
  );
}

function isAbortError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: unknown }).name === "AbortError"
  );
}
