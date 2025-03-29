/**
 * JavaScript Error Handling Enhancement Script
 * 
 * This script analyzes JavaScript files to:
 * 1. Identify areas missing error handling
 * 2. Detect potential undefined variables and properties
 * 3. Add consistent error handling patterns
 * 4. Generate a report of recommended improvements
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const JS_DIRS = [
  'src/scripts/**/*.js'
];

// Error handling patterns to check for
const ERROR_PATTERNS = [
  { regex: /try\s*{[^}]*}\s*catch/, description: 'Has try-catch block' },
  { regex: /\.catch\s*\(/, description: 'Has Promise catch handler' },
  { regex: /\.then\s*\([^,)]*,[^)]*\)/, description: 'Has Promise error callback' },
  { regex: /if\s*\([^)]*===?\s*null|\|\|undefined\)/, description: 'Checks for null/undefined' },
  { regex: /\?\?/, description: 'Uses nullish coalescing' },
  { regex: /\?\./, description: 'Uses optional chaining' }
];

// High-risk patterns that should have error handling
const HIGH_RISK_PATTERNS = [
  { regex: /fetch\s*\(/, description: 'fetch API call' },
  { regex: /\bXMLHttpRequest\b/, description: 'XMLHttpRequest' },
  { regex: /localStorage\.|sessionStorage\./, description: 'Storage API access' },
  { regex: /JSON\.parse\s*\(/, description: 'JSON parsing' },
  { regex: /eval\s*\(/, description: 'eval usage' },
  { regex: /document\.querySelector|getElementById|getElementsBy/, description: 'DOM query' },
  { regex: /new\s+Worker\s*\(/, description: 'Web Worker' },
  { regex: /setTimeout\s*\(|setInterval\s*\(/, description: 'Timer functions' },
  { regex: /\.addEventListener\s*\(/, description: 'Event listener' }
];

// Report data
const report = {
  filesAnalyzed: 0,
  missingErrorHandling: [],
  potentialUndefinedAccess: [],
  inconsistentErrorHandling: [],
  recommendedFixes: []
};

// Get all JavaScript files
const jsFiles = [];
JS_DIRS.forEach(dir => {
  const files = glob.sync(dir);
  jsFiles.push(...files);
});

console.log(`Found ${jsFiles.length} JavaScript files to analyze`);

// Process each file
jsFiles.forEach(file => {
  try {
    console.log(`Analyzing ${file}`);
    const content = fs.readFileSync(file, 'utf8');
    
    // Analyze file content
    analyzeErrorHandling(content, file);
    detectUndefinedAccess(content, file);
    checkConsistentPatterns(content, file);
    
    report.filesAnalyzed++;
  } catch (error) {
    console.error(`Error processing ${file}: ${error.message}`);
  }
});

// Generate final recommendations
generateRecommendations();

// Write report to file
fs.writeFileSync('error-handling-report.md', generateMarkdownReport());

console.log('Analysis complete. See error-handling-report.md for details.');

/**
 * Analyze file for missing error handling
 */
function analyzeErrorHandling(content, filename) {
  // Find high-risk patterns
  HIGH_RISK_PATTERNS.forEach(pattern => {
    const matches = content.match(new RegExp(pattern.regex, 'g')) || [];
    
    if (matches.length > 0) {
      // For each match, check if it has error handling nearby
      let lines = content.split('\n');
      let lineNumbers = [];
      
      // Find line numbers of matches
      for (let i = 0; i < lines.length; i++) {
        if (pattern.regex.test(lines[i])) {
          lineNumbers.push(i + 1);
        }
      }
      
      // Check each match for nearby error handling
      lineNumbers.forEach(lineNum => {
        // Get context (10 lines before and after)
        const startLine = Math.max(0, lineNum - 10);
        const endLine = Math.min(lines.length, lineNum + 10);
        const context = lines.slice(startLine, endLine).join('\n');
        
        // Check if any error handling pattern exists in context
        const hasErrorHandling = ERROR_PATTERNS.some(errorPattern => 
          errorPattern.regex.test(context)
        );
        
        if (!hasErrorHandling) {
          report.missingErrorHandling.push({
            file: filename,
            line: lineNum,
            pattern: pattern.description,
            code: lines[lineNum - 1].trim()
          });
        }
      });
    }
  });
}

/**
 * Detect potential undefined property access
 */
function detectUndefinedAccess(content, filename) {
  // Simple heuristic: look for chains of property access without checks
  const propertyChainRegex = /(\w+)(?:\.\w+){3,}/g;
  const matches = content.match(propertyChainRegex) || [];
  
  if (matches.length > 0) {
    // Get lines containing these chains
    const lines = content.split('\n');
    
    matches.forEach(match => {
      // Find line containing this match
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(match)) {
          // Check if optional chaining or null checks are used
          const hasCheck = 
            lines[i].includes('?.') || 
            new RegExp(`if\\s*\\(\\s*${match.split('.')[0]}\\s*(!=|!==|==|===)\\s*(null|undefined)`, 'g').test(lines[i]) ||
            lines[i].includes('try');
          
          if (!hasCheck) {
            report.potentialUndefinedAccess.push({
              file: filename,
              line: i + 1,
              code: lines[i].trim(),
              chain: match
            });
          }
          
          break;
        }
      }
    });
  }
}

/**
 * Check for consistent error handling patterns
 */
function checkConsistentPatterns(content, filename) {
  // Count error handling patterns
  const patternCounts = {};
  
  ERROR_PATTERNS.forEach(pattern => {
    const matches = content.match(new RegExp(pattern.regex, 'g')) || [];
    patternCounts[pattern.description] = matches.length;
  });
  
  // Check for mixed async/await and Promise chains
  const hasAsync = /async\s+function|\bawait\b/.test(content);
  const hasThenChain = /\.then\s*\(/.test(content);
  
  if (hasAsync && hasThenChain) {
    // Get examples of mixed usage
    const lines = content.split('\n');
    const mixedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      if (/\.then\s*\(/.test(lines[i]) && /async\s+function|await/.test(content.slice(Math.max(0, i - 10), i + 10))) {
        mixedLines.push({
          line: i + 1,
          code: lines[i].trim()
        });
      }
    }
    
    if (mixedLines.length > 0) {
      report.inconsistentErrorHandling.push({
        file: filename,
        issue: 'Mixed async/await with Promise chains',
        examples: mixedLines
      });
    }
  }
}

/**
 * Generate recommendations based on findings
 */
function generateRecommendations() {
  // For each missing error handling case
  report.missingErrorHandling.forEach(issue => {
    let recommendation = '';
    
    // Based on the pattern, suggest fix
    switch(issue.pattern) {
      case 'fetch API call':
        recommendation = `Add .catch() handler or try/catch with async/await to fetch call at line ${issue.line}`;
        break;
      case 'JSON parsing':
        recommendation = `Wrap JSON.parse() at line ${issue.line} in try/catch block`;
        break;
      case 'DOM query':
        recommendation = `Add null check before accessing properties of DOM element at line ${issue.line}`;
        break;
      default:
        recommendation = `Add appropriate error handling for ${issue.pattern} at line ${issue.line}`;
    }
    
    report.recommendedFixes.push({
      file: issue.file,
      line: issue.line,
      recommendation,
      severity: 'High'
    });
  });
  
  // For potential undefined access
  report.potentialUndefinedAccess.forEach(issue => {
    report.recommendedFixes.push({
      file: issue.file,
      line: issue.line,
      recommendation: `Add optional chaining or null check for chain "${issue.chain}"`,
      severity: 'Medium'
    });
  });
  
  // For inconsistent patterns
  report.inconsistentErrorHandling.forEach(issue => {
    report.recommendedFixes.push({
      file: issue.file,
      line: issue.examples[0].line,
      recommendation: `Standardize on either async/await or Promise chains for consistency`,
      severity: 'Low'
    });
  });
}

/**
 * Generate markdown report
 */
function generateMarkdownReport() {
  let md = '# JavaScript Error Handling Analysis Report\n\n';
  
  md += `## Summary\n\n`;
  md += `* **Files Analyzed:** ${report.filesAnalyzed}\n`;
  md += `* **Missing Error Handling:** ${report.missingErrorHandling.length} instances\n`;
  md += `* **Potential Undefined Access:** ${report.potentialUndefinedAccess.length} instances\n`;
  md += `* **Inconsistent Error Handling:** ${report.inconsistentErrorHandling.length} files\n`;
  md += `* **Total Recommendations:** ${report.recommendedFixes.length}\n\n`;
  
  md += `## Missing Error Handling\n\n`;
  if (report.missingErrorHandling.length === 0) {
    md += 'No issues found.\n\n';
  } else {
    md += '| File | Line | Pattern | Code |\n';
    md += '| ---- | ---- | ------- | ---- |\n';
    report.missingErrorHandling.forEach(issue => {
      md += `| ${issue.file} | ${issue.line} | ${issue.pattern} | \`${escapeMarkdown(issue.code)}\` |\n`;
    });
    md += '\n';
  }
  
  md += `## Potential Undefined Access\n\n`;
  if (report.potentialUndefinedAccess.length === 0) {
    md += 'No issues found.\n\n';
  } else {
    md += '| File | Line | Property Chain | Code |\n';
    md += '| ---- | ---- | -------------- | ---- |\n';
    report.potentialUndefinedAccess.forEach(issue => {
      md += `| ${issue.file} | ${issue.line} | ${issue.chain} | \`${escapeMarkdown(issue.code)}\` |\n`;
    });
    md += '\n';
  }
  
  md += `## Recommended Fixes\n\n`;
  if (report.recommendedFixes.length === 0) {
    md += 'No recommendations.\n\n';
  } else {
    md += '| File | Line | Severity | Recommendation |\n';
    md += '| ---- | ---- | -------- | -------------- |\n';
    report.recommendedFixes.forEach(fix => {
      md += `| ${fix.file} | ${fix.line} | ${fix.severity} | ${fix.recommendation} |\n`;
    });
    md += '\n';
  }
  
  md += `## Best Practices\n\n`;
  md += `1. **Use try/catch with async/await:** Prefer async/await with try/catch for asynchronous operations\n`;
  md += `2. **Optional Chaining:** Use the ?. operator to safely access nested properties\n`;
  md += `3. **Nullish Coalescing:** Use the ?? operator to provide fallbacks for null/undefined values\n`;
  md += `4. **Consistent Error Handling:** Standardize on one approach (Promises vs async/await)\n`;
  md += `5. **Typed Error Objects:** Create custom error classes for different types of errors\n`;
  md += `6. **Error Boundaries:** For UI components, implement error boundary components\n`;
  
  return md;
}

/**
 * Escape markdown special characters
 */
function escapeMarkdown(text) {
  return text
    .replace(/\|/g, '\\|')
    .replace(/\*/g, '\\*')
    .replace(/\_/g, '\\_')
    .replace(/\`/g, '\\`');
} 