/**
 * Navigation component for Grimoire
 */

import { debounce } from '../utils/index.js';

/**
 * Initialize navigation and active section tracking
 */
function initNavigation(): void {
  const navLinks: NodeListOf<HTMLAnchorElement> = document.querySelectorAll('.sidebar a');
  
  // Smooth scroll for navigation links
  navLinks.forEach(link => {
    link.addEventListener('click', function(e: MouseEvent): void {
      const targetId: string | null = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        
        const targetElement: HTMLElement | null = document.querySelector(targetId);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 50,
            behavior: 'smooth'
          });
          
          // Update URL without reloading the page
          window.history.pushState(null, '', targetId);
          
          // Update active link
          navLinks.forEach(navLink => navLink.classList.remove('active'));
          link.classList.add('active');
        }
      }
    });
  });
  
  // Highlight active section on scroll
  window.addEventListener('scroll', debounce(function(): void {
    if (document.querySelectorAll('.section').length === 0) return;
    
    let currentSectionId: string = '';
    const scrollPosition: number = window.scrollY + 150;
    
    // Find the current section based on scroll position
    document.querySelectorAll('.section').forEach((section: Element) => {
      const sectionElement = section as HTMLElement;
      const sectionTop: number = sectionElement.offsetTop;
      const sectionHeight: number = sectionElement.offsetHeight;
      
      if (scrollPosition >= sectionTop && 
          scrollPosition < sectionTop + sectionHeight) {
        currentSectionId = section.id;
      }
    });
    
    // Update active link
    navLinks.forEach(link => {
      link.classList.remove('active');
      const href: string | null = link.getAttribute('href');
      
      if (href === '#' + currentSectionId || 
          (currentSectionId === '' && href === '#top')) {
        link.classList.add('active');
      }
    });
  }, 100));
}

/**
 * Initialize scroll-related handlers
 */
function initScrollHandlers(): void {
  const backToTopButton: HTMLElement | null = document.getElementById('back-to-top');
  
  if (backToTopButton) {
    // Toggle button visibility based on scroll position
    window.addEventListener('scroll', debounce(function(): void {
      if (window.scrollY > 300) {
        backToTopButton.classList.add('visible');
      } else {
        backToTopButton.classList.remove('visible');
      }
    }, 100));
    
    // Scroll to top when button is clicked
    backToTopButton.addEventListener('click', function(e: MouseEvent): void {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

/**
 * Handle URL hash to navigate to section
 */
function handleUrlHash(): void {
  const hash: string = window.location.hash;
  if (hash) {
    setTimeout(() => {
      const targetElement: HTMLElement | null = document.querySelector(hash);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 50,
          behavior: 'smooth'
        });
        
        // Update active link
        const navLinks: NodeListOf<HTMLAnchorElement> = document.querySelectorAll('.sidebar a');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === hash) {
            link.classList.add('active');
          }
        });
      }
    }, 100);
  }
}

export { 
  initNavigation, 
  initScrollHandlers,
  handleUrlHash
}; 