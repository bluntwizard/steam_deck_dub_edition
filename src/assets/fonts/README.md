# Font Collection for Grimoire

This directory contains locally-hosted fonts for the guide to reduce dependency on Google Fonts and ensure offline functionality.

## Included Fonts

### Display Fonts
- **Montserrat** - Clean, modern sans-serif for headings
- **Poppins** - Contemporary geometric sans-serif with good readability

### Text Fonts
- **Inter** - Highly readable font designed for screens
- **Roboto** - Google's system font, versatile and readable at many sizes

### Code Fonts
- **JetBrains Mono** - Perfect for code blocks with programming ligatures
- **Fira Code** - Monospaced font with coding ligatures

### Accessibility Fonts
- **OpenDyslexic** - Designed to increase readability for readers with dyslexia
- **Atkinson Hyperlegible** - Designed by Braille Institute for low vision readers

## Font Organization

Each font should be organized in its own subdirectory:
```
/fonts
  /montserrat
    - montserrat-regular.woff2
    - montserrat-medium.woff2
    - montserrat-bold.woff2
  /jetbrains-mono
    - jetbrains-mono-regular.woff2
    - jetbrains-mono-bold.woff2
  ...etc
```

## Download Sources

- [Google Fonts](https://fonts.google.com/) (Montserrat, Poppins, Roboto, Inter)
- [JetBrains Mono](https://www.jetbrains.com/lp/mono/)
- [Fira Code](https://github.com/tonsky/FiraCode)
- [OpenDyslexic](https://opendyslexic.org/)
- [Atkinson Hyperlegible](https://brailleinstitute.org/freefont)

## Implementation

1. Download font files (preferably .woff2 format for best compression/compatibility)
2. Create a directory for each font family
3. Add the CSS file for each font family in `/src/styles/core/fonts/`
4. Import these CSS files in your base.css or create a font.css that is imported before other styles
