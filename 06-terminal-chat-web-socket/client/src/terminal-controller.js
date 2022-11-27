import ComponentsBuilder from "./components.js";
import constants from "./constants.js";

export default class TerminalController {
  #usersColors = new Map();

  constructor() {}

  #pickColor() {
    return `#${(((1 << 24) * Math.random()) | 0).toString(16)}-fg`;
  }

  #getUserColor(username) {
    if (this.#usersColors.has(username)) return this.#usersColors.get(username);

    const color = this.#pickColor();
    this.#usersColors.set(username, color);

    return color;
  }

  #onInputReceived(eventEmitter) {
    return function () {
      const message = this.getValue();
      console.log(message);
      this.clearValue();
    };
  }

  #onMessageReceived({ screen, chat }) {
    return (msg) => {
      const { username, message } = msg;
      const color = this.#getUserColor(username);
      chat.addItem(`{${color}}{bold}${username}{/}: ${message}{/}`);
      screen.render();
    };
  }

  #onActivityLogUpdated({ screen, activityLog }) {
    return (msg) => {
      const [username] = msg.split(/\s/);
      const color = this.#getUserColor(username);
      activityLog.addItem(`{${color}}{bold}${msg.toString()}{/}`);
      screen.render();
    };
  }

  #onStatusUpdated({ screen, status }) {
    return (users) => {
      const { content } = status.items.shift();
      status.clearItems();
      status.addItem(content);

      users.forEach((username) => {
        const color = this.#getUserColor(username);
        status.addItem(`{${color}}{bold}${username}{/}`);
      });

      screen.render();
    };
  }

  #registerEvents(eventEmitter, components) {
    eventEmitter.on(constants.events.app.ON_NEW_MESSAGE, this.#onMessageReceived(components));
    eventEmitter.on(constants.events.app.ON_UPDATE_ACTIVITY_LOG, this.#onActivityLogUpdated(components));
    eventEmitter.on(constants.events.app.STATUS_UPDATED, this.#onStatusUpdated(components));
  }

  async initializeTable(eventEmitter) {
    const components = new ComponentsBuilder()
      .setScreen({ title: "HackerChat - Tadeu" })
      .setLayoutComponent()
      .setInputComponent(this.#onInputReceived(eventEmitter))
      .setChatComponent()
      .setStatusComponent()
      .setActivityLogComponent()
      .build();

    this.#registerEvents(eventEmitter, components);

    components.input.focus();
    components.screen.render();

    setInterval(() => {
      eventEmitter.emit(constants.events.app.STATUS_UPDATED, ["tadeu", "tadeu2", "joao"]);
      eventEmitter.emit(constants.events.app.STATUS_UPDATED, ["tadeu", "tadeu2", "tadeu3", "joao"]);
      eventEmitter.emit(constants.events.app.ON_UPDATE_ACTIVITY_LOG, "tadeu joined");
      eventEmitter.emit(constants.events.app.ON_UPDATE_ACTIVITY_LOG, "joao joined");
      eventEmitter.emit(constants.events.app.ON_NEW_MESSAGE, {
        username: "tadeu",
        message: "hey",
      });
      eventEmitter.emit(constants.events.app.ON_NEW_MESSAGE, {
        username: "joao",
        message: "dude",
      });
    }, 1000);
  }
}
