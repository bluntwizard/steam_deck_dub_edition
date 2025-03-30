/**
 * Type declarations for service modules
 * These will be replaced when each service is migrated to TypeScript
 */

// Content Loader Service
declare module './content-loader.js' {
  export default class ContentLoader {
    constructor(contentContainer: HTMLElement);
    loadContent(contentFile: string, append?: boolean): Promise<HTMLElement>;
    initializeLoadedContent(): void;
    loadInitialContent(): Promise<HTMLElement>;
  }
}

// Offline Service
declare module './offline.js' {
  export default class OfflineService {
    constructor();
    initialize(): void;
    isOnline(): boolean;
    enableOfflineMode(): void;
    disableOfflineMode(): void;
    syncWhenOnline(): Promise<void>;
  }
}

// PDF Export Service
declare module './pdf-export.js' {
  export default class PdfExportService {
    constructor();
    generatePdf(element: HTMLElement, filename?: string): Promise<Blob>;
    exportElementToPdf(element: HTMLElement, options?: Record<string, any>): Promise<Blob>;
    downloadPdf(blob: Blob, filename: string): void;
  }
}

// Progress Tracker Service
declare module './progress-tracker.js' {
  export default class ProgressTrackerService {
    constructor();
    initialize(): void;
    trackSection(sectionId: string, completed: boolean): void;
    getProgress(): Record<string, boolean>;
    getCompletionPercentage(): number;
    resetProgress(): void;
  }
}

// Search Service
declare module './search.js' {
  export default class SearchService {
    constructor();
    initialize(): void;
    search(query: string): Promise<Array<{id: string, title: string, content: string, score: number}>>;
    buildSearchIndex(): Promise<void>;
    highlightResults(element: HTMLElement, query: string): void;
  }
}

// Settings Service
declare module './settings.js' {
  export default class SettingsService {
    constructor();
    initialize(): void;
    getSetting(key: string): any;
    setSetting(key: string, value: any): void;
    removeSetting(key: string): void;
    resetAllSettings(): void;
  }
}

// Version Manager Service
declare module './version-manager.js' {
  export default class VersionManagerService {
    constructor();
    initialize(): void;
    getCurrentVersion(): string;
    checkForUpdates(): Promise<boolean>;
    getLatestVersion(): Promise<string>;
    applyUpdate(): Promise<void>;
  }
} 