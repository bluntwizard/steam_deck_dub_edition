/**
 * PDF Export functionality for the Grimoire Guide
 * Allows users to generate and download a complete PDF of the guide
 */

// We'll need to dynamically load the required libraries when the user requests a PDF
let jsPDFLoaded = false;
let html2canvasLoaded = false;

// Initialize variable to hold dynamically loaded libraries
let html2canvas;
let jsPDF;

document.addEventListener('DOMContentLoaded', () => {
  // Create the PDF export button
  createPdfExportButton();
  
  // Add keyboard shortcut for PDF export (Alt+Shift+P)
  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.shiftKey && e.key === 'p') {
      e.preventDefault();
      showPdfExportDialog();
    }
  });
});

/**
 * Create the PDF export button in the UI
 */
function createPdfExportButton() {
  const button = document.createElement('button');
  button.id = 'pdf-export-button';
  button.className = 'pdf-export-button';
  button.innerHTML = '📄';
  button.title = 'Export as PDF (Alt+Shift+P)';
  
  // Style the button
  button.style.cssText = `
    position: fixed;
    bottom: 120px;
    right: 20px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: var(--dracula-pink, #ff79c6);
    color: var(--dracula-background, #282a36);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2em;
    cursor: pointer;
    z-index: 990;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s, background-color 0.3s;
  `;
  
  // Add hover effect
  button.addEventListener('mouseover', () => {
    button.style.transform = 'translateY(-3px)';
    button.style.backgroundColor = 'var(--dracula-purple, #bd93f9)';
  });
  
  button.addEventListener('mouseout', () => {
    button.style.transform = 'translateY(0)';
    button.style.backgroundColor = 'var(--dracula-pink, #ff79c6)';
  });
  
  // Add click event
  button.addEventListener('click', () => {
    showPdfExportDialog();
  });
  
  // Add to the document
  document.body.appendChild(button);
  
  // Hide in print view
  const style = document.createElement('style');
  style.textContent = `
    @media print {
      #pdf-export-button { display: none !important; }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Show PDF export options dialog
 */
function showPdfExportDialog() {
  // Create dialog element
  const dialog = document.createElement('div');
  dialog.className = 'pdf-export-dialog';
  
  // Style the dialog
  dialog.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--dracula-background, #282a36);
    border: 1px solid var(--dracula-current-line, #44475a);
    border-radius: 8px;
    padding: 20px;
    width: 90%;
    max-width: 500px;
    z-index: 10000;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  `;
  
  // Add content to the dialog
  dialog.innerHTML = `
    <h3 style="color: var(--dracula-pink, #ff79c6); margin-top: 0; margin-bottom: 15px;">Export Guide as PDF</h3>
    
    <div style="margin-bottom: 20px;">
      <h4 style="color: var(--dracula-cyan, #8be9fd); margin-bottom: 10px;">PDF Options:</h4>
      
      <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 15px;">
        <label style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" id="pdf-include-toc" checked>
          <span>Include table of contents</span>
        </label>
        
        <label style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" id="pdf-expand-details" checked>
          <span>Expand all sections</span>
        </label>
        
        <label style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" id="pdf-include-links" checked>
          <span>Include clickable links</span>
        </label>
        
        <label style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" id="pdf-include-cover" checked>
          <span>Include cover page</span>
        </label>
      </div>
      
      <h4 style="color: var(--dracula-cyan, #8be9fd); margin-bottom: 10px;">Content to Include:</h4>
      
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <label style="display: flex; align-items: center; gap: 8px;">
          <input type="radio" name="pdf-content" id="pdf-all-content" checked>
          <span>Complete guide</span>
        </label>
        
        <label style="display: flex; align-items: center; gap: 8px;">
          <input type="radio" name="pdf-content" id="pdf-current-section">
          <span>Current section only</span>
        </label>
        
        <div style="margin-top: 15px;">
          <label style="display: block; margin-bottom: 8px; color: var(--dracula-foreground, #f8f8f2);">PDF Quality:</label>
          <select id="pdf-quality" style="width: 100%; padding: 8px; background-color: var(--dracula-current-line, #44475a); color: var(--dracula-foreground, #f8f8f2); border: 1px solid var(--dracula-comment, #6272a4);">
            <option value="normal">Normal (faster)</option>
            <option value="high">High (larger file)</option>
            <option value="highest">Highest (may be slow)</option>
          </select>
        </div>
        
        <div style="margin-top: 15px; display: none;" id="pdf-progress-container">
          <label style="display: block; margin-bottom: 8px; color: var(--dracula-foreground, #f8f8f2);">Export Progress:</label>
          <div style="width: 100%; height: 20px; background-color: var(--dracula-current-line, #44475a); border-radius: 10px; overflow: hidden;">
            <div id="pdf-progress-bar" style="width: 0%; height: 100%; background-color: var(--dracula-green, #50fa7b); transition: width 0.3s ease;"></div>
          </div>
          <p id="pdf-progress-status" style="text-align: center; margin-top: 5px; font-size: 0.9em; color: var(--dracula-comment, #6272a4);"></p>
        </div>
      </div>
    </div>
    
    <div style="display: flex; justify-content: space-between; margin-top: 20px;">
      <button id="cancel-pdf-export" style="background-color: var(--dracula-comment, #6272a4); color: var(--dracula-foreground, #f8f8f2); border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Cancel</button>
      <button id="confirm-pdf-export" style="background-color: var(--dracula-pink, #ff79c6); color: var(--dracula-background, #282a36); padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">Generate PDF</button>
    </div>
  `;
  
  // Add to the document
  document.body.appendChild(dialog);
  
  // Add event listeners
  document.getElementById('cancel-pdf-export').addEventListener('click', () => {
    dialog.remove();
  });
  
  document.getElementById('confirm-pdf-export').addEventListener('click', () => {
    const options = {
      includeToc: document.getElementById('pdf-include-toc').checked,
      expandDetails: document.getElementById('pdf-expand-details').checked,
      includeLinks: document.getElementById('pdf-include-links').checked,
      includeCover: document.getElementById('pdf-include-cover').checked,
      contentMode: document.querySelector('input[name="pdf-content"]:checked').id,
      quality: document.getElementById('pdf-quality').value
    };
    
    // Show progress container
    document.getElementById('pdf-progress-container').style.display = 'block';
    
    // Disable generate button to prevent multiple clicks
    document.getElementById('confirm-pdf-export').disabled = true;
    document.getElementById('confirm-pdf-export').style.opacity = '0.5';
    document.getElementById('confirm-pdf-export').style.cursor = 'not-allowed';
    
    // Load required libraries and generate PDF
    loadPdfLibraries()
      .then(() => {
        generatePdf(options, dialog);
      })
      .catch(error => {
        showPdfError(error, dialog);
      });
  });
  
  // Close on escape key
  document.addEventListener('keydown', function closeOnEsc(e) {
    if (e.key === 'Escape') {
      dialog.remove();
      document.removeEventListener('keydown', closeOnEsc);
    }
  });
  
  // Close on outside click
  setTimeout(() => {
    document.addEventListener('click', function closeOnOutsideClick(e) {
      if (!dialog.contains(e.target) && e.target.id !== 'pdf-export-button') {
        dialog.remove();
        document.removeEventListener('click', closeOnOutsideClick);
      }
    });
  }, 10);
}

