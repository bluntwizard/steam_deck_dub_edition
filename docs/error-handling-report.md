# JavaScript Error Handling Analysis Report

## Summary

* **Files Analyzed:** 22
* **Missing Error Handling:** 430 instances
* **Potential Undefined Access:** 90 instances
* **Inconsistent Error Handling:** 0 files
* **Total Recommendations:** 520

## Missing Error Handling

| File | Line | Pattern | Code |
| ---- | ---- | ------- | ---- |
| src/scripts/utils/print-helper.js | 157 | DOM query | `document.getElementById('cancel-print').addEventListener('click', () => {` |
| src/scripts/utils/print-helper.js | 161 | DOM query | `document.getElementById('confirm-print').addEventListener('click', () => {` |
| src/scripts/utils/print-helper.js | 163 | DOM query | `expandCode: document.getElementById('print-expanded-code').checked,` |
| src/scripts/utils/print-helper.js | 164 | DOM query | `expandDetails: document.getElementById('print-all-details').checked,` |
| src/scripts/utils/print-helper.js | 165 | DOM query | `includeUrls: document.getElementById('print-include-urls').checked,` |
| src/scripts/utils/print-helper.js | 166 | DOM query | `printMode: document.querySelector('input[name="print-sections"]:checked').id` |
| src/scripts/utils/print-helper.js | 216 | DOM query | `document.querySelectorAll('.code-block').forEach(block => {` |
| src/scripts/utils/print-helper.js | 231 | DOM query | `document.querySelectorAll('details').forEach(details => {` |
| src/scripts/utils/print-helper.js | 249 | DOM query | `const sections = Array.from(document.querySelectorAll('.section'));` |
| src/scripts/utils/print-helper.js | 284 | DOM query | `const sections = Array.from(document.querySelectorAll('.section'));` |
| src/scripts/utils/print-helper.js | 182 | Timer functions | `setTimeout(() => {` |
| src/scripts/utils/print-helper.js | 313 | Timer functions | `setTimeout(() => {` |
| src/scripts/utils/print-helper.js | 6 | Event listener | `document.addEventListener('DOMContentLoaded', () => {` |
| src/scripts/utils/print-helper.js | 10 | Event listener | `document.addEventListener('keydown', (e) => {` |
| src/scripts/utils/print-helper.js | 51 | Event listener | `button.addEventListener('mouseover', () => {` |
| src/scripts/utils/print-helper.js | 56 | Event listener | `button.addEventListener('mouseout', () => {` |
| src/scripts/utils/print-helper.js | 62 | Event listener | `button.addEventListener('click', () => {` |
| src/scripts/utils/print-helper.js | 157 | Event listener | `document.getElementById('cancel-print').addEventListener('click', () => {` |
| src/scripts/utils/print-helper.js | 161 | Event listener | `document.getElementById('confirm-print').addEventListener('click', () => {` |
| src/scripts/utils/print-helper.js | 174 | Event listener | `document.addEventListener('keydown', function closeOnEsc(e) {` |
| src/scripts/utils/print-helper.js | 183 | Event listener | `document.addEventListener('click', function closeOnOutsideClick(e) {` |
| src/scripts/utils/print-helper.js | 318 | Event listener | `window.addEventListener('afterprint', () => {` |
| src/scripts/utils/layout-utilities.js | 67 | DOM query | `document.querySelectorAll('.code-block').forEach(codeBlock => {` |
| src/scripts/utils/layout-utilities.js | 88 | DOM query | `document.querySelectorAll('table').forEach(table => {` |
| src/scripts/utils/layout-utilities.js | 106 | DOM query | `document.querySelectorAll('img:not([loading])').forEach(img => {` |
| src/scripts/utils/layout-utilities.js | 128 | DOM query | `const container = document.querySelector(containerSelector);` |
| src/scripts/utils/layout-utilities.js | 141 | DOM query | `const elements = document.querySelectorAll(selector);` |
| src/scripts/utils/layout-utilities.js | 167 | DOM query | `const container = document.querySelector(containerSelector);` |
| src/scripts/utils/layout-utilities.js | 223 | DOM query | `const container = document.querySelector(containerSelector);` |
| src/scripts/utils/layout-utilities.js | 261 | DOM query | `const items = document.querySelectorAll(selector);` |
| src/scripts/utils/layout-utilities.js | 265 | DOM query | `let lightbox = document.getElementById('sdde-lightbox');` |
| src/scripts/utils/layout-utilities.js | 59 | Timer functions | `timeout = setTimeout(() => func.apply(context, args), wait);` |
| src/scripts/utils/layout-utilities.js | 14 | Event listener | `window.addEventListener('resize', debounce(updateResponsiveClasses, 250));` |
| src/scripts/utils/layout-utilities.js | 73 | Event listener | `codeBlock.addEventListener('click', () => {` |
| src/scripts/utils/layout-utilities.js | 111 | Event listener | `img.addEventListener('error', () => {` |
| src/scripts/utils/layout-utilities.js | 283 | Event listener | `lightbox.querySelector('.lightbox-close').addEventListener('click', () => {` |
| src/scripts/utils/layout-utilities.js | 287 | Event listener | `lightbox.querySelector('.lightbox-prev').addEventListener('click', () => {` |
| src/scripts/utils/layout-utilities.js | 291 | Event listener | `lightbox.querySelector('.lightbox-next').addEventListener('click', () => {` |
| src/scripts/utils/layout-utilities.js | 296 | Event listener | `lightbox.addEventListener('click', (e) => {` |
| src/scripts/utils/layout-utilities.js | 303 | Event listener | `document.addEventListener('keydown', (e) => {` |
| src/scripts/utils/layout-utilities.js | 325 | Event listener | `item.addEventListener('click', () => {` |
| src/scripts/utils/layout-utilities.js | 365 | Event listener | `document.addEventListener('DOMContentLoaded', initializeResponsiveLayouts);` |
| src/scripts/utils/layout-utilities.js | 368 | Event listener | `window.addEventListener('content-loaded', initializeResponsiveLayouts);` |
| src/scripts/utils/debug-helper.js | 30 | Storage API access | `if (localStorage.getItem('debugMode') === 'true') {` |
| src/scripts/utils/debug-helper.js | 75 | DOM query | `const sections = document.querySelectorAll('.section');` |
| src/scripts/utils/debug-helper.js | 101 | DOM query | `document.querySelectorAll('.gallery-grid, .features-grid, .cards-grid').forEach(grid => {` |
| src/scripts/utils/debug-helper.js | 145 | DOM query | `let errorContainer = document.getElementById('debug-error-container');` |
| src/scripts/utils/debug-helper.js | 194 | DOM query | `document.querySelectorAll('.section').forEach(section => {` |
| src/scripts/utils/debug-helper.js | 202 | DOM query | `document.querySelectorAll('.gallery-grid, .features-grid, .cards-grid').forEach(grid => {` |
| src/scripts/utils/debug-helper.js | 219 | DOM query | `const elementsWithZIndex = Array.from(document.querySelectorAll('\*')).filter(el => {` |
| src/scripts/utils/debug-helper.js | 267 | DOM query | `const debugToggleButton = document.getElementById('debug-toggle-button');` |
| src/scripts/utils/debug-helper.js | 177 | Timer functions | `setTimeout(() => {` |
| src/scripts/utils/debug-helper.js | 7 | Event listener | `document.addEventListener('DOMContentLoaded', function() {` |
| src/scripts/utils/debug-helper.js | 12 | Event listener | `document.addEventListener('keydown', function(e) {` |
| src/scripts/utils/debug-helper.js | 25 | Event listener | `window.addEventListener('content-loaded', function() {` |
| src/scripts/utils/debug-helper.js | 48 | Event listener | `button.addEventListener('click', toggleDebugMode);` |
| src/scripts/utils/debug-helper.js | 133 | Event listener | `window.addEventListener('error', function(event) {` |
| src/scripts/utils/debug-helper.js | 295 | Event listener | `pseudoElementDebugButton.addEventListener('click', function() {` |
| src/scripts/utils/cleanup.js | 34 | DOM query | `const elements = document.querySelectorAll(selector);` |
| src/scripts/utils/cleanup.js | 49 | DOM query | `const mainContent = document.querySelector('.main-content');` |
| src/scripts/utils/cleanup.js | 52 | DOM query | `const header = document.querySelector('.sdde-header');` |
| src/scripts/utils/cleanup.js | 63 | DOM query | `document.querySelectorAll('[style\*="margin-top"]').forEach(el => {` |
| src/scripts/utils/cleanup.js | 11 | Event listener | `document.addEventListener('DOMContentLoaded', cleanupLegacyElements);` |
| src/scripts/utils/cleanup.js | 14 | Event listener | `window.addEventListener('content-loaded', cleanupLegacyElements);` |
| src/scripts/services/version-manager.js | 45 | fetch API call | `const response = await fetch('version.json');` |
| src/scripts/services/version-manager.js | 261 | Storage API access | `const lastVisitedVersion = localStorage.getItem('sdde-last-visited-version');` |
| src/scripts/services/version-manager.js | 265 | Storage API access | `localStorage.setItem('sdde-last-visited-version', this.currentVersion);` |
| src/scripts/services/version-manager.js | 275 | Storage API access | `localStorage.setItem('sdde-last-visited-version', this.currentVersion);` |
| src/scripts/services/version-manager.js | 84 | DOM query | `const sidebar = document.querySelector('.sidebar-inner');` |
| src/scripts/services/version-manager.js | 109 | DOM query | `document.getElementById('show-changelog').addEventListener('click', (e) => {` |
| src/scripts/services/version-manager.js | 184 | DOM query | `document.getElementById('close-changelog').addEventListener('click', () => {` |
| src/scripts/services/version-manager.js | 215 | DOM query | `const section = document.getElementById(sectionId);` |
| src/scripts/services/version-manager.js | 339 | DOM query | `document.getElementById('view-updates').addEventListener('click', () => {` |
| src/scripts/services/version-manager.js | 344 | DOM query | `document.getElementById('dismiss-updates').addEventListener('click', () => {` |
| src/scripts/services/version-manager.js | 377 | DOM query | `const section = document.getElementById(sectionId);` |
| src/scripts/services/version-manager.js | 418 | DOM query | `const sidebarLink = document.querySelector(\`.sidebar a[href="#${sectionId}"]\`);` |
| src/scripts/services/version-manager.js | 197 | Timer functions | `setTimeout(() => {` |
| src/scripts/services/version-manager.js | 349 | Timer functions | `setTimeout(() => {` |
| src/scripts/services/version-manager.js | 355 | Timer functions | `setTimeout(() => {` |
| src/scripts/services/version-manager.js | 358 | Timer functions | `setTimeout(() => {` |
| src/scripts/services/version-manager.js | 27 | Event listener | `document.addEventListener('DOMContentLoaded', () => this.initVersionTracking());` |
| src/scripts/services/version-manager.js | 33 | Event listener | `window.addEventListener('content-loaded', () => {` |
| src/scripts/services/version-manager.js | 109 | Event listener | `document.getElementById('show-changelog').addEventListener('click', (e) => {` |
| src/scripts/services/version-manager.js | 184 | Event listener | `document.getElementById('close-changelog').addEventListener('click', () => {` |
| src/scripts/services/version-manager.js | 189 | Event listener | `document.addEventListener('keydown', function closeOnEsc(e) {` |
| src/scripts/services/version-manager.js | 198 | Event listener | `document.addEventListener('click', function closeOnOutsideClick(e) {` |
| src/scripts/services/version-manager.js | 339 | Event listener | `document.getElementById('view-updates').addEventListener('click', () => {` |
| src/scripts/services/version-manager.js | 344 | Event listener | `document.getElementById('dismiss-updates').addEventListener('click', () => {` |
| src/scripts/services/version-manager.js | 462 | Event listener | `document.addEventListener('DOMContentLoaded', () => {` |
| src/scripts/services/search.js | 42 | DOM query | `this.searchInput = document.getElementById(this.config.searchInputId);` |
| src/scripts/services/search.js | 43 | DOM query | `this.clearButton = document.getElementById(this.config.clearButtonId);` |
| src/scripts/services/search.js | 44 | DOM query | `this.contentContainer = document.getElementById(this.config.contentContainerId);` |
| src/scripts/services/search.js | 45 | DOM query | `this.noResultsMessage = document.getElementById(this.config.noResultsId);` |
| src/scripts/services/search.js | 149 | Timer functions | `this.searchTimeout = setTimeout(() => {` |
| src/scripts/services/search.js | 125 | Event listener | `button.addEventListener('mouseover', () => {` |
| src/scripts/services/search.js | 129 | Event listener | `button.addEventListener('mouseout', () => {` |
| src/scripts/services/search.js | 140 | Event listener | `this.searchInput.addEventListener('input', () => {` |
| src/scripts/services/search.js | 161 | Event listener | `this.clearButton.addEventListener('click', () => {` |
| src/scripts/services/search.js | 170 | Event listener | `this.prevButton.addEventListener('click', () => {` |
| src/scripts/services/search.js | 174 | Event listener | `this.nextButton.addEventListener('click', () => {` |
| src/scripts/services/search.js | 179 | Event listener | `document.addEventListener('keydown', (e) => {` |
| src/scripts/services/search.js | 201 | Event listener | `window.addEventListener('content-loaded', () => {` |
| src/scripts/services/search.js | 437 | Event listener | `document.addEventListener('DOMContentLoaded', () => {` |
| src/scripts/services/progress-tracker.js | 548 | Storage API access | `const savedData = localStorage.getItem(this.storageKey);` |
| src/scripts/services/progress-tracker.js | 549 | JSON parsing | `return savedData ? JSON.parse(savedData) : {};` |
| src/scripts/services/progress-tracker.js | 55 | DOM query | `const sidebar = document.querySelector('.sidebar-inner');` |
| src/scripts/services/progress-tracker.js | 86 | DOM query | `document.getElementById('reset-progress').addEventListener('click', (e) => {` |
| src/scripts/services/progress-tracker.js | 98 | DOM query | `const section = document.getElementById(sectionId);` |
| src/scripts/services/progress-tracker.js | 157 | DOM query | `if (document.getElementById('progress-fab')) return;` |
| src/scripts/services/progress-tracker.js | 220 | DOM query | `const section = document.getElementById(sectionId);` |
| src/scripts/services/progress-tracker.js | 295 | DOM query | `document.getElementById('dialog-close').addEventListener('click', () => {` |
| src/scripts/services/progress-tracker.js | 299 | DOM query | `document.getElementById('dialog-reset-progress').addEventListener('click', () => {` |
| src/scripts/services/progress-tracker.js | 381 | DOM query | `const progressBar = document.querySelector('.progress-bar');` |
| src/scripts/services/progress-tracker.js | 382 | DOM query | `const progressText = document.querySelector('.progress-text');` |
| src/scripts/services/progress-tracker.js | 394 | DOM query | `const fab = document.getElementById('progress-fab');` |
| src/scripts/services/progress-tracker.js | 418 | DOM query | `const sidebarLink = document.querySelector(\`.sidebar a[href="#${sectionId}"]\`);` |
| src/scripts/services/progress-tracker.js | 461 | DOM query | `document.getElementById('cancel-reset').addEventListener('click', () => {` |
| src/scripts/services/progress-tracker.js | 465 | DOM query | `document.getElementById('confirm-reset').addEventListener('click', () => {` |
| src/scripts/services/progress-tracker.js | 501 | DOM query | `const section = document.getElementById(sectionId);` |
| src/scripts/services/progress-tracker.js | 335 | Timer functions | `setTimeout(() => {` |
| src/scripts/services/progress-tracker.js | 479 | Timer functions | `setTimeout(() => {` |
| src/scripts/services/progress-tracker.js | 533 | Timer functions | `setTimeout(() => {` |
| src/scripts/services/progress-tracker.js | 535 | Timer functions | `setTimeout(() => {` |
| src/scripts/services/progress-tracker.js | 25 | Event listener | `document.addEventListener('DOMContentLoaded', () => this.init());` |
| src/scripts/services/progress-tracker.js | 31 | Event listener | `window.addEventListener('content-loaded', () => {` |
| src/scripts/services/progress-tracker.js | 86 | Event listener | `document.getElementById('reset-progress').addEventListener('click', (e) => {` |
| src/scripts/services/progress-tracker.js | 131 | Event listener | `control.addEventListener('click', () => this.toggleSectionProgress(sectionId, control));` |
| src/scripts/services/progress-tracker.js | 134 | Event listener | `control.addEventListener('keydown', (e) => {` |
| src/scripts/services/progress-tracker.js | 200 | Event listener | `fab.addEventListener('click', () => this.showProgressDialog());` |
| src/scripts/services/progress-tracker.js | 295 | Event listener | `document.getElementById('dialog-close').addEventListener('click', () => {` |
| src/scripts/services/progress-tracker.js | 299 | Event listener | `document.getElementById('dialog-reset-progress').addEventListener('click', () => {` |
| src/scripts/services/progress-tracker.js | 306 | Event listener | `checkbox.addEventListener('change', () => {` |
| src/scripts/services/progress-tracker.js | 327 | Event listener | `document.addEventListener('keydown', function closeOnEsc(e) {` |
| src/scripts/services/progress-tracker.js | 336 | Event listener | `document.addEventListener('click', function closeOnOutsideClick(e) {` |
| src/scripts/services/progress-tracker.js | 461 | Event listener | `document.getElementById('cancel-reset').addEventListener('click', () => {` |
| src/scripts/services/progress-tracker.js | 465 | Event listener | `document.getElementById('confirm-reset').addEventListener('click', () => {` |
| src/scripts/services/progress-tracker.js | 471 | Event listener | `document.addEventListener('keydown', function closeOnEsc(e) {` |
| src/scripts/services/progress-tracker.js | 480 | Event listener | `document.addEventListener('click', function closeOnOutsideClick(e) {` |
| src/scripts/services/pdf-export.js | 182 | DOM query | `document.getElementById('cancel-pdf-export').addEventListener('click', () => {` |
| src/scripts/services/pdf-export.js | 186 | DOM query | `document.getElementById('confirm-pdf-export').addEventListener('click', () => {` |
| src/scripts/services/pdf-export.js | 188 | DOM query | `includeToc: document.getElementById('pdf-include-toc').checked,` |
| src/scripts/services/pdf-export.js | 189 | DOM query | `expandDetails: document.getElementById('pdf-expand-details').checked,` |
| src/scripts/services/pdf-export.js | 190 | DOM query | `includeLinks: document.getElementById('pdf-include-links').checked,` |
| src/scripts/services/pdf-export.js | 191 | DOM query | `includeCover: document.getElementById('pdf-include-cover').checked,` |
| src/scripts/services/pdf-export.js | 192 | DOM query | `contentMode: document.querySelector('input[name="pdf-content"]:checked').id,` |
| src/scripts/services/pdf-export.js | 193 | DOM query | `quality: document.getElementById('pdf-quality').value` |
| src/scripts/services/pdf-export.js | 197 | DOM query | `document.getElementById('pdf-progress-container').style.display = 'block';` |
| src/scripts/services/pdf-export.js | 237 | DOM query | `updatePdfProgress(10, 'Loading required libraries...', document.querySelector('.pdf-export-dialog'));` |
| src/scripts/services/pdf-export.js | 283 | DOM query | `const contentContainer = document.getElementById('dynamic-content');` |
| src/scripts/services/pdf-export.js | 652 | DOM query | `const sections = Array.from(document.querySelectorAll('.section'));` |
| src/scripts/services/pdf-export.js | 715 | DOM query | `document.getElementById('close-pdf-success').addEventListener('click', () => {` |
| src/scripts/services/pdf-export.js | 740 | DOM query | `document.getElementById('close-pdf-error').addEventListener('click', () => {` |
| src/scripts/services/pdf-export.js | 223 | Timer functions | `setTimeout(() => {` |
| src/scripts/services/pdf-export.js | 14 | Event listener | `document.addEventListener('DOMContentLoaded', () => {` |
| src/scripts/services/pdf-export.js | 19 | Event listener | `document.addEventListener('keydown', (e) => {` |
| src/scripts/services/pdf-export.js | 59 | Event listener | `button.addEventListener('mouseover', () => {` |
| src/scripts/services/pdf-export.js | 64 | Event listener | `button.addEventListener('mouseout', () => {` |
| src/scripts/services/pdf-export.js | 70 | Event listener | `button.addEventListener('click', () => {` |
| src/scripts/services/pdf-export.js | 182 | Event listener | `document.getElementById('cancel-pdf-export').addEventListener('click', () => {` |
| src/scripts/services/pdf-export.js | 186 | Event listener | `document.getElementById('confirm-pdf-export').addEventListener('click', () => {` |
| src/scripts/services/pdf-export.js | 224 | Event listener | `document.addEventListener('click', function closeOnOutsideClick(e) {` |
| src/scripts/services/pdf-export.js | 715 | Event listener | `document.getElementById('close-pdf-success').addEventListener('click', () => {` |
| src/scripts/services/pdf-export.js | 740 | Event listener | `document.getElementById('close-pdf-error').addEventListener('click', () => {` |
| src/scripts/services/offline.js | 113 | DOM query | `if (document.getElementById(this.offlineBannerId)) {` |
| src/scripts/services/offline.js | 201 | DOM query | `const banner = document.getElementById(this.offlineBannerId);` |
| src/scripts/services/offline.js | 230 | DOM query | `if (document.getElementById('cache-status-button')) {` |
| src/scripts/services/offline.js | 288 | DOM query | `const button = document.getElementById('cache-status-button');` |
| src/scripts/services/offline.js | 514 | DOM query | `document.getElementById('close-cache-dialog').addEventListener('click', closeDialog);` |
| src/scripts/services/offline.js | 516 | DOM query | `document.getElementById('clear-cache-button').addEventListener('click', async () => {` |
| src/scripts/services/offline.js | 547 | DOM query | `document.getElementById('close-cache-dialog').addEventListener('click', closeDialog);` |
| src/scripts/services/offline.js | 101 | Timer functions | `setTimeout(() => {` |
| src/scripts/services/offline.js | 217 | Timer functions | `setTimeout(() => {` |
| src/scripts/services/offline.js | 421 | Timer functions | `setTimeout(() => {` |
| src/scripts/services/offline.js | 437 | Timer functions | `setTimeout(() => {` |
| src/scripts/services/offline.js | 22 | Event listener | `window.addEventListener('online', () => this.handleOnline());` |
| src/scripts/services/offline.js | 23 | Event listener | `window.addEventListener('offline', () => this.handleOffline());` |
| src/scripts/services/offline.js | 261 | Event listener | `button.addEventListener('mouseover', () => {` |
| src/scripts/services/offline.js | 265 | Event listener | `button.addEventListener('mouseout', () => {` |
| src/scripts/services/offline.js | 276 | Event listener | `button.addEventListener('click', () => this.showCacheStatus());` |
| src/scripts/services/offline.js | 438 | Event listener | `document.addEventListener('click', clickOutsideHandler);` |
| src/scripts/services/offline.js | 439 | Event listener | `document.addEventListener('keydown', keyHandler);` |
| src/scripts/services/offline.js | 514 | Event listener | `document.getElementById('close-cache-dialog').addEventListener('click', closeDialog);` |
| src/scripts/services/offline.js | 516 | Event listener | `document.getElementById('clear-cache-button').addEventListener('click', async () => {` |
| src/scripts/services/offline.js | 547 | Event listener | `document.getElementById('close-cache-dialog').addEventListener('click', closeDialog);` |
| src/scripts/services/offline.js | 613 | Event listener | `document.addEventListener('DOMContentLoaded', () => {` |
| src/scripts/services/content-loader.js | 56 | fetch API call | `const response = await fetch(contentFile);` |
| src/scripts/services/content-loader.js | 136 | DOM query | `document.querySelectorAll('.code-block .copy-button').forEach(button => {` |
| src/scripts/services/content-loader.js | 144 | DOM query | `document.querySelectorAll('details.guide-section').forEach(details => {` |
| src/scripts/services/content-loader.js | 204 | DOM query | `document.querySelectorAll('a[href^="#"]').forEach(link => {` |
| src/scripts/services/content-loader.js | 212 | DOM query | `const targetElement = document.querySelector(targetId);` |
| src/scripts/services/content-loader.js | 234 | DOM query | `document.querySelectorAll('a[href^="http"]').forEach(link => {` |
| src/scripts/services/content-loader.js | 276 | DOM query | `const targetElement = document.getElementById(targetId);` |
| src/scripts/services/content-loader.js | 304 | DOM query | `const mainContent = document.querySelector('.main-content');` |
| src/scripts/services/content-loader.js | 311 | DOM query | `let contentContainer = document.getElementById('dynamic-content');` |
| src/scripts/services/content-loader.js | 170 | Timer functions | `setTimeout(() => {` |
| src/scripts/services/content-loader.js | 195 | Timer functions | `setTimeout(() => {` |
| src/scripts/services/content-loader.js | 251 | Timer functions | `await new Promise(resolve => setTimeout(resolve, 50));` |
| src/scripts/services/content-loader.js | 265 | Timer functions | `await new Promise(resolve => setTimeout(resolve, 50));` |
| src/scripts/services/content-loader.js | 278 | Timer functions | `setTimeout(() => {` |
| src/scripts/services/content-loader.js | 149 | Event listener | `summary.addEventListener('click', (e) => {` |
| src/scripts/services/content-loader.js | 207 | Event listener | `link.addEventListener('click', (e) => {` |
| src/scripts/services/content-loader.js | 302 | Event listener | `document.addEventListener('DOMContentLoaded', function() {` |
| src/scripts/core/ui-improvements.js | 34 | Storage API access | `const savedTheme = localStorage.getItem('theme');` |
| src/scripts/core/ui-improvements.js | 42 | Storage API access | `localStorage.setItem('theme', isDark ? 'light-theme' : '');` |
| src/scripts/core/ui-improvements.js | 7 | DOM query | `if (!document.querySelector('.sdde-header')) {` |
| src/scripts/core/ui-improvements.js | 12 | DOM query | `document.querySelectorAll('.header:not(.sdde-header)').forEach(oldHeader => {` |
| src/scripts/core/ui-improvements.js | 30 | DOM query | `const themeSwitcher = document.getElementById('theme-toggle');` |
| src/scripts/core/ui-improvements.js | 87 | DOM query | `const header = document.querySelector('.sdde-header');` |
| src/scripts/core/ui-improvements.js | 88 | DOM query | `const mainContent = document.querySelector('.main-content');` |
| src/scripts/core/ui-improvements.js | 103 | DOM query | `document.querySelectorAll('details').forEach(details => {` |
| src/scripts/core/ui-improvements.js | 126 | DOM query | `document.querySelectorAll('pre code').forEach(codeBlock => {` |
| src/scripts/core/ui-improvements.js | 214 | DOM query | `const existingBar = document.querySelector('.scroll-progress');` |
| src/scripts/core/ui-improvements.js | 246 | DOM query | `document.querySelectorAll('.code-block').forEach(block => {` |
| src/scripts/core/ui-improvements.js | 290 | DOM query | `if (document.querySelector('.skip-to-content')) return;` |
| src/scripts/core/ui-improvements.js | 301 | DOM query | `const target = document.getElementById('dynamic-content');` |
| src/scripts/core/ui-improvements.js | 317 | DOM query | `const backToTop = document.getElementById('back-to-top');` |
| src/scripts/core/ui-improvements.js | 360 | DOM query | `document.getElementById('search-input').focus();` |
| src/scripts/core/ui-improvements.js | 366 | DOM query | `document.getElementById('theme-toggle').click();` |
| src/scripts/core/ui-improvements.js | 378 | DOM query | `const helpDialog = document.querySelector('.keyboard-shortcuts-dialog');` |
| src/scripts/core/ui-improvements.js | 384 | DOM query | `const searchInput = document.getElementById('search-input');` |
| src/scripts/core/ui-improvements.js | 441 | DOM query | `if (!document.querySelector('.keyboard-shortcuts-button')) {` |
| src/scripts/core/ui-improvements.js | 459 | DOM query | `const existingHelp = document.querySelector('.keyboard-shortcuts-help');` |
| src/scripts/core/ui-improvements.js | 505 | DOM query | `document.getElementById('close-shortcuts-help').addEventListener('click', () => {` |
| src/scripts/core/ui-improvements.js | 531 | DOM query | `const sections = Array.from(document.querySelectorAll('.section'));` |
| src/scripts/core/ui-improvements.js | 577 | DOM query | `document.querySelectorAll('.sidebar a').forEach(link => {` |
| src/scripts/core/ui-improvements.js | 582 | DOM query | `const activeLink = document.querySelector(\`.sidebar a[href="#${sectionId}"]\`);` |
| src/scripts/core/ui-improvements.js | 592 | DOM query | `document.querySelectorAll('.code-block').forEach(block => {` |
| src/scripts/core/ui-improvements.js | 639 | DOM query | `document.querySelectorAll('.code-block').forEach(block => {` |
| src/scripts/core/ui-improvements.js | 669 | DOM query | `document.querySelectorAll('a[href^="http"]').forEach(link => {` |
| src/scripts/core/ui-improvements.js | 693 | DOM query | `const tocLinks = document.querySelectorAll('.toc a[href^="#"]');` |
| src/scripts/core/ui-improvements.js | 718 | DOM query | `const heading = document.getElementById(headingId);` |
| src/scripts/core/ui-improvements.js | 157 | Timer functions | `setTimeout(initializeUIImprovements, 500);` |
| src/scripts/core/ui-improvements.js | 277 | Timer functions | `tapTimeout = setTimeout(() => {` |
| src/scripts/core/ui-improvements.js | 5 | Event listener | `document.addEventListener('DOMContentLoaded', function() {` |
| src/scripts/core/ui-improvements.js | 21 | Event listener | `window.addEventListener('content-loaded', function() {` |
| src/scripts/core/ui-improvements.js | 40 | Event listener | `themeSwitcher.addEventListener('click', function() {` |
| src/scripts/core/ui-improvements.js | 54 | Event listener | `window.addEventListener('resize', function() {` |
| src/scripts/core/ui-improvements.js | 112 | Event listener | `details.addEventListener('toggle', function() {` |
| src/scripts/core/ui-improvements.js | 152 | Event listener | `document.addEventListener('DOMContentLoaded', function() {` |
| src/scripts/core/ui-improvements.js | 154 | Event listener | `window.addEventListener('content-loaded', initializeUIImprovements);` |
| src/scripts/core/ui-improvements.js | 235 | Event listener | `window.addEventListener('scroll', () => {` |
| src/scripts/core/ui-improvements.js | 265 | Event listener | `block.addEventListener('touchend', (e) => {` |
| src/scripts/core/ui-improvements.js | 299 | Event listener | `skipLink.addEventListener('click', (e) => {` |
| src/scripts/core/ui-improvements.js | 324 | Event listener | `window.addEventListener('scroll', () => {` |
| src/scripts/core/ui-improvements.js | 333 | Event listener | `backToTop.addEventListener('click', (e) => {` |
| src/scripts/core/ui-improvements.js | 350 | Event listener | `document.addEventListener('keydown', function(e) {` |
| src/scripts/core/ui-improvements.js | 448 | Event listener | `helpButton.addEventListener('click', showKeyboardShortcutsHelp);` |
| src/scripts/core/ui-improvements.js | 505 | Event listener | `document.getElementById('close-shortcuts-help').addEventListener('click', () => {` |
| src/scripts/core/ui-improvements.js | 510 | Event listener | `document.addEventListener('keydown', function closeHelp(e) {` |
| src/scripts/core/ui-improvements.js | 518 | Event listener | `document.addEventListener('click', function closeHelp(e) {` |
| src/scripts/core/ui-improvements.js | 606 | Event listener | `copyButton.addEventListener('click', () => {` |
| src/scripts/core/ui-improvements.js | 649 | Event listener | `block.addEventListener('click', function(e) {` |
| src/scripts/core/ui-improvements.js | 733 | Event listener | `document.addEventListener('keydown', (e) => {` |
| src/scripts/core/ui-improvements.js | 741 | Event listener | `document.addEventListener('mousedown', () => {` |
| src/scripts/core/ui-improvements.js | 747 | Event listener | `document.addEventListener('touchstart', () => {` |
| src/scripts/core/renderer.js | 18 | Storage API access | `localStorage.setItem('sidebarHidden', sidebar.classList.contains('sidebar-hidden'));` |
| src/scripts/core/renderer.js | 22 | Storage API access | `const sidebarHidden = localStorage.getItem('sidebarHidden') === 'true';` |
| src/scripts/core/renderer.js | 7 | DOM query | `const toggleButton = document.querySelector('.toggle-sidebar');` |
| src/scripts/core/renderer.js | 8 | DOM query | `const sidebar = document.querySelector('.sidebar');` |
| src/scripts/core/renderer.js | 9 | DOM query | `const mainContent = document.querySelector('.main-content');` |
| src/scripts/core/renderer.js | 32 | DOM query | `const backToTopButton = document.getElementById('back-to-top');` |
| src/scripts/core/renderer.js | 58 | DOM query | `const navLinks = document.querySelectorAll('.sidebar a');` |
| src/scripts/core/renderer.js | 59 | DOM query | `const sections = document.querySelectorAll('.section');` |
| src/scripts/core/renderer.js | 101 | DOM query | `const targetElement = document.querySelector(targetId);` |
| src/scripts/core/renderer.js | 119 | DOM query | `const searchInput = document.getElementById('search-input');` |
| src/scripts/core/renderer.js | 131 | DOM query | `document.querySelectorAll('.guide-section').forEach(item => {` |
| src/scripts/core/renderer.js | 175 | DOM query | `const noResultsMessage = document.getElementById('no-results-message');` |
| src/scripts/core/renderer.js | 188 | DOM query | `const clearSearchButton = document.getElementById('clear-search');` |
| src/scripts/core/renderer.js | 254 | DOM query | `document.querySelectorAll('details.guide-section').forEach(details => {` |
| src/scripts/core/renderer.js | 317 | DOM query | `document.querySelectorAll('a[href^="http"]').forEach(link => {` |
| src/scripts/core/renderer.js | 393 | DOM query | `const targetElement = document.querySelector(window.location.hash);` |
| src/scripts/core/renderer.js | 232 | Timer functions | `setTimeout(() => {` |
| src/scripts/core/renderer.js | 240 | Timer functions | `setTimeout(() => {` |
| src/scripts/core/renderer.js | 279 | Timer functions | `setTimeout(() => {` |
| src/scripts/core/renderer.js | 304 | Timer functions | `setTimeout(() => {` |
| src/scripts/core/renderer.js | 368 | Timer functions | `timeout = setTimeout(() => func.apply(context, args), wait);` |
| src/scripts/core/renderer.js | 395 | Timer functions | `setTimeout(() => {` |
| src/scripts/core/renderer.js | 1 | Event listener | `document.addEventListener('DOMContentLoaded', function() {` |
| src/scripts/core/renderer.js | 12 | Event listener | `toggleButton.addEventListener('click', () => {` |
| src/scripts/core/renderer.js | 36 | Event listener | `window.addEventListener('scroll', () => {` |
| src/scripts/core/renderer.js | 45 | Event listener | `backToTopButton.addEventListener('click', () => {` |
| src/scripts/core/renderer.js | 89 | Event listener | `window.addEventListener('scroll', debounce(setActiveNavLink, 100));` |
| src/scripts/core/renderer.js | 96 | Event listener | `link.addEventListener('click', (e) => {` |
| src/scripts/core/renderer.js | 122 | Event listener | `searchInput.addEventListener('input', debounce(() => {` |
| src/scripts/core/renderer.js | 190 | Event listener | `clearSearchButton.addEventListener('click', () => {` |
| src/scripts/core/renderer.js | 258 | Event listener | `summary.addEventListener('click', (e) => {` |
| src/scripts/core/renderer.js | 329 | Event listener | `document.addEventListener('keydown', (e) => {` |
| src/scripts/core/renderer.js | 388 | Event listener | `window.addEventListener('load', () => {` |
| src/scripts/core/main.js | 3 | DOM query | `const toggleButton = document.querySelector('.toggle-sidebar');` |
| src/scripts/core/main.js | 4 | DOM query | `const sidebar = document.querySelector('.sidebar');` |
| src/scripts/core/main.js | 5 | DOM query | `const mainContent = document.querySelector('.main-content');` |
| src/scripts/core/main.js | 48 | DOM query | `const searchInput = document.getElementById('search-input');` |
| src/scripts/core/main.js | 49 | DOM query | `const sections = document.querySelectorAll('.section');` |
| src/scripts/core/main.js | 50 | DOM query | `const guideItems = document.querySelectorAll('.guide-section');` |
| src/scripts/core/main.js | 108 | DOM query | `const navLinks = document.querySelectorAll('.sidebar a');` |
| src/scripts/core/main.js | 136 | DOM query | `const headerHeight = document.querySelector('.sdde-header').offsetHeight;` |
| src/scripts/core/main.js | 139 | DOM query | `document.querySelectorAll('a[href^="#"]').forEach(anchor => {` |
| src/scripts/core/main.js | 144 | DOM query | `const targetElement = document.getElementById(targetId);` |
| src/scripts/core/main.js | 1 | Event listener | `document.addEventListener('DOMContentLoaded', function() {` |
| src/scripts/core/main.js | 7 | Event listener | `toggleButton.addEventListener('click', () => {` |
| src/scripts/core/main.js | 40 | Event listener | `backToTopButton.addEventListener('click', () => {` |
| src/scripts/core/main.js | 52 | Event listener | `searchInput.addEventListener('input', () => {` |
| src/scripts/core/main.js | 129 | Event listener | `window.addEventListener('scroll', setActiveNavLink);` |
| src/scripts/core/main.js | 140 | Event listener | `anchor.addEventListener('click', function (e) {` |
| src/scripts/core/main.js | 158 | Event listener | `window.addEventListener('content-loaded', updateScrollHandlers);` |
| src/scripts/core/layout.js | 98 | Storage API access | `const sidebarHidden = localStorage.getItem('sidebarHidden') === 'true';` |
| src/scripts/core/layout.js | 116 | Storage API access | `localStorage.setItem('sidebarHidden', sidebar.classList.contains('sidebar-hidden'));` |
| src/scripts/core/layout.js | 132 | Storage API access | `localStorage.setItem('sidebarHidden', 'true');` |
| src/scripts/core/layout.js | 28 | DOM query | `if (!document.querySelector('.page-container')) {` |
| src/scripts/core/layout.js | 30 | DOM query | `const sidebar = document.querySelector('.sidebar');` |
| src/scripts/core/layout.js | 31 | DOM query | `const mainContent = document.querySelector('.main-content');` |
| src/scripts/core/layout.js | 89 | DOM query | `const toggleButton = document.querySelector('.toggle-sidebar');` |
| src/scripts/core/layout.js | 90 | DOM query | `const sidebar = document.querySelector('.sidebar');` |
| src/scripts/core/layout.js | 91 | DOM query | `const mainContent = document.querySelector('.main-content');` |
| src/scripts/core/layout.js | 145 | DOM query | `const sidebar = document.querySelector('.sidebar');` |
| src/scripts/core/layout.js | 146 | DOM query | `const mainContent = document.querySelector('.main-content');` |
| src/scripts/core/layout.js | 147 | DOM query | `const toggleButton = document.querySelector('.toggle-sidebar');` |
| src/scripts/core/layout.js | 168 | DOM query | `const codeBlocks = document.querySelectorAll('.code-block');` |
| src/scripts/core/layout.js | 182 | DOM query | `const svgContainer = document.querySelector('.header-svg');` |
| src/scripts/core/layout.js | 186 | DOM query | `const headerContainer = document.querySelector('.header-container');` |
| src/scripts/core/layout.js | 6 | Event listener | `document.addEventListener('DOMContentLoaded', function() {` |
| src/scripts/core/layout.js | 14 | Event listener | `window.addEventListener('resize', handleResize);` |
| src/scripts/core/layout.js | 109 | Event listener | `toggleButton.addEventListener('click', () => {` |
| src/scripts/core/layout.js | 126 | Event listener | `link.addEventListener('click', () => {` |
| src/scripts/core/layout.js | 191 | Event listener | `svgContainer.addEventListener('load', function() {` |
| src/scripts/core/layout.js | 255 | Event listener | `svgContainer.addEventListener('error', function() {` |
| src/scripts/core/font-loader.js | 8 | Storage API access | `this.fontPreference = localStorage.getItem('fontPreference') \|\| 'default';` |
| src/scripts/core/font-loader.js | 9 | Storage API access | `this.dyslexicMode = localStorage.getItem('dyslexicMode') === 'true';` |
| src/scripts/core/font-loader.js | 53 | Storage API access | `localStorage.setItem('fontPreference', preference);` |
| src/scripts/core/font-loader.js | 99 | Storage API access | `localStorage.setItem('dyslexicMode', this.dyslexicMode);` |
| src/scripts/core/font-loader.js | 61 | DOM query | `const preferencesPanel = document.querySelector('.preferences-content');` |
| src/scripts/core/font-loader.js | 89 | DOM query | `const fontSelect = document.getElementById('font-preference');` |
| src/scripts/core/font-loader.js | 95 | DOM query | `const dyslexicCheck = document.getElementById('dyslexic-mode');` |
| src/scripts/core/font-loader.js | 17 | Event listener | `document.addEventListener('DOMContentLoaded', () => {` |
| src/scripts/core/font-loader.js | 91 | Event listener | `fontSelect.addEventListener('change', (e) => {` |
| src/scripts/core/font-loader.js | 96 | Event listener | `dyslexicCheck.addEventListener('change', (e) => {` |
| src/scripts/components/preferences.js | 560 | Storage API access | `autoSaveToggle.checked = localStorage.getItem('autoSavePreferences') === 'true';` |
| src/scripts/components/preferences.js | 563 | Storage API access | `localStorage.setItem('autoSavePreferences', this.checked);` |
| src/scripts/components/preferences.js | 608 | Storage API access | `if (localStorage.getItem('autoSavePreferences') === 'true') {` |
| src/scripts/components/preferences.js | 641 | Storage API access | `if (localStorage.getItem('autoSavePreferences') === 'true') {` |
| src/scripts/components/preferences.js | 1075 | Storage API access | `const storedPrefs = localStorage.getItem('userPreferences');` |
| src/scripts/components/preferences.js | 1093 | Storage API access | `localStorage.setItem('userPreferences', JSON.stringify(userPreferences));` |
| src/scripts/components/preferences.js | 1035 | JSON parsing | `const importedPrefs = JSON.parse(reader.result);` |
| src/scripts/components/preferences.js | 1077 | JSON parsing | `userPreferences = {...defaultPreferences, ...JSON.parse(storedPrefs)};` |
| src/scripts/components/preferences.js | 63 | DOM query | `const themeToggle = document.getElementById('theme-toggle');` |
| src/scripts/components/preferences.js | 99 | DOM query | `if (document.getElementById('preferences-button')) return;` |
| src/scripts/components/preferences.js | 132 | DOM query | `let dialogElement = document.querySelector('.preferences-dialog');` |
| src/scripts/components/preferences.js | 472 | DOM query | `document.getElementById('save-preferences-btn').addEventListener('click', function() {` |
| src/scripts/components/preferences.js | 479 | DOM query | `document.getElementById('reset-preferences-btn').addEventListener('click', function() {` |
| src/scripts/components/preferences.js | 492 | DOM query | `document.getElementById('export-prefs-btn').addEventListener('click', exportPreferences);` |
| src/scripts/components/preferences.js | 495 | DOM query | `document.getElementById('import-prefs-btn').addEventListener('click', importPreferences);` |
| src/scripts/components/preferences.js | 502 | DOM query | `const tabButtons = document.querySelectorAll('.tab-button');` |
| src/scripts/components/preferences.js | 507 | DOM query | `document.querySelectorAll('.tab-button').forEach(btn => {` |
| src/scripts/components/preferences.js | 512 | DOM query | `document.querySelectorAll('.preferences-tab-content').forEach(tab => {` |
| src/scripts/components/preferences.js | 523 | DOM query | `const tabContent = document.getElementById(tabId + '-tab');` |
| src/scripts/components/preferences.js | 557 | DOM query | `const autoSaveToggle = document.getElementById('auto-save-toggle');` |
| src/scripts/components/preferences.js | 574 | DOM query | `document.querySelectorAll('.preference-item').forEach(item => {` |
| src/scripts/components/preferences.js | 594 | DOM query | `const select = document.getElementById(elementId);` |
| src/scripts/components/preferences.js | 618 | DOM query | `const toggle = document.getElementById(elementId);` |
| src/scripts/components/preferences.js | 660 | DOM query | `document.querySelectorAll('.preference-item').forEach(item => {` |
| src/scripts/components/preferences.js | 809 | DOM query | `const mainContent = document.querySelector('.main-content');` |
| src/scripts/components/preferences.js | 819 | DOM query | `const sidebar = document.querySelector('.sidebar');` |
| src/scripts/components/preferences.js | 853 | DOM query | `document.querySelectorAll('.code-block').forEach(block => {` |
| src/scripts/components/preferences.js | 887 | DOM query | `const select = document.getElementById(id);` |
| src/scripts/components/preferences.js | 905 | DOM query | `const toggle = document.getElementById(id);` |
| src/scripts/components/preferences.js | 914 | DOM query | `const dialog = document.querySelector('.preferences-dialog');` |
| src/scripts/components/preferences.js | 948 | DOM query | `document.getElementById('confirm-btn').focus();` |
| src/scripts/components/preferences.js | 952 | DOM query | `document.getElementById('cancel-btn').addEventListener('click', () => {` |
| src/scripts/components/preferences.js | 956 | DOM query | `document.getElementById('confirm-btn').addEventListener('click', () => {` |
| src/scripts/components/preferences.js | 1175 | DOM query | `const existingNotification = document.querySelector('.preferences-notification');` |
| src/scripts/components/preferences.js | 1204 | DOM query | `if (!document.querySelector('style[data-id="notification-style"]')) {` |
| src/scripts/components/preferences.js | 67 | Timer functions | `setTimeout(function() {` |
| src/scripts/components/preferences.js | 89 | Timer functions | `timeout = setTimeout(function() {` |
| src/scripts/components/preferences.js | 632 | Timer functions | `setTimeout(() => {` |
| src/scripts/components/preferences.js | 678 | Timer functions | `setTimeout(() => {` |
| src/scripts/components/preferences.js | 947 | Timer functions | `setTimeout(() => {` |
| src/scripts/components/preferences.js | 1193 | Timer functions | `setTimeout(() => {` |
| src/scripts/components/preferences.js | 43 | Event listener | `document.addEventListener('DOMContentLoaded', function() {` |
| src/scripts/components/preferences.js | 56 | Event listener | `window.addEventListener('content-loaded', function() {` |
| src/scripts/components/preferences.js | 65 | Event listener | `themeToggle.addEventListener('click', function() {` |
| src/scripts/components/preferences.js | 74 | Event listener | `window.addEventListener('resize', debounce(function() {` |
| src/scripts/components/preferences.js | 108 | Event listener | `button.addEventListener('click', showPreferencesDialog);` |
| src/scripts/components/preferences.js | 112 | Event listener | `document.addEventListener('keydown', function(e) {` |
| src/scripts/components/preferences.js | 457 | Event listener | `document.addEventListener('keydown', function escapeHandler(e) {` |
| src/scripts/components/preferences.js | 465 | Event listener | `dialogElement.addEventListener('click', function(e) {` |
| src/scripts/components/preferences.js | 472 | Event listener | `document.getElementById('save-preferences-btn').addEventListener('click', function() {` |
| src/scripts/components/preferences.js | 479 | Event listener | `document.getElementById('reset-preferences-btn').addEventListener('click', function() {` |
| src/scripts/components/preferences.js | 492 | Event listener | `document.getElementById('export-prefs-btn').addEventListener('click', exportPreferences);` |
| src/scripts/components/preferences.js | 495 | Event listener | `document.getElementById('import-prefs-btn').addEventListener('click', importPreferences);` |
| src/scripts/components/preferences.js | 505 | Event listener | `button.addEventListener('click', function() {` |
| src/scripts/components/preferences.js | 562 | Event listener | `autoSaveToggle.addEventListener('change', function() {` |
| src/scripts/components/preferences.js | 578 | Event listener | `item.addEventListener('click', function(e) {` |
| src/scripts/components/preferences.js | 601 | Event listener | `select.addEventListener('change', function() {` |
| src/scripts/components/preferences.js | 625 | Event listener | `toggle.addEventListener('change', function() {` |
| src/scripts/components/preferences.js | 647 | Event listener | `toggle.addEventListener('keydown', function(e) {` |
| src/scripts/components/preferences.js | 664 | Event listener | `item.addEventListener('click', function(e) {` |
| src/scripts/components/preferences.js | 690 | Event listener | `toggle.addEventListener('change', function() {` |
| src/scripts/components/preferences.js | 695 | Event listener | `item.addEventListener('keydown', function(e) {` |
| src/scripts/components/preferences.js | 952 | Event listener | `document.getElementById('cancel-btn').addEventListener('click', () => {` |
| src/scripts/components/preferences.js | 956 | Event listener | `document.getElementById('confirm-btn').addEventListener('click', () => {` |
| src/scripts/components/preferences.js | 962 | Event listener | `dialog.addEventListener('click', e => {` |
| src/scripts/components/preferences.js | 969 | Event listener | `document.addEventListener('keydown', function escapeHandler(e) {` |
| src/scripts/components/preferences.js | 1023 | Event listener | `fileInput.addEventListener('change', function() {` |
| src/scripts/components/preferences.js | 1032 | Event listener | `reader.addEventListener('load', function() {` |
| src/scripts/components/navigation.js | 18 | Storage API access | `const preferModernNav = localStorage.getItem('preferModernNav') !== 'false';` |
| src/scripts/components/navigation.js | 46 | Storage API access | `localStorage.setItem('preferModernNav', isModernNav);` |
| src/scripts/components/navigation.js | 8 | DOM query | `const oldHeaderContainer = document.querySelector('.header:not(.sdde-header)');` |
| src/scripts/components/navigation.js | 29 | DOM query | `const headerActions = document.querySelector('.header-actions');` |
| src/scripts/components/navigation.js | 30 | DOM query | `if (!headerActions \|\| document.getElementById('nav-toggle-button')) return;` |
| src/scripts/components/navigation.js | 63 | DOM query | `const headerNavLinks = document.querySelectorAll('.header-nav a');` |
| src/scripts/components/navigation.js | 64 | DOM query | `const sidebarNavLinks = document.querySelectorAll('.sidebar a');` |
| src/scripts/components/navigation.js | 92 | DOM query | `const targetElement = document.querySelector(targetId);` |
| src/scripts/components/navigation.js | 97 | DOM query | `const header = document.querySelector('.sdde-header');` |
| src/scripts/components/navigation.js | 100 | DOM query | `const sidebar = document.querySelector('.sidebar');` |
| src/scripts/components/navigation.js | 101 | DOM query | `const toggleButton = document.querySelector('.toggle-sidebar');` |
| src/scripts/components/navigation.js | 108 | DOM query | `const headerHeight = document.querySelector('.sdde-header').offsetHeight \|\| 70;` |
| src/scripts/components/navigation.js | 137 | DOM query | `document.querySelectorAll('.header-nav a, .sidebar a').forEach(link => {` |
| src/scripts/components/navigation.js | 142 | DOM query | `document.querySelectorAll(\`.header-nav a[href="${targetId}"], .sidebar a[href="${targetId}"]\`).forEach(link => {` |
| src/scripts/components/navigation.js | 153 | DOM query | `const targetElement = document.querySelector(targetId);` |
| src/scripts/components/navigation.js | 159 | DOM query | `const headerHeight = document.querySelector('.sdde-header').offsetHeight \|\| 70;` |
| src/scripts/components/navigation.js | 186 | DOM query | `const sections = document.querySelectorAll('.section[id], [id^="section-"]');` |
| src/scripts/components/navigation.js | 192 | DOM query | `const headerHeight = document.querySelector('.sdde-header').offsetHeight \|\| 70;` |
| src/scripts/components/navigation.js | 50 | Timer functions | `setTimeout(() => {` |
| src/scripts/components/navigation.js | 157 | Timer functions | `setTimeout(() => {` |
| src/scripts/components/navigation.js | 229 | Timer functions | `timeout = setTimeout(() => func.apply(context, args), wait);` |
| src/scripts/components/navigation.js | 6 | Event listener | `document.addEventListener('DOMContentLoaded', function() {` |
| src/scripts/components/navigation.js | 15 | Event listener | `window.addEventListener('content-loaded', initNavigation);` |
| src/scripts/components/navigation.js | 44 | Event listener | `navToggle.addEventListener('click', function() {` |
| src/scripts/components/navigation.js | 86 | Event listener | `link.addEventListener('click', function(e) {` |
| src/scripts/components/navigation.js | 190 | Event listener | `window.addEventListener('scroll', debounce(function() {` |

