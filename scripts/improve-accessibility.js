/**
 * Accessibility Improvement Tool
 * 
 * This script analyzes HTML files to:
 * 1. Check for missing accessibility attributes (aria-*, role, alt, etc.)
 * 2. Suggest semantic HTML improvements
 * 3. Verify color contrast in related CSS
 * 4. Generate a report with recommendations
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

// Configuration
const HTML_DIRS = [
  'src/**/*.html',
  'public/**/*.html'
];

// HTML files to analyze
let htmlFiles = [];
HTML_DIRS.forEach(dir => {
  const files = glob.sync(dir);
  htmlFiles.push(...files);
});

// If jsdom is not installed, show message and exit
try {
  if (!jsdom) {
    console.error('This script requires jsdom. Please install it using:');
    console.error('npm install jsdom');
    process.exit(1);
  }
} catch (e) {
  console.error('This script requires jsdom. Please install it using:');
  console.error('npm install jsdom');
  process.exit(1);
}

console.log(`Found ${htmlFiles.length} HTML files to analyze`);

// Report data structure
const accessibilityReport = {
  filesAnalyzed: 0,
  missingAlt: [],
  missingLabels: [],
  nonSemanticElements: [],
  ariaIssues: [],
  focusableElements: [],
  recommendations: []
};

// Process each HTML file
htmlFiles.forEach(file => {
  try {
    console.log(`Analyzing ${file}`);
    const content = fs.readFileSync(file, 'utf8');
    
    // Parse HTML with jsdom
    const dom = new JSDOM(content);
    const document = dom.window.document;
    
    // Run accessibility checks
    checkImagesForAlt(document, file);
    checkFormControls(document, file);
    checkSemanticElements(document, file);
    checkAriaAttributes(document, file);
    checkFocusableElements(document, file);
    
    accessibilityReport.filesAnalyzed++;
  } catch (error) {
    console.error(`Error processing ${file}: ${error.message}`);
  }
});

// Generate recommendations based on findings
generateRecommendations();

// Write report to file
fs.writeFileSync('accessibility-report.md', generateMarkdownReport());

console.log('Analysis complete. See accessibility-report.md for details.');

/**
 * Check for images without alt attributes
 */
function checkImagesForAlt(document, filename) {
  const images = document.querySelectorAll('img');
  
  images.forEach((img, index) => {
    const altAttr = img.getAttribute('alt');
    const srcAttr = img.getAttribute('src') || `image-${index}`;
    
    if (altAttr === null) {
      // Missing alt attribute entirely
      accessibilityReport.missingAlt.push({
        file: filename,
        elementType: 'img',
        src: srcAttr,
        issue: 'Missing alt attribute',
        fix: `Add alt attribute to image (descriptive if informative, alt="" if decorative)`
      });
    } else if (altAttr === '' && !img.closest('figure')) {
      // Empty alt attribute but not in a figure
      // Empty alt is valid for decorative images, but we'll flag it for review
      accessibilityReport.missingAlt.push({
        file: filename,
        elementType: 'img',
        src: srcAttr,
        issue: 'Empty alt attribute (verify if image is decorative)',
        fix: `Verify image is decorative, otherwise add descriptive alt text`
      });
    }
  });
}

/**
 * Check for form controls without labels
 */
function checkFormControls(document, filename) {
  const formControls = document.querySelectorAll('input, select, textarea');
  
  formControls.forEach(control => {
    const id = control.getAttribute('id');
    const type = control.getAttribute('type') || 'text';
    const name = control.getAttribute('name');
    
    // Skip hidden and button-like inputs
    if (['hidden', 'button', 'submit', 'reset'].includes(type)) {
      return;
    }
    
    let hasLabel = false;
    
    if (id) {
      // Check for label with for attribute
      const associatedLabel = document.querySelector(`label[for="${id}"]`);
      hasLabel = associatedLabel !== null;
    }
    
    // Check for aria-label or aria-labelledby
    const ariaLabel = control.getAttribute('aria-label');
    const ariaLabelledby = control.getAttribute('aria-labelledby');
    
    // Check if control is inside a label tag
    const parentLabel = control.closest('label');
    
    if (!hasLabel && !ariaLabel && !ariaLabelledby && !parentLabel) {
      accessibilityReport.missingLabels.push({
        file: filename,
        elementType: control.tagName.toLowerCase(),
        element: `${control.tagName.toLowerCase()}${id ? `#${id}` : type ? `[type="${type}"]` : ''}${name ? `[name="${name}"]` : ''}`,
        issue: 'Form control without label',
        fix: id ? `Add <label for="${id}">Label text</label>` : `Add id to element and <label for="id">, or wrap in <label> tags`
      });
    }
  });
}

