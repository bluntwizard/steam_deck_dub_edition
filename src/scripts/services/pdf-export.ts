/**
 * PDF Export functionality for the SDDE Guide
 * Allows users to generate and download a complete PDF of the guide
 */

// Type definitions for dynamically loaded libraries
interface Html2CanvasOptions {
  scale?: number;
  logging?: boolean;
  allowTaint?: boolean;
  useCORS?: boolean;
  backgroundColor?: string;
  imageTimeout?: number;
  ignoreElements?: (element: Element) => boolean;
  onclone?: (document: Document) => void;
}

interface Html2Canvas {
  (element: HTMLElement, options?: Html2CanvasOptions): Promise<HTMLCanvasElement>;
}

interface JsPDFOptions {
  orientation?: 'portrait' | 'landscape';
  unit?: 'pt' | 'mm' | 'cm' | 'in';
  format?: string | [number, number];
  compress?: boolean;
  precision?: number;
  filters?: string[];
}

interface JsPDFStatic {
  new(options?: JsPDFOptions): JsPDF;
}

interface JsPDF {
  addImage: (
    imageData: string | HTMLImageElement | HTMLCanvasElement,
    format: string,
    x: number,
    y: number,
    width: number,
    height: number,
    alias?: string,
    compression?: string,
    rotation?: number
  ) => JsPDF;
  addPage: () => JsPDF;
  save: (filename: string) => JsPDF;
  setTextColor: (r: number, g: number, b: number) => JsPDF;
  setFontSize: (size: number) => JsPDF;
  text: (text: string, x: number, y: number, options?: any) => JsPDF;
  link: (x: number, y: number, w: number, h: number, link: string) => JsPDF;
  setFont: (fontName: string, fontStyle?: string) => JsPDF;
  internal: {
    getTextWidth: (text: string) => number;
    [key: string]: any;
  };
  line: (x1: number, y1: number, x2: number, y2: number) => JsPDF;
  setLineWidth: (width: number) => JsPDF;
}

/**
 * Interface for PDF export options
 */
interface PdfExportOptions {
  includeToc: boolean;
  expandDetails: boolean;
  includeLinks: boolean;
  includeCover: boolean;
  contentMode: string;
  quality: 'normal' | 'high' | 'highest';
}

// We'll need to dynamically load the required libraries when the user requests a PDF
let jsPDFLoaded = false;
let html2canvasLoaded = false;

// Initialize variable to hold dynamically loaded libraries
let html2canvas: Html2Canvas;
let jsPDF: JsPDFStatic;

document.addEventListener('DOMContentLoaded', () => {
  // Create the PDF export button
  createPdfExportButton();
  
  // Add keyboard shortcut for PDF export (Alt+Shift+P)
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.altKey && e.shiftKey && e.key === 'p') {
      e.preventDefault();
      showPdfExportDialog();
    }
  });
});

/**
 * Create the PDF export button in the UI
 */
function createPdfExportButton(): void {
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
function showPdfExportDialog(): void {
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
  const cancelButton = document.getElementById('cancel-pdf-export');
  if (cancelButton) {
    cancelButton.addEventListener('click', () => {
      dialog.remove();
    });
  }
  
  const confirmButton = document.getElementById('confirm-pdf-export') as HTMLButtonElement;
  if (confirmButton) {
    confirmButton.addEventListener('click', () => {
      const tocCheckbox = document.getElementById('pdf-include-toc') as HTMLInputElement;
      const expandCheckbox = document.getElementById('pdf-expand-details') as HTMLInputElement;
      const linksCheckbox = document.getElementById('pdf-include-links') as HTMLInputElement;
      const coverCheckbox = document.getElementById('pdf-include-cover') as HTMLInputElement;
      const allContentRadio = document.getElementById('pdf-all-content') as HTMLInputElement;
      const qualitySelect = document.getElementById('pdf-quality') as HTMLSelectElement;
      
      if (!tocCheckbox || !expandCheckbox || !linksCheckbox || !coverCheckbox || !allContentRadio || !qualitySelect) {
        console.error('Required elements not found');
        return;
      }
      
      const options: PdfExportOptions = {
        includeToc: tocCheckbox.checked,
        expandDetails: expandCheckbox.checked,
        includeLinks: linksCheckbox.checked,
        includeCover: coverCheckbox.checked,
        contentMode: document.querySelector('input[name="pdf-content"]:checked')?.id || 'pdf-all-content',
        quality: qualitySelect.value as 'normal' | 'high' | 'highest'
      };
      
      // Show progress container
      const progressContainer = document.getElementById('pdf-progress-container');
      if (progressContainer) {
        progressContainer.style.display = 'block';
      }
      
      // Disable generate button to prevent multiple clicks
      confirmButton.disabled = true;
      
      // Load libraries then generate the PDF
      loadPdfLibraries()
        .then(() => generatePdf(options, dialog))
        .catch((error: Error) => {
          showPdfError(error, dialog);
        });
    });
  }
  
  // Allow closing the dialog with the Escape key
  const keydownHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      document.removeEventListener('keydown', keydownHandler);
      dialog.remove();
    }
  };
  
  document.addEventListener('keydown', keydownHandler);
  
  // Close dialog when clicking outside
  const clickHandler = (e: MouseEvent) => {
    if (!dialog.contains(e.target as Node) && e.target !== document.getElementById('pdf-export-button')) {
      document.removeEventListener('click', clickHandler);
      dialog.remove();
    }
  };
  
  // Delay adding the click listener to prevent immediate closing
  setTimeout(() => {
    document.addEventListener('click', clickHandler);
  }, 100);
}

