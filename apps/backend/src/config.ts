import path from "node:path";

export type BackendConfig = {
  host: string;
  port: number;
  menuDataFile: string;
  allowedOrigins: string[];
};

const defaultOrigins = [
  "http://localhost:3000",
  "http://localhost:4173",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:4173",
  "http://127.0.0.1:5173"
];

export function loadConfig(env: NodeJS.ProcessEnv = process.env): BackendConfig {
  return {
    host: env.HOST || "127.0.0.1",
    port: parsePort(env.PORT),
    menuDataFile:
      env.MENU_DATA_FILE ||
      path.join(process.cwd(), "data", "menu-items.json"),
    allowedOrigins: parseAllowedOrigins(env.ALLOWED_ORIGINS)
  };
}

function parsePort(value: string | undefined): number {
  if (!value) {
    return 4000;
  }

  const port = Number.parseInt(value, 10);

  if (!Number.isInteger(port) || port <= 0) {
    return 4000;
  }

  return port;
}

function parseAllowedOrigins(value: string | undefined): string[] {
  if (!value) {
    return defaultOrigins;
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}
