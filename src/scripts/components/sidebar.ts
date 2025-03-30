/**
 * Sidebar component for Grimoire
 */

import { debounce } from '../utils';

/**
 * Initialize sidebar behavior
 */
function initSidebar(): void {
  const toggleButton: HTMLElement | null = document.querySelector('.toggle-sidebar');
  const sidebar: HTMLElement | null = document.querySelector('.sidebar');
  const mainContent: HTMLElement | null = document.querySelector('.main-content');
  
  if (toggleButton && sidebar && mainContent) {
    // Add body class for styling
    document.body.classList.add('has-sidebar');
    
    // Set initial state - hide sidebar by default since we have header navigation
    // Only respect localStorage if it's explicitly set to show the sidebar
    const sidebarHidden: boolean = localStorage.getItem('sidebarHidden') !== 'false';
    if (sidebarHidden) {
      sidebar.classList.add('sidebar-hidden');
      toggleButton.classList.add('sidebar-hidden');
      mainContent.classList.remove('sidebar-active');
    } else {
      mainContent.classList.add('sidebar-active');
    }
    
    // Add a label to the toggle button to indicate it's for legacy sidebar
    toggleButton.title = 'Toggle Legacy Sidebar';
    
    // Toggle sidebar on button click
    toggleButton.addEventListener('click', function(): void {
      sidebar.classList.toggle('sidebar-hidden');
      toggleButton.classList.toggle('sidebar-hidden');
      mainContent.classList.toggle('sidebar-active');
      
      // Save state to local storage
      localStorage.setItem('sidebarHidden', sidebar.classList.contains('sidebar-hidden').toString());
    });
    
    // Close sidebar when clicking on a link on mobile
    if (window.innerWidth <= 576) {
      const sidebarLinks: NodeListOf<HTMLAnchorElement> = sidebar.querySelectorAll('a');
      sidebarLinks.forEach(link => {
        link.addEventListener('click', function(): void {
          if (window.innerWidth <= 576) {
            sidebar.classList.add('sidebar-hidden');
            toggleButton.classList.add('sidebar-hidden');
            mainContent.classList.remove('sidebar-active');
            localStorage.setItem('sidebarHidden', 'true');
          }
        });
      });
    }
  } else {
    console.error('Sidebar elements not found in the DOM');
  }
}

export { initSidebar }; 