/**
 * Check for non-semantic elements used for structure
 */
function checkSemanticElements(document, filename) {
  // Check for divs with role attributes
  const divsWithRoles = document.querySelectorAll('div[role]');
  
  divsWithRoles.forEach(div => {
    const role = div.getAttribute('role');
    let recommendedTag = '';
    
    // Suggest semantic equivalent
    switch (role) {
      case 'navigation':
        recommendedTag = 'nav';
        break;
      case 'banner':
        recommendedTag = 'header';
        break;
      case 'contentinfo':
        recommendedTag = 'footer';
        break;
      case 'complementary':
        recommendedTag = 'aside';
        break;
      case 'main':
        recommendedTag = 'main';
        break;
      case 'button':
        recommendedTag = 'button';
        break;
      case 'heading':
        recommendedTag = 'h2';
        break;
      default:
        recommendedTag = '';
    }
    
    if (recommendedTag) {
      accessibilityReport.nonSemanticElements.push({
        file: filename,
        element: `div[role="${role}"]`,
        issue: `Non-semantic element with role="${role}"`,
        fix: `Replace with semantic <${recommendedTag}> element`
      });
    }
  });
  
  // Check for potential semantic structure issues
  const articleWithoutHeading = document.querySelectorAll('article:not(:has(h1, h2, h3, h4, h5, h6))');
  articleWithoutHeading.forEach(article => {
    accessibilityReport.nonSemanticElements.push({
      file: filename,
      element: 'article',
      issue: 'Article without heading',
      fix: 'Add a heading element (h2-h6) to the article'
    });
  });
  
  // Check for spans used as buttons
  const interactiveSpans = document.querySelectorAll('span[onclick], span[role="button"]');
  interactiveSpans.forEach(span => {
    accessibilityReport.nonSemanticElements.push({
      file: filename,
      element: 'span' + (span.getAttribute('role') ? `[role="${span.getAttribute('role')}"]` : '[onclick]'),
      issue: 'Interactive span used instead of a semantic button',
      fix: 'Replace with <button> element'
    });
  });
}

/**
 * Check for proper ARIA attribute usage
 */
function checkAriaAttributes(document, filename) {
  // Check for aria-hidden without role
  const ariaHiddenElements = document.querySelectorAll('[aria-hidden="true"]:not([role])');
  ariaHiddenElements.forEach(element => {
    accessibilityReport.ariaIssues.push({
      file: filename,
      element: element.tagName.toLowerCase(),
      issue: 'aria-hidden="true" without role attribute',
      fix: 'Add appropriate role attribute or review if aria-hidden is necessary'
    });
  });
  
  // Check for incorrect aria-label usage
  const ariaLabelOnNonInteractive = document.querySelectorAll('div[aria-label]:not([role]), span[aria-label]:not([role])');
  ariaLabelOnNonInteractive.forEach(element => {
    accessibilityReport.ariaIssues.push({
      file: filename,
      element: element.tagName.toLowerCase() + '[aria-label]',
      issue: 'aria-label on non-interactive element without role',
      fix: 'Add appropriate role attribute or move aria-label to an interactive child element'
    });
  });
  
  // Check for missing required ARIA attributes
  const elementsWithRoles = document.querySelectorAll('[role]');
  elementsWithRoles.forEach(element => {
    const role = element.getAttribute('role');
    
    // Check required attributes for specific roles
    if (role === 'combobox' && !element.hasAttribute('aria-expanded')) {
      accessibilityReport.ariaIssues.push({
        file: filename,
        element: `${element.tagName.toLowerCase()}[role="combobox"]`,
        issue: 'Missing required aria-expanded on combobox',
        fix: 'Add aria-expanded attribute'
      });
    }
    
    if (role === 'checkbox' && !element.hasAttribute('aria-checked')) {
      accessibilityReport.ariaIssues.push({
        file: filename,
        element: `${element.tagName.toLowerCase()}[role="checkbox"]`,
        issue: 'Missing required aria-checked on checkbox',
        fix: 'Add aria-checked attribute'
      });
    }
  });
}

