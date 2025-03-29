/**
 * Steam Deck DUB Edition - Main Application Entry Point
 * This file serves as the central import point for the application
 */

// Import core JavaScript functionality
import { initialize } from './scripts';

// Import accessibility features 
import './accessibility';

// Import stylesheets
import './styles';

// Initialize the application when loaded
document.addEventListener('DOMContentLoaded', () => {
  initialize();
});

// Export public API
export default {
  initialize
}; 