/**
 * Load required PDF generation libraries
 */
async function loadPdfLibraries() {
  updatePdfProgress(10, 'Loading required libraries...', document.querySelector('.pdf-export-dialog'));
  
  try {
    // Load jsPDF dynamically if needed
    if (!window.jspdf || !window.jspdf.jsPDF) {
      const jsPdfScript = document.createElement('script');
      jsPdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      document.head.appendChild(jsPdfScript);
      
      await new Promise((resolve, reject) => {
        jsPdfScript.onload = resolve;
        jsPdfScript.onerror = reject;
      });
    }
    
    // Load html2canvas dynamically
    if (!window.html2canvas) {
      const html2canvasScript = document.createElement('script');
      html2canvasScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      document.head.appendChild(html2canvasScript);
      
      await new Promise((resolve, reject) => {
        html2canvasScript.onload = resolve;
        html2canvasScript.onerror = reject;
      });
    }
    
    // Assign libraries to our variables
    jsPDF = window.jspdf.jsPDF;
    html2canvas = window.html2canvas;
    
    return true;
  } catch (error) {
    console.error('Failed to load PDF libraries:', error);
    return false;
  }
}

/**
 * Generate PDF with the specified options
 */
async function generatePdf(options, dialog) {
  try {
    updatePdfProgress(0, 'Preparing content for PDF export...', dialog);
    
    // Clone the content container to avoid modifying the original
    const contentContainer = document.getElementById('dynamic-content');
    const containerClone = contentContainer.cloneNode(true);
    
    // Create a temporary container to hold the cloned content
    const tempContainer = document.createElement('div');
    tempContainer.style.cssText = `
      position: absolute;
      top: -9999px;
      left: -9999px;
      width: 816px; /* 8.5" × 11" (US Letter) at 96 PPI */
      background-color: white;
      color: black;
      font-family: 'Georgia', serif;
      line-height: 1.5;
      padding: 72px; /* 0.75" margins */
    `;
    document.body.appendChild(tempContainer);
    
    // Apply print styles to the clone
    updatePdfProgress(5, 'Applying styles...', dialog);
    applyPdfStyles(containerClone, options);
    
    // Add cover page if requested
    if (options.includeCover) {
      updatePdfProgress(10, 'Creating cover page...', dialog);
      const coverPage = createCoverPage();
      tempContainer.appendChild(coverPage);
    }
    
    // Add table of contents if requested
    if (options.includeToc) {
      updatePdfProgress(15, 'Generating table of contents...', dialog);
      const tocPage = createTableOfContents(containerClone);
      tempContainer.appendChild(tocPage);
    }
    
    // Filter content based on options
    if (options.contentMode === 'pdf-current-section') {
      updatePdfProgress(20, 'Processing current section...', dialog);
      const currentSection = getCurrentSection();
      if (currentSection) {
        tempContainer.appendChild(currentSection.cloneNode(true));
      } else {
        throw new Error('Could not identify current section');
      }
    } else {
      // Add all content
      updatePdfProgress(20, 'Processing all sections...', dialog);
      tempContainer.appendChild(containerClone);
    }
    
    // Initialize PDF document with jsPDF
    updatePdfProgress(25, 'Initializing PDF document...', dialog);
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4',
      hotfixes: ['px_scaling']
    });
    
    // Set PDF metadata
    pdf.setProperties({
      title: 'Grimoire Guide',
      subject: 'A comprehensive guide for Steam Deck optimization',
      author: 'Grimoire Guide Team',
      keywords: 'Steam Deck, guide, gaming, optimization',
      creator: 'Grimoire Guide PDF Export'
    });
    
    // Calculate scaling factor based on quality setting
    let scale = 1;
    if (options.quality === 'high') scale = 1.5;
    if (options.quality === 'highest') scale = 2;
    
    // Get all pages to render
    const pages = tempContainer.querySelectorAll('.pdf-page, section');
    
    // Render each page to PDF
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const progress = 25 + (70 * (i / pages.length));
      updatePdfProgress(progress, `Rendering page ${i+1} of ${pages.length}...`, dialog);
      
      // Render the page to canvas
      const canvas = await html2canvas(page, {
        scale: scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      // Add page to PDF (first page doesn't need addPage)
      if (i > 0) {
        pdf.addPage();
      }
      
      // Calculate dimensions to maintain aspect ratio
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = Math.min(pageWidth / canvasWidth, pageHeight / canvasHeight);
      const imgWidth = canvasWidth * ratio;
      const imgHeight = canvasHeight * ratio;
      
      // Center the image on the page
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;
      
      // Add image to PDF
      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
    }
    
    // Generate PDF file name
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const fileName = `SteamDeck_DUB_Guide_${dateStr}.pdf`;
    
    // Save the PDF
    updatePdfProgress(95, 'Finalizing PDF...', dialog);
    pdf.save(fileName);
    
    // Clean up
    updatePdfProgress(100, 'PDF exported successfully!', dialog);
    document.body.removeChild(tempContainer);
    
    // Show success message
    showPdfSuccess(dialog, fileName);
    
  } catch (error) {
    console.error('PDF generation error:', error);
    showPdfError(error, dialog);
  }
}

