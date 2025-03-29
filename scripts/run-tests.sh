#!/bin/bash

# Script to run tests with nice output formatting

# Set colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================${NC}"
echo -e "${BLUE}   Running Steam Deck DUB Edition Tests   ${NC}"
echo -e "${BLUE}====================================${NC}"

# Check if a specific component was requested
if [ "$1" ]; then
  echo -e "${BLUE}Running tests for component: ${GREEN}$1${NC}"
  npx jest --testMatch="**/**/test/components/*${1}*.test.js" "$2" "$3"
  TEST_EXIT_CODE=$?
else
  echo -e "${BLUE}Running all tests${NC}"
  npx jest "$1" "$2"
  TEST_EXIT_CODE=$?
fi

# Check if tests passed or failed
if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
else
  echo -e "${RED}✗ Some tests failed.${NC}"
fi

exit $TEST_EXIT_CODE 