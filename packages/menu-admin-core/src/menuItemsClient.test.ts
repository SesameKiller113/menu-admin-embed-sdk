import { afterEach, describe, expect, it, vi } from "vitest";
import { createMenuItemsClient } from "./menuItemsClient";

describe("menu items API client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("builds restaurant-scoped list URLs", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        data: []
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const client = createMenuItemsClient({
      apiBaseUrl: "http://api.test/",
      restaurantId: "demo restaurant"
    });

    await expect(client.listMenuItems()).resolves.toEqual([]);

    const [url, requestOptions] = fetchMock.mock.calls[0];
    expect(url).toBe(
      "http://api.test/api/restaurants/demo%20restaurant/menu-items"
    );
    expect(requestOptions).toMatchObject({
      body: undefined,
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    });
    expect(requestOptions.signal).toBeInstanceOf(AbortSignal);
  });

  it("returns created menu items", async () => {
    const item = {
      id: "item_1",
      restaurantId: "demo-restaurant",
      name: "Soup",
      description: "Tomato soup",
      price: 8.5,
      createdAt: "2026-07-21T00:00:00.000Z",
      updatedAt: "2026-07-21T00:00:00.000Z"
    };
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: item }));
    vi.stubGlobal("fetch", fetchMock);

    const client = createMenuItemsClient({
      apiBaseUrl: "http://api.test",
      restaurantId: "demo-restaurant"
    });

    await expect(
      client.createMenuItem({
        name: "Soup",
        description: "Tomato soup",
        price: 8.5
      })
    ).resolves.toEqual(item);
  });

  it("adds authorization when the host provides a token", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        data: []
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const client = createMenuItemsClient({
      apiBaseUrl: "http://api.test",
      getAccessToken: async () => "demo-token",
      restaurantId: "demo-restaurant"
    });

    await client.listMenuItems();

    const [url, requestOptions] = fetchMock.mock.calls[0];
    expect(url).toBe(
      "http://api.test/api/restaurants/demo-restaurant/menu-items"
    );
    expect(requestOptions).toMatchObject({
      body: undefined,
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer demo-token"
      }
    });
    expect(requestOptions.signal).toBeInstanceOf(AbortSignal);
  });

  it("returns auth errors when the host token provider fails", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const client = createMenuItemsClient({
      apiBaseUrl: "http://api.test",
      getAccessToken: async () => {
        throw new Error("Session expired");
      },
      restaurantId: "demo-restaurant"
    });

    await expect(client.listMenuItems()).rejects.toMatchObject({
      status: 0,
      code: "auth_error",
      message: "Could not get an access token for the menu API."
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("turns JSON API errors into typed errors", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(
        {
          error: {
            code: "bad_request",
            message: "Validation failed",
            details: {
              name: "Name is required"
            }
          }
        },
        400
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const client = createMenuItemsClient({
      apiBaseUrl: "http://api.test",
      restaurantId: "demo-restaurant"
    });

    await expect(
      client.createMenuItem({
        name: "",
        description: "Bad item",
        price: 12
      })
    ).rejects.toMatchObject({
      status: 400,
      code: "bad_request",
      message: "Validation failed",
      details: {
        name: "Name is required"
      }
    });
  });

  it("turns slow API responses into timeout errors", async () => {
    vi.useFakeTimers();

    const fetchMock = vi.fn((_url: string, options: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        options.signal?.addEventListener("abort", () => {
          reject(new DOMException("Request aborted", "AbortError"));
        });
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = createMenuItemsClient({
      apiBaseUrl: "http://api.test",
      requestTimeoutMs: 50,
      restaurantId: "demo-restaurant"
    });

    const request = expect(client.listMenuItems()).rejects.toMatchObject({
      status: 0,
      code: "timeout_error",
      message: "The menu API took too long to respond."
    });

    await vi.advanceTimersByTimeAsync(50);

    await request;
  });
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}
