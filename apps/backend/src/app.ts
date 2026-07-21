import cors from "cors";
import express from "express";
import { ApiError, errorHandler } from "./errors.js";
import type { BackendConfig } from "./config.js";
import type { FlatFileMenuItemStore } from "./storage.js";
import {
  createMenuItemSchema,
  parseItemId,
  parseRequestBody,
  parseRestaurantId,
  updateMenuItemSchema
} from "./validation.js";

type CreateAppOptions = {
  store: FlatFileMenuItemStore;
  allowedOrigins: BackendConfig["allowedOrigins"];
};

export function createApp({ store, allowedOrigins }: CreateAppOptions) {
  const app = express();

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(null, false);
      },
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"]
    })
  );
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.status(200).json({ data: { ok: true } });
  });

  app.get("/api/restaurants/:restaurantId/menu-items", async (req, res, next) => {
    try {
      const restaurantId = parseRestaurantId(req.params.restaurantId);
      const items = await store.list(restaurantId);
      res.status(200).json({ data: items });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/restaurants/:restaurantId/menu-items", async (req, res, next) => {
    try {
      const restaurantId = parseRestaurantId(req.params.restaurantId);
      const body = parseRequestBody(createMenuItemSchema, req.body);
      const item = await store.create(restaurantId, body);
      res.status(201).json({ data: item });
    } catch (error) {
      next(error);
    }
  });

  app.patch(
    "/api/restaurants/:restaurantId/menu-items/:itemId",
    async (req, res, next) => {
      try {
        const restaurantId = parseRestaurantId(req.params.restaurantId);
        const itemId = parseItemId(req.params.itemId);
        const body = parseRequestBody(updateMenuItemSchema, req.body);
        const item = await store.update(restaurantId, itemId, body);
        res.status(200).json({ data: item });
      } catch (error) {
        next(error);
      }
    }
  );

  app.delete(
    "/api/restaurants/:restaurantId/menu-items/:itemId",
    async (req, res, next) => {
      try {
        const restaurantId = parseRestaurantId(req.params.restaurantId);
        const itemId = parseItemId(req.params.itemId);
        await store.delete(restaurantId, itemId);
        res.status(200).json({ data: { deleted: true } });
      } catch (error) {
        next(error);
      }
    }
  );

  app.use((_req, _res, next) => {
    next(new ApiError(404, "not_found", "Route not found"));
  });

  app.use(errorHandler);

  return app;
}
