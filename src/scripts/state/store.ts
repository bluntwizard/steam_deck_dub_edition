/**
 * Application State Store
 * Grimoire
 * 
 * Provides centralized state management for the application
 */

// Define types for state slices
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
  highContrast: boolean;
  language: string;
  [key: string]: any;
}

export interface ProgressState {
  completedSections: Record<string, boolean>;
  lastVisited: string | null;
  totalProgress: number;
}

export interface UIState {
  sidebarOpen: boolean;
  currentRoute: string | null;
  isLoading: boolean;
  showSettings: boolean;
  searchQuery: string;
  activeTab: string;
}

export interface ApplicationState {
  preferences: UserPreferences;
  progress: ProgressState;
  ui: UIState;
  // Add additional state slices as needed
}

// Define state change listener type
export type StateChangeListener<T> = (newState: T, oldState: T) => void;

/**
 * Create a default state
 */
function createDefaultState(): ApplicationState {
  return {
    preferences: {
      theme: 'system',
      fontSize: 'medium',
      reducedMotion: false,
      highContrast: false,
      language: 'en'
    },
    progress: {
      completedSections: {},
      lastVisited: null,
      totalProgress: 0
    },
    ui: {
      sidebarOpen: false,
      currentRoute: 'home',
      isLoading: false,
      showSettings: false,
      searchQuery: '',
      activeTab: 'general'
    }
  };
}

/**
 * Store class for managing application state
 */
export class Store {
  /**
   * Current application state
   */
  private state: ApplicationState;
  
  /**
   * Registered listeners for state changes
   */
  private listeners: {
    preferences: Array<StateChangeListener<UserPreferences>>;
    progress: Array<StateChangeListener<ProgressState>>;
    ui: Array<StateChangeListener<UIState>>;
  };
  
  /**
   * Whether to persist state to localStorage
   */
  private persist: boolean;
  
  /**
   * Key used for localStorage
   */
  private storageKey: string;
  
  /**
   * Constructor
   */
  constructor(initialState?: Partial<ApplicationState>, options: { persist?: boolean, storageKey?: string } = {}) {
    // Set default options
    this.persist = options.persist ?? true;
    this.storageKey = options.storageKey ?? 'appState';
    
    // Initialize state from localStorage if available
    let loadedState: Partial<ApplicationState> = {};
    
    if (this.persist) {
      try {
        const savedState = localStorage.getItem(this.storageKey);
        if (savedState) {
          loadedState = JSON.parse(savedState);
        }
      } catch (error) {
        console.error('Failed to load state from localStorage:', error);
      }
    }
    
    // Merge default state with loaded state and initial state
    this.state = {
      ...createDefaultState(),
      ...loadedState,
      ...initialState
    };
    
    // Initialize listeners
    this.listeners = {
      preferences: [],
      progress: [],
      ui: []
    };
  }
  
  /**
   * Get current state slice
   */
  public getState<K extends keyof ApplicationState>(slice: K): ApplicationState[K] {
    return { ...this.state[slice] };
  }
  
  /**
   * Get the full state (primarily for debugging)
   */
  public getFullState(): ApplicationState {
    return { ...this.state };
  }
  
  /**
   * Update state for a specific slice
   */
  public setState<K extends keyof ApplicationState>(
    slice: K,
    updater: ((state: ApplicationState[K]) => ApplicationState[K]) | Partial<ApplicationState[K]>
  ): void {
    const currentSliceState = this.state[slice];
    const newSliceState = typeof updater === 'function'
      ? updater({ ...currentSliceState })
      : { ...currentSliceState, ...updater };
    
    // Only update if state has changed
    if (JSON.stringify(currentSliceState) !== JSON.stringify(newSliceState)) {
      // Update state
      this.state = {
        ...this.state,
        [slice]: newSliceState
      };
      
      // Notify listeners
      this.notifyListeners(slice, newSliceState, currentSliceState);
      
      // Persist to localStorage if enabled
      if (this.persist) {
        this.saveToLocalStorage();
      }
    }
  }
  
  /**
   * Subscribe to changes in a specific state slice
   */
  public subscribe<K extends keyof ApplicationState>(
    slice: K,
    listener: StateChangeListener<ApplicationState[K]>
  ): () => void {
    // Add listener to the appropriate slice
    (this.listeners[slice] as StateChangeListener<ApplicationState[K]>[]).push(listener);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.listeners[slice] as StateChangeListener<ApplicationState[K]>[];
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    };
  }
  
  /**
   * Notify all listeners for a specific state slice
   */
  private notifyListeners<K extends keyof ApplicationState>(
    slice: K,
    newState: ApplicationState[K],
    oldState: ApplicationState[K]
  ): void {
    const listeners = this.listeners[slice] as StateChangeListener<ApplicationState[K]>[];
    listeners.forEach(listener => {
      listener(newState, oldState);
    });
  }
  
  /**
   * Save current state to localStorage
   */
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (error) {
      console.error('Failed to save state to localStorage:', error);
    }
  }
  
  /**
   * Reset state to defaults
   */
  public resetState(): void {
    const oldState = { ...this.state };
    this.state = createDefaultState();
    
    // Notify listeners for each slice
    this.notifyListeners('preferences', this.state.preferences, oldState.preferences);
    this.notifyListeners('progress', this.state.progress, oldState.progress);
    this.notifyListeners('ui', this.state.ui, oldState.ui);
    
    // Clear localStorage if persistence is enabled
    if (this.persist) {
      try {
        localStorage.removeItem(this.storageKey);
      } catch (error) {
        console.error('Failed to clear state from localStorage:', error);
      }
    }
  }
}

// Create and export singleton instance
const store = new Store();
export default store; 