## Potential Undefined Access

| File | Line | Property Chain | Code |
| ---- | ---- | -------------- | ---- |
| src/scripts/utils/print-helper.js | 206 | document.body.classList.add | `document.body.classList.add('preparing-print');` |
| src/scripts/utils/print-helper.js | 320 | document.body.classList.remove | `document.body.classList.remove('preparing-print');` |
| src/scripts/utils/print-helper.js | 325 | item.element.classList.remove | `item.element.classList.remove('expanded');` |
| src/scripts/utils/layout-utilities.js | 90 | table.parentNode.classList.contains | `if (table.parentNode.classList.contains('table-responsive')) return;` |
| src/scripts/utils/debug-helper.js | 32 | document.body.classList.add | `document.body.classList.add('debug-layout');` |
| src/scripts/utils/debug-helper.js | 57 | document.body.classList.toggle | `document.body.classList.toggle('debug-layout');` |
| src/scripts/utils/debug-helper.js | 60 | document.body.classList.contains | `if (document.body.classList.contains('debug-layout')) {` |
| src/scripts/utils/debug-helper.js | 60 | document.body.classList.contains | `if (document.body.classList.contains('debug-layout')) {` |
| src/scripts/utils/debug-helper.js | 60 | document.body.classList.contains | `if (document.body.classList.contains('debug-layout')) {` |
| src/scripts/utils/debug-helper.js | 57 | document.body.classList.toggle | `document.body.classList.toggle('debug-layout');` |
| src/scripts/utils/debug-helper.js | 60 | document.body.classList.contains | `if (document.body.classList.contains('debug-layout')) {` |
| src/scripts/services/version-manager.js | 74 | document.body.classList.contains | `if (document.body.classList.contains('content-loaded')) {` |
| src/scripts/services/search.js | 68 | this.searchNavigation.style.cssText | `this.searchNavigation.style.cssText = \`` |
| src/scripts/services/search.js | 141 | this.searchInput.value.trim | `const searchTerm = this.searchInput.value.trim();` |
| src/scripts/services/search.js | 155 | this.clearButton.style.display | `this.clearButton.style.display = searchTerm ? 'block' : 'none';` |
| src/scripts/services/search.js | 155 | this.clearButton.style.display | `this.clearButton.style.display = searchTerm ? 'block' : 'none';` |
| src/scripts/services/search.js | 223 | this.searchNavigation.style.display | `this.searchNavigation.style.display = 'none';` |
| src/scripts/services/search.js | 226 | this.noResultsMessage.style.display | `this.noResultsMessage.style.display = 'none';` |
| src/scripts/services/search.js | 223 | this.searchNavigation.style.display | `this.searchNavigation.style.display = 'none';` |
| src/scripts/services/search.js | 226 | this.noResultsMessage.style.display | `this.noResultsMessage.style.display = 'none';` |
| src/scripts/services/search.js | 226 | this.noResultsMessage.style.display | `this.noResultsMessage.style.display = 'none';` |
| src/scripts/services/search.js | 223 | this.searchNavigation.style.display | `this.searchNavigation.style.display = 'none';` |
| src/scripts/services/search.js | 155 | this.clearButton.style.display | `this.clearButton.style.display = searchTerm ? 'block' : 'none';` |
| src/scripts/services/search.js | 226 | this.noResultsMessage.style.display | `this.noResultsMessage.style.display = 'none';` |
| src/scripts/services/search.js | 442 | document.body.classList.contains | `if (document.body.classList.contains('content-loaded')) {` |
| src/scripts/services/progress-tracker.js | 45 | document.body.classList.contains | `if (document.body.classList.contains('content-loaded')) {` |
| src/scripts/services/pdf-export.js | 243 | jspdf.umd.min.js | `jsPdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';` |
| src/scripts/services/pdf-export.js | 382 | pdf.internal.pageSize.getWidth | `const pageWidth = pdf.internal.pageSize.getWidth();` |
| src/scripts/services/pdf-export.js | 383 | pdf.internal.pageSize.getHeight | `const pageHeight = pdf.internal.pageSize.getHeight();` |
| src/scripts/services/offline.js | 36 | document.body.classList.remove | `document.body.classList.remove(this.offlineClass);` |
| src/scripts/services/offline.js | 39 | document.body.classList.add | `document.body.classList.add(this.offlineClass);` |
| src/scripts/services/offline.js | 36 | document.body.classList.remove | `document.body.classList.remove(this.offlineClass);` |
| src/scripts/services/offline.js | 39 | document.body.classList.add | `document.body.classList.add(this.offlineClass);` |
| src/scripts/services/content-loader.js | 271 | document.body.classList.add | `document.body.classList.add('content-loaded');` |
| src/scripts/services/content-loader.js | 275 | window.location.hash.substring | `const targetId = window.location.hash.substring(1);` |
| src/scripts/core/ui-improvements.js | 36 | document.body.classList.add | `document.body.classList.add(savedTheme);` |
| src/scripts/core/ui-improvements.js | 41 | document.body.classList.toggle | `const isDark = document.body.classList.toggle('light-theme');` |
| src/scripts/core/ui-improvements.js | 66 | document.body.classList.remove | `document.body.classList.remove('xs', 'sm', 'md', 'lg', 'xl');` |
| src/scripts/core/ui-improvements.js | 36 | document.body.classList.add | `document.body.classList.add(savedTheme);` |
| src/scripts/core/ui-improvements.js | 36 | document.body.classList.add | `document.body.classList.add(savedTheme);` |
| src/scripts/core/ui-improvements.js | 36 | document.body.classList.add | `document.body.classList.add(savedTheme);` |
| src/scripts/core/ui-improvements.js | 36 | document.body.classList.add | `document.body.classList.add(savedTheme);` |
| src/scripts/core/ui-improvements.js | 36 | document.body.classList.add | `document.body.classList.add(savedTheme);` |
| src/scripts/core/ui-improvements.js | 142 | codeBlock.parentNode.classList.add | `codeBlock.parentNode.classList.add('has-line-numbers');` |
| src/scripts/core/ui-improvements.js | 567 | window.location.hash.substring | `const sectionId = window.location.hash.substring(1);` |
| src/scripts/core/ui-improvements.js | 651 | e.target.classList.contains | `if (e.target.classList.contains('copy-button')) return;` |
| src/scripts/core/ui-improvements.js | 36 | document.body.classList.add | `document.body.classList.add(savedTheme);` |
| src/scripts/core/ui-improvements.js | 66 | document.body.classList.remove | `document.body.classList.remove('xs', 'sm', 'md', 'lg', 'xl');` |
| src/scripts/core/ui-improvements.js | 66 | document.body.classList.remove | `document.body.classList.remove('xs', 'sm', 'md', 'lg', 'xl');` |
| src/scripts/core/renderer.js | 389 | document.body.classList.add | `document.body.classList.add('loaded');` |
| src/scripts/core/layout.js | 95 | document.body.classList.add | `document.body.classList.add('has-sidebar');` |
| src/scripts/core/layout.js | 102 | document.body.classList.remove | `document.body.classList.remove('sidebar-active');` |
| src/scripts/core/layout.js | 95 | document.body.classList.add | `document.body.classList.add('has-sidebar');` |
| src/scripts/core/layout.js | 112 | document.body.classList.toggle | `document.body.classList.toggle('sidebar-active');` |
| src/scripts/core/layout.js | 102 | document.body.classList.remove | `document.body.classList.remove('sidebar-active');` |
| src/scripts/core/font-loader.js | 23 | document.body.classList.add | `document.body.classList.add('dyslexic-mode');` |
| src/scripts/core/font-loader.js | 37 | document.body.classList.remove | `document.body.classList.remove('font-default', 'font-readable', 'font-dyslexic');` |
| src/scripts/core/font-loader.js | 23 | document.body.classList.add | `document.body.classList.add('dyslexic-mode');` |
| src/scripts/core/font-loader.js | 23 | document.body.classList.add | `document.body.classList.add('dyslexic-mode');` |
| src/scripts/core/font-loader.js | 23 | document.body.classList.add | `document.body.classList.add('dyslexic-mode');` |
| src/scripts/core/font-loader.js | 98 | document.body.classList.toggle | `document.body.classList.toggle('dyslexic-mode', this.dyslexicMode);` |
| src/scripts/components/preferences.js | 667 | e.target.classList.contains | `const isSliderElement = e.target.classList.contains('toggle-slider');` |
| src/scripts/components/preferences.js | 713 | document.body.classList.remove | `document.body.classList.remove('theme-dracula', 'theme-light', 'theme-dark', 'theme-high-contrast');` |
| src/scripts/components/preferences.js | 714 | document.body.classList.add | `document.body.classList.add(value);` |
| src/scripts/components/preferences.js | 713 | document.body.classList.remove | `document.body.classList.remove('theme-dracula', 'theme-light', 'theme-dark', 'theme-high-contrast');` |
| src/scripts/components/preferences.js | 714 | document.body.classList.add | `document.body.classList.add(value);` |
| src/scripts/components/preferences.js | 713 | document.body.classList.remove | `document.body.classList.remove('theme-dracula', 'theme-light', 'theme-dark', 'theme-high-contrast');` |
| src/scripts/components/preferences.js | 714 | document.body.classList.add | `document.body.classList.add(value);` |
| src/scripts/components/preferences.js | 713 | document.body.classList.remove | `document.body.classList.remove('theme-dracula', 'theme-light', 'theme-dark', 'theme-high-contrast');` |
| src/scripts/components/preferences.js | 714 | document.body.classList.add | `document.body.classList.add(value);` |
| src/scripts/components/preferences.js | 713 | document.body.classList.remove | `document.body.classList.remove('theme-dracula', 'theme-light', 'theme-dark', 'theme-high-contrast');` |
| src/scripts/components/preferences.js | 714 | document.body.classList.add | `document.body.classList.add(value);` |
| src/scripts/components/preferences.js | 713 | document.body.classList.remove | `document.body.classList.remove('theme-dracula', 'theme-light', 'theme-dark', 'theme-high-contrast');` |
| src/scripts/components/preferences.js | 714 | document.body.classList.add | `document.body.classList.add(value);` |
| src/scripts/components/preferences.js | 745 | document.body.classList.toggle | `document.body.classList.toggle('high-contrast', value);` |
| src/scripts/components/preferences.js | 745 | document.body.classList.toggle | `document.body.classList.toggle('high-contrast', value);` |
| src/scripts/components/preferences.js | 745 | document.body.classList.toggle | `document.body.classList.toggle('high-contrast', value);` |
| src/scripts/components/preferences.js | 745 | document.body.classList.toggle | `document.body.classList.toggle('high-contrast', value);` |
| src/scripts/components/preferences.js | 745 | document.body.classList.toggle | `document.body.classList.toggle('high-contrast', value);` |
| src/scripts/components/preferences.js | 745 | document.body.classList.toggle | `document.body.classList.toggle('high-contrast', value);` |
| src/scripts/components/preferences.js | 745 | document.body.classList.toggle | `document.body.classList.toggle('high-contrast', value);` |
| src/scripts/components/preferences.js | 745 | document.body.classList.toggle | `document.body.classList.toggle('high-contrast', value);` |
| src/scripts/components/preferences.js | 745 | document.body.classList.toggle | `document.body.classList.toggle('high-contrast', value);` |
| src/scripts/components/preferences.js | 780 | document.documentElement.style.scrollBehavior | `document.documentElement.style.scrollBehavior = value ? 'smooth' : 'auto';` |
| src/scripts/components/preferences.js | 713 | document.body.classList.remove | `document.body.classList.remove('theme-dracula', 'theme-light', 'theme-dark', 'theme-high-contrast');` |
| src/scripts/components/preferences.js | 780 | document.documentElement.style.scrollBehavior | `document.documentElement.style.scrollBehavior = value ? 'smooth' : 'auto';` |
| src/scripts/components/navigation.js | 19 | document.body.classList.toggle | `document.body.classList.toggle('use-modern-nav', preferModernNav);` |
| src/scripts/components/navigation.js | 32 | document.body.classList.contains | `const preferModernNav = document.body.classList.contains('use-modern-nav');` |
| src/scripts/components/navigation.js | 19 | document.body.classList.toggle | `document.body.classList.toggle('use-modern-nav', preferModernNav);` |
| src/scripts/components/navigation.js | 104 | document.body.classList.remove | `document.body.classList.remove('sidebar-active');` |