/**
 * Check focusable elements for keyboard accessibility
 */
function checkFocusableElements(document, filename) {
  // Find potentially focusable elements without keyboard event handlers
  const clickableElements = document.querySelectorAll('[onclick], [onmousedown], [onmouseup]');
  
  clickableElements.forEach(element => {
    const hasKeyboardHandler = element.hasAttribute('onkeydown') || element.hasAttribute('onkeyup') || element.hasAttribute('onkeypress');
    const isNativelyFocusable = ['a', 'button', 'input', 'select', 'textarea'].includes(element.tagName.toLowerCase());
    const hasTabindex = element.hasAttribute('tabindex');
    
    if (!hasKeyboardHandler && !isNativelyFocusable && !hasTabindex) {
      accessibilityReport.focusableElements.push({
        file: filename,
        element: element.tagName.toLowerCase(),
        issue: 'Element with click handler missing keyboard support',
        fix: 'Add tabindex="0" and keyboard event handler (or use a button/anchor element instead)'
      });
    }
  });
  
  // Check for tabindex > 0
  const elementsWithPositiveTabindex = document.querySelectorAll('[tabindex]');
  
  elementsWithPositiveTabindex.forEach(element => {
    const tabindex = parseInt(element.getAttribute('tabindex'), 10);
    
    if (tabindex > 0) {
      accessibilityReport.focusableElements.push({
        file: filename,
        element: `${element.tagName.toLowerCase()}[tabindex="${tabindex}"]`,
        issue: 'Positive tabindex changes tab order',
        fix: 'Use tabindex="0" instead to preserve natural tab order'
      });
    }
  });
}

/**
 * Generate recommendations based on findings
 */
function generateRecommendations() {
  // Add recommendations for missing alt attributes
  accessibilityReport.missingAlt.forEach(issue => {
    accessibilityReport.recommendations.push({
      file: issue.file,
      element: issue.elementType,
      recommendation: issue.fix,
      severity: 'High'
    });
  });
  
  // Add recommendations for missing labels
  accessibilityReport.missingLabels.forEach(issue => {
    accessibilityReport.recommendations.push({
      file: issue.file,
      element: issue.element,
      recommendation: issue.fix,
      severity: 'High' 
    });
  });
  
  // Add recommendations for non-semantic elements
  accessibilityReport.nonSemanticElements.forEach(issue => {
    accessibilityReport.recommendations.push({
      file: issue.file,
      element: issue.element,
      recommendation: issue.fix,
      severity: 'Medium'
    });
  });
  
  // Add recommendations for ARIA issues
  accessibilityReport.ariaIssues.forEach(issue => {
    accessibilityReport.recommendations.push({
      file: issue.file,
      element: issue.element,
      recommendation: issue.fix,
      severity: 'Medium'
    });
  });
  
  // Add recommendations for focusable elements
  accessibilityReport.focusableElements.forEach(issue => {
    accessibilityReport.recommendations.push({
      file: issue.file,
      element: issue.element,
      recommendation: issue.fix,
      severity: 'Medium'
    });
  });
}

/**
 * Generate markdown report
 */
