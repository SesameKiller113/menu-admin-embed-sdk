import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "./App";

vi.mock("@menu-admin-embed-sdk/menu-admin-react", async () => {
  const actual = await vi.importActual<
    typeof import("@menu-admin-embed-sdk/menu-admin-react")
  >("@menu-admin-embed-sdk/menu-admin-react");

  return {
    ...actual,
    MenuAdminApp: ({ restaurantId }: { restaurantId: string }) => (
      <div>Standalone menu admin for {restaurantId}</div>
    )
  };
});

describe("App", () => {
  it("renders the standalone menu admin shell", () => {
    render(<App />);

    expect(
      screen.getByText("Standalone menu admin for demo-restaurant")
    ).toBeInTheDocument();
  });
});