/**
 * Load the PDF generation libraries
 */
async function loadPdfLibraries(): Promise<void> {
  if (jsPDFLoaded && html2canvasLoaded) {
    return; // Libraries already loaded
  }
  
  try {
    // Load the HTML2Canvas library if not already loaded
    if (!html2canvasLoaded) {
      const html2canvasScript = document.createElement('script');
      html2canvasScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      html2canvasScript.async = true;
      
      await new Promise<void>((resolve, reject) => {
        html2canvasScript.onload = () => {
          html2canvasLoaded = true;
          html2canvas = (window as any).html2canvas;
          resolve();
        };
        html2canvasScript.onerror = () => reject(new Error('Failed to load html2canvas library'));
        document.head.appendChild(html2canvasScript);
      });
    }
    
    // Load the jsPDF library if not already loaded
    if (!jsPDFLoaded) {
      const jspdfScript = document.createElement('script');
      jspdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      jspdfScript.async = true;
      
      await new Promise<void>((resolve, reject) => {
        jspdfScript.onload = () => {
          jsPDFLoaded = true;
          jsPDF = (window as any).jspdf.jsPDF;
          resolve();
        };
        jspdfScript.onerror = () => reject(new Error('Failed to load jsPDF library'));
        document.head.appendChild(jspdfScript);
      });
    }
  } catch (error) {
    console.error('Error loading PDF libraries:', error);
    throw new Error('Could not load required libraries for PDF generation');
  }
}

/**
 * Generate the PDF from the specified content
 */
