const { ipcRenderer } = require('electron');

class VersionDisplay {
  constructor() {
    this.element = null;
    this.version = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    // Get the current version
    this.version = await ipcRenderer.invoke('get-version');
    
    // Create version display element
    this.element = document.createElement('div');
    this.element.className = 'version-display';
    this.element.innerHTML = `
      <span class="version-text">v${this.version}</span>
      <button class="check-updates-btn">Check for Updates</button>
    `;

    // Add click handler for update check
    const updateBtn = this.element.querySelector('.check-updates-btn');
    updateBtn.addEventListener('click', () => {
      ipcRenderer.invoke('check-for-updates');
    });

    // Add to the page
    document.body.appendChild(this.element);

    this.initialized = true;
  }
}

module.exports = new VersionDisplay(); 