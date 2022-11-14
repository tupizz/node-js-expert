import AppController from "./src/appController.js";
import ConnectionManager from "./src/connectionManager.js";
import ViewManager from "./src/viewManager.js";
import DragNDropManager from "./src/dragNDropManager.js";

console.log("Hello from app.js");

const API_URL = "https://localhost:3000";

const appController = new AppController({
  viewManager: new ViewManager(),
  dragNDropManager: new DragNDropManager(),
  connectionManager: new ConnectionManager({
    apiUrl: API_URL,
  }),
});

try {
  await appController.initialize();
} catch (error) {
  console.error(error);
  console.error(`Error on initialize`);
}
