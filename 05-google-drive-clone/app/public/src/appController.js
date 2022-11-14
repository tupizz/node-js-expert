export default class AppController {
  constructor({ connectionManager, viewManager, dragNDropManager }) {
    this.connectionManager = connectionManager;
    this.viewManager = viewManager;
    this.dragNDropManager = dragNDropManager;

    this.uploadingFilesMap = new Map();
  }

  async initialize() {
    this.viewManager.configureFileBtnClick();
    this.viewManager.configureOnFileChange(this.onFileChanges.bind(this));
    this.viewManager.configureModal();
    this.connectionManager.configureEvents(this.onProgress.bind(this));
    this.viewManager.updateStatus(0);
    this.dragNDropManager.initialize({
      onDropHandler: this.onFileChanges.bind(this),
    });
    await this.updateCurrentFiles();
  }

  async onDropHandler(files) {}

  // event received from backend
  async onProgress({ processedAlready, filename }) {
    const file = this.uploadingFilesMap.get(filename);
    const alreadyProcessed = Math.ceil((processedAlready / file.size) * 100);
    this.updateProgress(file, alreadyProcessed);

    if (alreadyProcessed < 98) {
      return;
    }

    return this.updateCurrentFiles();
  }

  updateProgress(file, percentage) {
    const uploadingFiles = this.uploadingFilesMap;
    file.percentage = percentage;

    const total = [...uploadingFiles.values()]
      .map(({ percentage }) => percentage ?? 0)
      .reduce((total, current) => total + current, 0);

    this.viewManager.updateStatus(total);
  }

  async onFileChanges(files) {
    this.uploadingFilesMap.clear();
    this.viewManager.openModal();
    this.viewManager.updateStatus(0);

    const requestsPromise = [];
    for (const file of files) {
      this.uploadingFilesMap.set(file.name, file);
      requestsPromise.push(this.connectionManager.uploadFile(file));
    }

    await Promise.all(requestsPromise);
    this.viewManager.updateStatus(100);
    setTimeout(() => this.viewManager.closeModal(), 2000);

    await this.updateCurrentFiles();
  }

  async updateCurrentFiles() {
    const files = await this.connectionManager.currentFiles();
    this.viewManager.updateCurrentFiles(files);
    return files;
  }
}