function generateMarkdownReport() {
  let md = '# Accessibility Analysis Report\n\n';
  
  md += `## Summary\n\n`;
  md += `* **Files Analyzed:** ${accessibilityReport.filesAnalyzed}\n`;
  md += `* **Missing Alt Attributes:** ${accessibilityReport.missingAlt.length}\n`;
  md += `* **Missing Form Labels:** ${accessibilityReport.missingLabels.length}\n`;
  md += `* **Non-Semantic Elements:** ${accessibilityReport.nonSemanticElements.length}\n`;
  md += `* **ARIA Issues:** ${accessibilityReport.ariaIssues.length}\n`;
  md += `* **Keyboard Accessibility Issues:** ${accessibilityReport.focusableElements.length}\n`;
  md += `* **Total Recommendations:** ${accessibilityReport.recommendations.length}\n\n`;
  
  md += `## Missing Alt Attributes\n\n`;
  if (accessibilityReport.missingAlt.length === 0) {
    md += 'No issues found.\n\n';
  } else {
    md += '| File | Element | Issue | Fix |\n';
    md += '| ---- | ------- | ----- | --- |\n';
    accessibilityReport.missingAlt.forEach(issue => {
      md += `| ${issue.file} | ${issue.elementType} (${issue.src}) | ${issue.issue} | ${issue.fix} |\n`;
    });
    md += '\n';
  }
  
  md += `## Missing Form Labels\n\n`;
  if (accessibilityReport.missingLabels.length === 0) {
    md += 'No issues found.\n\n';
  } else {
    md += '| File | Element | Issue | Fix |\n';
    md += '| ---- | ------- | ----- | --- |\n';
    accessibilityReport.missingLabels.forEach(issue => {
      md += `| ${issue.file} | ${issue.element} | ${issue.issue} | ${issue.fix} |\n`;
    });
    md += '\n';
  }
  
  md += `## Non-Semantic Elements\n\n`;
  if (accessibilityReport.nonSemanticElements.length === 0) {
    md += 'No issues found.\n\n';
  } else {
    md += '| File | Element | Issue | Fix |\n';
    md += '| ---- | ------- | ----- | --- |\n';
    accessibilityReport.nonSemanticElements.forEach(issue => {
      md += `| ${issue.file} | ${issue.element} | ${issue.issue} | ${issue.fix} |\n`;
    });
    md += '\n';
  }
  
  md += `## ARIA Issues\n\n`;
  if (accessibilityReport.ariaIssues.length === 0) {
    md += 'No issues found.\n\n';
  } else {
    md += '| File | Element | Issue | Fix |\n';
    md += '| ---- | ------- | ----- | --- |\n';
    accessibilityReport.ariaIssues.forEach(issue => {
      md += `| ${issue.file} | ${issue.element} | ${issue.issue} | ${issue.fix} |\n`;
    });
    md += '\n';
  }
  
  md += `## Keyboard Accessibility Issues\n\n`;
  if (accessibilityReport.focusableElements.length === 0) {
    md += 'No issues found.\n\n';
  } else {
    md += '| File | Element | Issue | Fix |\n';
    md += '| ---- | ------- | ----- | --- |\n';
    accessibilityReport.focusableElements.forEach(issue => {
      md += `| ${issue.file} | ${issue.element} | ${issue.issue} | ${issue.fix} |\n`;
    });
    md += '\n';
  }
  
  md += `## Accessibility Best Practices\n\n`;
  md += `1. **Semantic HTML:** Use semantic HTML elements (`;
  md += `<header>, <nav>, <main>, <section>, <article>, <aside>, <footer>, <button>, etc.)\n`;
  md += `2. **Alternative Text:** Provide alt text for all images (empty alt for decorative images)\n`;
  md += `3. **Form Labels:** Ensure all form controls have labels\n`;
  md += `4. **Color Contrast:** Maintain sufficient color contrast (4.5:1 for normal text, 3:1 for large text)\n`;
  md += `5. **Keyboard Accessibility:** Ensure all interactive elements are keyboard accessible\n`;
  md += `6. **Focus Indicators:** Maintain visible focus indicators (don't remove outline without alternative)\n`;
  md += `7. **Heading Hierarchy:** Use a logical heading structure (h1-h6)\n`;
  md += `8. **ARIA Landmarks:** Use ARIA roles appropriately when semantic HTML is not possible\n`;
  md += `9. **Error Handling:** Provide accessible error messages for form validation\n`;
  md += `10. **Skip Navigation:** Add a skip navigation link for keyboard users\n`;
  
  return md;
} 