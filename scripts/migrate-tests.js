#!/usr/bin/env node

/**
 * Test Migration Script
 * Converts JavaScript test files to TypeScript
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directories to process
const TEST_DIRS = [
  'src/test/components',
  'src/test/browser-compatibility',
  'src/test/e2e',
  'src/test',
];

// Extensions to convert
const SOURCE_EXT = '.js';
const TARGET_EXT = '.ts';

// Import transformation patterns
const IMPORT_TRANSFORMS = [
  // Fix dynamic imports
  {
    regex: /([A-Za-z0-9_]+)\s*=\s*import\s*\*\s*as\s*([A-Za-z0-9_]+)\s*from\s*['"]([^'"]+)['"]\s*\.default/g,
    replacement: (match, varName, importName, modulePath) => {
      return `import { ${importName} } from '${modulePath}';\nconst ${varName} = ${importName}`;
    }
  },
  // Fix const variable imports
  {
    regex: /const\s+([A-Za-z0-9_]+)\s*=\s*import\s*\*\s*as\s*([A-Za-z0-9_]+)\s*from\s*['"]([^'"]+)['"]\s*\.default/g,
    replacement: (match, varName, importName, modulePath) => {
      return `import { ${importName} } from '${modulePath}';\nconst ${varName} = ${importName}`;
    }
  },
  // Add TypeScript type imports
  {
    regex: /import\s+\{\s*([A-Za-z0-9_]+)\s*\}\s+from\s+['"]\.\.\/\.\.\/components\/([A-Za-z0-9_]+)['"]/g,
    replacement: (match, componentName, componentPath) => {
      return `import { ${componentName} } from '../../components/${componentPath}';\nimport type { ${componentName}Options } from '../../types/${componentPath.toLowerCase()}';\n`;
    }
  },
  // Transform require to import
  {
    regex: /const\s+([A-Za-z0-9_]+)\s*=\s*require\(['"]([^'"]+)['"]\)/g,
    replacement: (match, varName, modulePath) => {
      const baseName = path.basename(modulePath, path.extname(modulePath));
      return `import * as ${baseName} from '${modulePath}';\nconst ${varName} = ${baseName}`;
    }
  }
];

// Function transformations
const FUNCTION_TRANSFORMS = [
  // Fix arrow function type annotation syntax
  {
    regex: /const\s+([A-Za-z0-9_]+)\s*=\s*\(\(:\s*any\):\s*any\s*=>/g,
    replacement: (match, varName) => {
      return `const ${varName} = (): any =>`; 
    }
  },
  // Add type annotations to functions
  {
    regex: /function\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)/g,
    replacement: (match, funcName, params) => {
      // Simple type inference
      if (params.trim() === '') {
        return `function ${funcName}(): void`;
      }
      
      // Convert parameters to typed parameters
      const typedParams = params.split(',').map(param => {
        param = param.trim();
        if (param.includes('=')) {
          // Has default value
          const [name, defaultValue] = param.split('=');
          return `${name.trim()}: any = ${defaultValue.trim()}`;
        }
        return `${param}: any`;
      }).join(', ');
      
      return `function ${funcName}(${typedParams}): any`;
    }
  },
  // Add type annotations to arrow functions
  {
    regex: /const\s+([A-Za-z0-9_]+)\s*=\s*\(([^)]*)\)\s*=>\s*{/g,
    replacement: (match, funcName, params) => {
      // Skip if already processed
      if (match.includes(': any')) {
        return match;
      }
      
      // Convert parameters to typed parameters
      const typedParams = params.split(',').map(param => {
        param = param.trim();
        if (param.includes('=')) {
          // Has default value
          const [name, defaultValue] = param.split('=');
          return `${name.trim()}: any = ${defaultValue.trim()}`;
        }
        return `${param}: any`;
      }).join(', ');
      
      return `const ${funcName} = (${typedParams}): any => {`;
    }
  }
];

// Variable transformations
const VARIABLE_TRANSFORMS = [
  // Add types to variable declarations
  {
    regex: /(const|let|var)\s+([A-Za-z0-9_]+)\s*=\s*new\s+([A-Za-z0-9_]+)\(([^)]*)\)/g,
    replacement: (match, declarationType, varName, className, params) => {
      return `${declarationType} ${varName}: ${className} = new ${className}(${params})`;
    }
  },
  // Add types to object variable declarations
  {
    regex: /(const|let|var)\s+([A-Za-z0-9_]+)\s*=\s*\{/g,
    replacement: (match, declarationType, varName) => {
      // Check if it looks like component options
      if (varName.includes('options') || varName.includes('config') || varName.includes('props')) {
        return `${declarationType} ${varName}: any = {`;
      }
      return match;
    }
  },
  // Fix localStorage mock
  {
    regex: /const\s+localStorageMock\s*=\s*\(\(:\s*any\):\s*any\s*=>\s*{/g,
    replacement: () => {
      return `const localStorageMock: any = (() => {`;
    }
  }
];

/**
 * Convert a JavaScript file to TypeScript
 * @param {string} filePath Path to the JavaScript file
 */
