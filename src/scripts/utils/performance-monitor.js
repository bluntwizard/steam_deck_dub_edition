/**
 * Performance Monitoring Utilities
 * Provides tools for tracking and improving application performance
 */

// Track timing metrics
const performanceMetrics = {
  appStartTime: 0,
  firstContentfulPaint: 0,
  domInteractive: 0,
  domComplete: 0,
  resourceLoadTimes: {},
  interactionTimes: {}
};

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring() {
  // Record app start time
  performanceMetrics.appStartTime = performance.now();
  
  // Listen for performance-related events
  window.addEventListener('load', recordLoadMetrics);
  
  // If Performance Observer API is available, use it
  if ('PerformanceObserver' in window) {
    observePerformanceEntries();
  }
  
  // Record performance metrics on page unload
  window.addEventListener('beforeunload', () => {
    // Log performance data before page unload
    if (process.env.NODE_ENV === 'development') {
      logPerformanceMetrics();
    }
  });
}

/**
 * Record page load metrics
 */
function recordLoadMetrics() {
  // Get navigation timing data
  const navigationTiming = performance.getEntriesByType('navigation')[0];
  
  if (navigationTiming) {
    performanceMetrics.domInteractive = navigationTiming.domInteractive;
    performanceMetrics.domComplete = navigationTiming.domComplete;
  }
  
  // Get paint timing if available
  const paintEntries = performance.getEntriesByType('paint');
  const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
  
  if (firstContentfulPaint) {
    performanceMetrics.firstContentfulPaint = firstContentfulPaint.startTime;
  }
}

/**
 * Use Performance Observer to monitor performance entries
 */
function observePerformanceEntries() {
  // Create performance observers
  const resourceObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach(entry => {
      // Filter out non-critical resources
      if (shouldTrackResource(entry)) {
        performanceMetrics.resourceLoadTimes[entry.name] = {
          duration: entry.duration,
          size: entry.transferSize || 0,
          type: entry.initiatorType
        };
      }
    });
  });
  
  const longTaskObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach(entry => {
      console.warn('Long task detected:', entry.duration.toFixed(2) + 'ms', entry);
    });
  });
  
  // Start observing different entry types
  try {
    resourceObserver.observe({ entryTypes: ['resource'] });
    if (PerformanceObserver.supportedEntryTypes.includes('longtask')) {
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    }
  } catch (e) {
    console.error('Performance observer error:', e);
  }
}

/**
 * Determine if a resource should be tracked
 */
function shouldTrackResource(entry) {
  // Only track larger resources or specific file types
  return (
    entry.transferSize > 50000 || // Larger than 50KB
    entry.name.endsWith('.js') ||
    entry.name.endsWith('.css') ||
    entry.name.includes('fonts') ||
    entry.initiatorType === 'xmlhttprequest'
  );
}

/**
 * Record interaction time for a specific component
 */
export function recordInteraction(componentId, interactionType) {
  if (!performanceMetrics.interactionTimes[componentId]) {
    performanceMetrics.interactionTimes[componentId] = {};
  }
  
  performanceMetrics.interactionTimes[componentId][interactionType] = performance.now();
}

/**
 * Log current performance metrics to console
 */
export function logPerformanceMetrics() {
  const totalLoadTime = performanceMetrics.domComplete;
  
  console.group('📊 Performance Metrics');
  console.log('App Start Time:', performanceMetrics.appStartTime.toFixed(2) + 'ms');
  console.log('First Contentful Paint:', performanceMetrics.firstContentfulPaint.toFixed(2) + 'ms');
  console.log('DOM Interactive:', performanceMetrics.domInteractive.toFixed(2) + 'ms');
  console.log('DOM Complete:', totalLoadTime.toFixed(2) + 'ms');
  
  // Log top 5 slowest resources
  const sortedResources = Object.entries(performanceMetrics.resourceLoadTimes)
    .sort(([, a], [, b]) => b.duration - a.duration)
    .slice(0, 5);
  
  if (sortedResources.length > 0) {
    console.group('Slowest Resources:');
    sortedResources.forEach(([name, { duration, size, type }]) => {
      console.log(
        `${name.split('/').pop()} (${type}): ${duration.toFixed(2)}ms, ${(size / 1024).toFixed(2)}KB`
      );
    });
    console.groupEnd();
  }
  
  console.groupEnd();
  
  return performanceMetrics;
}

/**
 * Measure execution time of a function
 */
export function measureExecutionTime(func, name) {
  return function(...args) {
    const start = performance.now();
    const result = func.apply(this, args);
    const end = performance.now();
    const duration = end - start;
    
    // Log if execution took longer than 16ms (frame budget for 60fps)
    if (duration > 16) {
      console.warn(`⚠️ Slow execution: ${name || func.name || 'anonymous'} took ${duration.toFixed(2)}ms`);
    }
    
    return result;
  };
}

// Export the performance metrics object as read-only
export const metrics = Object.freeze({ ...performanceMetrics }); 