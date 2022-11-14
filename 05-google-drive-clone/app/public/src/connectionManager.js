export default class ConnectionManager {
  constructor({ apiUrl }) {
    this.apiUrl = apiUrl;
    this.ioClient = io.connect(apiUrl, { withCredentials: false });
    this.socketId = null;
  }

  configureEvents(onProgress) {
    this.ioClient.on("connect", this.onSocketConnect.bind(this));
    this.ioClient.on("file-upload", onProgress);
  }

  onSocketConnect() {
    console.log("Connected to socket.io server");
    this.socketId = this.ioClient.id;
  }

  async uploadFile(file) {
    const formData = new FormData();
    formData.append("files", file);

    const response = await fetch(`${this.apiUrl}?socketId=${this.socketId}`, {
      method: "POST",
      body: formData,
    });

    return response.json();
  }

  async currentFiles() {
    const files = await fetch(this.apiUrl).then((res) => res.json());
    return files;
  }
}
