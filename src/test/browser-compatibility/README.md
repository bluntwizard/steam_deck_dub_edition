# Cross-Browser Compatibility Testing

This directory contains tests that verify the compatibility of our modular components across different browsers.

## Purpose

The cross-browser tests ensure that:

1. All components render consistently across different browsers
2. ES6 module syntax works in all supported browsers
3. UI elements appear and behave consistently
4. Accessibility features work across different browsers

## Test Files

- `showcase.spec.js` - Tests the component showcase page and component functionality
- `es6-module-compatibility.spec.js` - Tests ES6 module support across browsers
- `accessibility.spec.js` - Tests accessibility features across browsers
- `ui-consistency.spec.js` - Tests UI consistency across browsers

## Running Tests

### Prerequisites

Before running the tests, you need to install the required browsers:

```bash
# Run the script to install all required browsers
./install-browsers.sh
```

### Running All Tests

To run all browser compatibility tests:

```bash
npm run test:browser
```

### Running Specific Test Files

To run a specific test file:

```bash
npx playwright test src/test/browser-compatibility/showcase.spec.js
```

### Running Tests in a Specific Browser

To run tests in a specific browser only:

```bash
npx playwright test --project=firefox
```

Available browser projects:
- `chromium` - Google Chrome/Microsoft Edge
- `firefox` - Mozilla Firefox
- `webkit` - Safari
- `mobile-chrome` - Chrome on mobile devices
- `mobile-safari` - Safari on iOS devices

## Test Reports

After running the tests, you can view the HTML report:

```bash
npm run test:browser:report
```

The report will open in your default browser and show detailed results, including:
- Test outcomes (pass/fail)
- Screenshots captured during tests
- Console logs from each browser
- Performance metrics

## Browser Support Target

We aim to support the following browsers:

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- iOS Safari (latest 2 versions)
- Chrome for Android (latest 2 versions)

## Common Issues

### Module Import Issues

If you encounter module import errors in specific browsers, check:
- ES6 module syntax compatibility
- CORS issues with local testing
- HTTP vs HTTPS constraints

### Visual Consistency Issues

For visual consistency issues:
- Check browser-specific CSS prefixes
- Verify font availability across platforms
- Test with browser zoom levels at 100%, 150%, and 200%

### Accessibility Issues

For accessibility issues:
- Test with screen readers on each platform (NVDA, VoiceOver, etc.)
- Verify keyboard navigation works consistently
- Check that ARIA attributes are supported 