## Recommended Fixes

| File | Line | Severity | Recommendation |
| ---- | ---- | -------- | -------------- |
| src/scripts/utils/print-helper.js | 157 | High | Add null check before accessing properties of DOM element at line 157 |
| src/scripts/utils/print-helper.js | 161 | High | Add null check before accessing properties of DOM element at line 161 |
| src/scripts/utils/print-helper.js | 163 | High | Add null check before accessing properties of DOM element at line 163 |
| src/scripts/utils/print-helper.js | 164 | High | Add null check before accessing properties of DOM element at line 164 |
| src/scripts/utils/print-helper.js | 165 | High | Add null check before accessing properties of DOM element at line 165 |
| src/scripts/utils/print-helper.js | 166 | High | Add null check before accessing properties of DOM element at line 166 |
| src/scripts/utils/print-helper.js | 216 | High | Add null check before accessing properties of DOM element at line 216 |
| src/scripts/utils/print-helper.js | 231 | High | Add null check before accessing properties of DOM element at line 231 |
| src/scripts/utils/print-helper.js | 249 | High | Add null check before accessing properties of DOM element at line 249 |
| src/scripts/utils/print-helper.js | 284 | High | Add null check before accessing properties of DOM element at line 284 |
| src/scripts/utils/print-helper.js | 182 | High | Add appropriate error handling for Timer functions at line 182 |
| src/scripts/utils/print-helper.js | 313 | High | Add appropriate error handling for Timer functions at line 313 |
| src/scripts/utils/print-helper.js | 6 | High | Add appropriate error handling for Event listener at line 6 |
| src/scripts/utils/print-helper.js | 10 | High | Add appropriate error handling for Event listener at line 10 |
| src/scripts/utils/print-helper.js | 51 | High | Add appropriate error handling for Event listener at line 51 |
| src/scripts/utils/print-helper.js | 56 | High | Add appropriate error handling for Event listener at line 56 |
| src/scripts/utils/print-helper.js | 62 | High | Add appropriate error handling for Event listener at line 62 |
| src/scripts/utils/print-helper.js | 157 | High | Add appropriate error handling for Event listener at line 157 |
| src/scripts/utils/print-helper.js | 161 | High | Add appropriate error handling for Event listener at line 161 |
| src/scripts/utils/print-helper.js | 174 | High | Add appropriate error handling for Event listener at line 174 |
| src/scripts/utils/print-helper.js | 183 | High | Add appropriate error handling for Event listener at line 183 |
| src/scripts/utils/print-helper.js | 318 | High | Add appropriate error handling for Event listener at line 318 |
| src/scripts/utils/layout-utilities.js | 67 | High | Add null check before accessing properties of DOM element at line 67 |
| src/scripts/utils/layout-utilities.js | 88 | High | Add null check before accessing properties of DOM element at line 88 |
| src/scripts/utils/layout-utilities.js | 106 | High | Add null check before accessing properties of DOM element at line 106 |
| src/scripts/utils/layout-utilities.js | 128 | High | Add null check before accessing properties of DOM element at line 128 |
| src/scripts/utils/layout-utilities.js | 141 | High | Add null check before accessing properties of DOM element at line 141 |
| src/scripts/utils/layout-utilities.js | 167 | High | Add null check before accessing properties of DOM element at line 167 |
| src/scripts/utils/layout-utilities.js | 223 | High | Add null check before accessing properties of DOM element at line 223 |
| src/scripts/utils/layout-utilities.js | 261 | High | Add null check before accessing properties of DOM element at line 261 |
| src/scripts/utils/layout-utilities.js | 265 | High | Add null check before accessing properties of DOM element at line 265 |
| src/scripts/utils/layout-utilities.js | 59 | High | Add appropriate error handling for Timer functions at line 59 |
| src/scripts/utils/layout-utilities.js | 14 | High | Add appropriate error handling for Event listener at line 14 |
| src/scripts/utils/layout-utilities.js | 73 | High | Add appropriate error handling for Event listener at line 73 |
| src/scripts/utils/layout-utilities.js | 111 | High | Add appropriate error handling for Event listener at line 111 |
| src/scripts/utils/layout-utilities.js | 283 | High | Add appropriate error handling for Event listener at line 283 |
| src/scripts/utils/layout-utilities.js | 287 | High | Add appropriate error handling for Event listener at line 287 |
| src/scripts/utils/layout-utilities.js | 291 | High | Add appropriate error handling for Event listener at line 291 |
| src/scripts/utils/layout-utilities.js | 296 | High | Add appropriate error handling for Event listener at line 296 |
| src/scripts/utils/layout-utilities.js | 303 | High | Add appropriate error handling for Event listener at line 303 |
| src/scripts/utils/layout-utilities.js | 325 | High | Add appropriate error handling for Event listener at line 325 |
| src/scripts/utils/layout-utilities.js | 365 | High | Add appropriate error handling for Event listener at line 365 |
| src/scripts/utils/layout-utilities.js | 368 | High | Add appropriate error handling for Event listener at line 368 |
| src/scripts/utils/debug-helper.js | 30 | High | Add appropriate error handling for Storage API access at line 30 |
| src/scripts/utils/debug-helper.js | 75 | High | Add null check before accessing properties of DOM element at line 75 |
| src/scripts/utils/debug-helper.js | 101 | High | Add null check before accessing properties of DOM element at line 101 |
| src/scripts/utils/debug-helper.js | 145 | High | Add null check before accessing properties of DOM element at line 145 |
| src/scripts/utils/debug-helper.js | 194 | High | Add null check before accessing properties of DOM element at line 194 |
| src/scripts/utils/debug-helper.js | 202 | High | Add null check before accessing properties of DOM element at line 202 |
| src/scripts/utils/debug-helper.js | 219 | High | Add null check before accessing properties of DOM element at line 219 |
| src/scripts/utils/debug-helper.js | 267 | High | Add null check before accessing properties of DOM element at line 267 |
| src/scripts/utils/debug-helper.js | 177 | High | Add appropriate error handling for Timer functions at line 177 |
| src/scripts/utils/debug-helper.js | 7 | High | Add appropriate error handling for Event listener at line 7 |
| src/scripts/utils/debug-helper.js | 12 | High | Add appropriate error handling for Event listener at line 12 |
| src/scripts/utils/debug-helper.js | 25 | High | Add appropriate error handling for Event listener at line 25 |
| src/scripts/utils/debug-helper.js | 48 | High | Add appropriate error handling for Event listener at line 48 |
| src/scripts/utils/debug-helper.js | 133 | High | Add appropriate error handling for Event listener at line 133 |
| src/scripts/utils/debug-helper.js | 295 | High | Add appropriate error handling for Event listener at line 295 |
| src/scripts/utils/cleanup.js | 34 | High | Add null check before accessing properties of DOM element at line 34 |
| src/scripts/utils/cleanup.js | 49 | High | Add null check before accessing properties of DOM element at line 49 |
| src/scripts/utils/cleanup.js | 52 | High | Add null check before accessing properties of DOM element at line 52 |
| src/scripts/utils/cleanup.js | 63 | High | Add null check before accessing properties of DOM element at line 63 |
| src/scripts/utils/cleanup.js | 11 | High | Add appropriate error handling for Event listener at line 11 |
| src/scripts/utils/cleanup.js | 14 | High | Add appropriate error handling for Event listener at line 14 |
| src/scripts/services/version-manager.js | 45 | High | Add .catch() handler or try/catch with async/await to fetch call at line 45 |
| src/scripts/services/version-manager.js | 261 | High | Add appropriate error handling for Storage API access at line 261 |
| src/scripts/services/version-manager.js | 265 | High | Add appropriate error handling for Storage API access at line 265 |
| src/scripts/services/version-manager.js | 275 | High | Add appropriate error handling for Storage API access at line 275 |
| src/scripts/services/version-manager.js | 84 | High | Add null check before accessing properties of DOM element at line 84 |
| src/scripts/services/version-manager.js | 109 | High | Add null check before accessing properties of DOM element at line 109 |
| src/scripts/services/version-manager.js | 184 | High | Add null check before accessing properties of DOM element at line 184 |
| src/scripts/services/version-manager.js | 215 | High | Add null check before accessing properties of DOM element at line 215 |
| src/scripts/services/version-manager.js | 339 | High | Add null check before accessing properties of DOM element at line 339 |
| src/scripts/services/version-manager.js | 344 | High | Add null check before accessing properties of DOM element at line 344 |
| src/scripts/services/version-manager.js | 377 | High | Add null check before accessing properties of DOM element at line 377 |
| src/scripts/services/version-manager.js | 418 | High | Add null check before accessing properties of DOM element at line 418 |
| src/scripts/services/version-manager.js | 197 | High | Add appropriate error handling for Timer functions at line 197 |
| src/scripts/services/version-manager.js | 349 | High | Add appropriate error handling for Timer functions at line 349 |
| src/scripts/services/version-manager.js | 355 | High | Add appropriate error handling for Timer functions at line 355 |
| src/scripts/services/version-manager.js | 358 | High | Add appropriate error handling for Timer functions at line 358 |
| src/scripts/services/version-manager.js | 27 | High | Add appropriate error handling for Event listener at line 27 |
| src/scripts/services/version-manager.js | 33 | High | Add appropriate error handling for Event listener at line 33 |
| src/scripts/services/version-manager.js | 109 | High | Add appropriate error handling for Event listener at line 109 |
| src/scripts/services/version-manager.js | 184 | High | Add appropriate error handling for Event listener at line 184 |
| src/scripts/services/version-manager.js | 189 | High | Add appropriate error handling for Event listener at line 189 |
| src/scripts/services/version-manager.js | 198 | High | Add appropriate error handling for Event listener at line 198 |
| src/scripts/services/version-manager.js | 339 | High | Add appropriate error handling for Event listener at line 339 |
| src/scripts/services/version-manager.js | 344 | High | Add appropriate error handling for Event listener at line 344 |
| src/scripts/services/version-manager.js | 462 | High | Add appropriate error handling for Event listener at line 462 |
| src/scripts/services/search.js | 42 | High | Add null check before accessing properties of DOM element at line 42 |
| src/scripts/services/search.js | 43 | High | Add null check before accessing properties of DOM element at line 43 |
| src/scripts/services/search.js | 44 | High | Add null check before accessing properties of DOM element at line 44 |
| src/scripts/services/search.js | 45 | High | Add null check before accessing properties of DOM element at line 45 |
| src/scripts/services/search.js | 149 | High | Add appropriate error handling for Timer functions at line 149 |
| src/scripts/services/search.js | 125 | High | Add appropriate error handling for Event listener at line 125 |
| src/scripts/services/search.js | 129 | High | Add appropriate error handling for Event listener at line 129 |
| src/scripts/services/search.js | 140 | High | Add appropriate error handling for Event listener at line 140 |
| src/scripts/services/search.js | 161 | High | Add appropriate error handling for Event listener at line 161 |
| src/scripts/services/search.js | 170 | High | Add appropriate error handling for Event listener at line 170 |
| src/scripts/services/search.js | 174 | High | Add appropriate error handling for Event listener at line 174 |
| src/scripts/services/search.js | 179 | High | Add appropriate error handling for Event listener at line 179 |
| src/scripts/services/search.js | 201 | High | Add appropriate error handling for Event listener at line 201 |
| src/scripts/services/search.js | 437 | High | Add appropriate error handling for Event listener at line 437 |
| src/scripts/services/progress-tracker.js | 548 | High | Add appropriate error handling for Storage API access at line 548 |
| src/scripts/services/progress-tracker.js | 549 | High | Wrap JSON.parse() at line 549 in try/catch block |
| src/scripts/services/progress-tracker.js | 55 | High | Add null check before accessing properties of DOM element at line 55 |
| src/scripts/services/progress-tracker.js | 86 | High | Add null check before accessing properties of DOM element at line 86 |
| src/scripts/services/progress-tracker.js | 98 | High | Add null check before accessing properties of DOM element at line 98 |
| src/scripts/services/progress-tracker.js | 157 | High | Add null check before accessing properties of DOM element at line 157 |
| src/scripts/services/progress-tracker.js | 220 | High | Add null check before accessing properties of DOM element at line 220 |
| src/scripts/services/progress-tracker.js | 295 | High | Add null check before accessing properties of DOM element at line 295 |
| src/scripts/services/progress-tracker.js | 299 | High | Add null check before accessing properties of DOM element at line 299 |
| src/scripts/services/progress-tracker.js | 381 | High | Add null check before accessing properties of DOM element at line 381 |
| src/scripts/services/progress-tracker.js | 382 | High | Add null check before accessing properties of DOM element at line 382 |
| src/scripts/services/progress-tracker.js | 394 | High | Add null check before accessing properties of DOM element at line 394 |
| src/scripts/services/progress-tracker.js | 418 | High | Add null check before accessing properties of DOM element at line 418 |
| src/scripts/services/progress-tracker.js | 461 | High | Add null check before accessing properties of DOM element at line 461 |
| src/scripts/services/progress-tracker.js | 465 | High | Add null check before accessing properties of DOM element at line 465 |
| src/scripts/services/progress-tracker.js | 501 | High | Add null check before accessing properties of DOM element at line 501 |
| src/scripts/services/progress-tracker.js | 335 | High | Add appropriate error handling for Timer functions at line 335 |
| src/scripts/services/progress-tracker.js | 479 | High | Add appropriate error handling for Timer functions at line 479 |
| src/scripts/services/progress-tracker.js | 533 | High | Add appropriate error handling for Timer functions at line 533 |
| src/scripts/services/progress-tracker.js | 535 | High | Add appropriate error handling for Timer functions at line 535 |
| src/scripts/services/progress-tracker.js | 25 | High | Add appropriate error handling for Event listener at line 25 |
| src/scripts/services/progress-tracker.js | 31 | High | Add appropriate error handling for Event listener at line 31 |
| src/scripts/services/progress-tracker.js | 86 | High | Add appropriate error handling for Event listener at line 86 |
| src/scripts/services/progress-tracker.js | 131 | High | Add appropriate error handling for Event listener at line 131 |
| src/scripts/services/progress-tracker.js | 134 | High | Add appropriate error handling for Event listener at line 134 |
| src/scripts/services/progress-tracker.js | 200 | High | Add appropriate error handling for Event listener at line 200 |
| src/scripts/services/progress-tracker.js | 295 | High | Add appropriate error handling for Event listener at line 295 |
| src/scripts/services/progress-tracker.js | 299 | High | Add appropriate error handling for Event listener at line 299 |
| src/scripts/services/progress-tracker.js | 306 | High | Add appropriate error handling for Event listener at line 306 |
| src/scripts/services/progress-tracker.js | 327 | High | Add appropriate error handling for Event listener at line 327 |
| src/scripts/services/progress-tracker.js | 336 | High | Add appropriate error handling for Event listener at line 336 |
| src/scripts/services/progress-tracker.js | 461 | High | Add appropriate error handling for Event listener at line 461 |
| src/scripts/services/progress-tracker.js | 465 | High | Add appropriate error handling for Event listener at line 465 |
| src/scripts/services/progress-tracker.js | 471 | High | Add appropriate error handling for Event listener at line 471 |
| src/scripts/services/progress-tracker.js | 480 | High | Add appropriate error handling for Event listener at line 480 |
| src/scripts/services/pdf-export.js | 182 | High | Add null check before accessing properties of DOM element at line 182 |
| src/scripts/services/pdf-export.js | 186 | High | Add null check before accessing properties of DOM element at line 186 |
| src/scripts/services/pdf-export.js | 188 | High | Add null check before accessing properties of DOM element at line 188 |
| src/scripts/services/pdf-export.js | 189 | High | Add null check before accessing properties of DOM element at line 189 |
| src/scripts/services/pdf-export.js | 190 | High | Add null check before accessing properties of DOM element at line 190 |
| src/scripts/services/pdf-export.js | 191 | High | Add null check before accessing properties of DOM element at line 191 |
| src/scripts/services/pdf-export.js | 192 | High | Add null check before accessing properties of DOM element at line 192 |
| src/scripts/services/pdf-export.js | 193 | High | Add null check before accessing properties of DOM element at line 193 |
| src/scripts/services/pdf-export.js | 197 | High | Add null check before accessing properties of DOM element at line 197 |
| src/scripts/services/pdf-export.js | 237 | High | Add null check before accessing properties of DOM element at line 237 |
| src/scripts/services/pdf-export.js | 283 | High | Add null check before accessing properties of DOM element at line 283 |
| src/scripts/services/pdf-export.js | 652 | High | Add null check before accessing properties of DOM element at line 652 |
| src/scripts/services/pdf-export.js | 715 | High | Add null check before accessing properties of DOM element at line 715 |
| src/scripts/services/pdf-export.js | 740 | High | Add null check before accessing properties of DOM element at line 740 |
| src/scripts/services/pdf-export.js | 223 | High | Add appropriate error handling for Timer functions at line 223 |
| src/scripts/services/pdf-export.js | 14 | High | Add appropriate error handling for Event listener at line 14 |
| src/scripts/services/pdf-export.js | 19 | High | Add appropriate error handling for Event listener at line 19 |
| src/scripts/services/pdf-export.js | 59 | High | Add appropriate error handling for Event listener at line 59 |
| src/scripts/services/pdf-export.js | 64 | High | Add appropriate error handling for Event listener at line 64 |
| src/scripts/services/pdf-export.js | 70 | High | Add appropriate error handling for Event listener at line 70 |
| src/scripts/services/pdf-export.js | 182 | High | Add appropriate error handling for Event listener at line 182 |
| src/scripts/services/pdf-export.js | 186 | High | Add appropriate error handling for Event listener at line 186 |
| src/scripts/services/pdf-export.js | 224 | High | Add appropriate error handling for Event listener at line 224 |
| src/scripts/services/pdf-export.js | 715 | High | Add appropriate error handling for Event listener at line 715 |
| src/scripts/services/pdf-export.js | 740 | High | Add appropriate error handling for Event listener at line 740 |
| src/scripts/services/offline.js | 113 | High | Add null check before accessing properties of DOM element at line 113 |
| src/scripts/services/offline.js | 201 | High | Add null check before accessing properties of DOM element at line 201 |
| src/scripts/services/offline.js | 230 | High | Add null check before accessing properties of DOM element at line 230 |
| src/scripts/services/offline.js | 288 | High | Add null check before accessing properties of DOM element at line 288 |
| src/scripts/services/offline.js | 514 | High | Add null check before accessing properties of DOM element at line 514 |
| src/scripts/services/offline.js | 516 | High | Add null check before accessing properties of DOM element at line 516 |
| src/scripts/services/offline.js | 547 | High | Add null check before accessing properties of DOM element at line 547 |
| src/scripts/services/offline.js | 101 | High | Add appropriate error handling for Timer functions at line 101 |
| src/scripts/services/offline.js | 217 | High | Add appropriate error handling for Timer functions at line 217 |
| src/scripts/services/offline.js | 421 | High | Add appropriate error handling for Timer functions at line 421 |
| src/scripts/services/offline.js | 437 | High | Add appropriate error handling for Timer functions at line 437 |
| src/scripts/services/offline.js | 22 | High | Add appropriate error handling for Event listener at line 22 |
| src/scripts/services/offline.js | 23 | High | Add appropriate error handling for Event listener at line 23 |
| src/scripts/services/offline.js | 261 | High | Add appropriate error handling for Event listener at line 261 |
| src/scripts/services/offline.js | 265 | High | Add appropriate error handling for Event listener at line 265 |
| src/scripts/services/offline.js | 276 | High | Add appropriate error handling for Event listener at line 276 |
| src/scripts/services/offline.js | 438 | High | Add appropriate error handling for Event listener at line 438 |
| src/scripts/services/offline.js | 439 | High | Add appropriate error handling for Event listener at line 439 |
| src/scripts/services/offline.js | 514 | High | Add appropriate error handling for Event listener at line 514 |
| src/scripts/services/offline.js | 516 | High | Add appropriate error handling for Event listener at line 516 |
| src/scripts/services/offline.js | 547 | High | Add appropriate error handling for Event listener at line 547 |
| src/scripts/services/offline.js | 613 | High | Add appropriate error handling for Event listener at line 613 |
| src/scripts/services/content-loader.js | 56 | High | Add .catch() handler or try/catch with async/await to fetch call at line 56 |
| src/scripts/services/content-loader.js | 136 | High | Add null check before accessing properties of DOM element at line 136 |
| src/scripts/services/content-loader.js | 144 | High | Add null check before accessing properties of DOM element at line 144 |
| src/scripts/services/content-loader.js | 204 | High | Add null check before accessing properties of DOM element at line 204 |
| src/scripts/services/content-loader.js | 212 | High | Add null check before accessing properties of DOM element at line 212 |
| src/scripts/services/content-loader.js | 234 | High | Add null check before accessing properties of DOM element at line 234 |
| src/scripts/services/content-loader.js | 276 | High | Add null check before accessing properties of DOM element at line 276 |
| src/scripts/services/content-loader.js | 304 | High | Add null check before accessing properties of DOM element at line 304 |
| src/scripts/services/content-loader.js | 311 | High | Add null check before accessing properties of DOM element at line 311 |
| src/scripts/services/content-loader.js | 170 | High | Add appropriate error handling for Timer functions at line 170 |
| src/scripts/services/content-loader.js | 195 | High | Add appropriate error handling for Timer functions at line 195 |
| src/scripts/services/content-loader.js | 251 | High | Add appropriate error handling for Timer functions at line 251 |
| src/scripts/services/content-loader.js | 265 | High | Add appropriate error handling for Timer functions at line 265 |
| src/scripts/services/content-loader.js | 278 | High | Add appropriate error handling for Timer functions at line 278 |
| src/scripts/services/content-loader.js | 149 | High | Add appropriate error handling for Event listener at line 149 |
| src/scripts/services/content-loader.js | 207 | High | Add appropriate error handling for Event listener at line 207 |
| src/scripts/services/content-loader.js | 302 | High | Add appropriate error handling for Event listener at line 302 |
| src/scripts/core/ui-improvements.js | 34 | High | Add appropriate error handling for Storage API access at line 34 |
| src/scripts/core/ui-improvements.js | 42 | High | Add appropriate error handling for Storage API access at line 42 |
| src/scripts/core/ui-improvements.js | 7 | High | Add null check before accessing properties of DOM element at line 7 |
| src/scripts/core/ui-improvements.js | 12 | High | Add null check before accessing properties of DOM element at line 12 |
| src/scripts/core/ui-improvements.js | 30 | High | Add null check before accessing properties of DOM element at line 30 |
| src/scripts/core/ui-improvements.js | 87 | High | Add null check before accessing properties of DOM element at line 87 |
| src/scripts/core/ui-improvements.js | 88 | High | Add null check before accessing properties of DOM element at line 88 |
| src/scripts/core/ui-improvements.js | 103 | High | Add null check before accessing properties of DOM element at line 103 |
| src/scripts/core/ui-improvements.js | 126 | High | Add null check before accessing properties of DOM element at line 126 |
| src/scripts/core/ui-improvements.js | 214 | High | Add null check before accessing properties of DOM element at line 214 |
| src/scripts/core/ui-improvements.js | 246 | High | Add null check before accessing properties of DOM element at line 246 |
| src/scripts/core/ui-improvements.js | 290 | High | Add null check before accessing properties of DOM element at line 290 |
| src/scripts/core/ui-improvements.js | 301 | High | Add null check before accessing properties of DOM element at line 301 |
| src/scripts/core/ui-improvements.js | 317 | High | Add null check before accessing properties of DOM element at line 317 |
| src/scripts/core/ui-improvements.js | 360 | High | Add null check before accessing properties of DOM element at line 360 |
| src/scripts/core/ui-improvements.js | 366 | High | Add null check before accessing properties of DOM element at line 366 |
| src/scripts/core/ui-improvements.js | 378 | High | Add null check before accessing properties of DOM element at line 378 |
| src/scripts/core/ui-improvements.js | 384 | High | Add null check before accessing properties of DOM element at line 384 |
| src/scripts/core/ui-improvements.js | 441 | High | Add null check before accessing properties of DOM element at line 441 |
| src/scripts/core/ui-improvements.js | 459 | High | Add null check before accessing properties of DOM element at line 459 |
| src/scripts/core/ui-improvements.js | 505 | High | Add null check before accessing properties of DOM element at line 505 |
| src/scripts/core/ui-improvements.js | 531 | High | Add null check before accessing properties of DOM element at line 531 |
| src/scripts/core/ui-improvements.js | 577 | High | Add null check before accessing properties of DOM element at line 577 |
| src/scripts/core/ui-improvements.js | 582 | High | Add null check before accessing properties of DOM element at line 582 |
| src/scripts/core/ui-improvements.js | 592 | High | Add null check before accessing properties of DOM element at line 592 |
| src/scripts/core/ui-improvements.js | 639 | High | Add null check before accessing properties of DOM element at line 639 |
| src/scripts/core/ui-improvements.js | 669 | High | Add null check before accessing properties of DOM element at line 669 |
| src/scripts/core/ui-improvements.js | 693 | High | Add null check before accessing properties of DOM element at line 693 |
| src/scripts/core/ui-improvements.js | 718 | High | Add null check before accessing properties of DOM element at line 718 |
| src/scripts/core/ui-improvements.js | 157 | High | Add appropriate error handling for Timer functions at line 157 |
| src/scripts/core/ui-improvements.js | 277 | High | Add appropriate error handling for Timer functions at line 277 |
| src/scripts/core/ui-improvements.js | 5 | High | Add appropriate error handling for Event listener at line 5 |
| src/scripts/core/ui-improvements.js | 21 | High | Add appropriate error handling for Event listener at line 21 |
| src/scripts/core/ui-improvements.js | 40 | High | Add appropriate error handling for Event listener at line 40 |
| src/scripts/core/ui-improvements.js | 54 | High | Add appropriate error handling for Event listener at line 54 |
| src/scripts/core/ui-improvements.js | 112 | High | Add appropriate error handling for Event listener at line 112 |
| src/scripts/core/ui-improvements.js | 152 | High | Add appropriate error handling for Event listener at line 152 |
| src/scripts/core/ui-improvements.js | 154 | High | Add appropriate error handling for Event listener at line 154 |
| src/scripts/core/ui-improvements.js | 235 | High | Add appropriate error handling for Event listener at line 235 |
| src/scripts/core/ui-improvements.js | 265 | High | Add appropriate error handling for Event listener at line 265 |
| src/scripts/core/ui-improvements.js | 299 | High | Add appropriate error handling for Event listener at line 299 |
| src/scripts/core/ui-improvements.js | 324 | High | Add appropriate error handling for Event listener at line 324 |
| src/scripts/core/ui-improvements.js | 333 | High | Add appropriate error handling for Event listener at line 333 |
| src/scripts/core/ui-improvements.js | 350 | High | Add appropriate error handling for Event listener at line 350 |
| src/scripts/core/ui-improvements.js | 448 | High | Add appropriate error handling for Event listener at line 448 |
| src/scripts/core/ui-improvements.js | 505 | High | Add appropriate error handling for Event listener at line 505 |
| src/scripts/core/ui-improvements.js | 510 | High | Add appropriate error handling for Event listener at line 510 |
| src/scripts/core/ui-improvements.js | 518 | High | Add appropriate error handling for Event listener at line 518 |
| src/scripts/core/ui-improvements.js | 606 | High | Add appropriate error handling for Event listener at line 606 |
| src/scripts/core/ui-improvements.js | 649 | High | Add appropriate error handling for Event listener at line 649 |
| src/scripts/core/ui-improvements.js | 733 | High | Add appropriate error handling for Event listener at line 733 |
| src/scripts/core/ui-improvements.js | 741 | High | Add appropriate error handling for Event listener at line 741 |
| src/scripts/core/ui-improvements.js | 747 | High | Add appropriate error handling for Event listener at line 747 |
| src/scripts/core/renderer.js | 18 | High | Add appropriate error handling for Storage API access at line 18 |
| src/scripts/core/renderer.js | 22 | High | Add appropriate error handling for Storage API access at line 22 |
| src/scripts/core/renderer.js | 7 | High | Add null check before accessing properties of DOM element at line 7 |
| src/scripts/core/renderer.js | 8 | High | Add null check before accessing properties of DOM element at line 8 |
| src/scripts/core/renderer.js | 9 | High | Add null check before accessing properties of DOM element at line 9 |
| src/scripts/core/renderer.js | 32 | High | Add null check before accessing properties of DOM element at line 32 |
| src/scripts/core/renderer.js | 58 | High | Add null check before accessing properties of DOM element at line 58 |
| src/scripts/core/renderer.js | 59 | High | Add null check before accessing properties of DOM element at line 59 |
| src/scripts/core/renderer.js | 101 | High | Add null check before accessing properties of DOM element at line 101 |
| src/scripts/core/renderer.js | 119 | High | Add null check before accessing properties of DOM element at line 119 |
| src/scripts/core/renderer.js | 131 | High | Add null check before accessing properties of DOM element at line 131 |
| src/scripts/core/renderer.js | 175 | High | Add null check before accessing properties of DOM element at line 175 |
| src/scripts/core/renderer.js | 188 | High | Add null check before accessing properties of DOM element at line 188 |
| src/scripts/core/renderer.js | 254 | High | Add null check before accessing properties of DOM element at line 254 |
| src/scripts/core/renderer.js | 317 | High | Add null check before accessing properties of DOM element at line 317 |
| src/scripts/core/renderer.js | 393 | High | Add null check before accessing properties of DOM element at line 393 |
| src/scripts/core/renderer.js | 232 | High | Add appropriate error handling for Timer functions at line 232 |
| src/scripts/core/renderer.js | 240 | High | Add appropriate error handling for Timer functions at line 240 |
| src/scripts/core/renderer.js | 279 | High | Add appropriate error handling for Timer functions at line 279 |
| src/scripts/core/renderer.js | 304 | High | Add appropriate error handling for Timer functions at line 304 |
| src/scripts/core/renderer.js | 368 | High | Add appropriate error handling for Timer functions at line 368 |
| src/scripts/core/renderer.js | 395 | High | Add appropriate error handling for Timer functions at line 395 |
| src/scripts/core/renderer.js | 1 | High | Add appropriate error handling for Event listener at line 1 |
| src/scripts/core/renderer.js | 12 | High | Add appropriate error handling for Event listener at line 12 |
| src/scripts/core/renderer.js | 36 | High | Add appropriate error handling for Event listener at line 36 |
| src/scripts/core/renderer.js | 45 | High | Add appropriate error handling for Event listener at line 45 |
| src/scripts/core/renderer.js | 89 | High | Add appropriate error handling for Event listener at line 89 |
| src/scripts/core/renderer.js | 96 | High | Add appropriate error handling for Event listener at line 96 |
| src/scripts/core/renderer.js | 122 | High | Add appropriate error handling for Event listener at line 122 |
| src/scripts/core/renderer.js | 190 | High | Add appropriate error handling for Event listener at line 190 |
| src/scripts/core/renderer.js | 258 | High | Add appropriate error handling for Event listener at line 258 |
| src/scripts/core/renderer.js | 329 | High | Add appropriate error handling for Event listener at line 329 |
| src/scripts/core/renderer.js | 388 | High | Add appropriate error handling for Event listener at line 388 |
| src/scripts/core/main.js | 3 | High | Add null check before accessing properties of DOM element at line 3 |
| src/scripts/core/main.js | 4 | High | Add null check before accessing properties of DOM element at line 4 |
| src/scripts/core/main.js | 5 | High | Add null check before accessing properties of DOM element at line 5 |
| src/scripts/core/main.js | 48 | High | Add null check before accessing properties of DOM element at line 48 |
| src/scripts/core/main.js | 49 | High | Add null check before accessing properties of DOM element at line 49 |
| src/scripts/core/main.js | 50 | High | Add null check before accessing properties of DOM element at line 50 |
| src/scripts/core/main.js | 108 | High | Add null check before accessing properties of DOM element at line 108 |
| src/scripts/core/main.js | 136 | High | Add null check before accessing properties of DOM element at line 136 |
| src/scripts/core/main.js | 139 | High | Add null check before accessing properties of DOM element at line 139 |
| src/scripts/core/main.js | 144 | High | Add null check before accessing properties of DOM element at line 144 |
| src/scripts/core/main.js | 1 | High | Add appropriate error handling for Event listener at line 1 |
| src/scripts/core/main.js | 7 | High | Add appropriate error handling for Event listener at line 7 |
| src/scripts/core/main.js | 40 | High | Add appropriate error handling for Event listener at line 40 |
| src/scripts/core/main.js | 52 | High | Add appropriate error handling for Event listener at line 52 |
| src/scripts/core/main.js | 129 | High | Add appropriate error handling for Event listener at line 129 |
| src/scripts/core/main.js | 140 | High | Add appropriate error handling for Event listener at line 140 |
| src/scripts/core/main.js | 158 | High | Add appropriate error handling for Event listener at line 158 |
| src/scripts/core/layout.js | 98 | High | Add appropriate error handling for Storage API access at line 98 |
| src/scripts/core/layout.js | 116 | High | Add appropriate error handling for Storage API access at line 116 |
| src/scripts/core/layout.js | 132 | High | Add appropriate error handling for Storage API access at line 132 |
| src/scripts/core/layout.js | 28 | High | Add null check before accessing properties of DOM element at line 28 |
| src/scripts/core/layout.js | 30 | High | Add null check before accessing properties of DOM element at line 30 |
| src/scripts/core/layout.js | 31 | High | Add null check before accessing properties of DOM element at line 31 |
| src/scripts/core/layout.js | 89 | High | Add null check before accessing properties of DOM element at line 89 |
| src/scripts/core/layout.js | 90 | High | Add null check before accessing properties of DOM element at line 90 |
| src/scripts/core/layout.js | 91 | High | Add null check before accessing properties of DOM element at line 91 |
| src/scripts/core/layout.js | 145 | High | Add null check before accessing properties of DOM element at line 145 |
| src/scripts/core/layout.js | 146 | High | Add null check before accessing properties of DOM element at line 146 |
| src/scripts/core/layout.js | 147 | High | Add null check before accessing properties of DOM element at line 147 |
| src/scripts/core/layout.js | 168 | High | Add null check before accessing properties of DOM element at line 168 |
| src/scripts/core/layout.js | 182 | High | Add null check before accessing properties of DOM element at line 182 |
| src/scripts/core/layout.js | 186 | High | Add null check before accessing properties of DOM element at line 186 |
| src/scripts/core/layout.js | 6 | High | Add appropriate error handling for Event listener at line 6 |
| src/scripts/core/layout.js | 14 | High | Add appropriate error handling for Event listener at line 14 |
| src/scripts/core/layout.js | 109 | High | Add appropriate error handling for Event listener at line 109 |
| src/scripts/core/layout.js | 126 | High | Add appropriate error handling for Event listener at line 126 |
| src/scripts/core/layout.js | 191 | High | Add appropriate error handling for Event listener at line 191 |
| src/scripts/core/layout.js | 255 | High | Add appropriate error handling for Event listener at line 255 |
| src/scripts/core/font-loader.js | 8 | High | Add appropriate error handling for Storage API access at line 8 |
| src/scripts/core/font-loader.js | 9 | High | Add appropriate error handling for Storage API access at line 9 |
| src/scripts/core/font-loader.js | 53 | High | Add appropriate error handling for Storage API access at line 53 |
| src/scripts/core/font-loader.js | 99 | High | Add appropriate error handling for Storage API access at line 99 |
| src/scripts/core/font-loader.js | 61 | High | Add null check before accessing properties of DOM element at line 61 |
| src/scripts/core/font-loader.js | 89 | High | Add null check before accessing properties of DOM element at line 89 |
| src/scripts/core/font-loader.js | 95 | High | Add null check before accessing properties of DOM element at line 95 |
| src/scripts/core/font-loader.js | 17 | High | Add appropriate error handling for Event listener at line 17 |
| src/scripts/core/font-loader.js | 91 | High | Add appropriate error handling for Event listener at line 91 |
| src/scripts/core/font-loader.js | 96 | High | Add appropriate error handling for Event listener at line 96 |
| src/scripts/components/preferences.js | 560 | High | Add appropriate error handling for Storage API access at line 560 |
| src/scripts/components/preferences.js | 563 | High | Add appropriate error handling for Storage API access at line 563 |
| src/scripts/components/preferences.js | 608 | High | Add appropriate error handling for Storage API access at line 608 |
| src/scripts/components/preferences.js | 641 | High | Add appropriate error handling for Storage API access at line 641 |
| src/scripts/components/preferences.js | 1075 | High | Add appropriate error handling for Storage API access at line 1075 |
| src/scripts/components/preferences.js | 1093 | High | Add appropriate error handling for Storage API access at line 1093 |
| src/scripts/components/preferences.js | 1035 | High | Wrap JSON.parse() at line 1035 in try/catch block |
| src/scripts/components/preferences.js | 1077 | High | Wrap JSON.parse() at line 1077 in try/catch block |
| src/scripts/components/preferences.js | 63 | High | Add null check before accessing properties of DOM element at line 63 |
| src/scripts/components/preferences.js | 99 | High | Add null check before accessing properties of DOM element at line 99 |
| src/scripts/components/preferences.js | 132 | High | Add null check before accessing properties of DOM element at line 132 |
| src/scripts/components/preferences.js | 472 | High | Add null check before accessing properties of DOM element at line 472 |
| src/scripts/components/preferences.js | 479 | High | Add null check before accessing properties of DOM element at line 479 |
| src/scripts/components/preferences.js | 492 | High | Add null check before accessing properties of DOM element at line 492 |
| src/scripts/components/preferences.js | 495 | High | Add null check before accessing properties of DOM element at line 495 |
| src/scripts/components/preferences.js | 502 | High | Add null check before accessing properties of DOM element at line 502 |
| src/scripts/components/preferences.js | 507 | High | Add null check before accessing properties of DOM element at line 507 |
| src/scripts/components/preferences.js | 512 | High | Add null check before accessing properties of DOM element at line 512 |
| src/scripts/components/preferences.js | 523 | High | Add null check before accessing properties of DOM element at line 523 |
| src/scripts/components/preferences.js | 557 | High | Add null check before accessing properties of DOM element at line 557 |
| src/scripts/components/preferences.js | 574 | High | Add null check before accessing properties of DOM element at line 574 |
| src/scripts/components/preferences.js | 594 | High | Add null check before accessing properties of DOM element at line 594 |
| src/scripts/components/preferences.js | 618 | High | Add null check before accessing properties of DOM element at line 618 |
| src/scripts/components/preferences.js | 660 | High | Add null check before accessing properties of DOM element at line 660 |
| src/scripts/components/preferences.js | 809 | High | Add null check before accessing properties of DOM element at line 809 |
| src/scripts/components/preferences.js | 819 | High | Add null check before accessing properties of DOM element at line 819 |
| src/scripts/components/preferences.js | 853 | High | Add null check before accessing properties of DOM element at line 853 |
| src/scripts/components/preferences.js | 887 | High | Add null check before accessing properties of DOM element at line 887 |
| src/scripts/components/preferences.js | 905 | High | Add null check before accessing properties of DOM element at line 905 |
| src/scripts/components/preferences.js | 914 | High | Add null check before accessing properties of DOM element at line 914 |
| src/scripts/components/preferences.js | 948 | High | Add null check before accessing properties of DOM element at line 948 |
| src/scripts/components/preferences.js | 952 | High | Add null check before accessing properties of DOM element at line 952 |
| src/scripts/components/preferences.js | 956 | High | Add null check before accessing properties of DOM element at line 956 |
| src/scripts/components/preferences.js | 1175 | High | Add null check before accessing properties of DOM element at line 1175 |
| src/scripts/components/preferences.js | 1204 | High | Add null check before accessing properties of DOM element at line 1204 |
| src/scripts/components/preferences.js | 67 | High | Add appropriate error handling for Timer functions at line 67 |
| src/scripts/components/preferences.js | 89 | High | Add appropriate error handling for Timer functions at line 89 |
| src/scripts/components/preferences.js | 632 | High | Add appropriate error handling for Timer functions at line 632 |
| src/scripts/components/preferences.js | 678 | High | Add appropriate error handling for Timer functions at line 678 |
| src/scripts/components/preferences.js | 947 | High | Add appropriate error handling for Timer functions at line 947 |
| src/scripts/components/preferences.js | 1193 | High | Add appropriate error handling for Timer functions at line 1193 |
| src/scripts/components/preferences.js | 43 | High | Add appropriate error handling for Event listener at line 43 |
| src/scripts/components/preferences.js | 56 | High | Add appropriate error handling for Event listener at line 56 |
| src/scripts/components/preferences.js | 65 | High | Add appropriate error handling for Event listener at line 65 |
| src/scripts/components/preferences.js | 74 | High | Add appropriate error handling for Event listener at line 74 |
| src/scripts/components/preferences.js | 108 | High | Add appropriate error handling for Event listener at line 108 |
| src/scripts/components/preferences.js | 112 | High | Add appropriate error handling for Event listener at line 112 |
| src/scripts/components/preferences.js | 457 | High | Add appropriate error handling for Event listener at line 457 |
| src/scripts/components/preferences.js | 465 | High | Add appropriate error handling for Event listener at line 465 |
| src/scripts/components/preferences.js | 472 | High | Add appropriate error handling for Event listener at line 472 |
| src/scripts/components/preferences.js | 479 | High | Add appropriate error handling for Event listener at line 479 |
| src/scripts/components/preferences.js | 492 | High | Add appropriate error handling for Event listener at line 492 |
| src/scripts/components/preferences.js | 495 | High | Add appropriate error handling for Event listener at line 495 |
| src/scripts/components/preferences.js | 505 | High | Add appropriate error handling for Event listener at line 505 |
| src/scripts/components/preferences.js | 562 | High | Add appropriate error handling for Event listener at line 562 |
| src/scripts/components/preferences.js | 578 | High | Add appropriate error handling for Event listener at line 578 |
| src/scripts/components/preferences.js | 601 | High | Add appropriate error handling for Event listener at line 601 |
| src/scripts/components/preferences.js | 625 | High | Add appropriate error handling for Event listener at line 625 |
| src/scripts/components/preferences.js | 647 | High | Add appropriate error handling for Event listener at line 647 |
| src/scripts/components/preferences.js | 664 | High | Add appropriate error handling for Event listener at line 664 |
| src/scripts/components/preferences.js | 690 | High | Add appropriate error handling for Event listener at line 690 |
| src/scripts/components/preferences.js | 695 | High | Add appropriate error handling for Event listener at line 695 |
| src/scripts/components/preferences.js | 952 | High | Add appropriate error handling for Event listener at line 952 |
| src/scripts/components/preferences.js | 956 | High | Add appropriate error handling for Event listener at line 956 |
| src/scripts/components/preferences.js | 962 | High | Add appropriate error handling for Event listener at line 962 |
| src/scripts/components/preferences.js | 969 | High | Add appropriate error handling for Event listener at line 969 |
| src/scripts/components/preferences.js | 1023 | High | Add appropriate error handling for Event listener at line 1023 |
| src/scripts/components/preferences.js | 1032 | High | Add appropriate error handling for Event listener at line 1032 |
| src/scripts/components/navigation.js | 18 | High | Add appropriate error handling for Storage API access at line 18 |
| src/scripts/components/navigation.js | 46 | High | Add appropriate error handling for Storage API access at line 46 |
| src/scripts/components/navigation.js | 8 | High | Add null check before accessing properties of DOM element at line 8 |
| src/scripts/components/navigation.js | 29 | High | Add null check before accessing properties of DOM element at line 29 |
| src/scripts/components/navigation.js | 30 | High | Add null check before accessing properties of DOM element at line 30 |
| src/scripts/components/navigation.js | 63 | High | Add null check before accessing properties of DOM element at line 63 |
| src/scripts/components/navigation.js | 64 | High | Add null check before accessing properties of DOM element at line 64 |
| src/scripts/components/navigation.js | 92 | High | Add null check before accessing properties of DOM element at line 92 |
| src/scripts/components/navigation.js | 97 | High | Add null check before accessing properties of DOM element at line 97 |
| src/scripts/components/navigation.js | 100 | High | Add null check before accessing properties of DOM element at line 100 |
| src/scripts/components/navigation.js | 101 | High | Add null check before accessing properties of DOM element at line 101 |
| src/scripts/components/navigation.js | 108 | High | Add null check before accessing properties of DOM element at line 108 |
| src/scripts/components/navigation.js | 137 | High | Add null check before accessing properties of DOM element at line 137 |
| src/scripts/components/navigation.js | 142 | High | Add null check before accessing properties of DOM element at line 142 |
| src/scripts/components/navigation.js | 153 | High | Add null check before accessing properties of DOM element at line 153 |
| src/scripts/components/navigation.js | 159 | High | Add null check before accessing properties of DOM element at line 159 |
| src/scripts/components/navigation.js | 186 | High | Add null check before accessing properties of DOM element at line 186 |
| src/scripts/components/navigation.js | 192 | High | Add null check before accessing properties of DOM element at line 192 |
| src/scripts/components/navigation.js | 50 | High | Add appropriate error handling for Timer functions at line 50 |
| src/scripts/components/navigation.js | 157 | High | Add appropriate error handling for Timer functions at line 157 |
| src/scripts/components/navigation.js | 229 | High | Add appropriate error handling for Timer functions at line 229 |
| src/scripts/components/navigation.js | 6 | High | Add appropriate error handling for Event listener at line 6 |
| src/scripts/components/navigation.js | 15 | High | Add appropriate error handling for Event listener at line 15 |
| src/scripts/components/navigation.js | 44 | High | Add appropriate error handling for Event listener at line 44 |
| src/scripts/components/navigation.js | 86 | High | Add appropriate error handling for Event listener at line 86 |
| src/scripts/components/navigation.js | 190 | High | Add appropriate error handling for Event listener at line 190 |
| src/scripts/utils/print-helper.js | 206 | Medium | Add optional chaining or null check for chain "document.body.classList.add" |
| src/scripts/utils/print-helper.js | 320 | Medium | Add optional chaining or null check for chain "document.body.classList.remove" |
| src/scripts/utils/print-helper.js | 325 | Medium | Add optional chaining or null check for chain "item.element.classList.remove" |
| src/scripts/utils/layout-utilities.js | 90 | Medium | Add optional chaining or null check for chain "table.parentNode.classList.contains" |
| src/scripts/utils/debug-helper.js | 32 | Medium | Add optional chaining or null check for chain "document.body.classList.add" |
| src/scripts/utils/debug-helper.js | 57 | Medium | Add optional chaining or null check for chain "document.body.classList.toggle" |
| src/scripts/utils/debug-helper.js | 60 | Medium | Add optional chaining or null check for chain "document.body.classList.contains" |
| src/scripts/utils/debug-helper.js | 60 | Medium | Add optional chaining or null check for chain "document.body.classList.contains" |
| src/scripts/utils/debug-helper.js | 60 | Medium | Add optional chaining or null check for chain "document.body.classList.contains" |
| src/scripts/utils/debug-helper.js | 57 | Medium | Add optional chaining or null check for chain "document.body.classList.toggle" |
| src/scripts/utils/debug-helper.js | 60 | Medium | Add optional chaining or null check for chain "document.body.classList.contains" |
| src/scripts/services/version-manager.js | 74 | Medium | Add optional chaining or null check for chain "document.body.classList.contains" |
| src/scripts/services/search.js | 68 | Medium | Add optional chaining or null check for chain "this.searchNavigation.style.cssText" |
| src/scripts/services/search.js | 141 | Medium | Add optional chaining or null check for chain "this.searchInput.value.trim" |
| src/scripts/services/search.js | 155 | Medium | Add optional chaining or null check for chain "this.clearButton.style.display" |
| src/scripts/services/search.js | 155 | Medium | Add optional chaining or null check for chain "this.clearButton.style.display" |
| src/scripts/services/search.js | 223 | Medium | Add optional chaining or null check for chain "this.searchNavigation.style.display" |
| src/scripts/services/search.js | 226 | Medium | Add optional chaining or null check for chain "this.noResultsMessage.style.display" |
| src/scripts/services/search.js | 223 | Medium | Add optional chaining or null check for chain "this.searchNavigation.style.display" |
| src/scripts/services/search.js | 226 | Medium | Add optional chaining or null check for chain "this.noResultsMessage.style.display" |
| src/scripts/services/search.js | 226 | Medium | Add optional chaining or null check for chain "this.noResultsMessage.style.display" |
| src/scripts/services/search.js | 223 | Medium | Add optional chaining or null check for chain "this.searchNavigation.style.display" |
| src/scripts/services/search.js | 155 | Medium | Add optional chaining or null check for chain "this.clearButton.style.display" |
| src/scripts/services/search.js | 226 | Medium | Add optional chaining or null check for chain "this.noResultsMessage.style.display" |
| src/scripts/services/search.js | 442 | Medium | Add optional chaining or null check for chain "document.body.classList.contains" |
| src/scripts/services/progress-tracker.js | 45 | Medium | Add optional chaining or null check for chain "document.body.classList.contains" |
| src/scripts/services/pdf-export.js | 243 | Medium | Add optional chaining or null check for chain "jspdf.umd.min.js" |
| src/scripts/services/pdf-export.js | 382 | Medium | Add optional chaining or null check for chain "pdf.internal.pageSize.getWidth" |
| src/scripts/services/pdf-export.js | 383 | Medium | Add optional chaining or null check for chain "pdf.internal.pageSize.getHeight" |
| src/scripts/services/offline.js | 36 | Medium | Add optional chaining or null check for chain "document.body.classList.remove" |
| src/scripts/services/offline.js | 39 | Medium | Add optional chaining or null check for chain "document.body.classList.add" |
| src/scripts/services/offline.js | 36 | Medium | Add optional chaining or null check for chain "document.body.classList.remove" |
| src/scripts/services/offline.js | 39 | Medium | Add optional chaining or null check for chain "document.body.classList.add" |
| src/scripts/services/content-loader.js | 271 | Medium | Add optional chaining or null check for chain "document.body.classList.add" |
| src/scripts/services/content-loader.js | 275 | Medium | Add optional chaining or null check for chain "window.location.hash.substring" |
| src/scripts/core/ui-improvements.js | 36 | Medium | Add optional chaining or null check for chain "document.body.classList.add" |
| src/scripts/core/ui-improvements.js | 41 | Medium | Add optional chaining or null check for chain "document.body.classList.toggle" |
| src/scripts/core/ui-improvements.js | 66 | Medium | Add optional chaining or null check for chain "document.body.classList.remove" |
| src/scripts/core/ui-improvements.js | 36 | Medium | Add optional chaining or null check for chain "document.body.classList.add" |
| src/scripts/core/ui-improvements.js | 36 | Medium | Add optional chaining or null check for chain "document.body.classList.add" |
| src/scripts/core/ui-improvements.js | 36 | Medium | Add optional chaining or null check for chain "document.body.classList.add" |
| src/scripts/core/ui-improvements.js | 36 | Medium | Add optional chaining or null check for chain "document.body.classList.add" |
| src/scripts/core/ui-improvements.js | 36 | Medium | Add optional chaining or null check for chain "document.body.classList.add" |
| src/scripts/core/ui-improvements.js | 142 | Medium | Add optional chaining or null check for chain "codeBlock.parentNode.classList.add" |
| src/scripts/core/ui-improvements.js | 567 | Medium | Add optional chaining or null check for chain "window.location.hash.substring" |
| src/scripts/core/ui-improvements.js | 651 | Medium | Add optional chaining or null check for chain "e.target.classList.contains" |
| src/scripts/core/ui-improvements.js | 36 | Medium | Add optional chaining or null check for chain "document.body.classList.add" |
| src/scripts/core/ui-improvements.js | 66 | Medium | Add optional chaining or null check for chain "document.body.classList.remove" |
| src/scripts/core/ui-improvements.js | 66 | Medium | Add optional chaining or null check for chain "document.body.classList.remove" |
| src/scripts/core/renderer.js | 389 | Medium | Add optional chaining or null check for chain "document.body.classList.add" |
| src/scripts/core/layout.js | 95 | Medium | Add optional chaining or null check for chain "document.body.classList.add" |
| src/scripts/core/layout.js | 102 | Medium | Add optional chaining or null check for chain "document.body.classList.remove" |
| src/scripts/core/layout.js | 95 | Medium | Add optional chaining or null check for chain "document.body.classList.add" |
| src/scripts/core/layout.js | 112 | Medium | Add optional chaining or null check for chain "document.body.classList.toggle" |
| src/scripts/core/layout.js | 102 | Medium | Add optional chaining or null check for chain "document.body.classList.remove" |
| src/scripts/core/font-loader.js | 23 | Medium | Add optional chaining or null check for chain "document.body.classList.add" |
| src/scripts/core/font-loader.js | 37 | Medium | Add optional chaining or null check for chain "document.body.classList.remove" |
| src/scripts/core/font-loader.js | 23 | Medium | Add optional chaining or null check for chain "document.body.classList.add" |
| src/scripts/core/font-loader.js | 23 | Medium | Add optional chaining or null check for chain "document.body.classList.add" |
| src/scripts/core/font-loader.js | 23 | Medium | Add optional chaining or null check for chain "document.body.classList.add" |
| src/scripts/core/font-loader.js | 98 | Medium | Add optional chaining or null check for chain "document.body.classList.toggle" |
| src/scripts/components/preferences.js | 667 | Medium | Add optional chaining or null check for chain "e.target.classList.contains" |
| src/scripts/components/preferences.js | 713 | Medium | Add optional chaining or null check for chain "document.body.classList.remove" |
| src/scripts/components/preferences.js | 714 | Medium | Add optional chaining or null check for chain "document.body.classList.add" |
| src/scripts/components/preferences.js | 713 | Medium | Add optional chaining or null check for chain "document.body.classList.remove" |
| src/scripts/components/preferences.js | 714 | Medium | Add optional chaining or null check for chain "document.body.classList.add" |
| src/scripts/components/preferences.js | 713 | Medium | Add optional chaining or null check for chain "document.body.classList.remove" |
| src/scripts/components/preferences.js | 714 | Medium | Add optional chaining or null check for chain "document.body.classList.add" |
| src/scripts/components/preferences.js | 713 | Medium | Add optional chaining or null check for chain "document.body.classList.remove" |
| src/scripts/components/preferences.js | 714 | Medium | Add optional chaining or null check for chain "document.body.classList.add" |
| src/scripts/components/preferences.js | 713 | Medium | Add optional chaining or null check for chain "document.body.classList.remove" |
| src/scripts/components/preferences.js | 714 | Medium | Add optional chaining or null check for chain "document.body.classList.add" |
| src/scripts/components/preferences.js | 713 | Medium | Add optional chaining or null check for chain "document.body.classList.remove" |
| src/scripts/components/preferences.js | 714 | Medium | Add optional chaining or null check for chain "document.body.classList.add" |
| src/scripts/components/preferences.js | 745 | Medium | Add optional chaining or null check for chain "document.body.classList.toggle" |
| src/scripts/components/preferences.js | 745 | Medium | Add optional chaining or null check for chain "document.body.classList.toggle" |
| src/scripts/components/preferences.js | 745 | Medium | Add optional chaining or null check for chain "document.body.classList.toggle" |
| src/scripts/components/preferences.js | 745 | Medium | Add optional chaining or null check for chain "document.body.classList.toggle" |
| src/scripts/components/preferences.js | 745 | Medium | Add optional chaining or null check for chain "document.body.classList.toggle" |
| src/scripts/components/preferences.js | 745 | Medium | Add optional chaining or null check for chain "document.body.classList.toggle" |
| src/scripts/components/preferences.js | 745 | Medium | Add optional chaining or null check for chain "document.body.classList.toggle" |
| src/scripts/components/preferences.js | 745 | Medium | Add optional chaining or null check for chain "document.body.classList.toggle" |
| src/scripts/components/preferences.js | 745 | Medium | Add optional chaining or null check for chain "document.body.classList.toggle" |
| src/scripts/components/preferences.js | 780 | Medium | Add optional chaining or null check for chain "document.documentElement.style.scrollBehavior" |
| src/scripts/components/preferences.js | 713 | Medium | Add optional chaining or null check for chain "document.body.classList.remove" |
| src/scripts/components/preferences.js | 780 | Medium | Add optional chaining or null check for chain "document.documentElement.style.scrollBehavior" |
| src/scripts/components/navigation.js | 19 | Medium | Add optional chaining or null check for chain "document.body.classList.toggle" |
| src/scripts/components/navigation.js | 32 | Medium | Add optional chaining or null check for chain "document.body.classList.contains" |
| src/scripts/components/navigation.js | 19 | Medium | Add optional chaining or null check for chain "document.body.classList.toggle" |
| src/scripts/components/navigation.js | 104 | Medium | Add optional chaining or null check for chain "document.body.classList.remove" |

## Best Practices

1. **Use try/catch with async/await:** Prefer async/await with try/catch for asynchronous operations
2. **Optional Chaining:** Use the ?. operator to safely access nested properties
3. **Nullish Coalescing:** Use the ?? operator to provide fallbacks for null/undefined values
4. **Consistent Error Handling:** Standardize on one approach (Promises vs async/await)
5. **Typed Error Objects:** Create custom error classes for different types of errors
6. **Error Boundaries:** For UI components, implement error boundary components
