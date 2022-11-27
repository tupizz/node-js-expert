export default class CliConfig {
  constructor({ username, room, hostUri }) {
    const { hostname, port, protocol } = new URL(hostUri);
    this.username = username;
    this.room = room;
    this.host = hostname;
    this.port = port;
    this.protocol = protocol.replace(/\W/, "");
  }

  static parseArguments(commands) {
    const cmd = new Map();

    for (const key in commands) {
      const index = parseInt(key);
      const command = commands[index];
      const commandPrefix = "--";
      if (!command.includes(commandPrefix)) continue;
      cmd.set(command.replace(commandPrefix, ""), commands[index + 1]);
    }

    return new CliConfig({
      username: cmd.get("username"),
      room: cmd.get("room"),
      hostUri: cmd.get("hostUri"),
    });
  }
}
