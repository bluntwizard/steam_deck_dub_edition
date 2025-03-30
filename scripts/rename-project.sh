#!/bin/bash

# Script to rename all variants of Steam Deck DUB Edition to "Grimoire" across the codebase
# This script excludes the src/content directory, which contains user-facing content that may
# reference the old name in a context that should not be changed.

echo "Starting project rename to 'Grimoire'"
echo "=============================================================================="

# Function to count occurrences of a string in the codebase
count_occurrences() {
    grep -r "$1" --include="*.md" --include="*.js" --include="*.ts" --include="*.html" --include="*.json" --exclude-dir="src/content" --exclude-dir="node_modules" . | wc -l
}

# Count initial occurrences
sdde_full_count=$(count_occurrences "Steam Deck DUB Edition")
sdde_abbr_count=$(count_occurrences "SDDE")
steamdeck_alt1_count=$(count_occurrences "Steamdeck")
steamdeck_alt2_count=$(count_occurrences "steamdeck")
steam_deck_count=$(count_occurrences "Steam Deck")

echo "Found $sdde_full_count occurrences of 'Steam Deck DUB Edition'"
echo "Found $sdde_abbr_count occurrences of 'SDDE'"
echo "Found $steamdeck_alt1_count occurrences of 'Steamdeck'"
echo "Found $steamdeck_alt2_count occurrences of 'steamdeck'"
echo "Found $steam_deck_count occurrences of 'Steam Deck' (not followed by 'DUB Edition')"
echo ""
echo "Replacing occurrences..."

# Replace "Steam Deck DUB Edition" with "Grimoire"
find . -type f -not -path "./src/content/*" -not -path "./node_modules/*" \
    \( -name "*.md" -o -name "*.js" -o -name "*.ts" -o -name "*.html" -o -name "*.json" \) \
    -exec sed -i 's/Steam Deck DUB Edition/Grimoire/g' {} \;

# Replace "SDDE" with "Grimoire"
find . -type f -not -path "./src/content/*" -not -path "./node_modules/*" \
    \( -name "*.md" -o -name "*.js" -o -name "*.ts" -o -name "*.html" -o -name "*.json" \) \
    -exec sed -i 's/SDDE/Grimoire/g' {} \;

# Replace "Steamdeck" (one word) with "Grimoire"
find . -type f -not -path "./src/content/*" -not -path "./node_modules/*" \
    \( -name "*.md" -o -name "*.js" -o -name "*.ts" -o -name "*.html" -o -name "*.json" \) \
    -exec sed -i 's/Steamdeck/Grimoire/g' {} \;

# Replace "steamdeck" (lowercase) with "grimoire"
find . -type f -not -path "./src/content/*" -not -path "./node_modules/*" \
    \( -name "*.md" -o -name "*.js" -o -name "*.ts" -o -name "*.html" -o -name "*.json" \) \
    -exec sed -i 's/steamdeck/grimoire/g' {} \;

# Replace "Steam Deck" with "Grimoire" when it's part of the project name but not followed by "DUB Edition"
# Note: We are excluding this for now as it requires careful review to avoid replacing legitimate references to Steam Deck hardware
# Instead, we'll warn about remaining occurrences
echo "Note: 'Steam Deck' occurrences (when not part of 'Steam Deck DUB Edition') will need manual review"

# Replace "@sdde/" with "@grimoire/" in import statements and package references
find . -type f -not -path "./src/content/*" -not -path "./node_modules/*" \
    \( -name "*.md" -o -name "*.js" -o -name "*.ts" -o -name "*.html" -o -name "*.json" \) \
    -exec sed -i 's/@sdde\//@grimoire\//g' {} \;

# Count remaining occurrences
remaining_full_count=$(count_occurrences "Steam Deck DUB Edition")
remaining_abbr_count=$(count_occurrences "SDDE")
remaining_alt1_count=$(count_occurrences "Steamdeck")
remaining_alt2_count=$(count_occurrences "steamdeck")

echo "Replacement complete!"
echo "Remaining occurrences of 'Steam Deck DUB Edition': $remaining_full_count"
echo "Remaining occurrences of 'SDDE': $remaining_abbr_count"
echo "Remaining occurrences of 'Steamdeck': $remaining_alt1_count"
echo "Remaining occurrences of 'steamdeck': $remaining_alt2_count"

# Update package.json (if it exists)
if [ -f "package.json" ]; then
    echo "Updating package.json..."
    sed -i 's/"name": "steam-deck-dub-edition"/"name": "grimoire"/g' package.json
    sed -i 's/"name": "sdde"/"name": "grimoire"/g' package.json
    sed -i 's/"name": "steamdeck"/"name": "grimoire"/g' package.json
fi

echo ""
echo "=============================================================================="
echo "Remember to:"
echo "1. Update any remaining occurrences manually (check with grep)"
echo "2. Rename any directories or filenames containing 'sdde', 'steamdeck', or 'steam-deck-dub-edition'"
echo "3. Rename the GitHub repository from 'steam_deck_dub_edition' to 'grimoire'"
echo "4. Update the Git remote URL for the repository"
echo "==============================================================================" 