async function generatePdf(options: PdfExportOptions, dialog: HTMLElement): Promise<void> {
  try {
    updatePdfProgress(5, 'Preparing content...', dialog);
    
    // Clone the document content for modification
    const content = document.querySelector('.content') as HTMLElement;
    if (!content) {
      throw new Error('Could not find content to export');
    }
    
    // Create a clone of the content for modification
    const contentClone = content.cloneNode(true) as HTMLElement;
    
    // Get current section if requested
    if (options.contentMode === 'pdf-current-section') {
      const currentSection = getCurrentSection();
      if (currentSection) {
        contentClone.innerHTML = '';
        contentClone.appendChild(currentSection.cloneNode(true) as HTMLElement);
      }
    }
    
    // Apply styles and modifications for better PDF output
    applyPdfStyles(contentClone, options);
    
    updatePdfProgress(10, 'Creating PDF document...', dialog);
    
    // Initialize jsPDF
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const marginX = 10; // Margins in mm
    const marginY = 15;
    const contentWidth = pageWidth - (2 * marginX);
    const contentHeight = pageHeight - (2 * marginY);
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Add cover page if requested
    let currentPage = 0;
    if (options.includeCover) {
      updatePdfProgress(15, 'Creating cover page...', dialog);
      await createCoverPage(pdf);
      currentPage++;
    }
    
    // Add table of contents if requested
    if (options.includeToc) {
      updatePdfProgress(20, 'Creating table of contents...', dialog);
      pdf.addPage();
      currentPage++;
      await createTableOfContents(contentClone, pdf);
    }
    
    // Temporary container to hold the content
    const tempContainer = document.createElement('div');
    tempContainer.style.width = `${contentWidth * 3.779527559}px`; // Convert mm to pixels
    tempContainer.style.padding = '0';
    tempContainer.style.margin = '0';
    tempContainer.appendChild(contentClone);
    
    // Hide this container from view but keep it in the DOM for rendering
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    document.body.appendChild(tempContainer);
    
    updatePdfProgress(30, 'Rendering page content...', dialog);
    
    // Configure HTML2Canvas options based on quality
    const scaleOptions: { [key: string]: number } = {
      'normal': 1.5,
      'high': 2,
      'highest': 3
    };
    
    const scale = scaleOptions[options.quality] || 2;
    
    // Convert HTML content to canvas
    const canvas = await html2canvas(tempContainer, {
      scale: scale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      onclone: (clonedDoc) => {
        // Further modifications to the cloned document if needed
      }
    });
    
    // Clean up the temp container
    document.body.removeChild(tempContainer);
    
    updatePdfProgress(70, 'Processing content for PDF...', dialog);
    
    // Calculate number of pages needed
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pageCount = Math.ceil(imgHeight / contentHeight);
    
    // Add content page by page
    for (let i = 0; i < pageCount; i++) {
      if (i > 0 || currentPage > 0) {
        pdf.addPage();
      }
      
      // Calculate position to slice the canvas
      const sourceY = i * (canvas.height / pageCount);
      const sourceHeight = canvas.height / pageCount;
      
      // Get image data for this page
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sourceHeight;
      const ctx = pageCanvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(
          canvas,
          0, sourceY, canvas.width, sourceHeight,
          0, 0, pageCanvas.width, pageCanvas.height
        );
        
        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.9);
        
        pdf.addImage(
          pageImgData, 'JPEG',
          marginX, marginY,
          contentWidth, (sourceHeight * contentWidth) / canvas.width
        );
      }
      
      updatePdfProgress(70 + Math.floor(i / pageCount * 25), `Rendering page ${i + 1} of ${pageCount}...`, dialog);
    }
    
    updatePdfProgress(95, 'Finalizing PDF...', dialog);
    
    // Generate filename based on current date
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    const fileName = options.contentMode === 'pdf-current-section'
      ? `sdde-guide-section-${dateStr}.pdf`
      : `sdde-complete-guide-${dateStr}.pdf`;
    
    // Save the PDF
    pdf.save(fileName);
    
    updatePdfProgress(100, 'PDF generated successfully!', dialog);
    
    // Show success message
    showPdfSuccess(dialog, fileName);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    showPdfError(error instanceof Error ? error : new Error('Unknown error'), dialog);
  }
}

/**
 * Apply styles and modifications to the content for PDF export
 */
function applyPdfStyles(container: HTMLElement, options: PdfExportOptions): void {
  // Set PDF-specific styles
  const pdfStyles = document.createElement('style');
  pdfStyles.textContent = `
    * {
      font-family: 'Helvetica', 'Arial', sans-serif;
      color: #000;
      background: #fff;
      page-break-inside: avoid;
    }
    body {
      background: #fff;
      color: #000;
      font-size: 12px;
      line-height: 1.5;
    }
    a {
      color: #0066cc;
      text-decoration: underline;
    }
    code, pre {
      font-family: 'Courier New', monospace;
      background-color: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 3px;
      padding: 2px 4px;
    }
    pre {
      padding: 8px;
      white-space: pre-wrap;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1em;
      margin-bottom: 0.5em;
      page-break-after: avoid;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f2f2f2;
    }
    .header, .footer, .nav, .sidebar, button, .no-print {
      display: none !important;
    }
  `;
  
  // Append styles to container
  const stylesContainer = document.createElement('div');
  stylesContainer.appendChild(pdfStyles);
  container.insertBefore(stylesContainer, container.firstChild);
  
  // Expand all details elements if requested
  if (options.expandDetails) {
    const details = container.querySelectorAll('details');
    details.forEach(detail => {
      detail.setAttribute('open', '');
    });
  }
  
  // Remove elements that shouldn't be in the PDF
  const elementsToRemove = [
    '.navigation-controls',
    '.theme-toggle',
    '.search-container',
    '.pdf-export-button',
    '.back-to-top',
    '.feedback-button',
    'script',
    'iframe',
    '.adsbygoogle',
    '.hidden'
  ];
  
  elementsToRemove.forEach(selector => {
    const elements = container.querySelectorAll(selector);
    elements.forEach(element => {
      element.parentNode?.removeChild(element);
    });
  });
  
  // Handle links based on options
  if (!options.includeLinks) {
    const links = container.querySelectorAll('a');
    links.forEach(link => {
      const span = document.createElement('span');
      span.textContent = link.textContent || '';
      link.parentNode?.replaceChild(span, link);
    });
  }
  
  // Remove any click event listeners that might interfere
  const interactive = container.querySelectorAll('button, [onclick], [data-toggle], [data-trigger]');
  interactive.forEach(element => {
    const newElement = element.cloneNode(true);
    element.parentNode?.replaceChild(newElement, element);
  });
  
  // Add page breaks before main sections
  const sections = container.querySelectorAll('h1, h2');
  sections.forEach(section => {
    const sectionElement = section as HTMLElement;
    sectionElement.style.pageBreakBefore = 'always';
  });
  
  // Ensure images don't break across pages
  const images = container.querySelectorAll('img, figure');
  images.forEach(img => {
    const imgElement = img as HTMLElement;
    imgElement.style.pageBreakInside = 'avoid';
  });
  
  // Ensure code blocks don't break across pages
  const codeBlocks = container.querySelectorAll('pre, code, .code-block');
  codeBlocks.forEach(block => {
    const blockElement = block as HTMLElement;
    blockElement.style.pageBreakInside = 'avoid';
  });
}

