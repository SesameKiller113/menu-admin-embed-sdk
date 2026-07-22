import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { createApp } from "../app.js";
import { FlatFileMenuItemStore } from "../storage.js";

const tmpDir = await mkdtemp(path.join(os.tmpdir(), "menu-backend-smoke-"));
const dataFile = path.join(tmpDir, "menu-items.json");
const store = new FlatFileMenuItemStore(dataFile);

await store.init();

const app = createApp({
  accessToken: "smoke-token",
  store,
  allowedOrigins: ["http://localhost:5173"]
});
const server = app.listen(0, "127.0.0.1");

try {
  await new Promise<void>((resolve) => server.once("listening", resolve));

  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const health = await request(baseUrl, "GET", "/api/health");
  assert.equal(health.status, 200);
  assert.equal(health.body.data.ok, true);

  const missingToken = await request(
    baseUrl,
    "GET",
    "/api/restaurants/demo-restaurant/menu-items"
  );
  assert.equal(missingToken.status, 401);
  assert.equal(missingToken.body.error.code, "unauthorized");

  const authHeaders = {
    authorization: "Bearer smoke-token"
  };

  const emptyList = await request(
    baseUrl,
    "GET",
    "/api/restaurants/demo-restaurant/menu-items",
    undefined,
    authHeaders
  );
  assert.equal(emptyList.status, 200);
  assert.deepEqual(emptyList.body.data, []);

  const created = await request(
    baseUrl,
    "POST",
    "/api/restaurants/demo-restaurant/menu-items",
    {
      name: "Charred Lemon Chicken",
      description: "Roasted herbs and lemon jus",
      price: 24
    },
    authHeaders
  );
  assert.equal(created.status, 201);
  assert.equal(created.body.data.restaurantId, "demo-restaurant");
  assert.equal(created.body.data.price, 24);

  const listed = await request(
    baseUrl,
    "GET",
    "/api/restaurants/demo-restaurant/menu-items",
    undefined,
    authHeaders
  );
  assert.equal(listed.body.data.length, 1);
  assert.equal(listed.body.data[0].id, created.body.data.id);

  const updated = await request(
    baseUrl,
    "PATCH",
    `/api/restaurants/demo-restaurant/menu-items/${created.body.data.id}`,
    {
      name: "Charred Lemon Chicken Plate",
      description: "Roasted herbs, lemon jus, and greens",
      price: 25.5
    },
    authHeaders
  );
  assert.equal(updated.status, 200);
  assert.equal(updated.body.data.name, "Charred Lemon Chicken Plate");
  assert.equal(updated.body.data.price, 25.5);

  const validation = await request(
    baseUrl,
    "POST",
    "/api/restaurants/demo-restaurant/menu-items",
    {
      description: "Missing name and bad price",
      price: 12.999
    },
    authHeaders
  );
  assert.equal(validation.status, 400);
  assert.equal(validation.body.error.code, "bad_request");

  const missing = await request(
    baseUrl,
    "PATCH",
    "/api/restaurants/demo-restaurant/menu-items/missing-item",
    {
      name: "Missing"
    },
    authHeaders
  );
  assert.equal(missing.status, 404);
  assert.equal(missing.body.error.code, "not_found");

  const reloadedStore = new FlatFileMenuItemStore(dataFile);
  await reloadedStore.init();
  const persistedItems = await reloadedStore.list("demo-restaurant");
  assert.equal(persistedItems.length, 1);
  assert.match(await readFile(dataFile, "utf8"), /Charred Lemon Chicken Plate/);

  const deleted = await request(
    baseUrl,
    "DELETE",
    `/api/restaurants/demo-restaurant/menu-items/${created.body.data.id}`,
    undefined,
    authHeaders
  );
  assert.equal(deleted.status, 200);
  assert.deepEqual(deleted.body.data, { deleted: true });

  console.log("Backend smoke test passed");
} finally {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  await rm(tmpDir, { recursive: true, force: true });
}

async function request(
  baseUrl: string,
  method: string,
  pathname: string,
  body?: unknown,
  headers: Record<string, string> = {}
) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers: {
      ...headers,
      ...(body ? { "content-type": "application/json" } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await response.text();

  return {
    status: response.status,
    body: text ? JSON.parse(text) : undefined
  };
}
