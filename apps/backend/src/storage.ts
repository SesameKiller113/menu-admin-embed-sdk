import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { datastoreError, notFound } from "./errors.js";
import type {
  CreateMenuItemRequest,
  MenuItem,
  UpdateMenuItemRequest
} from "./types.js";

type MenuItemState = {
  menuItems: MenuItem[];
};

export class FlatFileMenuItemStore {
  private writeQueue: Promise<unknown> = Promise.resolve();

  constructor(private readonly dataFile: string) {}

  async init() {
    await mkdir(path.dirname(this.dataFile), { recursive: true });

    try {
      await readFile(this.dataFile, "utf8");
    } catch (error) {
      if (isNodeError(error) && error.code === "ENOENT") {
        await this.writeState({ menuItems: [] });
        return;
      }

      throw error;
    }
  }

  async list(restaurantId: string): Promise<MenuItem[]> {
    const state = await this.readState();
    return state.menuItems
      .filter((item) => item.restaurantId === restaurantId)
      .map(copyMenuItem);
  }

  async create(
    restaurantId: string,
    input: CreateMenuItemRequest
  ): Promise<MenuItem> {
    return this.mutate((state) => {
      const now = new Date().toISOString();
      const item: MenuItem = {
        id: randomUUID(),
        restaurantId,
        name: input.name,
        description: input.description,
        price: input.price,
        createdAt: now,
        updatedAt: now
      };

      state.menuItems.push(item);
      return copyMenuItem(item);
    });
  }

  async update(
    restaurantId: string,
    itemId: string,
    input: UpdateMenuItemRequest
  ): Promise<MenuItem> {
    return this.mutate((state) => {
      const item = state.menuItems.find(
        (candidate) =>
          candidate.restaurantId === restaurantId && candidate.id === itemId
      );

      if (!item) {
        throw notFound();
      }

      Object.assign(item, input, { updatedAt: new Date().toISOString() });
      return copyMenuItem(item);
    });
  }

  async delete(restaurantId: string, itemId: string): Promise<void> {
    return this.mutate((state) => {
      const nextItems = state.menuItems.filter(
        (candidate) =>
          !(candidate.restaurantId === restaurantId && candidate.id === itemId)
      );

      if (nextItems.length === state.menuItems.length) {
        throw notFound();
      }

      state.menuItems = nextItems;
    });
  }

  private async mutate<T>(change: (state: MenuItemState) => T): Promise<T> {
    const next = this.writeQueue.then(async () => {
      const state = await this.readState();
      const result = change(state);
      await this.writeState(state);
      return result;
    });

    this.writeQueue = next.catch(() => undefined);
    return next;
  }

  private async readState(): Promise<MenuItemState> {
    let raw: string;

    try {
      raw = await readFile(this.dataFile, "utf8");
    } catch (error) {
      throw datastoreError("Datastore could not be read", {
        dataFile: this.dataFile
      });
    }

    try {
      const parsed = JSON.parse(raw) as Partial<MenuItemState>;

      if (!Array.isArray(parsed.menuItems)) {
        throw new Error("Missing menuItems array");
      }

      return {
        menuItems: parsed.menuItems
      };
    } catch {
      throw datastoreError("Datastore is invalid", {
        dataFile: this.dataFile,
        expected: "{ menuItems: [] }"
      });
    }
  }

  private async writeState(state: MenuItemState) {
    const tmpFile = `${this.dataFile}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(tmpFile, `${JSON.stringify(state, null, 2)}\n`, "utf8");
    await rename(tmpFile, this.dataFile);
  }
}

function copyMenuItem(item: MenuItem): MenuItem {
  return { ...item };
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