/**
 * Create a cover page for the PDF
 */
async function createCoverPage(pdf: JsPDF): Promise<void> {
  // Add title
  pdf.setFontSize(28);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Steam Deck DUB Edition Guide', 105, 70, { align: 'center' });
  
  // Add logo if available
  const logo = document.querySelector('.logo img, .site-logo') as HTMLImageElement;
  if (logo) {
    try {
      // Create a canvas from the logo image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = logo.naturalWidth;
        canvas.height = logo.naturalHeight;
        ctx.drawImage(logo, 0, 0);
        
        // Add to PDF
        const logoData = canvas.toDataURL('image/png');
        const logoWidth = 80;
        const logoHeight = (logo.naturalHeight / logo.naturalWidth) * logoWidth;
        pdf.addImage(logoData, 'PNG', (210 - logoWidth) / 2, 100, logoWidth, logoHeight);
      }
    } catch (e) {
      console.warn('Could not add logo to cover page', e);
    }
  }
  
  // Add date
  const now = new Date();
  const dateStr = now.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  pdf.setFontSize(12);
  pdf.text(`Generated on ${dateStr}`, 105, 200, { align: 'center' });
  
  // Add horizontal line
  pdf.setLineWidth(0.5);
  pdf.line(40, 210, 170, 210);
  
  // Add footer text
  pdf.setFontSize(10);
  pdf.text('This guide is built by the Steam Deck community for educational purposes.', 105, 220, { align: 'center' });
  pdf.text('All content is provided "as is" without warranty of any kind.', 105, 226, { align: 'center' });
  
  return Promise.resolve();
}

/**
 * Create a table of contents
 */
async function createTableOfContents(content: HTMLElement, pdf: JsPDF): Promise<void> {
  // Add title
  pdf.setFontSize(20);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Table of Contents', 105, 20, { align: 'center' });
  
  // Horizontal line under title
  pdf.setLineWidth(0.5);
  pdf.line(40, 25, 170, 25);
  
  // Find all headings in the content
  const headings = content.querySelectorAll('h1, h2, h3');
  
  let y = 40;
  const lineHeight = 10;
  
  // Add each heading to the TOC
  headings.forEach((heading, index) => {
    if (index > 0 && heading.tagName === 'H1' && y > 250) {
      // Start a new page if we have a main heading and are near the bottom
      pdf.addPage();
      y = 20;
    }
    
    const level = parseInt(heading.tagName.substring(1), 10);
    const indent = (level - 1) * 10;
    
    // Set font based on heading level
    if (level === 1) {
      pdf.setFontSize(14);
      pdf.setFont('Helvetica', 'bold');
    } else if (level === 2) {
      pdf.setFontSize(12);
      pdf.setFont('Helvetica', 'normal');
    } else {
      pdf.setFontSize(11);
      pdf.setFont('Helvetica', 'italic');
    }
    
    // Add heading to TOC
    pdf.text(`${heading.textContent?.trim() || ''}`, 20 + indent, y);
    
    // Draw dots
    const textWidth = pdf.internal.getTextWidth(`${heading.textContent?.trim() || ''}`);
    const dotsStart = 25 + indent + textWidth;
    const dotsEnd = 190;
    
    if (dotsEnd > dotsStart + 5) {
      pdf.setFontSize(8);
      let dotX = dotsStart;
      while (dotX < dotsEnd) {
        pdf.text('.', dotX, y);
        dotX += 3;
      }
      pdf.setFontSize(12);
    }
    
    y += lineHeight;
    
    // Check if we need a new page
    if (y > 270) {
      pdf.addPage();
      y = 20;
    }
  });
  
  return Promise.resolve();
}

