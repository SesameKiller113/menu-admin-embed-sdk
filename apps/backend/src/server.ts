import { createApp } from "./app.js";
import { loadConfig } from "./config.js";
import { FlatFileMenuItemStore } from "./storage.js";

const config = loadConfig();
const store = new FlatFileMenuItemStore(config.menuDataFile);

await store.init();

const app = createApp({
  store,
  allowedOrigins: config.allowedOrigins
});

const server = app.listen(config.port, config.host, () => {
  console.log(`Backend API listening on http://${config.host}:${config.port}`);
  console.log(`Menu datastore: ${config.menuDataFile}`);
});

server.on("error", (error) => {
  console.error(error);
  process.exitCode = 1;
});
