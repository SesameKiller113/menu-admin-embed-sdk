import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { MenuItem, MenuItemsClient } from "@menu-admin-embed-sdk/core";
import { describe, expect, it, vi } from "vitest";
import { MenuAdminApp } from "./App";

const item: MenuItem = {
  id: "item_1",
  restaurantId: "demo-restaurant",
  name: "Spicy Rigatoni",
  description: "Tomato cream sauce",
  price: 19.5,
  createdAt: "2026-07-21T00:00:00.000Z",
  updatedAt: "2026-07-21T00:00:00.000Z"
};

describe("MenuAdminApp", () => {
  it("shows loading and then menu items", async () => {
    const client = createClient({
      listMenuItems: vi.fn().mockResolvedValue([item])
    });

    render(<MenuAdminApp client={client} restaurantId="demo-restaurant" />);

    expect(screen.getByText("Loading menu items...")).toBeInTheDocument();
    expect(await screen.findByText("Spicy Rigatoni")).toBeInTheDocument();
    expect(screen.getByText("$19.50")).toBeInTheDocument();
  });

  it("shows load errors", async () => {
    const client = createClient({
      listMenuItems: vi.fn().mockRejectedValue(new Error("Backend is down"))
    });

    render(<MenuAdminApp client={client} restaurantId="demo-restaurant" />);

    expect(
      await screen.findByText(/Could not load menu items. Backend is down/)
    ).toBeInTheDocument();
  });

  it("creates a menu item through the API client", async () => {
    const createdItem = {
      ...item,
      id: "item_2",
      name: "Lemon Chicken",
      description: "Herbs and greens",
      price: 24
    };
    const client = createClient({
      listMenuItems: vi.fn().mockResolvedValue([]),
      createMenuItem: vi.fn().mockResolvedValue(createdItem)
    });
    const user = userEvent.setup();

    render(<MenuAdminApp client={client} restaurantId="demo-restaurant" />);

    await screen.findByText("No menu items yet.");
    await user.type(screen.getByLabelText("Name"), "Lemon Chicken");
    await user.type(screen.getByLabelText("Description"), "Herbs and greens");
    await user.type(screen.getByLabelText("Price"), "24");
    await user.click(screen.getByRole("button", { name: /Add item/ }));

    await waitFor(() => {
      expect(client.createMenuItem).toHaveBeenCalledWith({
        name: "Lemon Chicken",
        description: "Herbs and greens",
        price: 24
      });
    });
    expect(await screen.findByText("Lemon Chicken")).toBeInTheDocument();
  });
});

function createClient(overrides: Partial<MenuItemsClient>): MenuItemsClient {
  return {
    listMenuItems: vi.fn().mockResolvedValue([]),
    createMenuItem: vi.fn(),
    updateMenuItem: vi.fn(),
    deleteMenuItem: vi.fn(),
    ...overrides
  };
}