/**
 * Apply PDF-specific styles to content
 */
function applyPdfStyles(container, options) {
  // Apply general PDF styles
  container.querySelectorAll('*').forEach(el => {
    // Remove background colors
    el.style.backgroundColor = '';
    el.style.background = '';
    
    // Set text color to black
    el.style.color = '#000000';
    
    // Remove animations
    el.style.animation = 'none';
    el.style.transition = 'none';
    
    // Remove shadows
    el.style.boxShadow = 'none';
    el.style.textShadow = 'none';
  });
  
  // Handle headings
  container.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading, index) => {
    heading.style.fontFamily = '\'Georgia\', serif';
    
    // Color headings based on level
    switch (heading.tagName) {
      case 'H1': heading.style.color = '#000000'; break;
      case 'H2': heading.style.color = '#222222'; break;
      case 'H3': heading.style.color = '#333333'; break;
      default: heading.style.color = '#444444';
    }
    
    // Add page break before major headings
    if (heading.tagName === 'H1' || heading.tagName === 'H2') {
      heading.style.pageBreakBefore = 'always';
      heading.style.marginTop = '1em';
    }
  });
  
  // Handle links
  container.querySelectorAll('a').forEach(link => {
    if (options.includeLinks) {
      // Keep links clickable but style them
      link.style.color = '#0000EE';
      link.style.textDecoration = 'underline';
    } else {
      // Convert links to normal text
      const text = document.createTextNode(link.textContent);
      link.parentNode.replaceChild(text, link);
    }
  });
  
  // Handle code blocks
  container.querySelectorAll('.code-block, pre, code').forEach(code => {
    code.style.fontFamily = '\'Courier New\', monospace';
    code.style.border = '1px solid #CCCCCC';
    code.style.backgroundColor = '#F8F8F8';
    code.style.pageBreakInside = 'avoid';
  });
  
  // Handle details elements
  if (options.expandDetails) {
    container.querySelectorAll('details').forEach(details => {
      details.setAttribute('open', '');
      
      // Style the summary
      const summary = details.querySelector('summary');
      if (summary) {
        summary.style.fontWeight = 'bold';
        summary.style.marginBottom = '0.5em';
      }
    });
  }
  
  // Handle images
  container.querySelectorAll('img').forEach(img => {
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.pageBreakInside = 'avoid';
  });
  
  // Handle tables
  container.querySelectorAll('table').forEach(table => {
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.pageBreakInside = 'avoid';
    
    // Style table cells
    table.querySelectorAll('th, td').forEach(cell => {
      cell.style.border = '1px solid #CCCCCC';
      cell.style.padding = '8px';
    });
    
    // Style table headers
    table.querySelectorAll('th').forEach(th => {
      th.style.backgroundColor = '#EEEEEE';
      th.style.fontWeight = 'bold';
    });
  });
  
  // Remove elements that shouldn't be in the PDF
  container.querySelectorAll('.search-container, .back-to-top, .skip-to-content').forEach(el => {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  });
  
  // Wrap each section in a page container for PDF rendering
  container.querySelectorAll('section').forEach(section => {
    section.classList.add('pdf-page');
  });
}

