export default class ViewManager {
  constructor() {
    this.tbody = document.getElementById("tbody");
    this.newFileBtn = document.getElementById("newFileBtn");
    this.fileElement = document.getElementById("fileElem");
    this.progressModal = document.getElementById("progressModal");
    this.progressBar = document.getElementById("progressBar");
    this.output = document.getElementById("output");

    this.dateFormatter = new Intl.DateTimeFormat("pt", {
      day: "numeric",
      locale: "pt-BR",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    this.modalInsance = {};
  }

  configureModal() {
    this.modalInsance = M.Modal.init(this.progressModal, {
      dismissible: false,
      opacity: 0,
      onOpenEnd() {
        this.$overlay[0].remove();
      },
    });
  }

  openModal() {
    this.modalInsance.open();
  }

  closeModal() {
    this.modalInsance.close();
  }

  configureFileBtnClick() {
    this.newFileBtn.onclick = () => this.fileElement.click();
  }

  configureOnFileChange(fn) {
    this.fileElement.onchange = (event) => {
      const files = [...event.target.files];
      fn(files);
    };
  }

  updateStatus(size) {
    this.output.innerHTML = `Uploading in <b>${Math.floor(size)}</b>`;
    this.progressBar.value = size;
  }

  getIcon(file) {
    if (file.match(/\.mp4/i)) {
      return "movie";
    }

    if (file.match(/\.jpe?g/i)) {
      return "image";
    }

    if (file.match(/\.png/i)) {
      return "image";
    }

    return "content_copy";
  }

  makeIcon(file) {
    const icon = this.getIcon(file);
    const colors = {
      image: "yellow600",
      movie: "red600",
      file: "",
    };
    return `<i class="material-icons ${colors[icon]} left">${icon}</i>`;
  }

  updateCurrentFiles(filesArray) {
    const template = (item) => `
        <tr>
            <td>${this.makeIcon(item.file)} ${item.file}</td>
            <td>${item.owner}</td>
            <td>${this.dateFormatter.format(new Date(item.lastModified))}</td>
            <td>${item.size}</td>
        </tr>
    `;

    this.tbody.innerHTML = filesArray.map(template).join("");
  }
}