function convertFile(filePath) {
  console.log(`Converting ${filePath}`);
  
  // Read the file
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Apply transformations
  IMPORT_TRANSFORMS.forEach(transform => {
    content = content.replace(transform.regex, transform.replacement);
  });
  
  FUNCTION_TRANSFORMS.forEach(transform => {
    content = content.replace(transform.regex, transform.replacement);
  });
  
  VARIABLE_TRANSFORMS.forEach(transform => {
    content = content.replace(transform.regex, transform.replacement);
  });
  
  // Create TypeScript file path
  const tsFilePath = filePath.replace(SOURCE_EXT, TARGET_EXT);
  
  // Add JSDoc comment if file doesn't start with one
  if (!content.trimStart().startsWith('/**')) {
    content = `/**
 * ${path.basename(tsFilePath)} - TypeScript test file
 * Generated by the test migration script
 */\n${content}`;
  }
  
  // Write the TypeScript file
  fs.writeFileSync(tsFilePath, content);
  
  // Run prettier on the file if available
  try {
    execSync(`npx prettier --write "${tsFilePath}"`);
    console.log(`Formatted ${tsFilePath}`);
  } catch (error) {
    console.warn(`Could not format ${tsFilePath}: ${error.message}`);
  }
  
  return tsFilePath;
}

/**
 * Process a directory
 * @param {string} dirPath Path to the directory
 */
function processDirectory(dirPath) {
  console.log(`Processing directory: ${dirPath}`);
  
  // Get all files in the directory
  const files = fs.readdirSync(dirPath);
  
  const jsFiles = files.filter(file => 
    file.endsWith(SOURCE_EXT) &&
    !file.endsWith('.d.js') && // Skip declaration files
    !file.includes('.min.js') && // Skip minified files
    !file.includes('.spec.js') && // Skip spec files (we'll process test files separately)
    fs.statSync(path.join(dirPath, file)).isFile()
  );
  
  // Convert each JavaScript file
  const convertedFiles = jsFiles.map(file => {
    const filePath = path.join(dirPath, file);
    return convertFile(filePath);
  });
  
  // Process subdirectories
  const subdirs = files.filter(file => 
    fs.statSync(path.join(dirPath, file)).isDirectory()
  );
  
  subdirs.forEach(subdir => {
    const subdirPath = path.join(dirPath, subdir);
    processDirectory(subdirPath);
  });
  
  return convertedFiles;
}

// Main function
function main() {
  console.log('Starting test migration script');
  
  let convertedFiles = [];
  
  // Process all directories
  TEST_DIRS.forEach(dirPath => {
    if (fs.existsSync(dirPath)) {
      const files = processDirectory(dirPath);
      convertedFiles = convertedFiles.concat(files);
    } else {
      console.warn(`Directory not found: ${dirPath}`);
    }
  });
  
  console.log(`Successfully converted ${convertedFiles.length} files to TypeScript`);
}

// Run the script
main(); 