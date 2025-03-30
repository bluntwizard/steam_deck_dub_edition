/**
 * @jest-environment jsdom
 */

import { Gallery } from "../../components/Gallery/Gallery";

// Mock DOM manipulation methods
document.createComment = jest.fn().mockImplementation(() => {
  const comment = document.createTextNode("");
  comment.nodeType = Node.COMMENT_NODE;
  return comment;
});

// Mock MutationObserver
global.MutationObserver = class {
  constructor(callback) {
    this.callback = callback;
  }

  observe() {}
  disconnect() {}
};

describe("Gallery Component", () => {
  let gallery;
  let mockContainer;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = "";

    // Create a test container
    mockContainer = document.createElement("div");
    mockContainer.className = "content-section";
    document.body.appendChild(mockContainer);

    // Initialize gallery with default options
    gallery = new Gallery();
  });

  afterEach(() => {
    // Clean up event listeners
    document.removeEventListener("keydown", gallery.handleKeyPress);
  });

  test("should initialize with default options", () => {
    // Initialize the gallery
    gallery.initialize();

    // Check default options
    expect(gallery.selector).toBe(".gallery, [data-gallery]");
    expect(gallery.lazyLoad).toBe(true);
    expect(gallery.preloadAdjacentImages).toBe(true);
    expect(gallery.animationDuration).toBe(300);
    expect(gallery.minImagesForGrid).toBe(2);
    expect(gallery.initialized).toBe(true);
  });

  test("should initialize with custom options", () => {
    const customOptions = {
      selector: ".custom-gallery",
      lazyLoad: false,
      preloadAdjacentImages: false,
      animationDuration: 500,
      minImagesForGrid: 3,
    };

    // Create gallery with custom options
    const customGallery: Gallery = new Gallery(customOptions);
    customGallery.initialize();

    // Check if options were applied
    expect(customGallery.selector).toBe(".custom-gallery");
    expect(customGallery.lazyLoad).toBe(false);
    expect(customGallery.preloadAdjacentImages).toBe(false);
    expect(customGallery.animationDuration).toBe(500);
    expect(customGallery.minImagesForGrid).toBe(3);
    expect(customGallery.initialized).toBe(true);
  });

  test("should create lightbox elements", () => {
    gallery.initialize();

    // Check lightbox elements created
    expect(gallery.lightbox).not.toBeNull();
    expect(gallery.lightboxImg).not.toBeNull();
    expect(gallery.lightboxCaption).not.toBeNull();
    expect(gallery.lightboxPrevBtn).not.toBeNull();
    expect(gallery.lightboxNextBtn).not.toBeNull();

    // Check lightbox attributes
    expect(gallery.lightbox.getAttribute("role")).toBe("dialog");
    expect(gallery.lightbox.getAttribute("aria-modal")).toBe("true");
    expect(gallery.lightbox.getAttribute("tabindex")).toBe("-1");
  });

  test("should create gallery grid for multiple images", () => {
    // Add multiple images to the container
    for (let i = 0; i < 3; i++) {
      const img = document.createElement("img");
      img.src = `image${i}.jpg`;
      img.alt = `Image ${i}`;
      mockContainer.appendChild(img);
    }

    // Initialize gallery
    gallery.initialize();

    // Check if gallery grid was created
    const galleryGrid = mockContainer.querySelector(
      'div[class*="galleryGrid"]',
    );
    expect(galleryGrid).not.toBeNull();
    expect(galleryGrid.children.length).toBe(3);
  });

  test("should not create gallery for single image", () => {
    // Add single image to the container
    const img = document.createElement("img");
    img.src = "image.jpg";
    mockContainer.appendChild(img);

    // Initialize gallery
    gallery.initialize();

    // Check that no gallery grid was created
    const galleryGrid = mockContainer.querySelector(
      'div[class*="galleryGrid"]',
    );
    expect(galleryGrid).toBeNull();
  });

  test("should use figcaption for gallery item captions", () => {
    // Create figure with image and caption
    const figure = document.createElement("figure");

    const img = document.createElement("img");
    img.src = "image1.jpg";
    figure.appendChild(img);

    const figcaption = document.createElement("figcaption");
    figcaption.textContent = "Test caption";
    figure.appendChild(figcaption);

    // Create a second figure
    const figure2 = document.createElement("figure");

    const img2 = document.createElement("img");
    img2.src = "image2.jpg";
    figure2.appendChild(img2);

    const figcaption2 = document.createElement("figcaption");
    figcaption2.textContent = "Another caption";
    figure2.appendChild(figcaption2);

    // Add figures to container
    mockContainer.appendChild(figure);
    mockContainer.appendChild(figure2);

    // Initialize gallery
    gallery.initialize();

    // Find gallery captions
    const captions = mockContainer.querySelectorAll(
      'div[class*="galleryCaption"]',
    );

    // Verify captions
    expect(captions.length).toBe(2);
    expect(captions[0].textContent).toBe("Test caption");
    expect(captions[1].textContent).toBe("Another caption");

    // Verify image data-caption attributes
    const galleryImages = mockContainer.querySelectorAll(
      'div[class*="galleryItem"] img',
    );
    expect(galleryImages[0].dataset.caption).toBe("Test caption");
    expect(galleryImages[1].dataset.caption).toBe("Another caption");
  });

  test("should use alt text as caption if no figcaption", () => {
    // Create image with alt text
    const img = document.createElement("img");
    img.src = "image.jpg";
    img.alt = "Alt text caption";

    // Create another image
    const img2 = document.createElement("img");
    img2.src = "image2.jpg";
    img2.alt = "Second alt caption";

    // Add images to container
    mockContainer.appendChild(img);
    mockContainer.appendChild(img2);

    // Initialize gallery
    gallery.initialize();

    // Find gallery captions
    const captions = mockContainer.querySelectorAll(
      'div[class*="galleryCaption"]',
    );

    // Verify captions
    expect(captions.length).toBe(2);
    expect(captions[0].textContent).toBe("Alt text caption");
    expect(captions[1].textContent).toBe("Second alt caption");
  });

  test("should open lightbox when gallery image is clicked", () => {
    // Create test images
    for (let i = 0; i < 3; i++) {
      const img = document.createElement("img");
      img.src = `image${i}.jpg`;
      img.alt = `Image ${i}`;
      mockContainer.appendChild(img);
    }

    // Initialize gallery
    gallery.initialize();

    // Find first gallery image
    const galleryImage = mockContainer.querySelector(
      'div[class*="galleryItem"] img',
    );

    // Mock the lightbox methods
    gallery.updateLightboxImage = jest.fn();
    gallery.preloadAdjacentImages = jest.fn();
    gallery.announceForScreenReaders = jest.fn();

    // Click the image
    galleryImage.click();

    // Check lightbox is displayed
    expect(gallery.lightbox.style.display).toBe("flex");
    expect(document.body.style.overflow).toBe("hidden");

    // Verify methods were called
    expect(gallery.updateLightboxImage).toHaveBeenCalled();
    expect(gallery.announceForScreenReaders).toHaveBeenCalled();
  });

  test("should close lightbox", () => {
    // Initialize gallery
    gallery.initialize();

    // Open lightbox
    gallery.lightbox.style.display = "flex";
    document.body.style.overflow = "hidden";

    // Mock announceForScreenReaders
    gallery.announceForScreenReaders = jest.fn();

    // Close lightbox
    gallery.closeLightbox();

    // Check lightbox is hidden
    expect(gallery.lightbox.style.display).toBe("none");
    expect(document.body.style.overflow).toBe("");
    expect(gallery.announceForScreenReaders).toHaveBeenCalledWith(
      "Lightbox closed",
    );
  });

  test("should navigate lightbox images", () => {
    // Initialize gallery
    gallery.initialize();

    // Set up test data
    gallery.galleryImages = [
      { src: "image1.jpg", alt: "Image 1", caption: "Caption 1" },
      { src: "image2.jpg", alt: "Image 2", caption: "Caption 2" },
      { src: "image3.jpg", alt: "Image 3", caption: "Caption 3" },
    ];
    gallery.currentIndex = 0;

    // Mock methods
    gallery.updateLightboxImage = jest.fn();
    gallery.announceForScreenReaders = jest.fn();

    // Navigate forward
    gallery.navigateLightbox(1);

    // Check index and method calls
    expect(gallery.currentIndex).toBe(1);
    expect(gallery.updateLightboxImage).toHaveBeenCalled();
    expect(gallery.announceForScreenReaders).toHaveBeenCalledWith(
      "Image 2 of 3",
    );

    // Navigate backward
    gallery.updateLightboxImage.mockClear();
    gallery.announceForScreenReaders.mockClear();
    gallery.navigateLightbox(-1);

    // Check index and method calls
    expect(gallery.currentIndex).toBe(0);
    expect(gallery.updateLightboxImage).toHaveBeenCalled();
    expect(gallery.announceForScreenReaders).toHaveBeenCalledWith(
      "Image 1 of 3",
    );

    // Test wrapping behavior
    gallery.updateLightboxImage.mockClear();
    gallery.announceForScreenReaders.mockClear();
    gallery.navigateLightbox(-1);

    // Check wrapping to last image
    expect(gallery.currentIndex).toBe(2);
    expect(gallery.updateLightboxImage).toHaveBeenCalled();
    expect(gallery.announceForScreenReaders).toHaveBeenCalledWith(
      "Image 3 of 3",
    );
  });

  test("should update lightbox image", () => {
    // Initialize gallery
    gallery.initialize();

    // Set up test data
    gallery.galleryImages = [
      { src: "image1.jpg", alt: "Image 1", caption: "Caption 1" },
      { src: "image2.jpg", alt: "Image 2", caption: "Caption 2" },
    ];
    gallery.currentIndex = 0;

    // Mock the preloadAdjacentImages method
    gallery.preloadAdjacentImages = jest.fn();

    // Call update
    gallery.updateLightboxImage();

    // Check image and caption updates
    expect(gallery.lightboxImg.src).toContain("image1.jpg");
    expect(gallery.lightboxImg.alt).toBe("Image 1");
    expect(gallery.lightboxCaption.textContent).toBe("Caption 1");
    expect(gallery.lightboxCaption.style.display).toBe("block");

    // Verify navigation buttons are visible for multiple images
    expect(gallery.lightboxPrevBtn.style.display).toBe("block");
    expect(gallery.lightboxNextBtn.style.display).toBe("block");

    // Test with a single image
    gallery.galleryImages = [{ src: "single.jpg", alt: "Single", caption: "" }];
    gallery.currentIndex = 0;

    // Call update
    gallery.updateLightboxImage();

    // Check empty caption is hidden
    expect(gallery.lightboxCaption.style.display).toBe("none");

    // Verify navigation buttons are hidden for single image
    expect(gallery.lightboxPrevBtn.style.display).toBe("none");
    expect(gallery.lightboxNextBtn.style.display).toBe("none");
  });

  test("should handle keyboard navigation in lightbox", () => {
    // Initialize gallery
    gallery.initialize();

    // Setup test data
    gallery.galleryImages = [
      { src: "image1.jpg", alt: "Image 1", caption: "Caption 1" },
      { src: "image2.jpg", alt: "Image 2", caption: "Caption 2" },
      { src: "image3.jpg", alt: "Image 3", caption: "Caption 3" },
    ];
    gallery.currentIndex = 1;
    gallery.lightbox.style.display = "flex";

    // Mock methods
    gallery.updateLightboxImage = jest.fn();
    gallery.closeLightbox = jest.fn();

    // Test left arrow
    const leftEvent: KeyboardEvent = new KeyboardEvent("keydown", {
      key: "ArrowLeft",
    });
    Object.defineProperty(leftEvent, "preventDefault", { value: jest.fn() });
    gallery.handleKeyPress(leftEvent);

    expect(gallery.currentIndex).toBe(0);
    expect(gallery.updateLightboxImage).toHaveBeenCalled();
    expect(leftEvent.preventDefault).toHaveBeenCalled();

    // Test right arrow
    gallery.updateLightboxImage.mockClear();
    const rightEvent: KeyboardEvent = new KeyboardEvent("keydown", {
      key: "ArrowRight",
    });
    Object.defineProperty(rightEvent, "preventDefault", { value: jest.fn() });
    gallery.handleKeyPress(rightEvent);

    expect(gallery.currentIndex).toBe(1);
    expect(gallery.updateLightboxImage).toHaveBeenCalled();
    expect(rightEvent.preventDefault).toHaveBeenCalled();

    // Test escape key
    const escEvent: KeyboardEvent = new KeyboardEvent("keydown", {
      key: "Escape",
    });
    Object.defineProperty(escEvent, "preventDefault", { value: jest.fn() });
    gallery.handleKeyPress(escEvent);

    expect(gallery.closeLightbox).toHaveBeenCalled();
    expect(escEvent.preventDefault).toHaveBeenCalled();

    // Test home key
    gallery.updateLightboxImage.mockClear();
    const homeEvent: KeyboardEvent = new KeyboardEvent("keydown", {
      key: "Home",
    });
    Object.defineProperty(homeEvent, "preventDefault", { value: jest.fn() });
    gallery.handleKeyPress(homeEvent);

    expect(gallery.currentIndex).toBe(0);
    expect(gallery.updateLightboxImage).toHaveBeenCalled();
    expect(homeEvent.preventDefault).toHaveBeenCalled();

    // Test end key
    gallery.updateLightboxImage.mockClear();
    const endEvent: KeyboardEvent = new KeyboardEvent("keydown", {
      key: "End",
    });
    Object.defineProperty(endEvent, "preventDefault", { value: jest.fn() });
    gallery.handleKeyPress(endEvent);

    expect(gallery.currentIndex).toBe(2);
    expect(gallery.updateLightboxImage).toHaveBeenCalled();
    expect(endEvent.preventDefault).toHaveBeenCalled();
  });

  test("should preload adjacent images", () => {
    // Mock the Image constructor
    const originalImage = global.Image;
    global.Image = jest.fn(() => ({
      src: null,
    }));

    // Initialize gallery
    gallery.initialize();

    // Setup test data
    gallery.galleryImages = [
      { src: "image1.jpg", alt: "Image 1" },
      { src: "image2.jpg", alt: "Image 2" },
      { src: "image3.jpg", alt: "Image 3" },
    ];
    gallery.currentIndex = 1;

    // Call the method
    gallery.preloadAdjacentImages();

    // Verify Image constructor was called twice (for prev and next images)
    expect(global.Image).toHaveBeenCalledTimes(2);

    // Get the instances of Image constructor
    const imageInstance1 = global.Image.mock.results[0].value;
    const imageInstance2 = global.Image.mock.results[1].value;

    // Verify the correct images were preloaded
    expect(imageInstance1.src).toBe("image1.jpg");
    expect(imageInstance2.src).toBe("image3.jpg");

    // Restore original Image constructor
    global.Image = originalImage;
  });

  test("should announce messages for screen readers", () => {
    // Initialize gallery
    gallery.initialize();

    // Mock setTimeout
    jest.useFakeTimers();

    // Call the method
    gallery.announceForScreenReaders("Test announcement");

    // Find the announcer element
    const announcer = document.getElementById("gallery-announcer");

    // Verify announcer exists and has correct attributes
    expect(announcer).not.toBeNull();
    expect(announcer.getAttribute("aria-live")).toBe("assertive");
    expect(announcer.getAttribute("aria-atomic")).toBe("true");

    // Verify the message was set
    expect(announcer.textContent).toBe("Test announcement");

    // Advance timers to clear the message
    jest.advanceTimersByTime(1000);

    // Verify message was cleared
    expect(announcer.textContent).toBe("");

    // Restore timers
    jest.useRealTimers();
  });

  test("should process newly added content via mutation observer", () => {
    // Initialize gallery
    gallery.initialize();

    // Mock the initializeGalleries method
    gallery.initializeGalleries = jest.fn();

    // Get the mutation observer callback
    const observer: MutationObserver = new MutationObserver(() => {});
    const observerCallback = observer.callback;

    // Create a mock mutation with added nodes
    const mockArticle = document.createElement("article");
    const mockImg = document.createElement("img");
    mockArticle.appendChild(mockImg);

    const mockMutations = [
      {
        type: "childList",
        addedNodes: [mockArticle],
        removedNodes: [],
      },
    ];

    // Call the mutation observer callback
    observerCallback(mockMutations);

    // Verify initializeGalleries was called
    expect(gallery.initializeGalleries).toHaveBeenCalled();
  });
});
