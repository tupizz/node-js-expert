export default class DragNDropManager {
  constructor() {
    this.dropArea = document.getElementById("dropArea");
    this.onDropHandler = () => {};
  }

  disableDragNDropEvents() {
    const events = ["dragenter", "dragover", "dragleave", "drop"];

    const preventDefaults = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };

    events.forEach((eventName) => {
      this.dropArea.addEventListener(eventName, preventDefaults, false);
      document.body.addEventListener(eventName, preventDefaults, false);
    });
  }

  enableHighLightOnDrag() {
    const events = ["dragenter", "dragover"];
    const highligth = (e) => {
      this.dropArea.classList.add("highlight");
      this.dropArea.classList.add("drop-area");
    };

    events.forEach((eventName) => {
      this.dropArea.addEventListener(eventName, highligth, false);
    });
  }

  enableDrop() {
    const drop = (e) => {
      this.dropArea.classList.remove("highlight");
      this.dropArea.classList.remove("drop-area");
      const files = [...e.dataTransfer.files];
      this.onDropHandler(files);
    };

    this.dropArea.addEventListener("drop", drop, false);
  }

  initialize({ onDropHandler }) {
    this.disableDragNDropEvents();
    this.enableHighLightOnDrag();
    this.onDropHandler = onDropHandler;
    this.enableDrop();
  }
}