/**
 * Create a cover page for the PDF
 */
function createCoverPage() {
  const coverPage = document.createElement('div');
  coverPage.className = 'pdf-page cover-page';
  coverPage.style.cssText = `
    height: 1123px; /* A4 height at 96 DPI */
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 72px;
  `;
  
  // Add cover page content
  coverPage.innerHTML = `
    <h1 style="font-size: 40px; margin-bottom: 20px; color: #000000; font-family: 'Georgia', serif;">Grimoire</h1>
    <h2 style="font-size: 30px; margin-bottom: 40px; color: #444444; font-family: 'Georgia', serif;">Complete Guide</h2>
    
    <div style="margin: 40px 0; width: 100px; border-top: 3px solid #000000;"></div>
    
    <p style="font-size: 18px; margin-bottom: 20px; color: #666666; font-style: italic;">A comprehensive guide to optimizing your Steam Deck experience</p>
    
    <div style="margin-top: 60px; font-size: 14px; color: #666666;">
      <p>Generated on ${new Date().toLocaleDateString()}</p>
      <p>Version 1.0</p>
    </div>
  `;
  
  return coverPage;
}

/**
 * Create a table of contents for the PDF
 */
function createTableOfContents(content) {
  const tocPage = document.createElement('div');
  tocPage.className = 'pdf-page toc-page';
  tocPage.style.cssText = `
    height: 1123px; /* A4 height at 96 DPI */
    width: 100%;
    padding: 72px;
  `;
  
  // Add TOC header
  const tocHeader = document.createElement('h1');
  tocHeader.textContent = 'Table of Contents';
  tocHeader.style.cssText = `
    font-size: 24px;
    margin-bottom: 20px;
    color: #000000;
    font-family: 'Georgia', serif;
    page-break-after: avoid;
  `;
  tocPage.appendChild(tocHeader);
  
  // Create TOC list
  const tocList = document.createElement('ul');
  tocList.style.cssText = `
    list-style-type: none;
    padding: 0;
    margin: 0;
  `;
  
  // Extract headings for TOC
  const headings = content.querySelectorAll('h1, h2, h3');
  headings.forEach((heading, index) => {
    const item = document.createElement('li');
    
    // Style based on heading level
    let indent = '0';
    let fontSize = '16px';
    let marginBottom = '10px';
    
    switch (heading.tagName) {
      case 'H1':
        indent = '0';
        fontSize = '18px';
        marginBottom = '15px';
        break;
      case 'H2':
        indent = '20px';
        fontSize = '16px';
        marginBottom = '10px';
        break;
      case 'H3':
        indent = '40px';
        fontSize = '14px';
        marginBottom = '8px';
        break;
    }
    
    item.style.cssText = `
      margin-left: ${indent};
      font-size: ${fontSize};
      margin-bottom: ${marginBottom};
      page-break-inside: avoid;
    `;
    
    // Add heading text
    item.textContent = heading.textContent;
    
    tocList.appendChild(item);
  });
  
  tocPage.appendChild(tocList);
  return tocPage;
}

