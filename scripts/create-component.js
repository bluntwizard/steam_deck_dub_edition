#!/usr/bin/env node

/**
 * Component Generator Script
 * 
 * Usage: node create-component.js ComponentName
 * 
 * This script creates a new component with the following structure:
 * - src/components/ComponentName/
 *   - index.js
 *   - ComponentName.js
 *   - ComponentName.module.css
 * - src/test/components/ComponentName.test.js
 */

const fs = require('fs');
const path = require('path');

// Get component name from command line arguments
const componentName = process.argv[2];

if (!componentName) {
  console.error('Please provide a component name as an argument.');
  console.log('Usage: node create-component.js ComponentName');
  process.exit(1);
}

// Ensure first character is uppercase
const formattedName = componentName.charAt(0).toUpperCase() + componentName.slice(1);

// Create component directory
const componentDir = path.join(__dirname, '..', 'src', 'components', formattedName);
if (!fs.existsSync(componentDir)) {
  fs.mkdirSync(componentDir, { recursive: true });
  console.log(`Created directory: ${componentDir}`);
} else {
  console.warn(`Directory already exists: ${componentDir}`);
}

// Create test directory if it doesn't exist
const testDir = path.join(__dirname, '..', 'src', 'test', 'components');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
  console.log(`Created directory: ${testDir}`);
}

// Template for index.js
const indexContent = `export { ${formattedName} } from './${formattedName}';
`;

// Template for component file
const componentContent = `import styles from './${formattedName}.module.css';

export class ${formattedName} {
  constructor(options = {}) {
    this.element = document.createElement('div');
    this.element.className = styles.container;
    
    // Add any custom initialization logic here
    
    // Set content if provided
    if (options.content) {
      this.setContent(options.content);
    }
  }
  
  render() {
    return this.element;
  }
  
  setContent(content) {
    this.element.innerHTML = '';
    
    if (typeof content === 'string') {
      this.element.textContent = content;
    } else if (content instanceof HTMLElement) {
      this.element.appendChild(content);
    }
  }
}
`;

// Template for CSS module
const cssContent = `.container {
  /* Component styles */
}
`;

// Template for test file
const testContent = `/**
 * @jest-environment jsdom
 */

import { ${formattedName} } from '../../components/${formattedName}';

describe('${formattedName} Component', () => {
  
  beforeEach(() => {
    document.body.innerHTML = '';
  });
  
  test('renders correctly', () => {
    const component = new ${formattedName}({
      content: 'Test Content'
    });
    
    const element = component.render();
    document.body.appendChild(element);
    
    expect(element.tagName).toBe('DIV');
    expect(element.textContent).toBe('Test Content');
  });
  
  test('setContent method works correctly', () => {
    const component = new ${formattedName}();
    const element = component.render();
    document.body.appendChild(element);
    
    // Test with string content
    component.setContent('Updated Content');
    expect(element.textContent).toBe('Updated Content');
    
    // Test with HTMLElement content
    const childElement = document.createElement('span');
    childElement.textContent = 'Child Element';
    component.setContent(childElement);
    
    expect(element.textContent).toBe('Child Element');
    expect(element.querySelector('span')).not.toBeNull();
  });
});
`;

// Write files
const files = [
  { path: path.join(componentDir, 'index.js'), content: indexContent },
  { path: path.join(componentDir, `${formattedName}.js`), content: componentContent },
  { path: path.join(componentDir, `${formattedName}.module.css`), content: cssContent },
  { path: path.join(testDir, `${formattedName}.test.js`), content: testContent }
];

files.forEach(file => {
  if (!fs.existsSync(file.path)) {
    fs.writeFileSync(file.path, file.content);
    console.log(`Created file: ${file.path}`);
  } else {
    console.warn(`File already exists: ${file.path}`);
  }
});

console.log(`\nComponent "${formattedName}" created successfully!`);
console.log(`\nTo use this component:
import { ${formattedName} } from './components/${formattedName}';

const ${formattedName.toLowerCase()} = new ${formattedName}({
  content: 'Your content here'
});
document.querySelector('#container').appendChild(${formattedName.toLowerCase()}.render());
`); 