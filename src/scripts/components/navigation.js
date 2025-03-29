/**
 * Navigation component for Steam Deck DUB Edition
 */

import { debounce } from '../utils/index.js';

/**
 * Initialize navigation and active section tracking
 */
function initNavigation() {
  const navLinks = document.querySelectorAll('.sidebar a');
  
  // Smooth scroll for navigation links
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const targetId = link.getAttribute('href');
      if (targetId.startsWith('#')) {
        e.preventDefault();
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 50,
            behavior: 'smooth'
          });
          
          // Update URL without reloading the page
          window.history.pushState(null, null, targetId);
          
          // Update active link
          navLinks.forEach(navLink => navLink.classList.remove('active'));
          link.classList.add('active');
        }
      }
    });
  });
  
  // Highlight active section on scroll
  window.addEventListener('scroll', debounce(function() {
    if (document.querySelectorAll('.section').length === 0) return;
    
    let currentSectionId = '';
    const scrollPosition = window.scrollY + 150;
    
    // Find the current section based on scroll position
    document.querySelectorAll('.section').forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      
      if (scrollPosition >= sectionTop && 
          scrollPosition < sectionTop + sectionHeight) {
        currentSectionId = section.id;
      }
    });
    
    // Update active link
    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      
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
function initScrollHandlers() {
  const backToTopButton = document.getElementById('back-to-top');
  
  if (backToTopButton) {
    // Toggle button visibility based on scroll position
    window.addEventListener('scroll', debounce(function() {
      if (window.scrollY > 300) {
        backToTopButton.classList.add('visible');
      } else {
        backToTopButton.classList.remove('visible');
      }
    }, 100));
    
    // Scroll to top when button is clicked
    backToTopButton.addEventListener('click', function(e) {
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
function handleUrlHash() {
  const hash = window.location.hash;
  if (hash) {
    setTimeout(() => {
      const targetElement = document.querySelector(hash);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 50,
          behavior: 'smooth'
        });
        
        // Update active link
        const navLinks = document.querySelectorAll('.sidebar a');
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