/**
 * Get the current section for partial PDF export
 */
function getCurrentSection(): HTMLElement | null {
  // Try to get the currently active section
  const activeSection = document.querySelector('.section.active, article.active, .content-section.active') as HTMLElement;
  if (activeSection) {
    return activeSection;
  }
  
  // If no active section, try to find the section that contains the most visible content
  const allSections = document.querySelectorAll('.section, article, .content-section');
  
  let mostVisibleSection: HTMLElement | null = null;
  let maxVisibleHeight = 0;
  
  allSections.forEach(section => {
    const rect = section.getBoundingClientRect();
    const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
    
    if (visibleHeight > maxVisibleHeight) {
      maxVisibleHeight = visibleHeight;
      mostVisibleSection = section as HTMLElement;
    }
  });
  
  return mostVisibleSection;
}

/**
 * Update the progress bar and status in the dialog
 */
function updatePdfProgress(percent: number, status: string, dialog: HTMLElement): void {
  const progressBar = dialog.querySelector('#pdf-progress-bar') as HTMLElement;
  const progressStatus = dialog.querySelector('#pdf-progress-status') as HTMLElement;
  
  if (progressBar) {
    progressBar.style.width = `${percent}%`;
  }
  
  if (progressStatus) {
    progressStatus.textContent = status;
  }
}

/**
 * Show a success message after PDF generation
 */
function showPdfSuccess(dialog: HTMLElement, fileName: string): void {
  // Clear dialog content
  dialog.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <h3 style="color: var(--dracula-green, #50fa7b); margin-top: 0;">PDF Generated Successfully!</h3>
      <p>Your PDF has been saved as <strong>${fileName}</strong></p>
      <p>You can find it in your browser's download folder.</p>
      <div style="margin-top: 20px;">
        <button id="close-pdf-success" style="background-color: var(--dracula-purple, #bd93f9); color: var(--dracula-background, #282a36); border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">Close</button>
      </div>
    </div>
  `;
  
  // Add close button event listener
  const closeButton = dialog.querySelector('#close-pdf-success');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      dialog.remove();
    });
  }
  
  // Automatically close after 5 seconds
  setTimeout(() => {
    if (document.body.contains(dialog)) {
      dialog.remove();
    }
  }, 5000);
}

/**
 * Show an error message if PDF generation fails
 */
function showPdfError(error: Error, dialog: HTMLElement): void {
  console.error('PDF generation error:', error);
  
  // Clear dialog content
  dialog.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <h3 style="color: var(--dracula-red, #ff5555); margin-top: 0;">PDF Generation Failed</h3>
      <p>There was an error generating your PDF:</p>
      <p style="color: var(--dracula-red, #ff5555); background-color: var(--dracula-current-line, #44475a); padding: 10px; border-radius: 4px;">${error.message || 'Unknown error'}</p>
      <div style="margin-top: 20px;">
        <button id="close-pdf-error" style="background-color: var(--dracula-comment, #6272a4); color: var(--dracula-foreground, #f8f8f2); border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">Close</button>
        <button id="retry-pdf-export" style="background-color: var(--dracula-pink, #ff79c6); color: var(--dracula-background, #282a36); border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-left: 10px;">Try Again</button>
      </div>
    </div>
  `;
  
  // Add event listeners
  const closeButton = dialog.querySelector('#close-pdf-error');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      dialog.remove();
    });
  }
  
  const retryButton = dialog.querySelector('#retry-pdf-export');
  if (retryButton) {
    retryButton.addEventListener('click', () => {
      dialog.remove();
      showPdfExportDialog();
    });
  }
}

// Export the PDF functionality for external use
export default {
  showPdfExportDialog,
  createPdfExportButton
}; 