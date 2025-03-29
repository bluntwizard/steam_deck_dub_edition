// Script to update index.html JS references
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// Replace individual script tags with a single bundled script
const updatedHtml = html.replace(
  /<script src="cleanup\.js"><\/script>\s*<script src="content-loader\.js"><\/script>\s*<script src="ui-improvements\.js"><\/script>\s*<script src="search\.js"><\/script>\s*<script src="preferences-manager\.js"><\/script>\s*<script src="script\.js"><\/script>\s*<script src="renderer\.js"><\/script>\s*<script src="layout\.js"><\/script>\s*<script src="layout-utilities\.js"><\/script>\s*<script src="navigation\.js"><\/script>\s*<script src="offline\.js"><\/script>\s*<script src="print-helper\.js"><\/script>\s*<script src="pdf-export\.js"><\/script>\s*<script src="version-manager\.js"><\/script>\s*<script src="progress-tracker\.js"><\/script>\s*<script src="debug-helper\.js"><\/script>/,
  '<script type="module" src="src/scripts/index.js"></script>'
);

fs.writeFileSync('index.html.js-updated', updatedHtml);
console.log('Updated index.html has been created as index.html.js-updated');
