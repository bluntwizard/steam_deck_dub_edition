const { autoUpdater } = require('electron-updater');
const { app, dialog } = require('electron');

class UpdateHandler {
  constructor() {
    this.autoUpdater = autoUpdater;
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    // Check for updates when the app starts
    this.autoUpdater.checkForUpdatesAndNotify();

    // Update available
    this.autoUpdater.on('update-available', (info) => {
      dialog.showMessageBox({
        type: 'info',
        title: 'Update Available',
        message: `A new version (${info.version}) is available. Would you like to update now?`,
        buttons: ['Update', 'Later'],
        defaultId: 0
      }).then(({ response }) => {
        if (response === 0) {
          this.autoUpdater.downloadUpdate();
        }
      });
    });

    // Update downloaded
    this.autoUpdater.on('update-downloaded', (info) => {
      dialog.showMessageBox({
        type: 'info',
        title: 'Update Ready',
        message: `Version ${info.version} has been downloaded. Restart the application to apply the update.`,
        buttons: ['Restart', 'Later'],
        defaultId: 0
      }).then(({ response }) => {
        if (response === 0) {
          this.autoUpdater.quitAndInstall(false, true);
        }
      });
    });

    // Error handling
    this.autoUpdater.on('error', (err) => {
      console.error('Update error:', err);
      dialog.showErrorBox(
        'Update Error',
        'An error occurred while checking for updates. Please try again later.'
      );
    });

    // Progress updates
    this.autoUpdater.on('download-progress', (progressObj) => {
      // You can send this to the renderer process to show a progress bar
      const message = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`;
      console.log(message);
    });
  }

  // Check for updates manually
  checkForUpdates() {
    this.autoUpdater.checkForUpdates();
  }

  // Get current version
  getCurrentVersion() {
    return app.getVersion();
  }
}

module.exports = new UpdateHandler(); 