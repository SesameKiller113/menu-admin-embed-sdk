import type {
  ApiErrorResponse,
  DeleteMenuItemResponse,
  MenuItem,
  MenuItemInput,
  MenuItemListResponse,
  MenuItemResponse
} from "../types";

export type MenuItemsClient = {
  listMenuItems(): Promise<MenuItem[]>;
  createMenuItem(input: MenuItemInput): Promise<MenuItem>;
  updateMenuItem(itemId: string, input: MenuItemInput): Promise<MenuItem>;
  deleteMenuItem(itemId: string): Promise<void>;
};

export type MenuItemsClientConfig = {
  apiBaseUrl: string;
  restaurantId: string;
};

export class MenuItemsApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: Record<string, string>
  ) {
    super(message);
    this.name = "MenuItemsApiError";
  }
}

export function createMenuItemsClient({
  apiBaseUrl,
  restaurantId
}: MenuItemsClientConfig): MenuItemsClient {
  const baseUrl = apiBaseUrl.replace(/\/+$/, "");
  const menuItemsUrl = `${baseUrl}/api/restaurants/${encodeURIComponent(
    restaurantId
  )}/menu-items`;

  return {
    async listMenuItems() {
      const response = await requestJson<MenuItemListResponse>(menuItemsUrl, {
        method: "GET"
      });
      return response.data;
    },

    async createMenuItem(input) {
      const response = await requestJson<MenuItemResponse>(menuItemsUrl, {
        method: "POST",
        body: JSON.stringify(input)
      });
      return response.data;
    },

    async updateMenuItem(itemId, input) {
      const response = await requestJson<MenuItemResponse>(
        `${menuItemsUrl}/${encodeURIComponent(itemId)}`,
        {
          method: "PATCH",
          body: JSON.stringify(input)
        }
      );
      return response.data;
    },

    async deleteMenuItem(itemId) {
      await requestJson<DeleteMenuItemResponse>(
        `${menuItemsUrl}/${encodeURIComponent(itemId)}`,
        {
          method: "DELETE"
        }
      );
    }
  };
}

async function requestJson<T>(url: string, init: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {})
      }
    });
  } catch {
    throw new MenuItemsApiError(
      0,
      "network_error",
      "Could not reach the menu API. Check that the backend is running."
    );
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
