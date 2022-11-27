import { constants } from "./constants.js";

export default class Controller {
  #users = new Map();
  #rooms = new Map();

  constructor({ socketServer }) {
    this.socketServer = socketServer;
  }

  #updateGlobalUserData(socketId, userData) {
    const users = this.#users;
    const user = users.get(socketId) ?? {};

    const updatedUserData = {
      ...user,
      ...userData,
    };

    users.set(socketId, updatedUserData);

    return users.get(socketId);
  }

  async joinRoom(socketId, data) {
    const { userName, roomId } = JSON.parse(data);
    console.log(`${userName} joined! ${roomId}`, [socketId]);

    const user = this.#updateGlobalUserData(socketId, userData);
    const users = this.#joinUserOnRoom(roomId, user);

    const currentUsers = Array.from(users.values()).map(({ id, userName }) => ({ id, userName }));

    // update user that just connect about users connected on the same room
    this.socketServer.sendMessage(user.socket, constants.event.UPDATE_USERS, currentUsers);
  }

  #joinUserOnRoom(roomId, user) {
    const usersOnRoom = this.#rooms.get(roomId) ?? new Map();
    usersOnRoom.set(user.id, user);
    this.#rooms.set(roomId, usersOnRoom);
    return usersOnRoom;
  }

  #onSocketData(id) {
    return (data) => {
      try {
        const { event, message } = JSON.parse(data);
        // joinRoom
        this[event](id, message);
      } catch (err) {
        console.log(data.toString());
        console.error(err);
      }
    };
  }

  #onSocketError(id) {
    return (err) => {
      console.log("onSocketError", err.toString());
    };
  }

  #onSocketEnd(id) {
    return () => {
      console.log(`connection => [${id}]: was closed`);
    };
  }

  onNewConnection(socket) {
    const { id } = socket;
    console.log(`connection => [${id}]: has been stablished`);

    const userData = { id, socket };

    this.#updateGlobalUserData(id, userData);

    socket.on("data", this.#onSocketData(id));
    socket.on("error", this.#onSocketError(id));
    socket.on("end", this.#onSocketEnd(id));
  }
}