/**
 * Get the current section visible in the viewport
 */
function getCurrentSection() {
  const sections = Array.from(document.querySelectorAll('.section'));
  if (sections.length === 0) return null;
  
  // Find which section is most visible in the viewport
  const viewportHeight = window.innerHeight;
  let maxVisibleSection = null;
  let maxVisibleArea = 0;
  
  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    // Skip if not in viewport
    if (rect.bottom < 0 || rect.top > viewportHeight) return;
    
    // Calculate visible area
    const top = Math.max(0, rect.top);
    const bottom = Math.min(viewportHeight, rect.bottom);
    const visibleArea = bottom - top;
    
    if (visibleArea > maxVisibleArea) {
      maxVisibleArea = visibleArea;
      maxVisibleSection = section;
    }
  });
  
  return maxVisibleSection;
}

/**
 * Update the PDF generation progress bar
 */
function updatePdfProgress(percent, status, dialog) {
  const progressBar = dialog.querySelector('#pdf-progress-bar');
  const progressStatus = dialog.querySelector('#pdf-progress-status');
  
  if (progressBar) {
    progressBar.style.width = `${percent}%`;
  }
  
  if (progressStatus) {
    progressStatus.textContent = status;
  }
}

/**
 * Show PDF generation success message
 */
function showPdfSuccess(dialog, fileName) {
  // Update dialog content to show success message
  dialog.innerHTML = `
    <h3 style="color: var(--dracula-green, #50fa7b); margin-top: 0; margin-bottom: 15px;">PDF Generated Successfully!</h3>
    
    <div style="text-align: center; margin: 20px 0;">
      <div style="font-size: 4em; margin-bottom: 20px;">✅</div>
      <p>Your PDF has been downloaded as:</p>
      <p style="font-weight: bold; color: var(--dracula-cyan, #8be9fd);">${fileName}</p>
    </div>
    
    <div style="margin-top: 20px; text-align: center;">
      <button id="close-pdf-success" style="background-color: var(--dracula-purple, #bd93f9); color: var(--dracula-background, #282a36); padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Close</button>
    </div>
  `;
  
  // Add event listener to close button
  document.getElementById('close-pdf-success').addEventListener('click', () => {
    dialog.remove();
  });
}

/**
 * Show PDF generation error message
 */
function showPdfError(error, dialog) {
  // Update dialog content to show error message
  dialog.innerHTML = `
    <h3 style="color: var(--dracula-red, #ff5555); margin-top: 0; margin-bottom: 15px;">PDF Generation Failed</h3>
    
    <div style="text-align: center; margin: 20px 0;">
      <div style="font-size: 4em; margin-bottom: 20px;">❌</div>
      <p>There was an error generating your PDF:</p>
      <p style="font-weight: bold; color: var(--dracula-red, #ff5555);">${error.message || 'Unknown error'}</p>
    </div>
    
    <div style="margin-top: 20px; text-align: center;">
      <button id="close-pdf-error" style="background-color: var(--dracula-purple, #bd93f9); color: var(--dracula-background, #282a36); padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Close</button>
    </div>
  `;
  
  // Add event listener to close button
  document.getElementById('close-pdf-error').addEventListener('click', () => {
    dialog.remove();
  });
}
