/**
 * Test suite for Search component
 */

describe("Search", () => {
  let Search;
  let instance;
  let container;

  // Mock search service
  const mockSearchService = {
    search: jest.fn().mockReturnValue([]),
    getRecentSearches: jest.fn().mockReturnValue([]),
    addToRecentSearches: jest.fn(),
  };

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = "";
    container = document.createElement("div");
    document.body.appendChild(container);

    // Clear module cache to ensure fresh instances
    jest.resetModules();

    // Import component
    Search = require("../../components/Search/Search").default;

    // Create instance
    instance = new Search({
      container: container,
      searchService: mockSearchService,
    });
  });

  afterEach(() => {
    // Clean up
    if (instance && typeof instance.destroy === "function") {
      instance.destroy();
    }
    document.body.innerHTML = "";
    jest.clearAllMocks();
  });

  test("should initialize properly", () => {
    expect(instance).toBeDefined();
    expect(instance.container).toBe(container);
    expect(instance.searchService).toBe(mockSearchService);
  });

  test("should render search component", () => {
    instance.render();

    const searchElement = container.querySelector(".search-component");
    expect(searchElement).not.toBeNull();

    const searchInput = searchElement.querySelector("input");
    expect(searchInput).not.toBeNull();

    const searchButton = searchElement.querySelector("button");
    expect(searchButton).not.toBeNull();
  });

  test("should perform search when button is clicked", () => {
    instance.render();

    const searchInput = container.querySelector(".search-component input");
    const searchButton = container.querySelector(".search-component button");

    // Set search query
    searchInput.value = "test query";

    // Simulate button click
    searchButton.click();

    // Verify search was performed
    expect(mockSearchService.search).toHaveBeenCalledWith("test query");
    expect(mockSearchService.addToRecentSearches).toHaveBeenCalledWith(
      "test query",
    );
  });

  test("should perform search on Enter key press", () => {
    instance.render();

    const searchInput = container.querySelector(".search-component input");

    // Set search query
    searchInput.value = "enter key test";

    // Simulate Enter key press
    const enterEvent: KeyboardEvent = new KeyboardEvent("keyup", {
      key: "Enter",
    });
    searchInput.dispatchEvent(enterEvent);

    // Verify search was performed
    expect(mockSearchService.search).toHaveBeenCalledWith("enter key test");
    expect(mockSearchService.addToRecentSearches).toHaveBeenCalledWith(
      "enter key test",
    );
  });

  test("should display search results", () => {
    // Mock search results
    const mockResults = [
      { title: "Result 1", url: "/page1", snippet: "This is result 1" },
      { title: "Result 2", url: "/page2", snippet: "This is result 2" },
    ];
    mockSearchService.search.mockReturnValue(mockResults);

    instance.render();

    // Perform search
    const searchInput = container.querySelector(".search-component input");
    searchInput.value = "test results";
    const searchButton = container.querySelector(".search-component button");
    searchButton.click();

    // Check if results are displayed
    const resultsContainer = container.querySelector(".search-results");
    expect(resultsContainer).not.toBeNull();

    const resultItems = resultsContainer.querySelectorAll(
      ".search-result-item",
    );
    expect(resultItems.length).toBe(2);

    // Check first result content
    expect(resultItems[0].textContent).toContain("Result 1");
    expect(resultItems[0].textContent).toContain("This is result 1");
    expect(resultItems[0].querySelector("a").getAttribute("href")).toBe(
      "/page1",
    );
  });

  test("should display message when no results found", () => {
    // Mock empty search results
    mockSearchService.search.mockReturnValue([]);

    instance.render();

    // Perform search
    const searchInput = container.querySelector(".search-component input");
    searchInput.value = "no results";
    const searchButton = container.querySelector(".search-component button");
    searchButton.click();

    // Check if no results message is displayed
    const noResultsMessage = container.querySelector(".no-results-message");
    expect(noResultsMessage).not.toBeNull();
    expect(noResultsMessage.textContent).toContain("No results found");
  });

  test("should display recent searches", () => {
    // Mock recent searches
    const recentSearches = ["previous search 1", "previous search 2"];
    mockSearchService.getRecentSearches.mockReturnValue(recentSearches);

    instance.render();

    // Focus the input to trigger recent searches display
    const searchInput = container.querySelector(".search-component input");
    searchInput.dispatchEvent(new Event("focus"));

    // Check if recent searches are displayed
    const recentSearchesContainer = container.querySelector(".recent-searches");
    expect(recentSearchesContainer).not.toBeNull();

    const recentItems = recentSearchesContainer.querySelectorAll(
      ".recent-search-item",
    );
    expect(recentItems.length).toBe(2);
    expect(recentItems[0].textContent).toContain("previous search 1");
    expect(recentItems[1].textContent).toContain("previous search 2");
  });

  test("should clean up event listeners on destroy", () => {
    // Setup spy on event listeners
    const removeEventListenerSpy = jest.spyOn(
      HTMLElement.prototype,
      "removeEventListener",
    );

    instance.render();
    instance.destroy();

    expect(removeEventListenerSpy).toHaveBeenCalled();
  });
});
