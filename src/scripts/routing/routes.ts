/**
 * Routes Configuration
 * Grimoire
 * 
 * Defines all available routes in the application
 */

import { Route } from './router';

/**
 * Application routes
 */
const routes: Route[] = [
  {
    id: 'home',
    path: '/',
    title: 'Home',
    contentPath: '/src/content/home.html'
  },
  {
    id: 'getting-started',
    path: '/getting-started',
    title: 'Getting Started',
    contentPath: '/src/content/getting-started.html'
  },
  {
    id: 'installation',
    path: '/installation',
    title: 'Installation Guide',
    contentPath: '/src/content/installation.html'
  },
  {
    id: 'features',
    path: '/features',
    title: 'Features',
    contentPath: '/src/content/features.html'
  },
  {
    id: 'customization',
    path: '/customization',
    title: 'Customization',
    contentPath: '/src/content/customization.html'
  },
  {
    id: 'troubleshooting',
    path: '/troubleshooting',
    title: 'Troubleshooting',
    contentPath: '/src/content/troubleshooting.html'
  },
  {
    id: 'faq',
    path: '/faq',
    title: 'Frequently Asked Questions',
    contentPath: '/src/content/faq.html'
  },
  {
    id: 'settings-display',
    path: '/settings/display',
    title: 'Display Settings',
    contentPath: '/src/content/settings/display.html'
  },
  {
    id: 'settings-performance',
    path: '/settings/performance',
    title: 'Performance Settings',
    contentPath: '/src/content/settings/performance.html'
  },
  {
    id: 'settings-power',
    path: '/settings/power',
    title: 'Power Settings',
    contentPath: '/src/content/settings/power.html'
  },
  {
    id: 'settings-audio',
    path: '/settings/audio',
    title: 'Audio Settings',
    contentPath: '/src/content/settings/audio.html'
  },
  {
    id: 'about',
    path: '/about',
    title: 'About',
    contentPath: '/src/content/about.html'
  },
  {
    id: 'privacy',
    path: '/privacy',
    title: 'Privacy Policy',
    contentPath: '/src/content/privacy.html'
  },
  {
    id: 'not-found',
    path: '/not-found',
    title: 'Page Not Found',
    contentPath: '/src/content/not-found.html'
  }
];

export default routes; 