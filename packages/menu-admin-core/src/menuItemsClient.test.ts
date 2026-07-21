import { afterEach, describe, expect, it, vi } from "vitest";
import { createMenuItemsClient } from "./menuItemsClient";

describe("menu items API client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
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

    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.test/api/restaurants/demo%20restaurant/menu-items",
      {
        body: undefined,
        method: "GET",
        headers: {
          Accept: "application/json"
        }
      }
    );
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

    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.test/api/restaurants/demo-restaurant/menu-items",
      {
        body: undefined,
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: "Bearer demo-token"
        }
      }
    );
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
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}
